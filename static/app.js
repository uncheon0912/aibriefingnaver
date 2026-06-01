// aibriefingnaver - 실시간 AEO 고도화 분석 비동기 인터랙션 엔진

// Web Audio API 기반 미래지향적 프리미엄 오디오 합성 엔진
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioCtx();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

// 1. 타이핑 사운드 (틱/톡 클릭음)
function playTickSound() {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.04);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
        console.warn("Audio play error", e);
    }
}

// 2. 오류 사운드 (삐빅 묵직한 에러음)
function playErrorSound() {
    try {
        const ctx = getAudioContext();
        
        const playBuzzer = (delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(160, ctx.currentTime + delay);
            osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + delay + 0.16);
            
            gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + delay + 0.16);
            
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.16);
        };
        
        playBuzzer(0);
        playBuzzer(0.18);
    } catch (e) {
        console.warn("Audio play error", e);
    }
}

// 3. 성공 사운드 (도-솔-도 진입 성공 비프음)
function playSuccessSound() {
    try {
        const ctx = getAudioContext();
        
        const playChime = (freq, delay, duration, vol) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            
            gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
        };
        
        playChime(523.25, 0, 0.22, 0.08);    // C5
        playChime(783.99, 0.07, 0.26, 0.08);   // G5
        playChime(1046.50, 0.14, 0.4, 0.1);  // C6
    } catch (e) {
        console.warn("Audio play error", e);
    }
}

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
    
    // [신규] 인용 썸네일 출처 관련 엘리먼트
    const multimediaBoard = document.getElementById("multimedia-board");
    const aiMultimediaList = document.getElementById("ai-multimedia-list");

    // [신규] 보안 인증 모달 관련 엘리먼트 정의
    const authModal = document.getElementById("auth-modal");
    const authForm = document.getElementById("auth-form");
    const authPasswordInput = document.getElementById("auth-password-input");
    const authErrorMsg = document.getElementById("auth-error-msg");

    // [신규] 게스트 / 마스터 배지 처리용 엘리먼트
    const headerBadgeContainer = document.getElementById("header-badge-container");
    let guestTimerInterval = null;

    // 게스트 재충전 타이머 (오늘 자정까지 카운트다운)
    function startGuestTimer() {
        if (guestTimerInterval) clearInterval(guestTimerInterval);
        
        const timerSpan = document.getElementById("guest-timer");
        if (!timerSpan) return;

        function updateTimer() {
            const now = new Date();
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            const diff = midnight - now;

            if (diff <= 0) {
                timerSpan.textContent = "00:00:00";
                fetchAuthStatus();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const hStr = String(hours).padStart(2, "0");
            const mStr = String(minutes).padStart(2, "0");
            const sStr = String(seconds).padStart(2, "0");

            timerSpan.textContent = `${hStr}:${mStr}:${sStr}`;
        }

        updateTimer();
        guestTimerInterval = setInterval(updateTimer, 1000);
    }

    // 백엔드로부터 정확한 권한 정보 및 게스트 횟수 수집
    async function fetchAuthStatus() {
        const token = sessionStorage.getItem("mydamgong_token");
        if (!token) return;

        try {
            const res = await fetch(`/api/auth/status?token=${encodeURIComponent(token)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.role === "master") {
                    headerBadgeContainer.className = "header-badge master-badge";
                    headerBadgeContainer.innerHTML = `<span class="badge-dot"></span> 마스터 회원 (무제한 분석)`;
                    if (guestTimerInterval) clearInterval(guestTimerInterval);
                } else if (data.role === "guest") {
                    headerBadgeContainer.className = "header-badge guest-badge";
                    headerBadgeContainer.innerHTML = `<span class="badge-dot"></span> 게스트 이용권: <span id="guest-count">${data.remaining}</span>/10회 | 충전까지 <span id="guest-timer">--:--:--</span>`;
                    startGuestTimer();
                }
            }
        } catch (e) {
            console.error("인증 상태를 가져올 수 없습니다.", e);
        }
    }

    // 초기 비밀번호 확인 및 제어
    function checkAuthentication() {
        const savedToken = sessionStorage.getItem("mydamgong_token");
        if (savedToken === "0988" || savedToken === "5420") {
            authModal.classList.add("hide");
            fetchAuthStatus(); // 권한 상태 및 횟수 렌더링 호출
            return true;
        } else {
            sessionStorage.removeItem("mydamgong_token");
            authModal.classList.remove("hide");
            authPasswordInput.focus();
            return false;
        }
    }

    // [신규] 비밀번호 입력할 때 틱 소리 재생
    authPasswordInput.addEventListener("input", () => {
        playTickSound();
    });

    // 인증 폼 전송 핸들러
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pwd = authPasswordInput.value.trim();
        if (pwd === "0988" || pwd === "5420") {
            playSuccessSound(); // 성공 차임 사운드
            sessionStorage.setItem("mydamgong_token", pwd);
            authModal.classList.add("hide");
            authErrorMsg.classList.add("hide");
            authPasswordInput.value = "";
            
            // [요청사항] 로그인해서 들어갔을 때 검색어 입력창을 빈 칸으로!
            keywordInput.value = "";
            
            // 인증 완료 후 초기 쿼리 파라미터가 있었다면 실시간 분석 자동 트리거
            const urlParams = new URLSearchParams(window.location.search);
            const initialKeyword = urlParams.get("keyword");
            if (initialKeyword) {
                performAnalysis(initialKeyword, false);
            }
        } else {
            playErrorSound(); // 삐빅 오류 사운드
            authErrorMsg.textContent = "올바르지 않은 비밀번호입니다.";
            authErrorMsg.classList.remove("hide");
            authPasswordInput.value = "";
            authPasswordInput.focus();
        }
    });

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
    async function performAnalysis(keyword, pushHistory = true) {
        const token = sessionStorage.getItem("mydamgong_token");
        if (!token) {
            checkAuthentication();
            return;
        }

        if (pushHistory) {
            history.pushState({ keyword: keyword }, "", `?keyword=${encodeURIComponent(keyword)}`);
        }

        btnSpinner.classList.remove("hide");
        loadingState.classList.remove("hide");
        resultSection.classList.add("hide");
        keywordInput.blur();

        try {
            const response = await fetch(`/api/analyze?keyword=${encodeURIComponent(keyword)}&token=${encodeURIComponent(token)}`);
            
            if (response.status === 401) {
                sessionStorage.removeItem("mydamgong_token");
                alert("인증 정보가 올바르지 않거나 만료되었습니다. 비밀번호를 다시 입력해 주세요.");
                checkAuthentication();
                throw new Error("인증 만료");
            }
            if (response.status === 429) {
                const errData = await response.json();
                throw new Error(errData.detail || "검색 제한이 초과되었습니다.");
            }
            if (!response.ok) {
                throw new Error("네이버 실시간 데이터 조회 도중 오류가 발생했습니다.");
            }

            const data = await response.json();
            
            // 게스트인 경우 실시간 잔여 검색 횟수 차감 렌더링
            if (data.guest_info && document.getElementById("guest-count")) {
                document.getElementById("guest-count").textContent = data.guest_info.remaining;
            }
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
            
            // [신규 고도화] 인용 썸네일 멀티미디어 리스트 렌더링
            if (ai.multimedia && ai.multimedia.length > 0) {
                multimediaBoard.classList.remove("hide");
                let multiHtml = "";
                ai.multimedia.forEach(item => {
                    multiHtml += `
                        <a href="${item.url}" target="_blank" class="thumbnail-card" title="클릭하여 원본 이미지 문서 확인">
                            <div class="thumbnail-img-wrapper">
                                <img src="${item.thumbnail_url}" alt="${item.title}" class="thumbnail-img" loading="lazy" referrerpolicy="no-referrer">
                                <span class="thumbnail-platform-badge">${item.platform}</span>
                            </div>
                            <div class="thumbnail-content">
                                <span class="thumbnail-title">${item.title}</span>
                                <div class="thumbnail-meta">
                                    <span class="thumbnail-author">${item.author}</span>
                                    <span class="thumbnail-date">${item.date}</span>
                                </div>
                            </div>
                        </a>
                    `;
                });
                aiMultimediaList.innerHTML = multiHtml;
            } else {
                multimediaBoard.classList.add("hide");
                aiMultimediaList.innerHTML = "";
            }

            // [초고도화] 출처 리스트 렌더링 (스크린샷 12번 레이아웃 완벽 이식)
            if (ai.sources && ai.sources.length > 0) {
                let sourcesHtml = '<div class="source-list-wrapper">';
                ai.sources.forEach(src => {
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
            
            multimediaBoard.classList.add("hide");
            aiMultimediaList.innerHTML = "";
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

    // 5. 뒤로 가기 / 앞으로 가기 (popstate) 이벤트 감지
    window.addEventListener("popstate", async (e) => {
        if (e.state && e.state.keyword) {
            keywordInput.value = e.state.keyword;
            await performAnalysis(e.state.keyword, false);
        } else {
            // 초기 빈 화면 복원
            keywordInput.value = "";
            resultSection.classList.add("hide");
            loadingState.classList.add("hide");
        }
    });

    // 6. 초기 로드 시 URL 파라미터 분석 및 자동 진단
    const urlParams = new URLSearchParams(window.location.search);
    const initialKeyword = urlParams.get("keyword");
    
    // [요청사항] 왼쪽 상단 로고 클릭 시 쿼리 파라미터 소거하고 홈 새로고침 이동
    const logoBtn = document.getElementById("logo-btn");
    if (logoBtn) {
        logoBtn.addEventListener("click", () => {
            window.location.href = window.location.origin + window.location.pathname;
        });
    }
    
    if (checkAuthentication()) {
        if (initialKeyword) {
            // [요청사항] 자동 분석은 돌리되 검색 필드는 깨끗하게 빈 값 보장!
            keywordInput.value = "";
            history.replaceState({ keyword: initialKeyword }, "", window.location.search);
            performAnalysis(initialKeyword, false);
        } else {
            keywordInput.value = "";
            history.replaceState({ keyword: "" }, "", window.location.search);
        }
    } else {
        if (initialKeyword) {
            history.replaceState({ keyword: initialKeyword }, "", window.location.search);
        } else {
            history.replaceState({ keyword: "" }, "", window.location.search);
        }
    }
});
