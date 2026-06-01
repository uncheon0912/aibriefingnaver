# -*- coding: utf-8 -*-
import uvicorn
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import requests
from bs4 import BeautifulSoup
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor

# 기존 네이버 검색광고 API 모듈 가져오기
from naver_search_ad import get_keyword_search_volume

app = FastAPI(title="aibriefingnaver API", version="1.0")

# 멀티스레딩 처리를 위한 엑시큐터 설정 (동시 요청 처리 속도 최적화)
executor = ThreadPoolExecutor(max_workers=10)

def scrape_naver_ai_briefing(keyword: str):
    """
    네이버 모바일 통합검색에서 AI 브리핑 영역이 활성화되어 있는지 진단하고, 
    활성화된 경우 답변 내용, 출처 목록, 관련 질문을 실시간 크롤링하여 정제합니다.
    """
    # 모바일 네이버 검색 URL (공백을 + 또는 %20으로 인코딩)
    url = f"https://m.search.naver.com/search.naver?query={requests.utils.quote(keyword)}"
    
    # 봇 차단을 방지하고 완벽한 AI 브리핑 레이아웃 렌더링을 유도하기 위한 최신 스마트폰(Android Chrome) User-Agent 위장
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://m.naver.com/",
        "Cache-Control": "max-age=0"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=6)
        if response.status_code != 200:
            return {"active": False, "error": f"네이버 웹 응답 오류 ({response.status_code})"}
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 1. AI 브리핑 컨테이너 영역 초강력 탐색 (클래스명 난독화 및 변경 대비)
        ai_briefing_box = None
        
        # "AI 브리핑"이라는 고유 표식을 담고 있는 엘리먼트를 전체 DOM에서 대소문자 구분 없이 탐색
        target_tags = soup.find_all(text=re.compile(r"AI\s*브리핑", re.IGNORECASE))
        
        for element in target_tags:
            # 부모로 올라가며 네이버 통합검색의 카드 컨테이너(api_subject_bx, api_bx) 또는 알맞은 레이아웃 div 탐색
            parent = element.find_parent("div", class_=re.compile(r"api_subject_bx|api_bx|card_wrap|section"))
            if parent:
                ai_briefing_box = parent
                break
            # 부모 클래스가 애매할 경우, 3단계 상위 div를 가져옴
            else:
                p = element.parent
                if p:
                    pp = p.parent
                    if pp and pp.name == "div":
                        ai_briefing_box = pp
                        break
                        
        # 만약 박스를 찾지 못했다면 클래스명 기준 우회 탐색
        if not ai_briefing_box:
            ai_briefing_box = soup.find("div", class_=re.compile(r"ai_briefing|generative|cue_answer|ai_opinion"))

        if not ai_briefing_box:
            # AI 브리핑 영역이 감지되지 않음
            return {
                "active": False,
                "message": "해당 키워드는 네이버 AI 브리핑이 활성화되지 않은 키워드이거나, 인용 추천 대상이 아닙니다."
            }
            
        # 2. 본문 답변 텍스트 정밀 추출
        answer_text = ""
        
        # 가독성을 높이기 위해 AI 브리핑 영역 내의 텍스트 중 불필요한 메타 안내문 제거용 정규식
        noise_patterns = [
            r"AI\s*브리핑", 
            r"실험\s*단계로\s*정확하지\s*않을\s*수\s*있어요\.?", 
            r"도움이\s*되셨나요\.?",
            r"피드백\s*보내기",
            r"펼쳐서\s*더보기",
            r"관련\s*질문"
        ]
        
        # 클래스에 text, desc, content 등이 들어가는 엘리먼트 파싱
        paragraphs = ai_briefing_box.find_all(["p", "div", "span"], class_=re.compile(r"text|desc|paragraph|content|summary|detail_txt"))
        if paragraphs:
            raw_paragraphs = []
            for p in paragraphs:
                txt = p.get_text(strip=True)
                # 너무 짧은 노이즈 텍스트 필터링
                if txt and len(txt) > 5 and not any(re.search(pat, txt) for pat in noise_patterns):
                    raw_paragraphs.append(txt)
            if raw_paragraphs:
                answer_text = "\n\n".join(raw_paragraphs)
                
        # 만약 문단 단위 파싱에 실패했다면 전체 텍스트 수집 후 노이즈 정화
        if not answer_text or len(answer_text) < 15:
            full_text = ai_briefing_box.get_text("\n", strip=True)
            lines = []
            for line in full_text.split("\n"):
                line = line.strip()
                if line and not any(re.search(pat, line) for pat in noise_patterns):
                    lines.append(line)
            answer_text = "\n\n".join(lines)

        # 3. 출처 정보 (Citations / References) 파싱
        sources = []
        source_links = ai_briefing_box.find_all("a", href=True)
        seen_urls = set()
        
        for a in source_links:
            href = a["href"]
            title = a.get_text(strip=True)
            
            # 본문 출처 링크 필터링 (네이버 블로그, 카페 및 일반 외부 도메인 수집)
            if any(domain in href for domain in ["blog.naver.com", "cafe.naver.com", "brunch.co.kr", "tistory.com", "http"]):
                # 네이버 내부 길찾기나 공통 검색 스크립트 링크 제외
                if href not in seen_urls and "search.naver" not in href and "nid.naver.com" not in href:
                    # 링크 내의 노이즈 텍스트 정밀 제거
                    clean_title = re.sub(r"^\[\d+\]\s*|\s*\+\d+$|블로그|카페", "", title).strip()
                    if not clean_title:
                        # 타이틀이 비어있으면 도메인을 이름으로 대용
                        match = re.search(r"https?://([^/]+)", href)
                        clean_title = match.group(1) if match else "본문 출처"
                        
                    if len(clean_title) >= 2:
                        sources.append({
                            "index": len(sources) + 1,
                            "name": clean_title,
                            "url": href
                        })
                        seen_urls.add(href)
                        
        # 4. 관련 추천 질문 파싱
        related_questions = []
        # 물음표가 포함되거나 '질문' 타이틀 하위에 있는 텍스트/버튼 탐색
        question_elements = ai_briefing_box.find_all(["a", "button", "span", "div"], text=re.compile(r"\?|어떻게|무엇인가요|차이점|방법은"))
        
        for q in question_elements:
            q_text = q.get_text(strip=True)
            # 물음표가 포함된 실제 문장만 질문으로 채택
            if q_text and len(q_text) > 8 and q_text not in related_questions and "?" in q_text:
                # 불필요한 번호 장식 제거
                clean_q = re.sub(r"^\d+\.\s*", "", q_text)
                related_questions.append(clean_q)
                
        # 최종 결과 반환
        return {
            "active": True if len(answer_text) > 15 else False,
            "answer": answer_text if len(answer_text) > 15 else "AI 브리핑 답변 본문 영역을 파싱할 수 없습니다.",
            "sources": sources[:5],
            "related_questions": related_questions[:3]
        }
        
    except Exception as e:
        return {"active": False, "error": f"크롤러 작동 오류: {str(e)}"}

def get_blog_document_count(keyword: str):
    """
    네이버 모바일 검색 결과를 스캔하여 전체 블로그 문서 수를 대략적으로 추정합니다.
    (포화도 진단 시 분모로 사용)
    """
    url = f"https://search.naver.com/search.naver?query={keyword}&ssc=tab.blog.all"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    try:
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "html.parser")
            # 네이버 블로그 검색결과 상단의 전체 건수 텍스트 탐색 (예: "1/50,211건" 또는 "50,211건")
            count_elem = soup.find("span", class_="title_num")
            if count_elem:
                text = count_elem.get_text(strip=True)
                match = re.search(r"([\d,]+)건", text)
                if match:
                    return int(match.group(1).replace(",", ""))
    except:
        pass
    return 1500  # 기본 더미 수치 반환 (실패 시)

@app.get("/api/analyze")
async def analyze_keyword(keyword: str = Query(..., description="분석할 검색어 키워드 입력")):
    """
    키워드를 전달받아 월간 검색량(네이버 광고 API) 및 AI 브리핑 상태(실시간 스크래퍼)를 
    비동기로 동시 수집하여 연동 가공된 결과를 반환합니다.
    """
    if not keyword or not keyword.strip():
        raise HTTPException(status_code=400, detail="키워드를 입력해 주세요.")
        
    keyword = keyword.strip()
    
    # 1. 스레드풀을 통해 검색광고 API 조회 및 실시간 검색결과 스크래핑을 비동기로 동시 진행
    loop = asyncio.get_event_loop()
    
    # 병렬 실행 예약
    task_ad_api = loop.run_in_executor(executor, get_keyword_search_volume, [keyword])
    task_ai_scraper = loop.run_in_executor(executor, scrape_naver_ai_briefing, keyword)
    task_doc_count = loop.run_in_executor(executor, get_blog_document_count, keyword)
    
    # 세 개의 연동 결과를 대기
    ad_results, ai_briefing, doc_count = await asyncio.gather(task_ad_api, task_ai_scraper, task_doc_count)
    
    # 2. 검색광고 데이터 정제
    pc_vol = 0
    mo_vol = 0
    total_vol = 0
    
    if ad_results:
        # 입력한 키워드와 매칭되는 정확한 항목 필터링 (공백 완전 제거 상태로 대조)
        matched_item = None
        for item in ad_results:
            rel_kw = item.get("relKeyword", "").replace(" ", "")
            target_kw = keyword.replace(" ", "")
            if rel_kw == target_kw:
                matched_item = item
                break
            
        if matched_item:
            try:
                pc_vol = int(matched_item.get("monthlyPcQcCnt", 0))
            except (ValueError, TypeError):
                pc_vol = 5
            try:
                mo_vol = int(matched_item.get("monthlyMobileQcCnt", 0))
            except (ValueError, TypeError):
                mo_vol = 5
            total_vol = pc_vol + mo_vol
            
    # 3. 경쟁강도 / 포화도 계산 및 진단
    # 포화도 = (블로그 문서 수 / 총 검색량) * 100
    saturation_rate = 0.0
    competition_level = "LOW"
    
    if total_vol > 0:
        saturation_rate = round((doc_count / total_vol) * 100, 2)
        
    if saturation_rate > 150.0:
        competition_level = "HIGH"
    elif saturation_rate > 50.0:
        competition_level = "MEDIUM"
    else:
        competition_level = "LOW"
        
    # 최종 결과 조립
    analysis_data = {
        "keyword": keyword,
        "search_volume": {
            "pc": pc_vol,
            "mobile": mo_vol,
            "total": total_vol
        },
        "ai_briefing": ai_briefing,
        "competition": {
            "doc_count": doc_count,
            "saturation_rate": saturation_rate,
            "level": competition_level
        }
    }
    
    return analysis_data

# 정적 파일 서빙 등록 (프론트엔드 static 폴더)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    # 로컬 개발 서버 구동 (포트 8000)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
