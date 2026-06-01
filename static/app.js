// aibriefingnaver - 실시간 AEO 고도화 분석 비동기 인터랙션 엔진

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
    
    // 신규 고도화 렌더링 엘리먼트
    const relatedKeywordsTbody = document.getElementById("related-keywords-tbody");
    const aeoCategoryBadge = document.getElementById("aeo-category-badge");
    const aeoChecklist = document.getElementById("aeo-checklist");

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
        btnSpinner.classList.remove("hide");
        loadingState.classList.remove("hide");
        resultSection.classList.add("hide");
        keywordInput.blur();

        try {
            const response = await fetch(`/api/analyze?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error("네이버 실시간 데이터 조회 도중 오류가 발생했습니다.");
            }

            const data = await response.json();
            renderAnalysisResults(data);
            
            loadingState.classList.add("hide");
            resultSection.classList.remove("hide");
            
            resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            alert(error.message || "서버 통신 실패");
            loadingState.classList.add("hide");
        } finally {
            btnSpinner.classList.add("hide");
        }
    }

    // 4. 분석 데이터 동적 UI 렌더링
    function renderAnalysisResults(data) {
        // 4.1. AI 브리핑 상태 및 답변 내용 렌더링
        const ai = data.ai_briefing;
        if (ai.active) {
            aiActiveStatus.textContent = "노출 중";
            aiActiveStatus.className = "metric-value text-glow-purple";
            
            aiActiveBadge.textContent = "AI 브리핑 노출";
            aiActiveBadge.className = "board-badge active";
            
            // 백엔드가 포장해준 HTML 문단 및 표(Table) 구조 그대로 서빙
            aiBriefingBody.innerHTML = `
                <div class="ai-answer-container">
                    ${ai.answer}
                </div>
            `;
            
            // [초고도화] 출처 리스트 렌더링 (스크린샷 12번 레이아웃 완벽 이식)
            if (ai.sources && ai.sources.length > 0) {
                let sourcesHtml = '<div class="source-list-wrapper">';
                ai.sources.forEach(src => {
                    // 설명글이 없으면 깔끔하게 도메인/이름만 표시
                    const descStr = src.description ? src.description : "출처 정보 페이지 링크";
                    sourcesHtml += `
                        <a href="${src.url}" target="_blank" class="source-item" title="클릭하여 원본 출처 확인">
                            <span class="source-num">${src.index}</span>
                            <div class="source-info-wrapper">
                                <span class="source-name">${src.name}</span>
                                <span class="source-desc">${descStr}</span>
                            </div>
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    `;
                });
                sourcesHtml += '</div>';
                aiSourcesList.innerHTML = sourcesHtml;
            } else {
                aiSourcesList.innerHTML = `<div class="empty-state-small">인용된 본문 출처 링크가 존재하지 않습니다.</div>`;
            }

            // 관련 추천 질문 렌더링
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

                // 관련 질문 클릭 재검색 바인딩
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

        // 4.2. 메인 검색어 검색 트래픽 렌더링
        const vol = data.search_volume;
        totalSearchVolume.textContent = vol.total > 0 ? `${vol.total.toLocaleString()} 회` : "조회 불가";
        searchVolBreakdown.textContent = `PC: ${vol.pc.toLocaleString()} | 모바일: ${vol.mobile.toLocaleString()}`;

        // 4.3. 경쟁 포화도 렌더링
        const comp = data.competition;
        if (comp.level === "HIGH") {
            competitionLevel.textContent = "높음 (HIGH)";
            competitionLevel.className = "metric-value text-glow-red";
        } else if (comp.level === "MEDIUM") {
            competitionLevel.textContent = "보통 (MEDIUM)";
            competitionLevel.className = "metric-value text-glow-blue";
        } else {
            competitionLevel.textContent = "낮음 (LOW)";
            competitionLevel.className = "metric-value text-glow-green";
        }
        saturationRate.textContent = `포화비율: ${comp.saturation_rate}% (발행 글: ${comp.doc_count.toLocaleString()}건)`;

        // 4.4. 연관 검색어 분석 테이블 렌더링
        if (data.related_keywords && data.related_keywords.length > 0) {
            let tbodyHtml = "";
            data.related_keywords.forEach(rk => {
                const totalStr = rk.total > 0 ? rk.total.toLocaleString() : "10 미만";
                const pcStr = rk.pc > 0 ? rk.pc.toLocaleString() : "-";
                const moStr = rk.mobile > 0 ? rk.mobile.toLocaleString() : "-";
                
                let compLabel = "낮음";
                if (rk.level === "HIGH") compLabel = "높음";
                if (rk.level === "MEDIUM") compLabel = "보통";
                
                tbodyHtml += `
                    <tr class="clickable-row" data-keyword="${rk.keyword}" style="cursor: pointer;">
                        <td style="font-weight: 600; color: var(--neon-blue);">${rk.keyword}</td>
                        <td>${pcStr}</td>
                        <td>${moStr}</td>
                        <td style="font-weight: 500;">${totalStr}</td>
                        <td>${rk.doc_count.toLocaleString()} 건</td>
                        <td><span class="badge-level ${rk.level}">${compLabel} (${rk.level})</span></td>
                    </tr>
                `;
            });
            relatedKeywordsTbody.innerHTML = tbodyHtml;
            
            // 연관 검색어 행 클릭 시 즉시 신규 진단 실행
            document.querySelectorAll(".clickable-row").forEach(row => {
                row.addEventListener("click", () => {
                    const clickKeyword = row.getAttribute("data-keyword");
                    keywordInput.value = clickKeyword;
                    performAnalysis(clickKeyword);
                });
            });
        } else {
            relatedKeywordsTbody.innerHTML = `<tr><td colspan="6" class="text-center">조회된 연관 검색어가 없습니다.</td></tr>`;
        }

        // 4.5. AEO 블로그 노출 처방 체크리스트 렌더링
        const guide = data.aeo_guide;
        aeoCategoryBadge.textContent = guide.category;
        
        if (guide.checklist && guide.checklist.length > 0) {
            let checklistHtml = "";
            guide.checklist.forEach(chk => {
                checklistHtml += `
                    <div class="aeo-item" id="${chk.id}">
                        <div class="aeo-checkbox">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <span class="aeo-text">${chk.text}</span>
                    </div>
                `;
            });
            aeoChecklist.innerHTML = checklistHtml;
            
            // 체크리스트 마이크로 인터랙션 바인딩
            document.querySelectorAll(".aeo-item").forEach(item => {
                item.addEventListener("click", () => {
                    item.classList.toggle("completed");
                });
            });
        } else {
            aeoChecklist.innerHTML = `<p class="empty-state-small">지정된 AEO 가이드라인이 없습니다.</p>`;
        }
    }
});
