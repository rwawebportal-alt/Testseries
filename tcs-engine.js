// =========================================================
// PAID TEST SERIES MINI APP - TCS ENGINE (tcs-engine.js)
// =========================================================

let tcsState = {
    activeTestKey: null,
    testMeta: null,
    rawAllQuestions: [],
    allParsedSections: [],      
    selectedOptionalByGroup: {}, 
    activeSections: [],         
    questions: [],              
    currentQIdx: 0,
    responses: {},              
    activeSectionIndex: 0,
    timerInterval: null,
    secondsLeft: 0,
    isSectionalTiming: false,
    sectionTimeAllocated: [],
    sectionSecondsLeft: [],
    isSubmitted: false,
    lang: "en",
    activeSolFilter: "all",
    activeFullSolIdx: 0
};

function stripHtmlText(html) {
    if (!html) return "";
    return String(html).replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function cleanQuestionHtml(rawHtml) {
    if (!rawHtml) return "";
    return String(rawHtml).replace(/font-size:\s*\d+(\.\d+)?(pt|px)/gi, "").replace(/<p>\s*(&nbsp;|\s)*\s*<\/p>/gi, "");
}

function detectSmartSubjectName(secId, rawLabel) {
    const cleanRaw = String(rawLabel || "").trim();
    if (cleanRaw && !/^section\s*\d+$/i.test(cleanRaw) && !/^\d+$/.test(cleanRaw)) return cleanRaw;
    return `Section ${secId}`;
}

window.launchTcsCbtEngine = async function(tKey) {
    const t = state.testMap[tKey];
    if (!t) return;

    tcsState.activeTestKey = tKey;
    tcsState.testMeta = t;
    tcsState.isSubmitted = false;
    tcsState.responses = {};
    tcsState.currentQIdx = 0;
    tcsState.activeSectionIndex = 0;
    tcsState.selectedOptionalByGroup = {};

    showSlide("slideTestAttempt");

    document.getElementById("start-screen").classList.remove("tcs-hidden");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("analysis-screen").classList.add("tcs-hidden");
    document.getElementById("solutions-screen").classList.add("tcs-hidden");
    document.getElementById("full-sol-screen").classList.add("tcs-hidden");

    document.getElementById("tcs-start-title").textContent = t.title || "Mock Test";
    const subContainer = document.getElementById("subjects-selection-container");
    subContainer.innerHTML = `<div style="text-align:center; padding:18px; font-weight:700; color:#475569;">🔄 Loading Test Subjects & Questions...</div>`;

    let rawQUrl = t.test_questions_url || t.questions_url || "";
    let loadedQuestions = [];
    if (rawQUrl) {
        try {
            const res = await fetch(rawQUrl);
            const json = await res.json();
            if (Array.isArray(json)) loadedQuestions = json;
            else if (json.data && Array.isArray(json.data)) loadedQuestions = json.data;
            else if (json.questions && Array.isArray(json.questions)) loadedQuestions = json.questions;
        } catch {
            console.error("Failed to load questions JSON directly.");
        }
    }

    if (!loadedQuestions || loadedQuestions.length === 0) {
        subContainer.innerHTML = `<div style="text-align:center; padding:18px; font-weight:700; color:#e53935;">❌ Failed to load questions.</div>`;
        return;
    }

    tcsState.rawAllQuestions = loadedQuestions;
    prepareAllSectionsAndRenderStart();
};

function prepareAllSectionsAndRenderStart() {
    const t = tcsState.testMeta || {};
    const groupMap = new Map();

    tcsState.rawAllQuestions.forEach((q, idx) => {
        const secId = String(q.section_id || q.part_id || q.subject_id || "1").trim();
        if (!groupMap.has(secId)) {
            groupMap.set(secId, {
                secId: secId,
                rawLabel: q.section_name || q.subject_name || q.part_title || q.subject || "",
                isExplicitOptional: String(q.is_optional || q.optional || "0") === "1",
                questions: []
            });
        }
        groupMap.get(secId).questions.push({ ...q, rawIndex: idx });
    });

    const parsedSections = [];
    groupMap.forEach((secObj, secId) => {
        const finalName = detectSmartSubjectName(secId, secObj.rawLabel);
        parsedSections.push({
            secId: secId,
            name: finalName,
            questions: secObj.questions,
            isOptional: secObj.isExplicitOptional,
            optGroup: "A"
        });
    });

    tcsState.allParsedSections = parsedSections;
    const optionalSecs = parsedSections.filter(s => s.isOptional);
    if (optionalSecs.length > 0 && !tcsState.selectedOptionalByGroup["A"]) {
        tcsState.selectedOptionalByGroup["A"] = optionalSecs[0].secId;
    }

    renderStartScreenUI();
}

function renderStartScreenUI() {
    const t = tcsState.testMeta || {};
    const container = document.getElementById("subjects-selection-container");
    const fixedSecs = tcsState.allParsedSections.filter(s => !s.isOptional);
    const optionalSecs = tcsState.allParsedSections.filter(s => s.isOptional);

    let html = `<div class="tcs-sec-heading">📚 Subjects in this Test:</div>`;

    fixedSecs.forEach(sec => {
        html += `
            <div class="tcs-sub-row fixed-sub">
                <div class="tcs-sub-left"><span style="font-size:16px;">✅</span><span>${sec.name}</span></div>
                <span class="tcs-sub-pill">${sec.questions.length} Qs</span>
            </div>`;
    });

    if (optionalSecs.length > 0) {
        const chosenSecId = tcsState.selectedOptionalByGroup["A"];
        html += `<div class="tcs-opt-heading">📝 Select Any One Optional Subject:</div>`;
        optionalSecs.forEach(sec => {
            const isSel = String(sec.secId) === String(chosenSecId);
            html += `
                <div class="tcs-sub-row opt-sub ${isSel ? "selected" : ""}" onclick="selectOptionalSubject('A', '${sec.secId}')">
                    <div class="tcs-sub-left">${isSel ? `<span style="color:#2e7d32; font-weight:900;">✓</span>` : ""}<span>${sec.name}</span></div>
                    <span class="tcs-sub-pill">${sec.questions.length} Qs</span>
                </div>`;
        });
    }

    container.innerHTML = html;

    const activeSecs = getActiveChosenSections();
    let totalQs = 0, totalMarks = 0;
    activeSecs.forEach(sec => {
        totalQs += sec.questions.length;
        sec.questions.forEach(q => { totalMarks += parseFloat(q.positive_marks || 2.0); });
    });

    const totalMins = String(t.time || "60").includes("+") ? String(t.time).split("+").reduce((a,b)=>a+parseInt(b),0) : parseInt(t.time || 60);

    document.getElementById("stat-qs").textContent = totalQs;
    document.getElementById("stat-time").textContent = `${totalMins} mins`;
    document.getElementById("stat-marks").textContent = Math.round(totalMarks);
}

window.selectOptionalSubject = function(groupKey, secId) {
    tcsState.selectedOptionalByGroup[groupKey] = String(secId);
    renderStartScreenUI();
};

function getActiveChosenSections() {
    const chosenOptId = tcsState.selectedOptionalByGroup["A"];
    return tcsState.allParsedSections.filter(sec => !sec.isOptional || String(sec.secId) === String(chosenOptId));
}

// ---------------- LIVE CBT ----------------
window.startTest = function() {
    const t = tcsState.testMeta || {};
    const chosenSecs = getActiveChosenSections();

    const flatQuestions = [];
    tcsState.activeSections = chosenSecs.map(sec => {
        const mappedQs = sec.questions.map(q => {
            const globalIdx = flatQuestions.length;
            const qCopy = { ...q, originalIndex: globalIdx, _sectionName: sec.name };
            flatQuestions.push(qCopy);
            return qCopy;
        });
        return { secId: sec.secId, name: sec.name, questions: mappedQs };
    });

    tcsState.questions = flatQuestions;
    tcsState.responses = {};
    tcsState.currentQIdx = 0;
    tcsState.activeSectionIndex = 0;

    const tStr = String(t.time || "60").trim();
    if (tStr.includes("+")) {
        const parts = tStr.split("+").map(n => (parseInt(n.trim()) || 15) * 60);
        tcsState.isSectionalTiming = true;
        tcsState.sectionTimeAllocated = tcsState.activeSections.map((_, i) => parts[i] || parts[0] || 900);
        tcsState.sectionSecondsLeft = [...tcsState.sectionTimeAllocated];
        tcsState.secondsLeft = tcsState.sectionSecondsLeft[0];
    } else {
        tcsState.isSectionalTiming = false;
        tcsState.secondsLeft = (parseInt(tStr) || 60) * 60;
    }

    document.getElementById("start-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.remove("tcs-hidden");
    document.getElementById("tcs-footer-sec-info").textContent = "";

    renderTcsTabs();
    loadQuestion(0);
    startTcsTimer();
};

function formatMMSS(sec) {
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}
function formatHHMMSS(sec) {
    return `${String(Math.floor(sec / 3600)).padStart(2, "0")}:${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function startTcsTimer() {
    if (tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    tcsState.timerInterval = setInterval(() => {
        if (tcsState.isSubmitted) return;

        const curIdx = tcsState.currentQIdx;
        if (!tcsState.responses[curIdx]) tcsState.responses[curIdx] = { status: "unattempted", chosenOption: null, timeSpent: 0 };
        tcsState.responses[curIdx].timeSpent++;
        document.getElementById("tcs-q-time").textContent = formatMMSS(tcsState.responses[curIdx].timeSpent);

        if (tcsState.secondsLeft <= 0) {
            if (tcsState.isSectionalTiming && tcsState.activeSectionIndex < tcsState.activeSections.length - 1) {
                tcsState.activeSectionIndex++;
                tcsState.secondsLeft = tcsState.sectionSecondsLeft[tcsState.activeSectionIndex];
                renderTcsTabs();
                loadQuestion(tcsState.activeSections[tcsState.activeSectionIndex].questions[0].originalIndex);
                return;
            }
            clearInterval(tcsState.timerInterval);
            submitTest();
            return;
        }

        tcsState.secondsLeft--;
        if (tcsState.isSectionalTiming) tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft;
        document.getElementById("tcs-timer-display").textContent = formatHHMMSS(tcsState.secondsLeft);
    }, 1000);
}

function renderTcsTabs() {
    const wrap = document.getElementById("tcs-tabs-container");
    wrap.innerHTML = "";
    tcsState.activeSections.forEach((sec, idx) => {
        const cls = idx === tcsState.activeSectionIndex ? "tcs-tab active" : "tcs-tab";
        wrap.innerHTML += `<div class="${cls}" onclick="switchTcsSection(${idx})">${sec.name}</div>`;
    });
}

window.switchTcsSection = function(secIdx) {
    if (tcsState.isSectionalTiming) {
        tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft;
        tcsState.secondsLeft = tcsState.sectionSecondsLeft[secIdx];
    }
    tcsState.activeSectionIndex = secIdx;
    renderTcsTabs();
    loadQuestion(tcsState.activeSections[secIdx].questions[0].originalIndex);
};

function loadQuestion(globalIdx) {
    tcsState.currentQIdx = globalIdx;
    const q = tcsState.questions[globalIdx];
    if (!q) return;

    if (!tcsState.responses[globalIdx]) tcsState.responses[globalIdx] = { status: "unattempted", chosenOption: null, timeSpent: 0 };

    let foundSecIdx = tcsState.activeSectionIndex;
    tcsState.activeSections.forEach((sec, sIdx) => { if (sec.questions.some(sq => sq.originalIndex === globalIdx)) foundSecIdx = sIdx; });
    if (foundSecIdx !== tcsState.activeSectionIndex) {
        if (tcsState.isSectionalTiming) {
            tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft;
            tcsState.secondsLeft = tcsState.sectionSecondsLeft[foundSecIdx];
        }
        tcsState.activeSectionIndex = foundSecIdx;
    }
    renderTcsTabs();

    document.getElementById("tcs-q-num").textContent = globalIdx + 1;
    document.getElementById("tcs-q-time").textContent = formatMMSS(tcsState.responses[globalIdx].timeSpent || 0);

    const posNum = parseFloat(q.positive_marks || 2);
    const negNum = parseFloat(q.negative_marks || 0.25);
    document.getElementById("tcs-live-pos").textContent = `+${Number.isInteger(posNum) ? posNum : posNum.toFixed(2)}`;
    document.getElementById("tcs-live-neg").textContent = `-${Number.isInteger(negNum) ? negNum : negNum}`;

    const qTxtBox = document.getElementById("tcs-q-text");
    const rawQHtml = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi)) ? (q.question_hi || q.question_hindi) : (q.question || q.question_text || "");
    qTxtBox.innerHTML = cleanQuestionHtml(rawQHtml);

    const optBox = document.getElementById("tcs-options-container");
    optBox.innerHTML = "";
    const chosen = (tcsState.responses[globalIdx] || {}).chosenOption;
    const letters = ["A", "B", "C", "D", "E"];
    const opts = [
        { id: "1", text: q.option_1 || q.opt1 }, { id: "2", text: q.option_2 || q.opt2 },
        { id: "3", text: q.option_3 || q.opt3 }, { id: "4", text: q.option_4 || q.opt4 },
        q.option_5 ? { id: "5", text: q.option_5 } : null
    ].filter(Boolean);

    opts.forEach((opt, oIdx) => {
        const isSel = String(chosen) === String(opt.id);
        optBox.innerHTML += `
            <div class="${isSel ? "tcs-option selected" : "tcs-option"}" onclick="selectTcsOption('${opt.id}')">
                <span class="tcs-opt-letter">${letters[oIdx] || opt.id}.</span>
                <div style="flex: 1; word-break: break-word;">${cleanQuestionHtml(opt.text || "")}</div>
            </div>`;
    });

    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([qTxtBox, optBox]).catch(() => {});
}

window.selectTcsOption = function(optId) {
    const idx = tcsState.currentQIdx;
    const prevTime = (tcsState.responses[idx] && tcsState.responses[idx].timeSpent) || 0;
    tcsState.responses[idx] = { status: "attempted", chosenOption: optId, timeSpent: prevTime };
    loadQuestion(idx);
};
window.saveAndNext = function() {
    const idx = tcsState.currentQIdx;
    if (tcsState.responses[idx]) tcsState.responses[idx].status = tcsState.responses[idx].chosenOption ? "attempted" : "unattempted";
    if (idx < tcsState.questions.length - 1) loadQuestion(idx + 1);
};
window.markForReview = function() {
    const idx = tcsState.currentQIdx;
    tcsState.responses[idx].status = tcsState.responses[idx].chosenOption ? "marked_attempted" : "marked";
    if (idx < tcsState.questions.length - 1) loadQuestion(idx + 1);
};
window.clearResponse = function() {
    const idx = tcsState.currentQIdx;
    tcsState.responses[idx] = { status: "unattempted", chosenOption: null, timeSpent: tcsState.responses[idx].timeSpent || 0 };
    loadQuestion(idx);
};
window.nextQuestion = function() { if (tcsState.currentQIdx < tcsState.questions.length - 1) loadQuestion(tcsState.currentQIdx + 1); };
window.prevQuestion = function() { if (tcsState.currentQIdx > 0) loadQuestion(tcsState.currentQIdx - 1); };

window.toggleTcsLangMode = function() {
    tcsState.lang = tcsState.lang === "en" ? "hi" : "en";
    if (!document.getElementById("live-test-screen").classList.contains("tcs-hidden")) loadQuestion(tcsState.currentQIdx);
    else if (!document.getElementById("solutions-screen").classList.contains("tcs-hidden")) renderSolutionsList(tcsState.activeSolFilter);
    else if (!document.getElementById("full-sol-screen").classList.contains("tcs-hidden")) renderFullSolutionContent(tcsState.activeFullSolIdx);
};

window.toggleTcsFullScreen = function() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else if (document.exitFullscreen) document.exitFullscreen();
};

window.toggleTcsPalette = function() {
    const palette = document.getElementById("tcs-palette");
    palette.classList.toggle("show");
    if (palette.classList.contains("show")) renderTcsAccordionGrid();
};

function renderTcsAccordionGrid() {
    const cont = document.getElementById("tcs-accordion-container");
    cont.innerHTML = "";
    tcsState.activeSections.forEach((sec, sIdx) => {
        let gridHtml = `<div class="tcs-q-grid open" id="grid_sec_${sIdx}">`;
        sec.questions.forEach(sq => {
            const gIdx = sq.originalIndex;
            const r = tcsState.responses[gIdx];
            let boxCls = "tcs-q-box st-not-ans";
            if (r) {
                if (r.status === "attempted") boxCls = "tcs-q-box st-ans";
                else if (r.status === "marked") boxCls = "tcs-q-box st-mark";
                else if (r.status === "marked_attempted") boxCls = "tcs-q-box st-mark-ans";
            }
            gridHtml += `<div class="${boxCls}" onclick="jumpToQuestion(${gIdx})">${gIdx + 1}</div>`;
        });
        gridHtml += `</div>`;
        cont.innerHTML += `<div class="tcs-accordion"><div class="tcs-acc-header" onclick="toggleGridSec(${sIdx})"><span>${sec.name}</span><span>▼</span></div>${gridHtml}</div>`;
    });
}
window.toggleGridSec = function(sIdx) { document.getElementById(`grid_sec_${sIdx}`).classList.toggle("open"); };
window.jumpToQuestion = function(idx) { toggleTcsPalette(); loadQuestion(idx); };

// ---------------- SUBMIT & ANALYSIS ----------------
window.handleDynamicSubmit = function() { prepareSubmit(); };
window.prepareSubmit = function() {
    document.getElementById("tcs-palette").classList.remove("show");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("submit-screen").classList.remove("tcs-hidden");
    const cont = document.getElementById("submit-summary-container");
    cont.innerHTML = "";
    tcsState.activeSections.forEach(sec => {
        let att = 0;
        sec.questions.forEach(sq => {
            const r = tcsState.responses[sq.originalIndex];
            if (r && (r.status === "attempted" || r.status === "marked_attempted")) att++;
        });
        cont.innerHTML += `<div style="background:#fff; padding:15px; border-radius:10px; border:1px solid #ddd; margin-bottom:10px;">
            <h3 style="margin-bottom:8px; color:#1a237e;">${sec.name}</h3>
            <div>Attempted: <b>${att} / ${sec.questions.length}</b></div>
        </div>`;
    });
};
window.closeSubmit = function() {
    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.remove("tcs-hidden");
};

window.submitTest = function() {
    if (tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    tcsState.isSubmitted = true;
    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("analysis-screen").classList.remove("tcs-hidden");

    let correct = 0, maxMarks = 0, score = 0;
    tcsState.questions.forEach((q, i) => {
        const pos = parseFloat(q.positive_marks || 2.0);
        const neg = parseFloat(q.negative_marks || 0.25);
        maxMarks += pos;
        const r = tcsState.responses[i] || {};
        const ans = String(q.answer || q.correct_option || "1").trim();
        if (r.chosenOption) {
            if (String(r.chosenOption) === ans) { correct++; score += pos; }
            else { score -= neg; }
        }
    });

    const accuracy = correct > 0 ? Math.round((correct / tcsState.questions.filter((_,i)=>tcsState.responses[i]?.chosenOption).length) * 100) : 0;
    
    document.getElementById("res-score").textContent = `${parseFloat(score.toFixed(2))}/${Math.round(maxMarks)}`;
    document.getElementById("res-acc").textContent = `${accuracy}%`;
    document.getElementById("res-rank").textContent = score >= maxMarks * 0.75 ? "#12" : "#148";
};

window.reAttemptCbtTest = function() { window.launchTcsCbtEngine(tcsState.activeTestKey); };
window.exitCbtTest = function() { if (tcsState.timerInterval) clearInterval(tcsState.timerInterval); showSlide("slideExplorer"); };

// ---------------- SOLUTIONS ----------------
window.openSolutions = function() {
    document.getElementById("analysis-screen").classList.add("tcs-hidden");
    document.getElementById("solutions-screen").classList.remove("tcs-hidden");
    tcsState.activeSolFilter = "all";
    renderSolutionsList("all");
};
window.closeSolutions = function() {
    document.getElementById("solutions-screen").classList.add("tcs-hidden");
    document.getElementById("analysis-screen").classList.remove("tcs-hidden");
};
window.filterSol = function(filter, btn) {
    document.querySelectorAll(".flt-btn").forEach(b => b.classList.remove("flt-active"));
    if (btn) btn.classList.add("flt-active");
    tcsState.activeSolFilter = filter;
    renderSolutionsList(filter);
};

function renderSolutionsList(filter) {
    const cont = document.getElementById("sol-list-container");
    cont.innerHTML = "";
    tcsState.questions.forEach((q, idx) => {
        const r = tcsState.responses[idx];
        const ans = String(q.answer || q.correct_option || "1").trim();
        const hasAns = r && r.chosenOption;
        const isCorr = hasAns && String(r.chosenOption) === ans;
        const isInc = hasAns && !isCorr;
        const isUna = !hasAns;

        if (filter === "correct" && !isCorr) return;
        if (filter === "incorrect" && !isInc) return;
        if (filter === "unattempted" && !isUna) return;

        let bCls = "st-una", ic = "−";
        if (isCorr) { bCls = "st-corr"; ic = "✓"; } else if (isInc) { bCls = "st-wr"; ic = "✕"; }
        const qTxt = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi)) ? (q.question_hi || q.question_hindi) : (q.question || q.question_text || "");

        cont.innerHTML += `
            <div class="sol-item" onclick="openFullSolution(${idx})" style="cursor:pointer;">
                <div class="sol-num-col"><div class="sol-num">${idx + 1}<div class="sol-status-icon ${bCls}">${ic}</div></div><div class="sol-line"></div></div>
                <div class="sol-card"><span class="sol-sec-badge" style="font-size:11px;background:#e2e8f0;padding:2px 8px;border-radius:10px;margin-bottom:8px;display:inline-block;">${q._sectionName || ""}</span><div class="sol-q-txt">${cleanQuestionHtml(qTxt)}</div></div>
            </div>`;
    });
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([cont]).catch(() => {});
}

window.openFullSolution = function(idx) {
    tcsState.activeFullSolIdx = idx;
    document.getElementById("solutions-screen").classList.add("tcs-hidden");
    document.getElementById("full-sol-screen").classList.remove("tcs-hidden");
    renderFullSolutionContent(idx);
};
function renderFullSolutionContent(idx) {
    const q = tcsState.questions[idx];
    if (!q) return;
    const r = tcsState.responses[idx] || {};
    const ans = String(q.answer || q.correct_option || "1").trim();

    document.getElementById("fs-q-num").textContent = `Question ${idx + 1} (${q._sectionName || ""})`;
    const qTxt = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi)) ? (q.question_hi || q.question_hindi) : (q.question || q.question_text || "");
    document.getElementById("fs-q-txt").innerHTML = cleanQuestionHtml(qTxt);

    const optBox = document.getElementById("fs-options-container");
    optBox.innerHTML = "";
    const letters = ["A", "B", "C", "D", "E"];
    const opts = [{ id: "1", text: q.option_1 || q.opt1 }, { id: "2", text: q.option_2 || q.opt2 }, { id: "3", text: q.option_3 || q.opt3 }, { id: "4", text: q.option_4 || q.opt4 }, q.option_5 ? { id: "5", text: q.option_5 } : null].filter(Boolean);
    opts.forEach((opt, oIdx) => {
        const isCorr = String(opt.id) === ans;
        const isUsr = r.chosenOption && String(r.chosenOption) === String(opt.id);
        const cls = isCorr ? "fs-opt correct" : (isUsr ? "fs-opt wrong" : "fs-opt");
        optBox.innerHTML += `<div class="${cls}">
            <div style="display:flex; gap:10px;"><strong style="color:#1a237e;">${letters[oIdx] || opt.id}.</strong><div>${cleanQuestionHtml(opt.text || "")}</div></div>
            ${isCorr ? `<span style="font-size:11px;font-weight:800;color:#2e7d32;background:#c8e6c9;padding:2px 6px;border-radius:6px;">✓ Correct</span>` : ""}
            ${isUsr && !isCorr ? `<span style="font-size:11px;font-weight:800;color:#c62828;">✗ Your Ans</span>` : ""}
        </div>`;
    });

    const expText = (tcsState.lang === "hi" && (q.explanation_hi || q.solution_hi)) ? (q.explanation_hi || q.solution_hi) : (q.solution_text || q.explanation || q.solution || "Detailed solution above.");
    document.getElementById("fs-exp-text").innerHTML = cleanQuestionHtml(expText);
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([document.getElementById("full-sol-screen")]).catch(() => {});
}
window.closeFullSol = function() { document.getElementById("full-sol-screen").classList.add("tcs-hidden"); document.getElementById("solutions-screen").classList.remove("tcs-hidden"); };
window.nextFullSol = function() { if (tcsState.activeFullSolIdx < tcsState.questions.length - 1) { tcsState.activeFullSolIdx++; renderFullSolutionContent(tcsState.activeFullSolIdx); } };
window.prevFullSol = function() { if (tcsState.activeFullSolIdx > 0) { tcsState.activeFullSolIdx--; renderFullSolutionContent(tcsState.activeFullSolIdx); } };
