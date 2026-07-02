"""문장 임베딩 기반 의미 유사도 검색 (선택적 기능).

용도(BM25/키워드 검색과 동일한 원칙):
- (1) 국내 리콜 대표 사례 정렬, (2) KC 유사 인증사례 정렬에만 사용.
- 법정 품목명 확정·인증유형·안전기준 판단에는 절대 사용하지 않음.

설계:
- transformers(AutoModel/AutoTokenizer)를 직접 사용해 sentence-transformers
  의존성을 추가하지 않는다. mean-pooling + L2 정규화를 직접 수행.
- 모델: intfloat/multilingual-e5-small (약 470MB, 100개 언어, CPU 동작).
  e5 계열은 쿼리에 "query: ", 문서에 "passage: " 접두사를 붙여야 성능이 좋다.
- ENABLE_EMBEDDING=false(기본)이면 로드하지 않으며, torch/transformers 미설치
  또는 모델 로드 실패 시 available=False로 떨어져 호출부가 BM25/키워드로 폴백한다.
"""
from __future__ import annotations

import logging
import threading
from typing import List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

_QUERY_PREFIX = "query: "
_PASSAGE_PREFIX = "passage: "
_MAX_TOKENS = 128  # 모델명·제품명·리콜 사유는 짧아 128이면 충분


class EmbeddingModel:
    """multilingual-e5-small 임베딩 모델 (lazy load, thread-safe)."""

    def __init__(self, model_name: Optional[str] = None) -> None:
        self._model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self._model = None
        self._tokenizer = None
        self._torch = None
        self._failed = False
        self._lock = threading.Lock()

    # ── 로딩 ────────────────────────────────────────────────────────────────
    def _ensure_loaded(self) -> bool:
        if self._model is not None:
            return True
        if self._failed:
            return False
        with self._lock:
            if self._model is not None:
                return True
            if self._failed:
                return False
            try:
                import torch
                from transformers import AutoModel, AutoTokenizer

                cache_dir = str(settings.BASE_DIR / "hf_cache")
                token = settings.HF_TOKEN or None
                logger.info("임베딩 모델 로딩 시작: %s", self._model_name)
                self._tokenizer = AutoTokenizer.from_pretrained(
                    self._model_name, cache_dir=cache_dir, token=token
                )
                self._model = AutoModel.from_pretrained(
                    self._model_name, cache_dir=cache_dir, token=token
                )
                self._model.eval()
                self._torch = torch
                logger.info("임베딩 모델 로딩 완료: %s", self._model_name)
                return True
            except Exception as exc:
                self._failed = True
                logger.warning(
                    "임베딩 모델 로딩 실패 → 임베딩 검색 비활성화 (BM25/키워드 폴백): %s",
                    exc,
                )
                return False

    @property
    def available(self) -> bool:
        return self._ensure_loaded()

    @property
    def model_name(self) -> str:
        return self._model_name

    # ── 인코딩 ──────────────────────────────────────────────────────────────
    def encode(self, texts: List[str], is_query: bool = False, batch_size: int = 64):
        """텍스트 리스트 → L2 정규화된 임베딩 행렬 (numpy float32, shape (N, D)).

        실패/미가용 시 None 반환.
        """
        if not texts:
            return None
        if not self._ensure_loaded():
            return None
        try:
            import numpy as np

            torch = self._torch
            prefix = _QUERY_PREFIX if is_query else _PASSAGE_PREFIX
            prepared = [prefix + (t or "").strip() for t in texts]

            vectors = []
            with torch.no_grad():
                for start in range(0, len(prepared), batch_size):
                    batch = prepared[start : start + batch_size]
                    enc = self._tokenizer(
                        batch,
                        padding=True,
                        truncation=True,
                        max_length=_MAX_TOKENS,
                        return_tensors="pt",
                    )
                    out = self._model(**enc)
                    last_hidden = out.last_hidden_state  # (B, T, D)
                    mask = enc["attention_mask"].unsqueeze(-1).float()  # (B, T, 1)
                    summed = (last_hidden * mask).sum(dim=1)
                    counts = mask.sum(dim=1).clamp(min=1e-9)
                    pooled = summed / counts  # mean pooling
                    pooled = torch.nn.functional.normalize(pooled, p=2, dim=1)
                    vectors.append(pooled.cpu().numpy().astype("float32"))

            return np.vstack(vectors)
        except Exception as exc:
            logger.warning("임베딩 인코딩 실패 (무시): %s", exc)
            return None

    def encode_one(self, text: str, is_query: bool = False):
        """단일 텍스트 → (D,) 임베딩 벡터. 실패 시 None."""
        mat = self.encode([text], is_query=is_query)
        if mat is None or len(mat) == 0:
            return None
        return mat[0]


def similarity_scores(
    app_data: dict,
    cache_key: str,
    query_text: str,
    passages: List[str],
) -> Optional[List[float]]:
    """passages 각각과 query의 코사인 유사도(0~1) 리스트 반환. passages와 순서 일치.

    - passages 임베딩은 cache_key로 embedding_cache에 1회 저장 후 재사용
      (품목별 코퍼스는 서버 구동 중 고정이므로 재인코딩 불필요).
    - 임베딩 모델 미가용/실패 시 None → 호출부가 BM25·키워드 정렬로 폴백.
    """
    model = (app_data or {}).get("embedding_model")
    if model is None or not query_text or not passages:
        return None
    try:
        import numpy as np

        cache = app_data.setdefault("embedding_cache", {})
        pmat = cache.get(cache_key)
        if pmat is None or len(pmat) != len(passages):
            pmat = model.encode(passages, is_query=False)
            if pmat is None:
                return None
            cache[cache_key] = pmat
        qv = model.encode_one(query_text, is_query=True)
        if qv is None:
            return None
        return (np.asarray(pmat) @ np.asarray(qv)).tolist()
    except Exception as exc:
        logger.warning("임베딩 유사도 계산 실패 (무시): %s", exc)
        return None
