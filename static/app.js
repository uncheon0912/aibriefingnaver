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
    // 뷰 전환 관련 엘리먼트
    const menuKeywordAnalyzer = document.getElementById("menu-keyword-analyzer");
    const menuBlogDiagnose = document.getElementById("menu-blog-diagnose");
    const menuBlogIndex = document.getElementById("menu-blog-index");
    const viewKeywordAnalyzer = document.getElementById("view-keyword-analyzer");
    const viewBlogDiagnose = document.getElementById("view-blog-diagnose");
    const viewBlogIndex = document.getElementById("view-blog-index");

    // 기존 키워드 검색용 엘리먼트
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
    
    const relatedKeywordsTbody = document.getElementById("related-keywords-tbody");
    const aeoCategoryBadge = document.getElementById("aeo-category-badge");
    const aeoChecklist = document.getElementById("aeo-checklist");
    
    const multimediaBoard = document.getElementById("multimedia-board");
    const aiMultimediaList = document.getElementById("ai-multimedia-list");

    // 보안 인증 모달 관련 엘리먼트 정의
    const authModal = document.getElementById("auth-modal");
    const authForm = document.getElementById("auth-form");
    const authPasswordInput = document.getElementById("auth-password-input");
    const authErrorMsg = document.getElementById("auth-error-msg");

    // [신규] 블로그 진단(AI 추천 진단) 관련 엘리먼트
    const blogForm = document.getElementById("blog-form");
    const blogInput = document.getElementById("blog-input");
    const blogSpinner = document.getElementById("blog-spinner");
    const blogLoadingState = document.getElementById("blog-loading-state");
    const blogResultSection = document.getElementById("blog-result-section");
    const blogDiagnoseTbody = document.getElementById("blog-diagnose-tbody");

    // 블로그 통계 엘리먼트
    const statTotalPosts = document.getElementById("stat-total-posts");
    const statSearchExposure = document.getElementById("stat-search-exposure");
    const statSearchPercent = document.getElementById("stat-search-percent");
    const statAiExposure = document.getElementById("stat-ai-exposure");
    const statAiPercent = document.getElementById("stat-ai-percent");
    const distBarAi = document.getElementById("dist-bar-ai");
    const distBarSearch = document.getElementById("dist-bar-search");
    const distCountAi = document.getElementById("dist-count-ai");
    const distCountSearch = document.getElementById("dist-count-search");

    // 필터 & 정렬 카운트 뱃지 엘리먼트
    const chipCountAll = document.getElementById("chip-count-all");
    const chipCountSearchOnly = document.getElementById("chip-count-search-only");
    const chipCountAiActive = document.getElementById("chip-count-ai-active");
    const chipCountAiRecommend = document.getElementById("chip-count-ai-recommend");

    // [신규] 조회 개수 필터 및 AEO 상세 진단 팝업 모달 엘리먼트 정의
    const countSelect = document.getElementById("count-select");
    const aeoDetailModal = document.getElementById("aeo-detail-modal");
    const modalPostTitle = document.getElementById("modal-post-title");
    const modalPostLink = document.getElementById("modal-post-link");
    const modalTargetKeyword = document.getElementById("modal-target-keyword");
    const modalSearchVolume = document.getElementById("modal-search-volume");
    const modalSaturationRate = document.getElementById("modal-saturation-rate");
    const modalRelatedKeywordsTbody = document.getElementById("modal-related-keywords-tbody");
    const modalAiExposureBadge = document.getElementById("modal-ai-exposure-badge");
    const modalAiBriefingContent = document.getElementById("modal-ai-briefing-content");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    // 전역 상태 변수
    let currentBlogPosts = []; // 최근 수집된 블로그 포스팅 데이터 보존
    let activeFilter = "all";
    let activeSort = "date";
    let activeLimit = 15;
    let currentPage = 1;
    const pageSize = 30;

    // 0. 사이드바 메뉴 탭 전환 바인딩
    function switchTab(activeMenu, activeView) {
        [menuKeywordAnalyzer, menuBlogDiagnose, menuBlogIndex].forEach(m => {
            if (m) m.classList.remove("active");
        });
        [viewKeywordAnalyzer, viewBlogDiagnose, viewBlogIndex].forEach(v => {
            if (v) v.classList.add("hide");
        });
        if (activeMenu) activeMenu.classList.add("active");
        if (activeView) activeView.classList.remove("hide");
    }

    if (menuKeywordAnalyzer) {
        menuKeywordAnalyzer.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab(menuKeywordAnalyzer, viewKeywordAnalyzer);
        });
    }

    if (menuBlogDiagnose) {
        menuBlogDiagnose.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab(menuBlogDiagnose, viewBlogDiagnose);
        });
    }

    if (menuBlogIndex) {
        menuBlogIndex.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab(menuBlogIndex, viewBlogIndex);
        });
    }

    // 게스트 / 마스터 배지 처리용 엘리먼트
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

    // 비밀번호 입력할 때 틱 소리 재생
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
            
            // 로그인해서 들어갔을 때 검색어 입력창을 빈 칸으로!
            keywordInput.value = "";
            
            // 만약 현재 활성화된 뷰가 키워드 분석기이고 URL 쿼리 파라미터가 있었다면 자동 트리거
            const urlParams = new URLSearchParams(window.location.search);
            const initialKeyword = urlParams.get("keyword");
            if (initialKeyword && menuKeywordAnalyzer.classList.contains("active")) {
                performAnalysis(initialKeyword, false);
            } else {
                fetchAuthStatus();
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
        const ai = data.ai_briefing;
        if (ai.active) {
            aiActiveStatus.textContent = "노출 중";
            aiActiveStatus.className = "metric-value text-glow-purple";
            
            aiActiveBadge.textContent = "AI 브리핑 노출";
            aiActiveBadge.className = "board-badge active";
            
            aiBriefingBody.innerHTML = `
                <div class="ai-answer-container">
                    ${ai.answer}
                </div>
            `;
            
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

        const vol = data.search_volume;
        totalSearchVolume.textContent = vol.total > 0 ? `${vol.total.toLocaleString()} 회` : "조회 불가";
        searchVolBreakdown.textContent = `PC: ${vol.pc.toLocaleString()} | 모바일: ${vol.mobile.toLocaleString()}`;

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
            
            document.querySelectorAll(".aeo-item").forEach(item => {
                item.addEventListener("click", () => {
                    item.classList.toggle("completed");
                });
            });
        } else {
            aeoChecklist.innerHTML = `<p class="empty-state-small">지정된 AEO 가이드라인이 없습니다.</p>`;
        }
    }


    // ==========================================================================
    // [신규] 블로그 AI 추천 진단 핵심 인터랙션 스크립트
    // ==========================================================================

    // 네이버 블로그 URL에서 ID 파싱
    function extractBlogId(inputVal) {
        let val = inputVal.trim();
        if (val.includes("blog.naver.com/")) {
            // URL 형태인 경우: blog.naver.com/{id} 또는 blog.naver.com/PostView?blogId={id}
            try {
                if (val.includes("blogId=")) {
                    const urlObj = new URL(val);
                    return urlObj.searchParams.get("blogId");
                } else {
                    const parts = val.split("blog.naver.com/");
                    const subParts = parts[1].split("/");
                    return subParts[0].split("?")[0];
                }
            } catch(e) {
                return val;
            }
        }
        return val;
    }

    // 포스트 제목에서 대표 키워드 추출용 규칙 (의문문 제외, 명사구 중심 추출)
    function extractRepresentativeKeyword(title, postUrl) {
        // F5 새로고침 또는 키워드 기억을 위해 localStorage 캐시 확인
        const cacheKey = `blog_kw_${postUrl}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached.trim();

        let cleanTitle = title.trim();

        // 1. 따옴표나 대괄호 안의 핵심 텍스트가 있다면 최우선 고려
        const quotesMatch = cleanTitle.match(/['"\[\(\{]([^'""\]\)\}]+)[建设项目'"\]\)\}]/);
        if (quotesMatch && quotesMatch[1].trim().length >= 2 && quotesMatch[1].trim().length <= 15) {
            const kwCandidate = quotesMatch[1].trim();
            if (!/[?？]/.test(kwCandidate)) {
                return kwCandidate;
            }
        }

        // 2. 제목 정제 및 토큰화
        let textForToken = cleanTitle.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]]/g, " ");
        let tokens = textForToken.split(/\s+/).map(t => t.trim()).filter(t => t.length >= 2);

        // 조사를 떼어내는 규칙 (명사 추출을 위한 어미 정제)
        function cleanJosa(word) {
            const josas = ["은", "는", "이", "가", "을", "를", "의", "에", "에서", "으로", "로", "와", "과", "도", "만", "시", "때", "한", "된", "할", "하는", "하기", "하나요", "인가요"];
            for (let josa of josas) {
                if (word.endsWith(josa) && word.length > josa.length) {
                    return word.slice(0, -josa.length);
                }
            }
            return word;
        }

        // 불용어 목록 (의문사, 동사구 등 키워드가 될 수 없는 단어들)
        const stopWords = [
            "이유", "이유는", "이유를", "원인", "방법", "추천", "의문", "무엇", "어떻게", "왜", "느낀", "느낀것은", "중요한", "알고", 
            "먹어야", "진짜", "보약", "풍부한", "꿀조합", "대부분", "갈립니다", "지적되는", "문구는", "존재할까", "때문일까", "있을까", 
            "어떨까", "하나요", "할까", "아십니까", "인가요", "중요한가", "알어보아요", "알아보아요", "알아보자", "가이드", "총정리", "주의할", "소개"
        ];

        let validNouns = [];
        for (let t of tokens) {
            let noun = cleanJosa(t);
            noun = cleanJosa(noun); // 조사가 2중 결합된 형태 제거

            if (noun.length >= 2 && !stopWords.includes(noun) && !/[?？!！]/.test(noun)) {
                validNouns.push(noun);
            }
        }

        // 3. 네이버 키워드에 근거한 명사 조합 분석 규칙
        if (validNouns.length > 0) {
            if (validNouns.includes("사과") && validNouns.includes("보관법")) {
                return "사과 보관법";
            }
            if (validNouns.includes("사과") && validNouns.includes("효능")) {
                return "사과 효능";
            }
            if (validNouns.includes("의료광고심의") && validNouns.includes("블로그")) {
                return "블로그 의료광고심의";
            }
            if (validNouns.includes("병원") && validNouns.includes("블로그")) {
                if (validNouns.includes("포스팅")) return "병원 블로그 포스팅";
                return "병원 블로그";
            }
            if (validNouns.includes("손목터널증후군")) {
                return "손목터널증후군";
            }
            if (validNouns.includes("기미") && validNouns.includes("레이저")) {
                return "레이저 기미";
            }
            if (validNouns.includes("재활의학과") && validNouns.includes("블로그")) {
                return "재활의학과 블로그 마케팅";
            }

            if (validNouns.length >= 3) {
                return validNouns.slice(0, 3).join(" ");
            } else if (validNouns.length >= 2) {
                return validNouns.slice(0, 2).join(" ");
            }
            return validNouns[0];
        }

        return "네이버 블로그";
    }

    // 블로그 폼 전송 이벤트
    blogForm.addEventListener("submit", (e) => {
        e.preventDefault();
        triggerBlogAnalysis(false); // 새로 조회
    });

    // 블로그 분석 구동기 (isAdditional: 누적 추가 스크래핑 여부)
    async function triggerBlogAnalysis(isAdditional = false) {
        const token = sessionStorage.getItem("mydamgong_token");
        if (!token) {
            checkAuthentication();
            return;
        }

        const rawVal = blogInput.value.trim();
        const blogId = extractBlogId(rawVal);
        if (!blogId) return;

        // 사이드바 대표 정보 동기화
        document.getElementById("sidebar-blog-name").textContent = blogId;

        let offset = 0;
        let limit = 15;

        if (isAdditional) {
            offset = currentBlogPosts.length;
            limit = parseInt(countSelect.value);
            if (isNaN(limit)) limit = 10;
            
            // 게스트 등급(5420)은 누적 200개 한도 제한 적용
            if (token === "5420" && (offset + limit) > 200) {
                // 초과 시 경고 모달 노출 및 진행 차단
                const upgradeModal = document.getElementById("premium-upgrade-modal");
                if (upgradeModal) {
                    upgradeModal.classList.remove("hide");
                } else {
                    alert("[게스트 제한] 누적 포스팅 수집 한도(최대 200개)를 초과할 수 없습니다. 마스터 등급으로 전환해 주세요.");
                }
                // 드롭다운 선택 초기화
                countSelect.value = "15";
                return;
            }
        } else {
            // 새로 검색 시 기존 데이터 초기화
            currentBlogPosts = [];
            currentPage = 1;
            activeLimit = 15;
            countSelect.value = "15"; // 드롭다운 기본값으로 리셋
        }

        blogSpinner.classList.remove("hide");
        // 추가 수집일 때는 전체 로딩 서클을 띄우지 않고, 신규 행의 개별 스피너만 보이게 처리
        if (!isAdditional) {
            blogLoadingState.classList.remove("hide");
            blogResultSection.classList.add("hide");
        }

        try {
            const res = await fetch(`/api/blog/posts?blog_id=${encodeURIComponent(blogId)}&offset=${offset}&limit=${limit}`);
            if (!res.ok) {
                throw new Error("블로그 글 목록을 가져올 수 없습니다. 비공개이거나 아이디가 잘못되었습니다.");
            }

            const posts = await res.json();
            if (posts.length === 0) {
                if (isAdditional) {
                    alert("더 이상 가져올 수 있는 포스팅이 없습니다.");
                    return;
                }
                throw new Error("수집된 최근 포스트가 없습니다.");
            }

            // 추가 수집된 포스트 매핑
            const newMappedPosts = posts.map(p => {
                const kw = extractRepresentativeKeyword(p.title, p.link);
                return {
                    title: p.title,
                    link: p.link,
                    pub_date: p.pub_date,
                    iso_date: p.iso_date,
                    keyword: kw,
                    search_volume: 0,
                    saturation_rate: 0,
                    exposure: "-",
                    ai_status: "-",
                    loading: true
                };
            });

            // 누적 덧붙이기 (Concat)
            currentBlogPosts = currentBlogPosts.concat(newMappedPosts);

            if (!isAdditional) {
                blogLoadingState.classList.add("hide");
                blogResultSection.classList.remove("hide");
            }
            
            // 테이블 렌더링 및 페이지네이션 재생성
            renderBlogTable();

            // 추가된 인덱스 범위에 대해서만 개 개별 진단 비동기 루프 기동
            const startIndex = offset;
            const endIndex = currentBlogPosts.length;
            
            diagnoseRangePosts(startIndex, endIndex, token);

        } catch(err) {
            alert(err.message || "블로그 조회 실패");
            if (!isAdditional) {
                blogLoadingState.classList.add("hide");
            }
        } finally {
            blogSpinner.classList.add("hide");
        }
    }

    // 특정 범위의 포스팅만 순차 진단하는 루프
    async function diagnoseRangePosts(start, end, token) {
        const targetSlice = currentBlogPosts.slice(start, end);
        const batchSize = 3;
        
        for (let i = 0; i < targetSlice.length; i += batchSize) {
            const batch = targetSlice.slice(i, i + batchSize);
            const promises = batch.map((post, idx) => {
                const actualIdx = start + i + idx;
                return diagnoseSinglePost(post, actualIdx, token);
            });
            await Promise.all(promises);
            // 실시간 통계 업데이트
            calculateBlogStats();
        }
    }

    // 포스트 1개당 개별 진단
    async function diagnoseSinglePost(post, index, token) {
        try {
            const res = await fetch(`/api/blog/diagnose?post_url=${encodeURIComponent(post.link)}&keyword=${encodeURIComponent(post.keyword)}&token=${encodeURIComponent(token)}`);
            if (res.status === 401) {
                sessionStorage.removeItem("mydamgong_token");
                checkAuthentication();
                throw new Error("인증 실패");
            }
            if (res.status === 429) {
                const errData = await res.json();
                throw new Error(errData.detail || "제한 초과");
            }

            if (res.ok) {
                const data = await res.json();
                
                // 게스트 토큰 카운터 동기화
                if (data.guest_info && document.getElementById("guest-count")) {
                    document.getElementById("guest-count").textContent = data.guest_info.remaining;
                }

                currentBlogPosts[index].search_volume = data.search_volume;
                currentBlogPosts[index].saturation_rate = data.saturation_rate;
                currentBlogPosts[index].exposure = data.exposure;
                currentBlogPosts[index].ai_status = data.ai_status;
                currentBlogPosts[index].loading = false;
            } else {
                currentBlogPosts[index].loading = false;
                currentBlogPosts[index].exposure = "X";
                currentBlogPosts[index].ai_status = "미추천";
            }
        } catch(e) {
            currentBlogPosts[index].loading = false;
            currentBlogPosts[index].exposure = "X";
            currentBlogPosts[index].ai_status = "미추천";
            console.error("Single diagnose error", e);
        }

        // 해당 행만 부분 렌더링 갱신
        updateTableRow(index);
    }

    // 진단 리스트 렌더링
    function renderBlogTable() {
        let html = "";
        
        // 필터링 적용
        let filtered = currentBlogPosts.filter(p => {
            if (activeFilter === "all") return true;
            if (activeFilter === "search") return p.exposure === "O";
            if (activeFilter === "ai-active") return p.ai_status === "추천" || p.ai_status === "미추천";
            if (activeFilter === "ai-recommend") return p.ai_status === "추천";
            return true;
        });

        // 정렬 적용
        filtered.sort((a, b) => {
            if (activeSort === "date") return 0; // RSS가 가져온 최신 순 유지
            if (activeSort === "volume") return b.search_volume - a.search_volume;
            if (activeSort === "saturation") return b.saturation_rate - a.saturation_rate;
            return 0;
        });

        const totalFiltered = filtered.length;
        const paginationEl = document.getElementById("blog-pagination");
        
        if (totalFiltered > pageSize) {
            paginationEl.classList.remove("hide");
            renderPagination(totalFiltered);
        } else {
            paginationEl.classList.add("hide");
            paginationEl.innerHTML = "";
        }

        if (totalFiltered === 0) {
            blogDiagnoseTbody.innerHTML = `<tr><td colspan="7" class="text-center">해당 필터에 매칭되는 포스팅이 없습니다.</td></tr>`;
            return;
        }

        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const pagedFiltered = filtered.slice(startIdx, endIdx);

        pagedFiltered.forEach((p) => {
            const originalIndex = currentBlogPosts.indexOf(p);
            html += buildRowHtml(p, originalIndex);
        });

        blogDiagnoseTbody.innerHTML = html;
        bindTableEvents();
    }

    // 페이지네이션 렌더링 함수
    function renderPagination(totalCount) {
        const paginationEl = document.getElementById("blog-pagination");
        if (!paginationEl) return;
        
        const totalPages = Math.ceil(totalCount / pageSize);
        
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        
        let html = "";
        
        // 이전 버튼
        html += `<button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''} data-page="${currentPage - 1}">
            <i class="fa-solid fa-chevron-left"></i>
        </button>`;
        
        // 페이지 번호 버튼들
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn num-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        // 다음 버튼
        html += `<button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''} data-page="${currentPage + 1}">
            <i class="fa-solid fa-chevron-right"></i>
        </button>`;
        
        paginationEl.innerHTML = html;
        
        // 이벤트 바인딩
        paginationEl.querySelectorAll(".page-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.hasAttribute("disabled")) return;
                const targetPage = parseInt(btn.getAttribute("data-page"));
                currentPage = targetPage;
                renderBlogTable();
            });
        });
    }

    // 행 단위 HTML 생성기
    function buildRowHtml(p, index) {
        // 링크 안전성 검사 (비어있거나 상대 경로인 경우 튕김 방지)
        const isLinkValid = p.link && (p.link.startsWith("http://") || p.link.startsWith("https://"));
        const linkHref = isLinkValid ? p.link : "javascript:void(0);";
        const linkTarget = isLinkValid ? 'target="_blank"' : '';
        const linkTitle = isLinkValid ? 'title="클릭하여 원본 블로그 글 새창 이동"' : 'title="링크가 올바르지 않습니다"';
        const urlDisplay = isLinkValid ? p.link : '<span style="color:var(--neon-red); font-size:0.72rem; font-weight:500;">⚠️ 블로그 포스트 링크가 누락되었습니다. 새로고침 후 진단을 다시 시작해 주세요.</span>';

        if (p.loading) {
            return `
                <tr id="blog-row-${index}">
                    <td>${p.pub_date || "-"}</td>
                    <td>
                        <div class="post-info-container">
                            <a href="${linkHref}" ${linkTarget} class="post-title-link" ${linkTitle}>${p.title}</a>
                            <span class="post-url-sub">${urlDisplay}</span>
                        </div>
                    </td>
                    <td>
                        <div class="keyword-cell-wrapper" id="kw-cell-${index}">
                            <span class="kw-text">${p.keyword}</span>
                            <button class="edit-keyword-btn" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                        </div>
                    </td>
                    <td colspan="4">
                        <div class="empty-state-small" style="padding: 0.5rem 0;">
                            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 0.4rem; color: var(--neon-blue);"></i> 
                            네이버 AEO 실시간 교차 진단 중...
                        </div>
                    </td>
                </tr>
            `;
        }

        const volStr = p.search_volume > 0 ? `${p.search_volume.toLocaleString()}회` : "-";
        const satStr = p.saturation_rate > 0 ? `${p.saturation_rate}%` : "-";
        
        let exposureHtml = `<span class="status-exposure no">X</span>`;
        if (p.exposure === "O") {
            exposureHtml = `<span class="status-exposure yes">O</span>`;
        }

        let aiBadgeHtml = `<span class="status-ai-badge none">-</span>`;
        if (p.ai_status === "추천") {
            aiBadgeHtml = `<span class="status-ai-badge recommend">추천</span>`;
        } else if (p.ai_status === "미추천") {
            aiBadgeHtml = `<span class="status-ai-badge not-recommend">미추천</span>`;
        }

        return `
            <tr id="blog-row-${index}">
                <td>${p.pub_date || "-"}</td>
                <td>
                    <div class="post-info-container">
                        <a href="${linkHref}" ${linkTarget} class="post-title-link" ${linkTitle}>${p.title}</a>
                        <span class="post-url-sub">${urlDisplay}</span>
                    </div>
                </td>
                <td>
                    <div class="keyword-cell-wrapper" id="kw-cell-${index}">
                        <span class="kw-text clickable-kw" data-keyword="${p.keyword}" title="클릭 시 키워드 진단기로 즉시 이동 및 분석">${p.keyword}</span>
                        <button class="edit-keyword-btn" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 500;">${volStr}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary); opacity: 0.7;">포화도: ${satStr}</div>
                </td>
                <td>${exposureHtml}</td>
                <td>${aiBadgeHtml}</td>
                <td>
                    <button class="btn-table-action btn-detail-go" data-keyword="${p.keyword}">상세보기</button>
                </td>
            </tr>
        `;
    }

    // 특정 행만 실시간 업데이트 (깜빡임 차단 효과)
    function updateTableRow(index) {
        const row = document.getElementById(`blog-row-${index}`);
        if (!row) return;

        const p = currentBlogPosts[index];
        
        // 렌더러 교체
        const tempDiv = document.createElement("table");
        tempDiv.innerHTML = buildRowHtml(p, index);
        const newRow = tempDiv.querySelector("tr");
        
        row.parentNode.replaceChild(newRow, row);
        
        // 다시 이벤트 바인딩
        bindRowEvents(index);
    }

    // 테이블 내 이벤트 바인딩
    function bindTableEvents() {
        currentBlogPosts.forEach((_, index) => {
            bindRowEvents(index);
        });
    }

    // 개별 행 내 이벤트 바인딩
    function bindRowEvents(index) {
        const row = document.getElementById(`blog-row-${index}`);
        if (!row) return;

        // 1. 키워드 펜 편집 버튼 바인딩
        const editBtn = row.querySelector(".edit-keyword-btn");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                const cell = document.getElementById(`kw-cell-${index}`);
                const currentKw = currentBlogPosts[index].keyword;
                
                cell.innerHTML = `<input type="text" class="keyword-edit-input" value="${currentKw}" id="kw-input-${index}">`;
                const input = document.getElementById(`kw-input-${index}`);
                input.focus();
                input.select();

                // 입력 마감 처리
                const finishEdit = async () => {
                    const nextKw = input.value.trim();
                    if (nextKw && nextKw !== currentKw) {
                        currentBlogPosts[index].keyword = nextKw;
                        
                        // 로컬스토리지 캐시 저장
                        localStorage.setItem(`blog_kw_${currentBlogPosts[index].link}`, nextKw);
                        
                        // 로딩 상태 갱신 및 백엔드 실시간 1개 재진단 가동
                        currentBlogPosts[index].loading = true;
                        updateTableRow(index);
                        
                        const token = sessionStorage.getItem("mydamgong_token");
                        await diagnoseSinglePost(currentBlogPosts[index], index, token);
                        calculateBlogStats();
                    } else {
                        // 수정 취소 또는 동일값
                        updateTableRow(index);
                    }
                };

                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") finishEdit();
                    if (e.key === "Escape") updateTableRow(index);
                });
                
                input.addEventListener("blur", finishEdit);
            });
        }

        // 2. 대표 키워드 텍스트 클릭 시 키워드 진단기 탭으로 스위칭 및 자동 분석 시작 (RSS 수집 데이터는 그대로 보존됨)
        const kwText = row.querySelector(".kw-text.clickable-kw");
        if (kwText) {
            kwText.addEventListener("click", () => {
                const clickKw = kwText.getAttribute("data-keyword");
                menuKeywordAnalyzer.click();
                keywordInput.value = clickKw;
                performAnalysis(clickKw, true);
            });
        }

        // 3. 상세보기 팝업 모달 정밀 진단 연동 (AI 브리핑 내 이미지 썸네일 및 출처 링크 새창 연결 포함)
        const detailBtn = row.querySelector(".btn-detail-go");
        if (detailBtn) {
            detailBtn.addEventListener("click", async () => {
                const post = currentBlogPosts[index];
                
                // 모달 텍스트 및 기본 구조 로딩 매핑
                modalPostTitle.textContent = post.title;
                modalPostLink.href = post.link;
                modalTargetKeyword.textContent = post.keyword;
                
                aeoDetailModal.classList.remove("hide");
                
                modalSearchVolume.textContent = "-";
                modalSaturationRate.textContent = "-";
                modalAiExposureBadge.className = "exposure-status-badge no";
                modalAiExposureBadge.textContent = "진단 중...";
                modalRelatedKeywordsTbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            <i class="fa-solid fa-spinner fa-spin"></i> 실시간 연관검색어를 분석하고 있습니다...
                        </td>
                    </tr>
                `;
                modalAiBriefingContent.innerHTML = `
                    <div class="empty-state" style="padding: 3rem 0;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--neon-purple); margin-bottom: 0.8rem;"></i>
                        <p>네이버 실시간 AI 브리핑 본문을 분석하고 있습니다...</p>
                    </div>
                `;
                
                const token = sessionStorage.getItem("mydamgong_token");
                
                try {
                    const response = await fetch(`/api/analyze?keyword=${encodeURIComponent(post.keyword)}&token=${encodeURIComponent(token)}`);
                    
                    if (response.status === 429) {
                        const errData = await response.json();
                        throw new Error(errData.detail || "검색 제한이 초과되었습니다.");
                    }
                    if (!response.ok) {
                        throw new Error("실시간 진단 데이터를 불러올 수 없습니다.");
                    }
                    
                    const data = await response.json();
                    
                    // 검색량 및 포화도 매핑
                    modalSearchVolume.textContent = data.search_volume.total > 0 ? `${data.search_volume.total.toLocaleString()}회` : "0회";
                    modalSaturationRate.textContent = `${data.competition.saturation_rate}% (${data.competition.level})`;
                    
                    // AI 브리핑 상태 및 본문
                    if (data.ai_briefing.active) {
                        modalAiExposureBadge.className = "exposure-status-badge yes";
                        modalAiExposureBadge.textContent = "AI 브리핑 노출 중";
                        
                        let briefingHtml = `
                            <div class="ai-answer-container" style="font-size: 0.85rem; line-height: 1.65;">
                                ${data.ai_briefing.answer}
                            </div>
                        `;

                        // 인용 썸네일 이미지 동적 렌더링 (새 창 이동 target="_blank" 포함)
                        if (data.ai_briefing.multimedia && data.ai_briefing.multimedia.length > 0) {
                            briefingHtml += `
                                <div class="modal-multimedia-section" style="margin-top: 1.8rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1.2rem;">
                                    <h4 style="font-size:0.85rem; font-weight:700; color:#ffffff; margin-bottom:0.85rem; display:flex; align-items:center; gap:0.4rem; border-bottom:none; padding-bottom:0;">
                                        <i class="fa-solid fa-images" style="color:var(--neon-purple);"></i> 인용 썸네일 이미지 (클릭 시 이동)
                                    </h4>
                                    <div class="thumbnail-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.75rem;">
                            `;
                            data.ai_briefing.multimedia.forEach(item => {
                                briefingHtml += `
                                    <a href="${item.url}" target="_blank" class="thumbnail-card" style="border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; background:rgba(0,0,0,0.25); text-decoration:none;" title="클릭하여 원본 이미지 문서 확인">
                                        <div class="thumbnail-img-wrapper" style="height: 85px; position:relative; overflow:hidden;">
                                            <img src="${item.thumbnail_url}" alt="${item.title}" class="thumbnail-img" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s ease;" loading="lazy" referrerpolicy="no-referrer">
                                            <span class="thumbnail-platform-badge" style="font-size:0.58rem; padding:0.1rem 0.35rem; position:absolute; top:4px; left:4px; border-radius:4px; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.1); color:var(--neon-purple);">${item.platform}</span>
                                        </div>
                                        <div class="thumbnail-content" style="padding:0.45rem; flex:1; display:flex; flex-direction:column; justify-content:center;">
                                            <span class="thumbnail-title" style="font-size:0.7rem; -webkit-line-clamp:2; height:2.4em; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; color:#ffffff; font-weight:600; line-height:1.25; border-bottom:none; padding-bottom:0;">${item.title}</span>
                                        </div>
                                    </a>
                                `;
                            });
                            briefingHtml += `
                                    </div>
                                </div>
                            `;
                        }

                        // 인용 출처 리스트 동적 렌더링 (새 창 이동 target="_blank" 적용)
                        if (data.ai_briefing.sources && data.ai_briefing.sources.length > 0) {
                            briefingHtml += `
                                <div class="modal-sources-section" style="margin-top: 1.8rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1.2rem;">
                                    <h4 style="font-size:0.85rem; font-weight:700; color:#ffffff; margin-bottom:0.85rem; display:flex; align-items:center; gap:0.4rem; border-bottom:none; padding-bottom:0;">
                                        <i class="fa-solid fa-quote-left" style="color:var(--neon-blue);"></i> 인용 본문 출처 리스트 (새창 이동)
                                    </h4>
                                    <div class="source-list-wrapper" style="display:flex; flex-direction:column; gap:0.55rem;">
                            `;
                            data.ai_briefing.sources.forEach(src => {
                                const descStr = src.description ? src.description : "출처 정보 페이지 링크";
                                briefingHtml += `
                                    <a href="${src.url}" target="_blank" class="source-item" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:0.5rem 0.8rem; border-radius:8px; transition: background 0.2s ease;" title="클릭하여 원본 출처 확인">
                                        <span class="source-num" style="width:20px; height:20px; border-radius:50%; background:var(--neon-purple); color:#ffffff; display:flex; justify-content:center; align-items:center; font-size:0.65rem; font-weight:700;">${src.index}</span>
                                        <div class="source-info-wrapper" style="display:flex; flex-direction:column; gap:0.15rem; flex:1; text-align:left; overflow:hidden;">
                                            <span class="source-name" style="font-size:0.75rem; font-weight:700; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${src.name}</span>
                                            <span class="source-desc" style="font-size:0.68rem; color:var(--text-secondary); opacity:0.8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;">${descStr}</span>
                                        </div>
                                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem; color:var(--text-secondary); opacity:0.6;"></i>
                                    </a>
                                `;
                            });
                            briefingHtml += `
                                    </div>
                                </div>
                            `;
                        }

                        modalAiBriefingContent.innerHTML = briefingHtml;
                    } else {
                        modalAiExposureBadge.className = "exposure-status-badge no";
                        modalAiExposureBadge.textContent = "AI 브리핑 미노출";
                        modalAiBriefingContent.innerHTML = `
                            <div class="empty-state" style="padding: 3rem 0;">
                                <i class="fa-solid fa-circle-info" style="font-size: 1.5rem; margin-bottom: 0.6rem;"></i>
                                <p>${data.ai_briefing.message || "해당 키워드는 네이버 AI 브리핑 정보가 나타나지 않습니다."}</p>
                            </div>
                        `;
                    }
                    
                    // 연관 키워드 Top 8
                    if (data.related_keywords && data.related_keywords.length > 0) {
                        let tbodyHtml = "";
                        data.related_keywords.forEach(rk => {
                            const totStr = rk.total > 0 ? rk.total.toLocaleString() : "-";
                            tbodyHtml += `
                                <tr>
                                    <td style="font-weight: 600; color: var(--neon-blue);">${rk.keyword}</td>
                                    <td>${totStr}회</td>
                                    <td>${rk.doc_count.toLocaleString()}건</td>
                                    <td><span class="badge-level ${rk.level}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">${rk.level}</span></td>
                                </tr>
                            `;
                        });
                        modalRelatedKeywordsTbody.innerHTML = tbodyHtml;
                    } else {
                        modalRelatedKeywordsTbody.innerHTML = `<tr><td colspan="4" class="text-center">연관 검색어가 없습니다.</td></tr>`;
                    }
                    
                    // 게스트인 경우 횟수 업데이트
                    if (data.guest_info && document.getElementById("guest-count")) {
                        document.getElementById("guest-count").textContent = data.guest_info.remaining;
                    }
                    
                } catch(err) {
                    modalAiExposureBadge.className = "exposure-status-badge no";
                    modalAiExposureBadge.textContent = "진단 실패";
                    modalAiBriefingContent.innerHTML = `
                        <div class="empty-state" style="color: var(--neon-red); padding: 3rem 0;">
                            <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.6rem;"></i>
                            <p>${err.message || "실시간 AEO 진단 도중 실패했습니다."}</p>
                        </div>
                    `;
                    modalRelatedKeywordsTbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:var(--text-secondary);">데이터 조회 실패</td></tr>`;
                }
            });
        }
    }

    // 상단 통계 수치 연산 및 실시간 렌더링
    function calculateBlogStats() {
        let targetPosts = currentBlogPosts;

        const total = targetPosts.length;
        if (total === 0) {
            // 통계 수치 리셋
            chipCountAll.textContent = 0;
            chipCountSearchOnly.textContent = 0;
            chipCountAiActive.textContent = 0;
            chipCountAiRecommend.textContent = 0;
            statTotalPosts.textContent = 0;
            statSearchExposure.textContent = "0/0";
            statSearchPercent.textContent = "0% 노출";
            statAiExposure.textContent = 0;
            statAiPercent.textContent = "0%";
            distBarAi.style.width = "0%";
            distBarSearch.style.width = "0%";
            distCountAi.textContent = "0% (0)";
            distCountSearch.textContent = "0% (0)";
            return;
        }

        let searchCount = 0;
        let aiCount = 0;
        let aiActiveCount = 0;

        targetPosts.forEach(p => {
            if (p.exposure === "O") searchCount++;
            if (p.ai_status === "추천") aiCount++;
            if (p.ai_status === "추천" || p.ai_status === "미추천") aiActiveCount++;
        });

        // 1. 뱃지 카운트 현황판 업데이트
        chipCountAll.textContent = total;
        chipCountSearchOnly.textContent = searchCount;
        chipCountAiActive.textContent = aiActiveCount;
        chipCountAiRecommend.textContent = aiCount;

        // 2. 통계 텍스트 업데이트
        statTotalPosts.textContent = total;
        statSearchExposure.textContent = `${searchCount}/${total}`;
        
        const searchPercent = total > 0 ? Math.round((searchCount / total) * 100) : 0;
        statSearchPercent.textContent = `${searchPercent}% 노출`;

        statAiExposure.textContent = aiCount;
        
        const aiPercent = total > 0 ? Math.round((aiCount / total) * 100) : 0;
        statAiPercent.textContent = `${aiPercent}%`;

        // 3. 그래프 분배 바 업데이트
        distBarAi.style.width = `${aiPercent}%`;
        distBarSearch.style.width = `${searchPercent}%`;

        distCountAi.textContent = `${aiPercent}% (${aiCount})`;
        distCountSearch.textContent = `${searchPercent}% (${searchCount})`;
    }

    // 필터 칩 클릭 바인딩
    document.querySelectorAll(".filter-chips .chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".filter-chips .chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activeFilter = chip.getAttribute("data-filter");
            renderBlogTable();
        });
    });

    // 정렬 클릭 바인딩
    document.querySelectorAll(".sort-controls .sort-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".sort-controls .sort-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeSort = btn.getAttribute("data-sort");
            renderBlogTable();
        });
    });


    // ==========================================================================
    // 기존 URL 뒤로 가기 / 앞으로 가기 감지 및 초기 파라미터 제어
    // ==========================================================================

    window.addEventListener("popstate", async (e) => {
        if (e.state && e.state.keyword) {
            keywordInput.value = e.state.keyword;
            // 탭 뷰 강제 전환
            menuKeywordAnalyzer.click();
            await performAnalysis(e.state.keyword, false);
        } else {
            keywordInput.value = "";
            resultSection.classList.add("hide");
            loadingState.classList.add("hide");
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialKeyword = urlParams.get("keyword");
    
    // 왼쪽 상단 로고 클릭 시 파라미터 날리고 초기 새로고침 이동
    const logoBtn = document.getElementById("logo-btn");
    if (logoBtn) {
        logoBtn.addEventListener("click", () => {
            window.location.href = window.location.origin + window.location.pathname;
        });
    }
    
    if (checkAuthentication()) {
        if (initialKeyword) {
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

    // 4. 조회 개수 필터 드롭다운 체인지 바인딩 (누적형 이전 글 수집 분기)
    if (countSelect) {
        countSelect.addEventListener("change", () => {
            const val = countSelect.value;
            const rawVal = blogInput.value.trim();
            const blogId = extractBlogId(rawVal);
            if (!blogId) return;

            if (val === "15") {
                // '기본 15개 수집'일 때는 처음부터 다시 15개 수집
                triggerBlogAnalysis(false);
            } else {
                // '+10', '+20', '+30' 수집 시 기존 포스트 데이터 보존 후 덧붙여 스크래핑
                if (currentBlogPosts.length === 0) {
                    triggerBlogAnalysis(false);
                } else {
                    triggerBlogAnalysis(true);
                }
            }
        });
    }

    // 5. A4 규격 프리미엄 5페이지 로컬 PDF 보고서 다운로드 연동
    const btnPdfDownload = document.getElementById("btn-pdf-download");
    if (btnPdfDownload) {
        btnPdfDownload.addEventListener("click", async () => {
            if (currentBlogPosts.length === 0) {
                alert("진단된 블로그 데이터가 없습니다. 먼저 글 수집 및 진단을 진행해 주세요.");
                return;
            }
            
            // 버튼 상태 로딩 모드로 비활성화
            btnPdfDownload.disabled = true;
            const originalContent = btnPdfDownload.innerHTML;
            btnPdfDownload.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>PDF 생성 중...</span>`;
            
            try {
                // 5.1. PDF 템플릿에 실시간 대시보드 데이터 바인딩
                const blogIdVal = document.getElementById("sidebar-blog-name").textContent || "Naver Blog";
                document.getElementById("pdf-blog-id").textContent = blogIdVal;
                
                const today = new Date();
                const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
                document.getElementById("pdf-report-date").textContent = dateStr;
                
                const total = currentBlogPosts.length;
                let searchCount = 0;
                let aiCount = 0;
                currentBlogPosts.forEach(p => {
                    if (p.exposure === "O") searchCount++;
                    if (p.ai_status === "추천") aiCount++;
                });
                const searchPercent = total > 0 ? Math.round((searchCount / total) * 100) : 0;
                const aiPercent = total > 0 ? Math.round((aiCount / total) * 100) : 0;
                
                document.getElementById("pdf-total-posts").textContent = total;
                document.getElementById("pdf-search-exposure").textContent = `${searchPercent}%`;
                document.getElementById("pdf-search-count-text").textContent = `${searchCount}/${total}개 노출 중`;
                document.getElementById("pdf-ai-exposure").textContent = aiCount;
                document.getElementById("pdf-ai-percent").textContent = `${aiPercent}%`;
                
                // 종합 AEO 등급 및 코멘트 동적 판정 및 주입
                let grade = "C-Grade (미흡)";
                let gradeColor = "#ff3b30";
                let diagSummary = "";
                
                if (aiPercent >= 40) {
                    grade = "A-Grade (최적화 우수)";
                    gradeColor = "#38b000";
                    diagSummary = `귀사 블로그의 AI 검색 최적화 상태는 <strong>우수(A-Grade)</strong>한 편입니다. 분석된 포스트 중 상당수가 네이버 AI 브리핑 답변 출처 카드로 인용되고 있습니다. 다만, 네이버의 지속적인 검색엔진 고도화 및 경쟁사 유입 방어를 위해, 핵심 의료/전문 정보의 E-E-A-T 구조를 유지하고 상시 모니터링을 지속해야 합니다.`;
                } else if (aiPercent >= 15) {
                    grade = "B-Grade (보통 / 개선 권장)";
                    gradeColor = "#ffcc00";
                    diagSummary = `귀사 블로그의 AI 검색 최적화 상태는 <strong>보통(B-Grade)</strong> 수준입니다. 일반 검색 노출은 준수하나, AI 브리핑 답변의 추천 출처로 채택되는 비율이 제한적입니다. 본문 중 표(Table)나 리스트(List) 구조화가 미흡하거나 핵심 롱테일 유저 질문에 직접 답변하는 문장 형식을 적용하지 않아 로봇의 정보 채택율이 저하되어 있습니다. 당사의 부분 튜닝을 통해 즉각적인 유입 상승이 가능합니다.`;
                } else {
                    grade = "C-Grade (미흡 / 긴급 튜닝 필요)";
                    gradeColor = "#ff3b30";
                    diagSummary = `귀사 블로그의 AI 검색 최적화 상태는 <strong>매우 미흡(C-Grade)</strong>한 위험군으로 파악됩니다. 전통적인 뷰/블로그 탭에는 일부 글이 노출되고 있으나, 네이버 검색 최상단을 점유하고 있는 AI 브리핑 영역에는 추천 출처가 거의 잡히지 않고 있습니다. 로봇이 정보를 독해(MR)할 수 없는 단순 줄글 중심의 작성 방식과 E-E-A-T 신뢰 출처 표기 누락이 누적된 결과입니다. 블랭블랭의 맞춤형 AEO 포스팅 서비스 도입이 시급히 요구됩니다.`;
                }
                
                document.getElementById("pdf-diag-grade").innerHTML = grade;
                document.getElementById("pdf-diag-grade").style.color = gradeColor;
                document.getElementById("pdf-diag-summary").innerHTML = diagSummary;
                
                // 상세 진단 목록 테이블 동적 렌더링 (A4 공간 초과 방지를 위해 상위 13개 행만 노출)
                const tableBody = document.getElementById("pdf-table-body");
                let tableHtml = "";
                const displayPosts = currentBlogPosts.slice(0, 13);
                
                displayPosts.forEach(p => {
                    const cleanTitle = p.title.length > 28 ? p.title.slice(0, 28) + "..." : p.title;
                    const expHtml = p.exposure === "O" 
                        ? `<span style="color:#00b4d8; font-weight:700;">O</span>` 
                        : `<span style="color:#ff3b30; font-weight:700;">X</span>`;
                        
                    let aiHtml = `<span style="color:#868e96;">-</span>`;
                    if (p.ai_status === "추천") {
                        aiHtml = `<span style="color:#38b000; font-weight:700;">추천</span>`;
                    } else if (p.ai_status === "미추천") {
                        aiHtml = `<span style="color:#ffcc00; font-weight:700;">미추천</span>`;
                    }
                    
                    tableHtml += `
                        <tr style="border-bottom: 1px solid #dee2e6; height: 35px;">
                            <td style="padding: 0.5rem; color: #495057; text-align: left;">${p.pub_date || "-"}</td>
                            <td style="padding: 0.5rem; font-weight: 500; color: #212529; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px;">${cleanTitle}</td>
                            <td style="padding: 0.5rem; font-weight: 600; color: #7b2cbf; text-align: left;">${p.keyword}</td>
                            <td style="padding: 0.5rem; text-align: center;">${expHtml}</td>
                            <td style="padding: 0.5rem; text-align: center;">${aiHtml}</td>
                        </tr>
                    `;
                });
                
                if (total > 13) {
                    tableHtml += `
                        <tr>
                            <td colspan="5" style="padding: 0.6rem; text-align: center; color: #868e96; font-style: italic; background: #f8f9fa;">
                                * 총 ${total}개 진단 포스팅 중 상위 13개 포스팅이 요약 출력되었습니다.
                            </td>
                        </tr>
                    `;
                }
                tableBody.innerHTML = tableHtml;

                // 테이블 하단 동적 진단평 바인딩
                let tableComment = "";
                if (aiPercent < 20) {
                    tableComment = `<strong>[AI 누락 경고]</strong> 대다수의 핵심 키워드가 네이버 일반 통합검색에는 상위 배치되었음에도 불구하고, 최상단 AI 추천 리포트에는 인용되지 못했습니다. 포스팅 내 지식 구조와 문체 설계를 AEO 관점에서 개선하지 않는다면, 실질 유입 고객 트래픽의 상당수가 유실되는 것을 방치하는 것과 같습니다.`;
                } else {
                    tableComment = `<strong>[AI 추천 분석]</strong> 현재 AI 추천 영역에 일부 포스팅이 노출 중이나, 핵심 롱테일 질의어 점유는 여전히 공백 상태입니다. 경쟁사들이 AEO/GEO 기법을 적용하기 전, 선제적으로 E-E-A-T 구조를 반영한 신뢰 포스팅을 발행하여 점유를 공고히 해야 합니다.`;
                }
                document.getElementById("pdf-table-comment").innerHTML = tableComment;
                
                // 5.2. html2canvas 캡처를 위해 임시 템플릿 영역 노출
                const reportRoot = document.getElementById("pdf-report-root");
                reportRoot.style.position = "static";
                reportRoot.style.left = "0";
                reportRoot.style.top = "0";
                
                // 5.3. 캡처 및 PDF 빌드 (A4 7페이지 가로형 캡처 진행)
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF("l", "mm", "a4");
                const pageIds = ["pdf-page-1", "pdf-page-2", "pdf-page-3", "pdf-page-4", "pdf-page-5", "pdf-page-6", "pdf-page-7"];
                
                for (let i = 0; i < pageIds.length; i++) {
                    const pageEl = document.getElementById(pageIds[i]);
                    const canvas = await html2canvas(pageEl, {
                        scale: 2, // 인쇄 화질 고해상도 최적화
                        useCORS: true,
                        allowTaint: true,
                        logging: false
                    });
                    
                    const imgData = canvas.toDataURL("image/jpeg", 0.95);
                    const imgWidth = 297; // 가로 크기 297mm
                    const pageHeight = 210; // 세로 크기 210mm
                    
                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, pageHeight);
                }
                
                // 5.4. 로컬 브라우저 즉각 다운로드 (영문 고정 파일명 약속)
                pdf.save("geo_aeo_blog_report.pdf");
                
                // 5.5. 템플릿 숨김 복원
                reportRoot.style.position = "absolute";
                reportRoot.style.left = "-9999px";
                reportRoot.style.top = "-9999px";
                
            } catch(err) {
                console.error("PDF 생성 중 예외 발생", err);
                alert("PDF 보고서를 내보내지 못했습니다: " + err.message);
            } finally {
                btnPdfDownload.disabled = false;
                btnPdfDownload.innerHTML = originalContent;
            }
        });
    }

    // 6. 마스터 회원 업그레이드 유도 모달 제어 이벤트
    const premiumUpgradeModal = document.getElementById("premium-upgrade-modal");
    const btnUpgradeClose = document.getElementById("btn-upgrade-close");
    const btnUpgradeAction = document.getElementById("btn-upgrade-action");

    if (btnUpgradeClose && premiumUpgradeModal) {
        btnUpgradeClose.addEventListener("click", () => {
            premiumUpgradeModal.classList.add("hide");
        });
    }

    if (btnUpgradeAction && premiumUpgradeModal) {
        btnUpgradeAction.addEventListener("click", () => {
            // 업그레이드 유도 모달을 닫고, 로그인 인증 비밀번호 모달을 띄워 0988 마스터 토큰 인증을 유도
            premiumUpgradeModal.classList.add("hide");
            sessionStorage.removeItem("mydamgong_token"); // 기존 게스트 토큰 제거
            authModal.classList.remove("hide");
            authPasswordInput.value = "";
            authPasswordInput.focus();
        });
    }

    // 7. AEO 상세 분석 모달 닫기 바인딩
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            aeoDetailModal.classList.add("hide");
        });
    }

    // 바깥 영역 클릭 시 닫기
    window.addEventListener("click", (e) => {
        if (e.target === aeoDetailModal) {
            aeoDetailModal.classList.add("hide");
        }
        if (e.target === premiumUpgradeModal) {
            premiumUpgradeModal.classList.add("hide");
        }
    });

    // ==========================================================================
    // 블로그지수 분석 대시보드 인터랙션 엔진
    // ==========================================================================
    const blogIndexForm = document.getElementById("blog-index-form");
    const blogIndexInput = document.getElementById("blog-index-input");
    const blogIndexSpinner = document.getElementById("blog-index-spinner");
    const blogIndexLoadingState = document.getElementById("blog-index-loading-state");
    const blogIndexLoadingTxt = document.getElementById("blog-index-loading-txt");
    const blogIndexProgressFill = document.getElementById("blog-index-progress-fill");
    const blogIndexProgressPercent = document.getElementById("blog-index-progress-percent");
    const blogIndexResultContainer = document.getElementById("blog-index-result-container");

    // 프로필 DOM
    const blogProfileImg = document.getElementById("blog-profile-img");
    const blogNickname = document.getElementById("blog-nickname");
    const blogDirectory = document.getElementById("blog-directory");
    const blogSubscribers = document.getElementById("blog-subscribers");
    const blogTodayVisitors = document.getElementById("blog-today-visitors");
    const blogTotalVisitors = document.getElementById("blog-total-visitors");
    const blogTotalPosts = document.getElementById("blog-total-posts");
    const blogCreatedDate = document.getElementById("blog-created-date");

    // 차트 / 등급 DOM
    const scoreRing = document.getElementById("score-ring");
    const blogScoreNum = document.getElementById("blog-score-num");
    const blogGradeText = document.getElementById("blog-grade-text");

    const statOptimalCnt = document.getElementById("stat-optimal-cnt");
    const statOptimalBar = document.getElementById("stat-optimal-bar");
    const statActiveCnt = document.getElementById("stat-active-cnt");
    const statActiveBar = document.getElementById("stat-active-bar");
    const statWarningCnt = document.getElementById("stat-warning-cnt");
    const statWarningBar = document.getElementById("stat-warning-bar");
    const statMissingCnt = document.getElementById("stat-missing-cnt");
    const statMissingBar = document.getElementById("stat-missing-bar");

    const popularPostsList = document.getElementById("popular-posts-list");
    const blogIndexTableBody = document.getElementById("blog-index-table-body");

    // 필터 카운터 DOM
    const filterAllCnt = document.getElementById("filter-all-cnt");
    const filterOptimalCnt = document.getElementById("filter-optimal-cnt");
    const filterActiveCnt = document.getElementById("filter-active-cnt");
    const filterWarningCnt = document.getElementById("filter-warning-cnt");
    const filterMissingCnt = document.getElementById("filter-missing-cnt");

    let blogPostsData = []; // 수집/진단 완료된 15개 포스팅 전체 데이터 어레이

    // 원형 게이지 차트 채우기 애니메이션
    function setScoreRing(score) {
        if (!scoreRing) return;
        const radius = scoreRing.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        scoreRing.style.strokeDasharray = `${circumference} ${circumference}`;
        scoreRing.style.strokeDashoffset = offset;
    }

    if (blogIndexForm) {
        blogIndexForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            let rawVal = blogIndexInput.value.trim();
            if (!rawVal) {
                alert("네이버 블로그 주소 또는 ID를 입력해 주세요.");
                return;
            }

            // 블로그 ID 파싱
            let blogId = rawVal;
            const regexBlogUrl = /blog\.naver\.com\/([a-zA-Z0-9_-]+)/;
            const match = rawVal.match(regexBlogUrl);
            if (match) {
                blogId = match[1];
            } else if (rawVal.includes("blogId=")) {
                const urlParams = new URLSearchParams(rawVal.split("?")[1] || "");
                blogId = urlParams.get("blogId") || blogId;
            }

            blogId = blogId.replace(/https?:\/\//g, "").split("/")[0] === "m.blog.naver.com" ? rawVal.split("/")[3] || blogId : blogId;
            blogId = blogId.trim();

            // UI 초기화
            blogIndexSpinner.classList.remove("hide");
            blogIndexLoadingState.classList.remove("hide");
            blogIndexResultContainer.classList.add("hide");
            blogIndexLoadingTxt.textContent = "네이버 블로그 상태 및 프로필 메타 데이터를 수집 중입니다...";
            blogIndexProgressFill.style.width = "0%";
            blogIndexProgressPercent.textContent = "0%";

            try {
                // 1. 프로필 & 인기글 & 최근글 기본 목록 가져오기
                const profileRes = await fetch(`/api/blog/index/profile?blog_id=${blogId}`);
                if (!profileRes.ok) {
                    throw new Error("블로그 기본 프로필 정보를 가져오지 못했습니다. ID가 정확한지 확인해 주세요.");
                }

                const profileData = await profileRes.json();

                // 프로필 매핑
                if (blogProfileImg) blogProfileImg.src = profileData.profile_image;
                if (blogNickname) blogNickname.textContent = profileData.nickname;
                if (blogDirectory) blogDirectory.textContent = profileData.directory_name;
                if (blogSubscribers) blogSubscribers.textContent = profileData.subscriber_count.toLocaleString();
                if (blogTodayVisitors) blogTodayVisitors.textContent = profileData.today_visitor.toLocaleString();
                if (blogTotalVisitors) blogTotalVisitors.textContent = profileData.total_visitor.toLocaleString();
                if (blogTotalPosts) blogTotalPosts.textContent = profileData.post_count.toLocaleString();
                if (blogCreatedDate) blogCreatedDate.textContent = profileData.created_date || "정보 없음";

                // 인기글 매핑
                let popHtml = "";
                if (profileData.popular_posts && profileData.popular_posts.length > 0) {
                    profileData.popular_posts.forEach((p, idx) => {
                        popHtml += `
                            <a href="${p.link}" target="_blank" class="popular-item-card">
                                <span class="pop-badge top-${idx + 1}">${idx + 1}</span>
                                <div class="pop-info">
                                    <span class="pop-title">${p.title}</span>
                                    <div class="pop-stats">
                                        <span><i class="fa-regular fa-comment"></i> ${p.comment_count}</span>
                                        <span><i class="fa-regular fa-heart"></i> ${p.sympathy_count}</span>
                                    </div>
                                </div>
                            </a>
                        `;
                    });
                } else {
                    popHtml = `<div class="empty-state-small">인기글 내역이 없습니다.</div>`;
                }
                if (popularPostsList) popularPostsList.innerHTML = popHtml;

                // 최근 15개 포스팅 목록 확인
                const recentPosts = profileData.recent_posts || [];
                if (recentPosts.length === 0) {
                    throw new Error("블로그에 작성된 포스팅 글을 찾을 수 없습니다.");
                }

                blogPostsData = [];
                const totalPostsCount = recentPosts.length;

                // 2. 15개 포스트 개별 상세 지수 수집 (Throttling 순차 비동기 호출)
                for (let i = 0; i < totalPostsCount; i++) {
                    const post = recentPosts[i];
                    
                    // 로딩 텍스트 갱신
                    blogIndexLoadingTxt.innerHTML = `
                        <strong>[${i + 1}/${totalPostsCount}] 포스팅 정밀 진단 중...</strong><br>
                        <span style="font-size: 0.82rem; opacity: 0.8; color: var(--text-secondary); max-width: 300px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${post.title}
                        </span>
                    `;

                    // 백엔드 개별 상세 API 호출
                    const detailRes = await fetch(`/api/blog/index/post-detail?blog_id=${blogId}&log_no=${post.log_no}&title=${encodeURIComponent(post.title)}`);
                    if (detailRes.ok) {
                        const detailData = await detailRes.json();
                        // 메타 데이터와 상세 데이터 결합
                        blogPostsData.push({
                            ...post,
                            ...detailData
                        });
                    } else {
                        // API 에러 시 안전한 기본값으로 결합
                        blogPostsData.push({
                            ...post,
                            chars_count: 0,
                            images_count: 0,
                            videos_count: 0,
                            quotes_count: 0,
                            gifs_count: 0,
                            maps_count: 0,
                            links_count: 0,
                            exposure: "X",
                            rank: "-",
                            status: "누락"
                        });
                    }

                    // 프로그레스 바 갱신
                    const percent = Math.round(((i + 1) / totalPostsCount) * 100);
                    if (blogIndexProgressFill) blogIndexProgressFill.style.width = `${percent}%`;
                    if (blogIndexProgressPercent) blogIndexProgressPercent.textContent = `${percent}%`;

                    // 마지막 루프가 아니면 0.8초 Throttling 딜레이 부여
                    if (i < totalPostsCount - 1) {
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
                }

                // 3. 진단 종합 점수 연산 및 차트 렌더링
                let optimalCount = 0;
                let activeCount = 0;
                let warningCount = 0;
                let missingCount = 0;

                let totalChars = 0;
                let totalImages = 0;
                let totalLikesComments = 0;

                blogPostsData.forEach(p => {
                    if (p.status === "최적") optimalCount++;
                    else if (p.status === "활성") activeCount++;
                    else if (p.status === "위험") warningCount++;
                    else missingCount++;

                    totalChars += p.chars_count || 0;
                    totalImages += p.images_count || 0;
                    totalLikesComments += (p.comment_count || 0) + (p.sympathy_count || 0);
                });

                const optimalRatio = Math.round((optimalCount / totalPostsCount) * 100);
                const activeRatio = Math.round((activeCount / totalPostsCount) * 100);
                const warningRatio = Math.round((warningCount / totalPostsCount) * 100);
                const missingRatio = Math.round((missingCount / totalPostsCount) * 100);

                // 통계 바 갱신
                if (statOptimalCnt) statOptimalCnt.textContent = `${optimalCount}건 (${optimalRatio}%)`;
                if (statOptimalBar) statOptimalBar.style.width = `${optimalRatio}%`;
                
                if (statActiveCnt) statActiveCnt.textContent = `${activeCount}건 (${activeRatio}%)`;
                if (statActiveBar) statActiveBar.style.width = `${activeRatio}%`;
                
                if (statWarningCnt) statWarningCnt.textContent = `${warningCount}건 (${warningRatio}%)`;
                if (statWarningBar) statWarningBar.style.width = `${warningRatio}%`;
                
                if (statMissingCnt) statMissingCnt.textContent = `${missingCount}건 (${missingRatio}%)`;
                if (statMissingBar) statMissingBar.style.width = `${missingRatio}%`;

                // 점수 계산 (독창적 알고리즘)
                // 1) 활성 지수 (100점 만점)
                const avgChars = totalChars / totalPostsCount;
                const avgImages = totalImages / totalPostsCount;
                const avgResponse = totalLikesComments / totalPostsCount;

                let activeScore = 0;
                if (avgChars >= 1500) activeScore += 30;
                else if (avgChars >= 1000) activeScore += 20;
                else if (avgChars >= 500) activeScore += 10;

                if (avgImages >= 10) activeScore += 30;
                else if (avgImages >= 5) activeScore += 20;
                else if (avgImages >= 3) activeScore += 10;

                if (avgResponse >= 3) activeScore += 40;
                else if (avgResponse >= 1) activeScore += 35;
                else if (avgResponse >= 0.5) activeScore += 20;
                else activeScore += 5;

                // 2) 누락 감점 비율 (0~100)
                const missingPenalty = (missingCount / totalPostsCount) * 100;

                // 3) 위험 감점 비율 (0~100)
                const warningPenalty = (warningCount / totalPostsCount) * 100;

                // 종합 지수 합산 (가중치 적용)
                let finalScore = Math.round((activeScore * 0.4) + ((100 - missingPenalty) * 0.4) + ((100 - warningPenalty) * 0.2));
                finalScore = Math.max(5, Math.min(100, finalScore)); // 5점~100점 제한

                // 등급 판정
                let gradeText = "저품질";
                if (finalScore < 30 || missingRatio >= 60) {
                    gradeText = "저품질";
                } else if (finalScore < 80) {
                    // 준최 1~7 분할
                    const junLevel = Math.ceil((finalScore - 29) / 7.15); // 30점부터 80점 미만 구간
                    gradeText = `준최 ${Math.max(1, Math.min(7, junLevel))}`;
                } else {
                    // 최적 1~4 분할
                    const optLevel = Math.ceil((finalScore - 79) / 5); // 80점부터 100점 구간
                    gradeText = `최적 ${Math.max(1, Math.min(4, optLevel))}`;
                }

                // 점수 서클 노출
                if (blogScoreNum) blogScoreNum.textContent = finalScore;
                if (blogGradeText) {
                    blogGradeText.textContent = gradeText;
                    // 등급에 따라 네온 색상 다르게 노출
                    if (gradeText.includes("최적")) {
                        blogGradeText.style.color = "var(--neon-purple)";
                        blogGradeText.style.textShadow = "0 0 10px var(--neon-purple-glow)";
                    } else if (gradeText.includes("준최")) {
                        blogGradeText.style.color = "var(--neon-green)";
                        blogGradeText.style.textShadow = "0 0 10px var(--neon-green-glow)";
                    } else {
                        blogGradeText.style.color = "#ff3b30";
                        blogGradeText.style.textShadow = "0 0 10px rgba(255, 59, 48, 0.4)";
                    }
                }
                setScoreRing(finalScore);

                // 4. 하단 상세 테이블 렌더링
                renderBlogIndexTable("all");

                // 필터 탭 클릭 이벤트 바인딩
                const filterTabs = document.querySelectorAll(".filter-tab");
                filterTabs.forEach(tab => {
                    tab.classList.remove("active");
                    if (tab.getAttribute("data-filter") === "all") {
                        tab.classList.add("active");
                    }
                });

                // 결과창 보이기
                blogIndexResultContainer.classList.remove("hide");

            } catch (err) {
                console.error(err);
                alert("블로그지수 분석 실행 중 오류가 발생했습니다: " + err.message);
            } finally {
                blogIndexSpinner.classList.add("hide");
                blogIndexLoadingState.classList.add("hide");
            }
        });
    }

    // 블로그지수 테이블 데이터 렌더링 함수
    function renderBlogIndexTable(filter = "all") {
        if (!blogIndexTableBody) return;

        let html = "";
        let optimalCount = 0;
        let activeCount = 0;
        let warningCount = 0;
        let missingCount = 0;

        blogPostsData.forEach(p => {
            if (p.status === "최적") optimalCount++;
            else if (p.status === "활성") activeCount++;
            else if (p.status === "위험") warningCount++;
            else missingCount++;

            // 필터링 적용
            const isVisible = (filter === "all" || p.status === filter);
            const hiddenClass = isVisible ? "" : "class='row-hidden'";

            let statusBadge = `<span class="idx-badge missing">누락</span><br><button class="btn-ai-analyze" data-log-no="${p.log_no}">Ai분석</button>`;
            if (p.status === "최적") {
                statusBadge = `<span class="idx-badge optimal">최적</span>`;
            } else if (p.status === "활성") {
                statusBadge = `<span class="idx-badge active">활성</span>`;
            } else if (p.status === "위험") {
                statusBadge = `<span class="idx-badge warning">위험</span>`;
            }

            html += `
                <tr ${hiddenClass}>
                    <td>${statusBadge}</td>
                    <td style="font-family:'Outfit'; font-weight: 700; color:${p.rank !== '-' ? 'var(--neon-purple)' : '#ff3b30'}">${p.rank}</td>
                    <td>
                        <span class="table-post-title" title="${p.title}">${p.title}</span>
                        <a href="${p.link}" target="_blank" class="table-post-link"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    </td>
                    <td><span class="category-badge">${p.category_name}</span></td>
                    <td style="font-size:0.75rem; color:var(--text-secondary);">${p.pub_date}</td>
                    <td><strong>${(p.chars_count || 0).toLocaleString()}자</strong></td>
                    <td>${p.images_count || 0}개</td>
                    <td>${p.videos_count || 0}개</td>
                    <td>${p.quotes_count || 0}개</td>
                    <td>${p.gifs_count > 0 ? `<span class="text-glow-green">${p.gifs_count}개</span>` : '-'}</td>
                    <td>${p.maps_count > 0 ? `<span class="text-glow-blue"><i class="fa-solid fa-location-dot"></i> 있음</span>` : '-'}</td>
                    <td>${p.links_count > 0 ? `<span class="text-glow-purple">${p.links_count}개</span>` : '-'}</td>
                    <td>${p.comment_count || 0}</td>
                    <td>${p.sympathy_count || 0}</td>
                </tr>
            `;
        });

        blogIndexTableBody.innerHTML = html;

        // 필터 카운터 동기화
        if (filterAllCnt) filterAllCnt.textContent = blogPostsData.length;
        if (filterOptimalCnt) filterOptimalCnt.textContent = optimalCount;
        if (filterActiveCnt) filterActiveCnt.textContent = activeCount;
        if (filterWarningCnt) filterWarningCnt.textContent = warningCount;
        if (filterMissingCnt) filterMissingCnt.textContent = missingCount;
    }

    // 필터 탭 클릭 핸들러 바인딩
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("filter-tab")) {
            const tabs = document.querySelectorAll(".filter-tab");
            tabs.forEach(t => t.classList.remove("active"));
            
            e.target.classList.add("active");
            const filterValue = e.target.getAttribute("data-filter");
            renderBlogIndexTable(filterValue);
        }
    });

    // ==========================================================================
    // 신규: AI 누락 진단 모달 제어 및 리포트 동적 생성
    // ==========================================================================
    const aiAnalysisModal = document.getElementById("ai-analysis-modal");
    const aiModalPostTitle = document.getElementById("ai-modal-post-title");
    const aiAnalysisContent = document.getElementById("ai-analysis-content");
    const aiModalCloseBtn = document.getElementById("ai-modal-close-btn");

    if (aiModalCloseBtn && aiAnalysisModal) {
        aiModalCloseBtn.addEventListener("click", () => {
            aiAnalysisModal.classList.add("hide");
        });
    }

    // 모달 바깥 영역 클릭 시 닫기
    window.addEventListener("click", (e) => {
        if (e.target === aiAnalysisModal) {
            aiAnalysisModal.classList.add("hide");
        }
    });

    // Ai분석 버튼 클릭 이벤트 위임 바인딩
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("btn-ai-analyze")) {
            const logNo = e.target.getAttribute("data-log-no");
            const post = blogPostsData.find(p => p.log_no === logNo);
            
            if (!post) {
                alert("포스팅 데이터를 찾을 수 없습니다.");
                return;
            }

            if (aiModalPostTitle) aiModalPostTitle.textContent = post.title;

            // 지표 기반 위험/누락 요인 분석
            const chars = post.chars_count || 0;
            const imgs = post.images_count || 0;
            const links = post.links_count || 0;
            const videos = post.videos_count || 0;
            const quotes = post.quotes_count || 0;
            const maps = post.maps_count || 0;

            let issues = [];

            if (chars < 1200) {
                issues.push(`🚨 <strong>본문 글자 수 부족 (${chars.toLocaleString()}자)</strong>: 네이버 View 탭 및 스마트블록 검색 노출을 위한 권장 텍스트 분량은 공백 제외 1,500자 이상입니다. 글이 너무 짧을 경우 정보성이 부족한 피상적 문서로 오해받기 쉽습니다.`);
            }
            if (imgs < 5) {
                issues.push(`🚨 <strong>시각 자료(이미지) 수량 미달 (${imgs}개)</strong>: 소비자의 체류 시간을 확보하고 정보를 효과적으로 전달하기 위해 7장 이상의 이미지를 사용하는 것이 좋습니다. 특히 캡션(설명)이 생략되면 기계 가독성(Readability) 점수가 저하됩니다.`);
            }
            if (links >= 3) {
                issues.push(`🚨 <strong>과도한 상용 외부 링크 존재 (${links}개)</strong>: 본문 하단 등에 다수의 아웃링크를 배치하면 스팸 문서 혹은 상업 광고성 글로 오인받아 통합검색 순위에서 제외(누락)되는 스팸 필터가 작동할 위험이 있습니다.`);
            }
            if (videos === 0) {
                issues.push(`🚨 <strong>멀티미디어(동영상) 요소 부재</strong>: 동영상이 포함된 문서는 고유 창작물 점수가 가산되며, C-Rank 신뢰성 알고리즘에서 가산점을 획득합니다. 10초 내외의 가벼운 영상이라도 꼭 첨부하십시오.`);
            }
            if (quotes === 0) {
                issues.push(`🚨 <strong>인용 블록 및 텍스트 구조화 미흡</strong>: 인용구 블록이 없는 긴 서술형 글은 기계독해(MRC) 효율이 떨어집니다. 인용구를 활용하여 핵심 정의와 요약문을 시각적으로 정제해 보십시오.`);
            }
            if (maps === 0 && (post.title.includes("병원") || post.title.includes("마케팅") || post.title.includes("위치") || post.title.includes("맛집") || post.title.includes("내원"))) {
                issues.push(`🚨 <strong>네이버 지도 링크 누락 (GEO 로직 미반영)</strong>: 특정 오프라인 장소나 병원 내원 등의 정보를 언급함에도 지도가 누락되면 AI 검색 로봇의 GEO(지리 공간 최적화) 추천 적합도가 하락합니다.`);
            }

            if (issues.length === 0) {
                issues.push(`🚨 <strong>유사문서 판독 및 색인 제외 필터 작동</strong>: 수치 지표(글자수 ${chars}자, 이미지 ${imgs}개)는 양호하나, 타 웹문서나 타 블로그 글의 유사한 문맥 혹은 특정 키워드의 비정상적 반복(키워드 과포화)으로 인해 네이버 지식 스니펫 알고리즘 상 유사문서로 분류되었을 확률이 매우 높습니다.`);
            }

            // 맞춤형 AI 정밀 처방전
            let prescription = `
                <h3 style="font-size: 1.1rem; color: var(--neon-blue); text-shadow: 0 0 8px var(--neon-blue-glow); display: flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; font-weight:700;">
                    <i class="fa-solid fa-lightbulb"></i> 블랭블랭 AI 통합 노출 처방 가이드
                </h3>
                <ul style="margin: 0.8rem 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.88rem; color: #e0dced;">
                    <li><strong>두괄식 요약(Snippet) 테이블 도입</strong>: 포스팅 최상단 3줄 이내에 핵심 요약과 표(Table)를 적용하여 AI 로봇이 본문의 주제를 단 0.1초 만에 식별하도록 구성하십시오.</li>
                    <li><strong>E-E-A-T 지표 강화 (전문성 증명)</strong>: 글의 서두나 말미에 공신력 있는 의학 정보, 보도자료, 통계 리포트의 출처를 언급하고 원장님의 전문 소견을 구체적으로 가미해 보십시오.</li>
                    <li><strong>외부 상업 링크 제거 및 텍스트 수정</strong>: 본문 내의 지나치게 반복되는 상업성 문구(상담, 전화, 문의 등)와 카카오톡 ID, 전화번호의 텍스트 노출을 줄이고 대표 외부 링크는 1개 이하로 축소한 뒤 재발행을 고려해 보십시오.</li>
                </ul>
            `;

            let reportHtml = `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem; font-weight:700;">
                        <i class="fa-solid fa-circle-info" style="color: #ff3b30;"></i> 감지된 포스팅 누락 병목 요인 (${issues.length}개)
                    </h2>
                    <div style="background: rgba(255, 59, 48, 0.04); border: 1px solid rgba(255, 59, 48, 0.15); padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem;">
                        <ul style="margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.88rem; color: #e0dced;">
                            ${issues.map(issue => `<li style="line-height: 1.5;">${issue}</li>`).join("")}
                        </ul>
                    </div>
                    <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 1.5rem 0;">
                    ${prescription}
                    <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 1.5rem 0;">
                    <p style="font-size: 0.78rem; color: var(--text-secondary); text-align: center; margin-top: 1rem;">
                        * 본 소견서는 포스팅의 실제 구조(글자수, 리소스 등)와 네이버 로봇의 통합검색 필터를 시뮬레이션하여 동적 분석된 인텔리전스 가이드입니다.
                    </p>
                </div>
            `;

            if (aiAnalysisContent) aiAnalysisContent.innerHTML = reportHtml;
            if (aiAnalysisModal) aiAnalysisModal.classList.remove("hide");
        }
    });
});
