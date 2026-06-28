import './App.css'

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">OriginProof AI</div>
        <nav>
          <a>홈</a>
          <a>문서</a>
          <a>HS 분석</a>
          <a>리스크</a>
          <button>로그인</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="badge">전문 관세 AI 알고리즘 탑재</div>

          <h1>OriginProof AI</h1>

          <p className="subtitle">
            AI 기반 FTA 원산지 사후검증<br />
            증빙관리 플랫폼
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">문서 업로드 시작하기</button>
            <button className="secondary-btn">검증 결과 보기</button>
          </div>

          <div className="preview-card">
            <div className="preview-header">
              <span>AI 분석 중...</span>
              <strong>75%</strong>
            </div>
            <div className="progress">
              <div className="progress-bar"></div>
            </div>

            <div className="dashboard-grid">
              <div>
                <p>업로드 문서 수</p>
                <strong>128건</strong>
              </div>
              <div>
                <p>검증 완료</p>
                <strong>112건</strong>
              </div>
              <div>
                <p>위험 경고</p>
                <strong className="danger">5건</strong>
              </div>
              <div>
                <p>평균 리스크</p>
                <strong>12점</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <h2>완벽한 원산지 관리를 위한 핵심 솔루션</h2>
          <p className="section-desc">
            복잡한 증빙 서류부터 리스크 판정까지, AI가 실시간으로 가이드합니다.
          </p>

          <div className="feature-grid">
            <article className="feature-card large">
              <h3>원산지 기준 자동검토</h3>
              <p>
                BOM, 인보이스, 원산지증명서를 분석하여 FTA 협정별
                원산지 결정 기준 충족 여부를 판정합니다.
              </p>
            </article>

            <article className="feature-card dark">
              <h3>증빙 누락 탐지</h3>
              <p>
                사후검증 시 자주 발생하는 증빙 서류 누락을 사전에 탐지합니다.
              </p>
            </article>

            <article className="feature-card">
              <h3>HS 코드 변경기준 확인</h3>
              <p>
                품목분류의 적정성과 세번변경기준 충족 여부를 확인합니다.
              </p>
            </article>

            <article className="feature-card warning">
              <h3>사후검증 리스크 관리</h3>
              <p>
                관세청 사후검증 시나리오를 바탕으로 잠재 리스크를 식별합니다.
              </p>
            </article>
          </div>
        </section>

        <section className="cta">
          <h2>지금 바로 무료 분석을 시작하세요</h2>
          <p>
            글로벌 무역의 규제 장벽, OriginProof AI와 함께라면 더 이상 두렵지 않습니다.
          </p>
          <button>플랫폼 체험하기</button>
        </section>
      </main>
    </div>
  )
}

export default App