# -*- coding: utf-8 -*-
import time
import hmac
import hashlib
import base64
import requests

# 네이버 검색광고 API 설정 정보 (전달받은 자격증명 적용)
CUSTOMER_ID = 3987068
ACCESS_LICENSE = "0100000000f73f18101754f8bf6d9e1b37a1d1decaacc6d7d541d2b6fc7255de808c901112"
SECRET_KEY = "AQAAAAD3PxgQF1T4v22eGzeh0d7KBXqCHFwGNFvnKA9Y1oG2lw=="

BASE_URL = "https://api.searchad.naver.com"

def generate_signature(timestamp, method, uri, secret_key):
    """
    네이버 검색광고 API 호출을 위한 HMAC-SHA256 서명(Signature)을 생성합니다.
    """
    # 비밀키와 메시지 바이트 변환
    secret_bytes = secret_key.encode("utf-8")
    message = f"{timestamp}.{method.upper()}.{uri}"
    message_bytes = message.encode("utf-8")
    
    # HMAC-SHA256 암호화 서명 생성
    signature = hmac.new(secret_bytes, message_bytes, hashlib.sha256).digest()
    return base64.b64encode(signature).decode("utf-8")

def get_keyword_search_volume(keywords_list):
    """
    입력된 키워드 리스트(최대 5개)에 대한 월간 검색량(PC, 모바일) 데이터를 네이버 광고 API를 통해 가져옵니다.
    키워드 자체에 공백(띄어쓰기)이 있는 경우 API 에러를 유발하므로 공백을 제거하고 요청합니다.
    """
    uri = "/keywordstool"
    method = "GET"
    timestamp = str(int(time.time() * 1000))  # 밀리초(ms) 단위 타임스탬프
    
    # 서명(Signature) 생성
    signature = generate_signature(timestamp, method, uri, SECRET_KEY)
    
    # HTTP 헤더 설정
    headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Timestamp": timestamp,
        "X-API-KEY": ACCESS_LICENSE,
        "X-Customer": str(CUSTOMER_ID),
        "X-Signature": signature
    }
    
    # API 오류(11001)를 방지하기 위해 각 키워드의 공백을 제거하고 콤마로 결합
    cleaned_keywords = [kw.replace(" ", "") for kw in keywords_list]
    keywords_str = ",".join(cleaned_keywords)
    
    params = {
        "hintKeywords": keywords_str,
        "showDetail": "1"  # 1로 설정해야 PC/모바일별 상세 수치가 반환됩니다.
    }
    
    try:
        response = requests.get(BASE_URL + uri, headers=headers, params=params)
        if response.status_code == 200:
            return response.json().get("keywordList", [])
        else:
            print(f"검색광고 API 오류 (상태 코드: {response.status_code})")
            print(response.text)
            return None
    except Exception as e:
        print(f"API 호출 중 예외가 발생했습니다: {e}")
        return None

if __name__ == "__main__":
    # 테스트할 키워드 리스트 (최대 5개)
    test_keywords = ["사과", "사과 보관법", "사과 효능"]
    
    print(f"키워드 검색량 조회 시작: {test_keywords}\n")
    results = get_keyword_search_volume(test_keywords)
    
    if results:
        print(f"{'키워드':<15} | {'월간 PC 검색량':<10} | {'월간 모바일 검색량':<10} | {'총 검색량':<10}")
        print("-" * 60)
        for item in results:
            rel_keyword = item.get("relKeyword", "")
            # 검색량이 10 미만인 경우 '< 10' 문자열로 올 수 있으므로 예외 처리
            pc_vol = item.get("monthlyPcQcCnt", 0)
            mo_vol = item.get("monthlyMobileQcCnt", 0)
            
            # 숫자 데이터 포맷팅
            pc_str = str(pc_vol) if isinstance(pc_vol, str) else f"{pc_vol:,}"
            mo_str = str(mo_vol) if isinstance(mo_vol, str) else f"{mo_vol:,}"
            
            # 총합 계산 (문자열 우회)
            try:
                total_vol = int(pc_vol) + int(mo_vol)
                total_str = f"{total_vol:,}"
            except ValueError:
                total_str = "조회 불가"
                
            print(f"{rel_keyword:<15} | {pc_str:<10} | {mo_str:<10} | {total_str:<10}")
    else:
        print("검색량 데이터를 가져오는 데 실패했습니다.")
