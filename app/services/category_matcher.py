from __future__ import annotations

import logging
import re
from typing import Any, Dict, Iterable, List, Tuple

from app.schemas.request import DiagnosisRequest
from app.schemas.response import LegalProductCandidate

logger = logging.getLogger(__name__)

# 검색 대상 필드와 가중치. JSON 스키마가 달라도 안전하게 동작하도록
# 존재하지 않는 필드는 자동으로 건너뛴다.
_SEARCHABLE_FIELDS: Tuple[Tuple[str, float], ...] = (
    ("legal_product_name", 3.0),
    ("display_product_name", 3.0),
    ("user_expression", 2.0),
    ("normalized_expression", 2.0),
    ("aliases", 2.0),
    ("keywords", 1.0),
    ("hazard_keywords", 1.0),
)

_TOKEN_SPLIT_RE = re.compile(r"[\s,/;:|()\[\]{}<>\"'`~!?.\-_+=]+")
_MIN_TOKEN_LEN = 2
_MAX_CANDIDATES = 5

# 핸드오프 §6 Phase 2: CONFIRMED / CANDIDATE / NEEDS_CONFIRMATION / NO_MATCH
_CONFIRMED_THRESHOLD = 0.7
_CANDIDATE_THRESHOLD = 0.4


def _tokenize(text: str) -> List[str]:
    if not text:
        return []
    parts = _TOKEN_SPLIT_RE.split(text.lower())
    return [p for p in parts if len(p) >= _MIN_TOKEN_LEN]


def _field_text(value: Any) -> str:
    """필드 값을 검색용 단일 문자열로 변환. list/str 모두 안전 처리."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.lower()
    if isinstance(value, (list, tuple, set)):
        return " ".join(_field_text(v) for v in value)
    return str(value).lower()


def _field_values_for_match_basis(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, (list, tuple, set)):
        out: List[str] = []
        for v in value:
            out.extend(_field_values_for_match_basis(v))
        return out
    return [str(value)]


def _score_item(
    item: Dict[str, Any],
    query_tokens: Iterable[str],
    raw_product_name: str,
) -> Tuple[float, List[str]]:
    """단일 후보에 대한 (raw_score, matched_fields) 계산."""
    tokens = list(query_tokens)
    if not tokens:
        return 0.0, []

    raw_score = 0.0
    matched_fields: List[str] = []

    for field, weight in _SEARCHABLE_FIELDS:
        if field not in item:
            continue
        haystack = _field_text(item.get(field))
        if not haystack:
            continue

        hits = 0
        for tok in tokens:
            if tok and tok in haystack:
                hits += 1
        if hits > 0:
            raw_score += weight * hits
            matched_fields.append(field)

    # 완전 일치 보너스: legal/display name이 입력 product_name과 정확히 같으면 강한 신호
    if raw_product_name:
        rp = raw_product_name.strip().lower()
        for field in ("legal_product_name", "display_product_name"):
            val = item.get(field)
            if isinstance(val, str) and val.strip().lower() == rp:
                raw_score += 5.0
                if field not in matched_fields:
                    matched_fields.append(field)

    return raw_score, matched_fields


def _confidence_level(score: float) -> Tuple[str, bool]:
    """confidence_score → (level, needs_user_confirmation).

    핸드오프 §6 Phase 2 기준:
      CONFIRMED          : 명확하게 매칭됨
      CANDIDATE          : 후보로 제시 가능함
      NEEDS_CONFIRMATION : 사용자 추가 확인 필요
    """
    if score >= _CONFIRMED_THRESHOLD:
        return "CONFIRMED", False
    if score >= _CANDIDATE_THRESHOLD:
        return "CANDIDATE", True
    return "NEEDS_CONFIRMATION", True


def _safe_str(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return str(value)


def match_category(
    request: DiagnosisRequest,
    index_data: Any,
) -> List[LegalProductCandidate]:
    """
    product_category_index.json 데이터로부터 법정 품목명 후보 매칭.

    - 데이터에 없는 값은 만들어내지 않는다.
    - 매칭이 없으면 빈 리스트를 반환한다 (placeholder 더미 추가 금지).
    - JSON 스키마가 예상과 달라도 예외를 던지지 않는다.
    """
    if not isinstance(index_data, list) or not index_data:
        return []

    raw_product_name = _safe_str(getattr(request, "product_name", "")).strip()
    query_text_parts = [
        raw_product_name,
        _safe_str(getattr(request, "user_query", "")),
        _safe_str(getattr(request, "material_text", "")),
    ]
    tokens = _tokenize(" ".join(part for part in query_text_parts if part))
    if not tokens:
        return []

    # 토큰 중복 제거하되 순서 유지
    seen = set()
    deduped_tokens: List[str] = []
    for tok in tokens:
        if tok not in seen:
            seen.add(tok)
            deduped_tokens.append(tok)

    scored: List[Tuple[float, List[str], Dict[str, Any]]] = []
    for item in index_data:
        if not isinstance(item, dict):
            continue
        raw_score, matched_fields = _score_item(item, deduped_tokens, raw_product_name)
        if raw_score > 0:
            scored.append((raw_score, matched_fields, item))

    if not scored:
        return []

    # 정규화: 가능한 최대 점수(상위 후보) 기준으로 0~1 스케일링
    max_raw = max(s[0] for s in scored)
    if max_raw <= 0:
        return []

    scored.sort(key=lambda x: x[0], reverse=True)

    candidates: List[LegalProductCandidate] = []
    for raw_score, matched_fields, item in scored[:_MAX_CANDIDATES]:
        norm_score = max(0.0, min(1.0, raw_score / max(max_raw, 6.0)))
        level, needs_confirm = _confidence_level(norm_score)

        legal_name = _safe_str(item.get("legal_product_name"))
        display_name = _safe_str(item.get("display_product_name")) or legal_name
        cert_type = _safe_str(item.get("certification_type"))

        basis = (
            "검색 일치 필드: " + ", ".join(matched_fields)
            if matched_fields
            else "검색 일치 필드 없음"
        )

        try:
            candidates.append(
                LegalProductCandidate(
                    legal_product_name=legal_name,
                    display_product_name=display_name,
                    certification_type=cert_type,
                    confidence_level=level,
                    confidence_score=round(norm_score, 4),
                    needs_user_confirmation=needs_confirm,
                    match_basis=basis,
                )
            )
        except Exception as e:  # 스키마 어긋난 데이터로부터의 방어선
            logger.warning("Skipping malformed category index item: %s", e)
            continue

    return candidates
