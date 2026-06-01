// aibriefingnaver - 실시간 AEO 분석 비동기 인터랙션 엔진

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const keywordInput = document.getElementById("keyword-input");
    const btnSpinner = document.getElementById("btn-spinner");
    const recTags = document.querySelectorAll(".rec-tag");
    const loadingState = document.getElementById("loading-state");
    const resultSection = document.getElementById("result-section");

    // 결과 렌더링 엘리먼트 정의
    const aiActiveStatus = document.getElementById("ai-active-status");
    const aiActiveBadge = document.getElementById("ai-active-badge");
    const totalSearchVolume = document.getElementById("total-search-volume");
    const searchVolBreakdown = document.getElementById("search-vol-breakdown");
    const competitionLevel = document.getElementById("competition-level");
    const saturationRate = document.getElementById("saturation-rate");
    
    const aiBriefingBody = document.getElementById("ai-briefing-body");
    const aiSourcesList = document.getElementById("ai-sources-list");
    const aiQuestionsList = document.getElementById("ai-questions-list");

    // 1. 검색 폼 서브밋 핸들러
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const keyword = keywordInput.value.trim();
        if (!keyword) return;

        await performAnalysis(keyword);
    });

    // 2. 추천 검색어 태그 클릭 연동
    recTags.forEach(tag => {
        tag.addEventListener("click", async () => {
            keywordInput.value = tag.textContent;
            await performAnalysis(tag.textContent);
        });
    });

    // 3. 실시간 분석 실행 함수
    async function performAnalysis(keyword) {
        // UI 상태 초기화 및 로딩 활성화
        btnSpinner.classList.remove("hide");
        loadingState.classList.remove("hide");
        resultSection.classList.add("hide");
        
        // 검색창 비활성화
        keywordInput.blur();

        try {
            // FastAPI 분석 API 호출
            const response = await fetch(`/api/analyze?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error("네이버 데이터 조회 도중 오류가 발생했습니다.");
            }

            const data = await response.json();
            
            // 데이터 렌더링 처리
            renderAnalysisResults(data);
            
            // 로딩 종료 및 결과 출력
            loadingState.classList.add("hide");
            resultSection.classList.remove("hide");
        } catch (error) {
            alert(error.message || "서버 통신 실패");
            loadingState.classList.add("hide");
        } finally {
            btnSpinner.classList.add("hide");
        }
    }

    // 4. 분석 데이터 동적 UI 렌더링
    function renderAnalysisResults(data) {
        // 4.1. AI 브리핑 상태 렌더링
        const ai = data.ai_briefing;
        if (ai.active) {
            aiActiveStatus.textContent = "노출 중";
            aiActiveStatus.className = "metric-value text-glow-purple";
            
            aiActiveBadge.textContent = "AI 브리핑 노출";
            aiActiveBadge.className = "board-badge active";
            
            // AI 답변 본문 렌더링 (HTML 개행 변환)
            // AI 답변에 테이블이 존재할 수 있으므로, HTML 문자열 안전 정비 후 주입
            const formattedAnswer = ai.answer.replace(/\n/g, "<br>");
            aiBriefingBody.innerHTML = `
                <div class="ai-answer-container">
                    ${formattedAnswer}
                </div>
            `;
            
            // 4.2. 출처 리스트 렌더링
            if (ai.sources && ai.sources.length > 0) {
                let sourcesHtml = '<div class="source-list-wrapper">';
                ai.sources.forEach(src => {
                    sourcesHtml += `
                        <a href="${src.url}" target="_blank" class="source-item">
                            <span class="source-num">${src.index}</span>
                            <span class="source-name" title="${src.name}">${src.name}</span>
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    `;
                });
                sourcesHtml += '</div>';
                aiSourcesList.innerHTML = sourcesHtml;
            } else {
                aiSourcesList.innerHTML = `<div class="empty-state-small">인용된 본문 출처 링크가 존재하지 않습니다.</div>`;
            }

            // 4.3. 관련 추천 질문 렌더링
            if (ai.related_questions && ai.related_questions.length > 0) {
                let questionsHtml = '<div class="question-list-wrapper">';
                ai.related_questions.forEach(q => {
                    questionsHtml += `
                        <div class="question-item" data-q="${q}">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            <span class="question-text">${q}</span>
                        </div>
                    `;
                });
                questionsHtml += '</div>';
                aiQuestionsList.innerHTML = questionsHtml;

                // 관련 질문 클릭 시 즉시 해당 질문으로 재진단 실행 인터랙션 추가
                document.querySelectorAll(".question-item").forEach(item => {
                    item.addEventListener("click", () => {
                        const nextKeyword = item.getAttribute("data-q");
                        keywordInput.value = nextKeyword;
                        performAnalysis(nextKeyword);
                    });
                });
            } else {
                aiQuestionsList.innerHTML = `<div class="empty-state-small">관련 질문 정보가 없습니다.</div>`;
            }

        } else {
            // AI 브리핑 미노출 상태 처리
            aiActiveStatus.textContent = "미노출";
            aiActiveStatus.className = "metric-value";
            
            aiActiveBadge.textContent = "미노출 키워드";
            aiActiveBadge.className = "board-badge";
            
            aiBriefingBody.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-circle-info"></i>
                    <p>${ai.message || "해당 키워드는 네이버 AI 브리핑 정보가 나타나지 않습니다."}</p>
                </div>
            `;
            
            aiSourcesList.innerHTML = `<div class="empty-state-small">인용된 본문 출처 링크가 존재하지 않습니다.</div>`;
            aiQuestionsList.innerHTML = `<div class="empty-state-small">추천된 질문 리스트가 존재하지 않습니다.</div>`;
        }

        // 4.4. 월간 검색량 렌더링
        const vol = data.search_volume;
        totalSearchVolume.textContent = vol.total > 0 ? `${vol.total.toLocaleString()} 회` : "조회 불가";
        searchVolBreakdown.textContent = `PC: ${vol.pc.toLocaleString()} | 모바일: ${vol.mobile.toLocaleString()}`;

        // 4.5. 경쟁 포화도 렌더링
        const comp = data.competition;
        
        // 포화도 등급에 따른 네온 색상 연동
        let levelClass = "metric-value";
        if (comp.level === "HIGH") {
            competitionLevel.textContent = "높음 (HIGH)";
            competitionLevel.className = "metric-value text-glow-purple"; // 보라색 경보
        } else if (comp.level === "MEDIUM") {
            competitionLevel.textContent = "보통 (MEDIUM)";
            competitionLevel.className = "metric-value text-glow-blue"; // 파란색 안심
        } else {
            competitionLevel.textContent = "낮음 (LOW)";
            competitionLevel.className = "metric-value text-glow-green"; // 연두색 기회
        }
        
        saturationRate.textContent = `포화비율: ${comp.saturation_rate}% (발행 글: ${comp.doc_count.toLocaleString()}건)`;
    }
});
