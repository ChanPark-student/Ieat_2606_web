from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "Compliance Assistant AI MVP"
    VERSION: str = "1.0.0"

    # LLM 활성화 여부 (기본값: 비활성화)
    # true로 설정하면 /diagnose 첫 호출 시 모델을 lazy load합니다.
    ENABLE_LLM: bool = False

    # Hugging Face Settings
    HF_TOKEN: str = ""
    HF_MODEL_NAME: str = "Qwen/Qwen2.5-1.5B-Instruct"
    LLM_MAX_NEW_TOKENS: int = 2500
    LLM_TEMPERATURE: float = 0.2

    # 임베딩 유사도 검색 (기본값: 비활성화)
    # true로 설정하면 서버 시작 시 임베딩 모델을 로드하고 리콜/KC 코퍼스를
    # 미리 인코딩합니다. 미설치/미다운로드 시 자동으로 BM25·키워드 정렬로 폴백합니다.
    # 리콜 대표 사례·KC 유사 인증사례 "정렬"에만 사용하며 판단에는 사용하지 않습니다.
    ENABLE_EMBEDDING: bool = False
    EMBEDDING_MODEL_NAME: str = "intfloat/multilingual-e5-small"

    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"

    MASTER_JSON_DIR: Path = DATA_DIR / "master_json"
    SAFETY_JSON_DIR: Path = DATA_DIR / "safety_json"
    RAG_JSONL_DIR: Path = DATA_DIR / "rag_jsonl"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
