from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import uuid4
import hashlib
import secrets

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship


DATABASE_URL = "sqlite:///./app.db"

JWT_SECRET_KEY = "change_this_secret_for_mvp"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()
security = HTTPBearer()

app = FastAPI(
    title="Certification Recall Risk Diagnosis API",
    description="신제품 출시 전 인증·리콜 리스크 진단 어시스턴트 MVP Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    diagnosis_cases = relationship("DiagnosisCase", back_populates="user")


class DiagnosisCase(Base):
    __tablename__ = "diagnosis_cases"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    product_name = Column(String, nullable=False)
    user_query = Column(Text, nullable=False)
    target_age = Column(String, nullable=True)
    material_text = Column(Text, nullable=True)
    power_type = Column(String, nullable=True)
    battery_included = Column(Boolean, nullable=True)
    import_or_manufacture = Column(String, nullable=True)

    model_name = Column(String, nullable=True)
    brand_name = Column(String, nullable=True)
    maker_country = Column(String, nullable=True)
    cert_num = Column(String, nullable=True)
    additional_info = Column(Text, nullable=True)

    status = Column(String, default="pending")
    ai_output_json = Column(JSON, nullable=True)
    final_report_markdown = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="diagnosis_cases")


Base.metadata.create_all(bind=engine)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class DiagnosisRequest(BaseModel):
    product_name: str
    user_query: str
    target_age: Optional[str] = None
    material_text: Optional[str] = None
    power_type: Optional[str] = None
    battery_included: Optional[bool] = False
    import_or_manufacture: Optional[str] = None
    model_name: Optional[str] = None
    brand_name: Optional[str] = None
    maker_country: Optional[str] = None
    cert_num: Optional[str] = None
    additional_info: Optional[str] = None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, saved_hash = password_hash.split("$", 1)
        hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
        return hashed == saved_hash
    except ValueError:
        return False


def create_access_token(user: User) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": expire,
    }

    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid_token",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid_token",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="user_not_found",
        )

    return user


def create_mock_ai_result(case_id: str, request: DiagnosisRequest) -> Dict[str, Any]:
    product_name = request.product_name

    return {
        "case_id": case_id,
        "status": "success",
        "product_name": product_name,
        "model_name": request.model_name,
        "input_summary": {
            "product_name": request.product_name,
            "user_query": request.user_query,
            "target_age": request.target_age,
            "material_text": request.material_text,
            "power_type": request.power_type,
            "battery_included": request.battery_included,
            "import_or_manufacture": request.import_or_manufacture,
            "model_name": request.model_name,
            "brand_name": request.brand_name,
            "maker_country": request.maker_country,
            "cert_num": request.cert_num,
            "additional_info": request.additional_info,
        },
        "legal_product_candidates": [
            {
                "product_name": "아동용 섬유제품",
                "certification_type": "공급자적합성확인",
                "confidence_level": "candidate",
            }
        ],
        "certification_diagnosis": {
            "certification_type": "공급자적합성확인",
            "applied_standards": [
                "어린이제품 공통안전기준",
                "아동용 섬유제품 안전기준",
            ],
            "judgement_level": "CANDIDATE",
        },
        "institution_guidance": {
            "summary": "공급자적합성확인은 지정기관 신고 대상이 아니며, 시험성적서 등 적합성 입증 자료 확보가 필요합니다.",
            "institutions": [],
        },
        "kc_certification_summary": {
            "summary": "유사 제품의 KC 인증 사례를 참고할 수 있습니다.",
            "representative_cases": [],
        },
        "recall_reason_summary": {
            "summary": "유사 국내 리콜 사례에서는 유해물질, 표시사항, 부자재 안전성 관련 사유가 자주 확인됩니다.",
            "top_recall_reasons": [
                "프탈레이트",
                "납",
                "표시사항",
            ],
        },
        "launch_checklist": [
            "법정 품목명 최종 확인",
            "안전기준 및 표시사항 확인",
            "원단, 코팅, 프린팅, 부자재 시험성적서 확보",
            "수입 제품의 경우 제조국 및 수입자 표시사항 확인",
        ],
        "final_report_markdown": f"""## 진단 결과

### 1. 제품명
- {product_name}

### 2. 법정 품목명 후보
- 아동용 섬유제품 후보

### 3. 예상 인증유형
- 공급자적합성확인 후보

### 4. 적용 가능 안전기준
- 어린이제품 공통안전기준
- 아동용 섬유제품 안전기준

### 5. 국내 리콜 주요 사유
- 프탈레이트계 가소제 초과
- 납 등 유해물질 기준 초과
- 표시사항 누락

### 6. 출시 전 확인사항
- 법정 품목명 최종 확인
- 원단, 코팅, 프린팅, 부자재 시험성적서 확보
- KC 표시 및 주의사항 문구 검토
""",
        "disclaimer": "공공데이터 기반 사전 검토용 안내이며 최종 확인은 관계 기관 또는 시험검사기관을 통해 진행해야 합니다.",
    }


def make_case_summary(case: DiagnosisCase) -> str:
    if not case.ai_output_json:
        return "진단 결과 없음"

    candidates = case.ai_output_json.get("legal_product_candidates", [])
    diagnosis = case.ai_output_json.get("certification_diagnosis", {})

    candidate_name = "품목명 후보 확인 필요"
    cert_type = "인증유형 확인 필요"

    if candidates:
        candidate_name = candidates[0].get("product_name", candidate_name)

    if diagnosis:
        cert_type = diagnosis.get("certification_type", cert_type)

    return f"{candidate_name}, {cert_type} 후보"


def serialize_case(case: DiagnosisCase) -> Dict[str, Any]:
    return {
        "case_id": case.id,
        "product_name": case.product_name,
        "status": case.status,
        "summary": make_case_summary(case),
        "created_at": case.created_at.isoformat(),
    }


@app.get("/")
def health_check():
    return {
        "message": "backend_running",
        "service": "certification_recall_risk_diagnosis_api",
    }


@app.post("/auth/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="email_already_registered",
        )

    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at.isoformat(),
    }


@app.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="invalid_email_or_password",
        )

    access_token = create_access_token(user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
        },
    }


@app.post("/auth/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {
        "message": "logout_success",
    }


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
    }


@app.post("/diagnoses")
def create_diagnosis(
    request: DiagnosisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    case_id = f"case_{uuid4().hex[:12]}"

    case = DiagnosisCase(
        id=case_id,
        user_id=current_user.id,
        product_name=request.product_name,
        user_query=request.user_query,
        target_age=request.target_age,
        material_text=request.material_text,
        power_type=request.power_type,
        battery_included=request.battery_included,
        import_or_manufacture=request.import_or_manufacture,
        model_name=request.model_name,
        brand_name=request.brand_name,
        maker_country=request.maker_country,
        cert_num=request.cert_num,
        additional_info=request.additional_info,
        status="pending",
    )

    db.add(case)
    db.commit()
    db.refresh(case)

    try:
        ai_result = create_mock_ai_result(case_id, request)

        case.status = "success"
        case.ai_output_json = ai_result
        case.final_report_markdown = ai_result.get("final_report_markdown")
        case.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(case)

        return ai_result

    except Exception as exc:
        case.status = "failed"
        case.error_message = str(exc)
        case.updated_at = datetime.utcnow()
        db.commit()

        raise HTTPException(
            status_code=500,
            detail="ai_diagnosis_failed",
        )


@app.get("/diagnoses")
def list_diagnoses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cases = (
        db.query(DiagnosisCase)
        .filter(DiagnosisCase.user_id == current_user.id)
        .order_by(DiagnosisCase.created_at.desc())
        .all()
    )

    return {
        "items": [serialize_case(case) for case in cases]
    }

@app.get("/diagnoses/{case_id}")
def get_diagnosis(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    case = (
        db.query(DiagnosisCase)
        .filter(
            DiagnosisCase.id == case_id,
            DiagnosisCase.user_id == current_user.id,
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="diagnosis_case_not_found",
        )

    return {
        "case_id": case.id,
        "input": {
            "product_name": case.product_name,
            "user_query": case.user_query,
            "target_age": case.target_age,
            "material_text": case.material_text,
            "power_type": case.power_type,
            "battery_included": case.battery_included,
            "import_or_manufacture": case.import_or_manufacture,
            "model_name": case.model_name,
            "brand_name": case.brand_name,
            "maker_country": case.maker_country,
            "cert_num": case.cert_num,
            "additional_info": case.additional_info,
        },
        "output": case.ai_output_json,
        "created_at": case.created_at.isoformat(),
    }
