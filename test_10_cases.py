import requests
import time
import json

BACKEND_URL = "http://127.0.0.1:8000"

TEST_CASES = [
    {
        "product_name": "어린이용 봉제 곰인형",
        "user_query": "안에 솜이 가득 차 있는 곰인형 완구를 중국에서 수입하려고 합니다. 안전 요건 검토를 부탁합니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "폴리에스터 원단, 폴리에스터 솜, 실",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "수입",
        "model_name": "BEAR-01"
    },
    {
        "product_name": "유아용 플라스틱 식기 세트",
        "user_query": "어린이집에서 사용할 수 있는 아기 숟가락, 포크, 식판 세트입니다. 무독성 요건 등을 진단해주세요.",
        "target_age": "영유아 36개월 미만",
        "material_text": "PP(폴리프로필렌), 실리콘",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "국내 제조",
        "model_name": "BABY-MEAL"
    },
    {
        "product_name": "아동용 방수 바람막이 점퍼",
        "user_query": "환절기에 입는 아동용 바람막이 점퍼입니다. 끈 조절 지퍼와 금속 똑딱이 단추가 부착되어 있습니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "나일론 원단, 지퍼, 금속 단추, 코팅 원사",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "수입",
        "model_name": "WIND-STOP"
    },
    {
        "product_name": "LED 발광 요요 완구",
        "user_query": "회전 시 건전지로 LED 불빛이 반짝이는 플라스틱 요요 장난감입니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "ABS 플라스틱, LED 기판, 나사",
        "power_type": "배터리",
        "battery_included": True,
        "import_or_manufacture": "수입",
        "model_name": "LED-YOYO"
    },
    {
        "product_name": "영유아용 보행기",
        "user_query": "바퀴가 달려 영유아가 밀고 다닐 수 있는 걸음마 보조 보행기입니다. 높이 조절 장치가 있습니다.",
        "target_age": "영유아 36개월 미만",
        "material_text": "플라스틱 프레임, 스틸 지지대, 고무 바퀴",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "국내 제조",
        "model_name": "WALK-ASSIST"
    },
    {
        "product_name": "어린이용 은목걸이 및 귀걸이",
        "user_query": "초등학생용 패션 은목걸이와 귀걸이 귀금속류 세트입니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "925 실버(은), 도금 코팅",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "수입",
        "model_name": "SILVER-SET"
    },
    {
        "product_name": "아동용 목재 학습용 책상",
        "user_query": "어린이가 공부방에서 사용하는 목재 재질의 학습용 책상과 의자 가구 세트입니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "MDF 판재, 원목 나무, 나사못, 친환경 페인트",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "국내 제조",
        "model_name": "DESK-STUDY"
    },
    {
        "product_name": "어린이 놀이방 미끄럼틀 완구",
        "user_query": "거실에 설치하여 탈 수 있는 접이식 실내 플라스틱 미끄럼틀입니다.",
        "target_age": "영유아 36개월 미만",
        "material_text": "HDPE 플라스틱",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "수입",
        "model_name": "SLIDE-PLAY"
    },
    {
        "product_name": "어린이용 캐릭터 스케치북 및 크레파스",
        "user_query": "초등학생 미술용 캐릭터 무늬 스케치북과 12색 미술 크레파스 학용품 세트입니다.",
        "target_age": "어린이 13세 이하",
        "material_text": "종이, 스프링 철사, 왁스, 안료",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "국내 제조",
        "model_name": "CRAYON-BOOK"
    },
    {
        "product_name": "유아용 봉제 인형 유모차 모빌",
        "user_query": "유모차나 아기 침대에 걸어두고 쓰는 종소리가 나는 패브릭 모빌 장난감입니다.",
        "target_age": "영유아 36개월 미만",
        "material_text": "코튼 원단, 플라스틱 클립, 내부 방울 종",
        "power_type": "전원 없음",
        "battery_included": False,
        "import_or_manufacture": "수입",
        "model_name": "MOBIL-TOY"
    }
]

def run_10_tests():
    print("=== [1] 테스트용 JWT 토큰 획득 ===")
    login_url = f"{BACKEND_URL}/auth/login"
    login_data = {
        "email": "test_agent@example.com",
        "password": "agentpassword123"
    }
    
    try:
        res = requests.post(login_url, json=login_data)
        if res.status_code != 200:
            print("로그인 실패! 테스트를 종료합니다. (응답:", res.text, ")")
            return
        token = res.json()["access_token"]
        print("로그인 성공 및 토큰 확보 완료.")
    except Exception as e:
        print("서버 연결 실패:", e)
        return

    headers = {
        "Authorization": f"Bearer {token}"
    }

    results = []

    print("\n=== [2] 10개 다른 데이터 진단 테스트 순차 수행 ===")
    for idx, case in enumerate(TEST_CASES, 1):
        print(f"\n[{idx}/10] {case['product_name']} 진단 요청 중...")
        start_time = time.time()
        status_code = None
        error_msg = ""
        success = False
        
        try:
            diag_url = f"{BACKEND_URL}/diagnoses"
            res = requests.post(diag_url, json=case, headers=headers, timeout=120.0)
            status_code = res.status_code
            if res.status_code == 200:
                success = True
                res_data = res.json()
                # 검증
                legal_name = res_data.get("legal_product_candidates", [{}])[0].get("product_name", "미정")
                cert_type = res_data.get("certification_diagnosis", {}).get("certification_type", "미정")
                mode = res_data.get("report_generation_mode", "template")
                model = res_data.get("model_name", "N/A")
                print(f" >> 성공! 품목: {legal_name} | 인증유형: {cert_type} | 모드: {mode} ({model})")
            else:
                error_msg = res.json().get("detail", res.text)
                print(f" >> 실패 (HTTP {res.status_code}): {error_msg}")
        except Exception as e:
            error_msg = str(e)
            print(f" >> 예외 발생: {error_msg}")
            
        elapsed = time.time() - start_time
        print(f" >> 소요시간: {elapsed:.2f}초")
        
        results.append({
            "idx": idx,
            "product_name": case["product_name"],
            "success": success,
            "status_code": status_code,
            "elapsed": round(elapsed, 2),
            "error_msg": error_msg
        })
        
        # 서버 과부하 및 쿨다운을 위해 잠시 대기
        time.sleep(1.0)

    print("\n=== [3] 최종 종합 테스트 보고서 ===")
    success_count = sum(1 for r in results if r["success"])
    print(f"종합 결과: {success_count} / 10 성공")
    
    # 보고서 파일 쓰기
    with open("test_10_results.json", "w", encoding="utf-8") as f:
        json.dump({
            "summary": {
                "total": 10,
                "success": success_count,
                "failed": 10 - success_count
            },
            "details": results
        }, f, ensure_ascii=False, indent=2)
    print("결과가 'test_10_results.json' 파일에 저장되었습니다.")

if __name__ == "__main__":
    run_10_tests()
