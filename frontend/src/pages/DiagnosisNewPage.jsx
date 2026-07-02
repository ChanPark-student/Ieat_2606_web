import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { createDiagnosis } from "../api/diagnosisApi";
import { sampleCases } from "../data/sampleCases";

export default function DiagnosisNewPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "",
    user_query: "",
    target_age: "어린이 13세 이하",
    material_text: "",
    power_type: "전원 없음",
    battery_included: false,
    import_or_manufacture: "수입",
    model_name: "",
    brand_name: "",
    maker_country: "",
    cert_num: "",
    additional_info: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSampleSelect(e) {
    const idx = e.target.value;
    if (idx === "") return;
    const sample = sampleCases[Number(idx)];
    setForm({
      product_name: sample.product_name || "",
      user_query: sample.user_query || "",
      target_age: sample.target_age || "어린이 13세 이하",
      material_text: sample.material_text || "",
      power_type: sample.power_type || "전원 없음",
      battery_included: sample.battery_included || false,
      import_or_manufacture: sample.import_or_manufacture || "수입",
      model_name: sample.model_name || "",
      brand_name: sample.brand_name || "",
      maker_country: sample.maker_country || "",
      cert_num: sample.cert_num || "",
      additional_info: sample.additional_info || "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const result = await createDiagnosis({
        ...form,
      });

      localStorage.setItem("latest_diagnosis_result", JSON.stringify(result));
      localStorage.setItem("selected_case_id", result.case_id);

      navigate("/diagnoses/result");
    } catch (err) {
      if (err.message === "Not authenticated" || err.message === "invalid_token") {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      alert(`진단 요청 실패: ${err.message}`);
    }
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="page">
        <section className="hero" style={{ padding: 36, marginBottom: 24 }}>
          <span className="eyebrow">New Diagnosis</span>

          <h1 className="hero-title" style={{ fontSize: 42 }}>
            제품 위험 진단
          </h1>

          <p className="hero-desc">
            제품명, 사용연령, 소재, 전원 방식, 제조·수입 여부를 입력하면
            백엔드 FastAPI 진단 API로 전달됩니다.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="form-layout">
          <section className="form-section" style={{ background: "rgba(240, 246, 255, 0.6)", borderColor: "var(--primary)", borderStyle: "dashed" }}>
            <h2>시연용 10대 샘플 자동 입력</h2>
            <div className="field">
              <label>기획자 전용 샘플 품목 선택 (선택 시 폼 자동 완성)</label>
              <select onChange={handleSampleSelect} defaultValue="" style={{ padding: "10px 14px", borderRadius: "10px", width: "100%", fontWeight: 600 }}>
                <option value="">-- 샘플 품목 선택 (원하는 시연 샘플을 고르세요) --</option>
                {sampleCases.map((sc, i) => (
                  <option key={i} value={i}>{sc.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="form-section">
            <h2>기본 정보</h2>

            <div className="field">
              <label>제품명 *</label>
              <input
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
                placeholder="예: 어린이용 책가방"
              />
            </div>

            <div className="field">
              <label>제품 설명 *</label>
              <textarea
                name="user_query"
                value={form.user_query}
                onChange={handleChange}
                required
                rows="4"
                placeholder="제품의 용도, 사용 대상, 주요 기능을 입력하세요."
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>대상 연령 *</label>
                <select
                  name="target_age"
                  value={form.target_age}
                  onChange={handleChange}
                >
                  <option>영유아 36개월 미만</option>
                  <option>어린이 13세 이하</option>
                  <option>성인</option>
                </select>
              </div>

              <div className="field">
                <label>제조/수입 여부 *</label>
                <select
                  name="import_or_manufacture"
                  value={form.import_or_manufacture}
                  onChange={handleChange}
                >
                  <option>수입</option>
                  <option>국내 제조</option>
                  <option>OEM 생산</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>기술 사양 및 소재</h2>

            <div className="field">
              <label>주요 소재 *</label>
              <textarea
                name="material_text"
                value={form.material_text}
                onChange={handleChange}
                required
                rows="3"
                placeholder="예: 폴리에스터, 코팅 원단, 플라스틱 버클"
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>전원 유형 *</label>
                <select
                  name="power_type"
                  value={form.power_type}
                  onChange={handleChange}
                >
                  <option>전원 없음</option>
                  <option>배터리</option>
                  <option>교류 전원</option>
                  <option>기타</option>
                </select>
              </div>

              <div className="field">
                <label>배터리 포함 여부 *</label>
                <select
                  name="battery_included"
                  value={form.battery_included ? "true" : "false"}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      battery_included: e.target.value === "true",
                    }));
                  }}
                >
                  <option value="false">아니오</option>
                  <option value="true">예</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>추가 정보</h2>

            <div className="grid-2">
              <div className="field">
                <label>모델명</label>
                <input
                  name="model_name"
                  value={form.model_name}
                  onChange={handleChange}
                  placeholder="예: BAG-001"
                />
              </div>

              <div className="field">
                <label>브랜드명</label>
                <input
                  name="brand_name"
                  value={form.brand_name}
                  onChange={handleChange}
                  placeholder="브랜드명"
                />
              </div>

              <div className="field">
                <label>제조국</label>
                <input
                  name="maker_country"
                  value={form.maker_country}
                  onChange={handleChange}
                  placeholder="예: 중국"
                />
              </div>

              <div className="field">
                <label>기존 인증번호</label>
                <input
                  name="cert_num"
                  value={form.cert_num}
                  onChange={handleChange}
                  placeholder="KC 인증번호가 있다면 입력"
                />
              </div>
            </div>

            <div className="field">
              <label>추가 설명</label>
              <textarea
                name="additional_info"
                value={form.additional_info}
                onChange={handleChange}
                rows="3"
                placeholder="기타 특이사항을 입력하세요."
              />
            </div>
          </section>

          <button className="btn-primary" style={{ width: "100%", fontSize: 17 }}>
            진단 요청하기
          </button>
        </form>
      </main>
    </div>
  );
}