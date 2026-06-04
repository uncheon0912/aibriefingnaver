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
    const viewKeywordAnalyzer = document.getElementById("view-keyword-analyzer");
    const viewBlogDiagnose = document.getElementById("view-blog-diagnose");

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

    // [신규] 기간 필터 및 AEO 상세 진단 팝업 모달 엘리먼트 정의
    const periodSelect = document.getElementById("period-select");
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
    let activePeriod = "all";

    // 0. 사이드바 메뉴 탭 전환 바인딩
    menuKeywordAnalyzer.addEventListener("click", (e) => {
        e.preventDefault();
        menuKeywordAnalyzer.classList.add("active");
        menuBlogDiagnose.classList.remove("active");
        viewKeywordAnalyzer.classList.remove("hide");
        viewBlogDiagnose.classList.add("hide");
    });

    menuBlogDiagnose.addEventListener("click", (e) => {
        e.preventDefault();
        menuBlogDiagnose.classList.add("active");
        menuKeywordAnalyzer.classList.remove("active");
        viewBlogDiagnose.classList.remove("hide");
        viewKeywordAnalyzer.classList.add("hide");
    });

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
        triggerBlogAnalysis();
    });

    // 블로그 분석 구동기
    async function triggerBlogAnalysis() {
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

        blogSpinner.classList.remove("hide");
        blogLoadingState.classList.remove("hide");
        blogResultSection.classList.add("hide");

        try {
            const res = await fetch(`/api/blog/posts?blog_id=${encodeURIComponent(blogId)}`);
            if (!res.ok) {
                throw new Error("블로그 글 목록을 가져올 수 없습니다. 비공개이거나 아이디가 잘못되었습니다.");
            }

            const posts = await res.json();
            if (posts.length === 0) {
                throw new Error("수집된 최근 포스트가 없습니다.");
            }

            currentBlogPosts = posts.map(p => {
                // 대표 키워드 매핑 및 캐시화
                const kw = extractRepresentativeKeyword(p.title, p.link);
                return {
                    title: p.title,
                    link: p.link,
                    pub_date: p.pub_date,
                    keyword: kw,
                    search_volume: 0,
                    saturation_rate: 0,
                    exposure: "-",
                    ai_status: "-",
                    loading: true
                };
            });

            blogLoadingState.classList.add("hide");
            blogResultSection.classList.remove("hide");
            
            // 1차 목록 테이블 즉시 렌더링 (로딩 모드)
            renderBlogTable();

            // 순차적으로 병렬 분석 진단 호출 (서버 과부하 방지를 위해 순차 병렬)
            diagnoseAllPosts(token);

        } catch(err) {
            alert(err.message || "블로그 조회 실패");
            blogLoadingState.classList.add("hide");
        } finally {
            blogSpinner.classList.add("hide");
        }
    }

    // 개별 행 진단 호출 루프
    async function diagnoseAllPosts(token) {
        // 병렬 요청 최대 3개씩 청킹하여 안정적 크롤링 진행
        const batchSize = 3;
        for (let i = 0; i < currentBlogPosts.length; i += batchSize) {
            const batch = currentBlogPosts.slice(i, i + batchSize);
            const promises = batch.map((post, idx) => {
                const actualIdx = i + idx;
                return diagnoseSinglePost(post, actualIdx, token);
            });
            await Promise.all(promises);
            // 각 배치 완료 후 요약 통계 실시간 업데이트
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

        // 기간 필터 적용
        if (activePeriod !== "all") {
            const daysLimit = parseInt(activePeriod);
            const now = new Date();
            filtered = filtered.filter(p => {
                if (!p.iso_date) return false;
                const pDate = new Date(p.iso_date);
                const diffTime = Math.abs(now - pDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= daysLimit;
            });
        }

        // 정렬 적용
        filtered.sort((a, b) => {
            if (activeSort === "date") return 0; // RSS가 가져온 최신 순 유지
            if (activeSort === "volume") return b.search_volume - a.search_volume;
            if (activeSort === "saturation") return b.saturation_rate - a.saturation_rate;
            return 0;
        });

        if (filtered.length === 0) {
            blogDiagnoseTbody.innerHTML = `<tr><td colspan="7" class="text-center">해당 필터에 매칭되는 포스팅이 없습니다.</td></tr>`;
            return;
        }

        filtered.forEach((p, idx) => {
            const originalIndex = currentBlogPosts.indexOf(p);
            html += buildRowHtml(p, originalIndex);
        });

        blogDiagnoseTbody.innerHTML = html;
        bindTableEvents();
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
                        <span class="kw-text" style="font-weight: 600; color: var(--neon-blue);">${p.keyword}</span>
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

        // 2. 상세보기 팝업 모달 정밀 진단 연동
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
                        modalAiBriefingContent.innerHTML = `
                            <div class="ai-answer-container" style="font-size: 0.85rem; line-height: 1.65;">
                                ${data.ai_briefing.answer}
                            </div>
                        `;
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
        
        // 기간 필터 반영
        if (activePeriod !== "all") {
            const daysLimit = parseInt(activePeriod);
            const now = new Date();
            targetPosts = targetPosts.filter(p => {
                if (!p.iso_date) return false;
                const pDate = new Date(p.iso_date);
                const diffTime = Math.abs(now - pDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= daysLimit;
            });
        }

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

    // 4. 기간 필터 드롭다운 체인지 바인딩
    if (periodSelect) {
        periodSelect.addEventListener("change", () => {
            activePeriod = periodSelect.value;
            renderBlogTable();
            calculateBlogStats();
        });
    }

    // 5. AEO 상세 분석 모달 닫기 바인딩
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
    });
});
