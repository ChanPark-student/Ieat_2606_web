import requests
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "http://127.0.0.1:8000"

def test_flow():
    print("=== [1] 사용자 회원가입 테스트 ===")
    reg_url = f"{BACKEND_URL}/auth/register"
    reg_data = {
        "email": "test_agent@example.com",
        "password": "agentpassword123",
        "name": "에이전트테스터"
    }
    try:
        res = requests.post(reg_url, json=reg_data)
        print("회원가입 상태코드:", res.status_code)
        print("회원가입 응답:", res.text)
    except Exception as e:
        print("회원가입 예외 (이미 존재할 수 있음):", e)

    print("\n=== [2] 로그인 테스트 ===")
    login_url = f"{BACKEND_URL}/auth/login"
    login_data = {
        "email": "test_agent@example.com",
        "password": "agentpassword123"
    }
    res = requests.post(login_url, json=login_data)
    print("로그인 상태코드:", res.status_code)
    if res.status_code != 200:
        print("로그인 실패:", res.text)
        return
    token = res.json()["access_token"]
    print("JWT 토큰 획득 성공")

    print("\n=== [3] 제품 진단 요청 테스트 (RAG + LLM 연동) ===")
    diag_url = f"{BACKEND_URL}/diagnoses"
    diag_data = {
        "product_name": "어린이용 봉제 인형",
        "user_query": "솜이 든 봉제 완구를 수입하여 국내에 유통하려 합니다. 안전 인증 요건이 궁금합니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "극세사 원단, 폴리에스터 솜, 실",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "수입",
        "model_name": "PLUSH-001",
        "brand_name": "토이월드",
        "maker_country": "중국",
        "cert_num": "",
        "additional_info": "별도 전원은 전혀 들어가지 않습니다."
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print("진단 요청 발송... (Hugging Face LLM 가동으로 15~30초 가량 소요될 수 있습니다)")
    start_time = time.time()
    res = requests.post(diag_url, json=diag_data, headers=headers)
    elapsed = time.time() - start_time
    print(f"진단 완료! 소요시간: {elapsed:.2f}초")
    print("진단 상태코드:", res.status_code)
    
    if res.status_code != 200:
        print("진단 실패:", res.text)
        return
        
    result = res.json()
    
    print("\n=== [4] 스키마 매핑 검증 ===")
    # 1. 루트 레벨 product_name
    print("1. 루트 레벨 product_name:", result.get("product_name"))
    
    # 2. candidates 내 product_name
    candidates = result.get("legal_product_candidates", [])
    if candidates:
        print("2. 매칭된 첫 번째 후보 product_name:", candidates[0].get("product_name"))
        print("   (display_product_name):", candidates[0].get("display_product_name"))
    else:
        print("2. 경고: 매칭된 법정 품목 후보가 없습니다.")
        
    # 3. recall_reason_summary 내 summary
    recall = result.get("recall_reason_summary", {})
    print("3. 리콜 요약 summary:", recall.get("summary"))
    
    # 4. kc_certification_summary 내 summary
    kc = result.get("kc_certification_summary", {})
    print("4. KC 유사인증 요약 summary:", kc.get("summary"))
    
    print("\n=== [5] 최종 마크다운 보고서 일부 ===")
    md_report = result.get("final_report_markdown", "")
    # Prevent cp949 crash
    print(md_report[:600].encode('utf-8', errors='replace').decode('utf-8'))
    print("...(생략)...")
    
    # Dump full API response for inspection
    with open("result_dump.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    test_flow()
