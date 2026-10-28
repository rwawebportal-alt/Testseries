// =========================================================
// TEST SERIES PRO - CBT ENGINE (tcs-engine.js)
// =========================================================

let tcsState = {
    activeTestKey: null, testMeta: null, rawAllQuestions: [], allParsedSections: [],      
    selectedOptionalByGroup: {}, activeSections: [], questions: [], currentQIdx: 0,
    responses: {}, activeSectionIndex: 0, timerInterval: null, secondsLeft: 0,
    isSectionalTiming: false, sectionTimeAllocated: [], sectionSecondsLeft: [],
    isSubmitted: false, lang: "en", activeSolFilter: "all", activeFullSolIdx: 0
};

function cleanHtml(html) {
    if (!html) return "";
    return String(html).replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<p>\s*(&nbsp;|\s)*\s*<\/p>/gi, "");
}

window.launchTcsCbtEngine = async function(tKey) {
    const t = state.testMap[tKey];
    if (!t) return;
    
    tcsState.activeTestKey = tKey; tcsState.testMeta = t; tcsState.isSubmitted = false;
    tcsState.responses = {}; tcsState.currentQIdx = 0; tcsState.activeSectionIndex = 0; tcsState.selectedOptionalByGroup = {};

    showCbtSlide(); // Overlap fix (Uses clean routing)

    document.getElementById("start-screen").classList.remove("tcs-hidden");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("analysis-screen").classList.add("tcs-hidden");
    document.getElementById("solutions-screen").classList.add("tcs-hidden");
    document.getElementById("full-sol-screen").classList.add("tcs-hidden");

    document.getElementById("tcs-start-title").textContent = t.title || "Mock Test";
    const subContainer = document.getElementById("subjects-selection-container");
    subContainer.innerHTML = `<div class="text-center p-4 font-bold text-indigo-700">🔄 Loading Questions...</div>`;

    let rawQUrl = t.test_questions_url || t.questions_url || "";
    if(rawQUrl && !rawQUrl.startsWith("http")) rawQUrl = state.currentDomain + rawQUrl;
    
    let loadedQuestions = [];
    if (rawQUrl) {
        try {
            const res = await fetch(rawQUrl);
            const json = await res.json();
            if (Array.isArray(json)) loadedQuestions = json;
            else if (json.data && Array.isArray(json.data)) loadedQuestions = json.data;
            else if (json.questions && Array.isArray(json.questions)) loadedQuestions = json.questions;
        } catch {
            // Proxy Fallback for questions JSON
            try {
                const pRes = await fetch("https://proplayer.allswbatch22.workers.dev/proxy?url=" + encodeURIComponent(rawQUrl));
                const pJson = await pRes.json();
                if (Array.isArray(pJson)) loadedQuestions = pJson;
                else if (pJson.data && Array.isArray(pJson.data)) loadedQuestions = pJson.data;
            } catch (e) {
                console.error("Failed to load Qs");
            }
        }
    }

    if (!loadedQuestions || loadedQuestions.length === 0) {
        subContainer.innerHTML = `<div class="text-center p-4 font-bold text-red-600">❌ Questions data not found.</div>`;
        return;
    }
    tcsState.rawAllQuestions = loadedQuestions;
    prepareAllSectionsAndRenderStart();
};

function prepareAllSectionsAndRenderStart() {
    const groupMap = new Map();
    tcsState.rawAllQuestions.forEach((q, idx) => {
        const secId = String(q.section_id || q.part_id || q.subject_id || "1").trim();
        if (!groupMap.has(secId)) {
            groupMap.set(secId, {
                secId: secId, rawLabel: q.section_name || q.subject_name || `Section ${secId}`,
                isOptional: String(q.is_optional || q.optional || "0") === "1", questions: []
            });
        }
        groupMap.get(secId).questions.push({ ...q, originalIndex: idx });
    });

    tcsState.allParsedSections = [];
    groupMap.forEach(secObj => {
        tcsState.allParsedSections.push({ secId: secObj.secId, name: secObj.rawLabel, questions: secObj.questions, isOptional: secObj.isOptional });
    });

    const optSecs = tcsState.allParsedSections.filter(s => s.isOptional);
    if (optSecs.length > 0) tcsState.selectedOptionalByGroup["A"] = optSecs[0].secId;

    renderStartScreenUI();
}

function renderStartScreenUI() {
    const container = document.getElementById("subjects-selection-container");
    const fixedSecs = tcsState.allParsedSections.filter(s => !s.isOptional);
    const optSecs = tcsState.allParsedSections.filter(s => s.isOptional);

    let html = `<div class="font-bold text-indigo-900 mb-2">📚 Compulsory Subjects:</div>`;
    fixedSecs.forEach(sec => {
        html += `<div class="tcs-sub-row fixed-sub"><div><span class="mr-2">✅</span>${sec.name}</div><span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">${sec.questions.length} Qs</span></div>`;
    });

    if (optSecs.length > 0) {
        const chosenId = tcsState.selectedOptionalByGroup["A"];
        html += `<div class="font-bold text-orange-600 mt-4 mb-2">📝 Select Any One Optional:</div>`;
        optSecs.forEach(sec => {
            const isSel = String(sec.secId) === String(chosenId);
            html += `<div class="tcs-sub-row opt-sub ${isSel ? "selected" : ""}" onclick="selectOptionalSubject('A', '${sec.secId}')">
                    <div>${isSel ? `<span class="text-green-600 mr-2 font-black">✓</span>` : ""}${sec.name}</div>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">${sec.questions.length} Qs</span>
                </div>`;
        });
    }

    container.innerHTML = html;

    const activeSecs = tcsState.allParsedSections.filter(sec => !sec.isOptional || String(sec.secId) === String(tcsState.selectedOptionalByGroup["A"]));
    let totalQs = 0, totalMarks = 0;
    activeSecs.forEach(sec => {
        totalQs += sec.questions.length;
        sec.questions.forEach(q => totalMarks += parseFloat(q.positive_marks || 2.0));
    });

    const t = tcsState.testMeta || {};
    const totalMins = String(t.time || "60").includes("+") ? String(t.time).split("+").reduce((a,b)=>a+parseInt(b),0) : parseInt(t.time || 60);

    document.getElementById("stat-qs").textContent = totalQs;
    document.getElementById("stat-time").textContent = `${totalMins} mins`;
    document.getElementById("stat-marks").textContent = Math.round(totalMarks);
}

window.selectOptionalSubject = function(groupKey, secId) {
    tcsState.selectedOptionalByGroup[groupKey] = String(secId);
    renderStartScreenUI();
};

window.startTest = function() {
    const activeSecs = tcsState.allParsedSections.filter(sec => !sec.isOptional || String(sec.secId) === String(tcsState.selectedOptionalByGroup["A"]));
    const flatQuestions = [];
    tcsState.activeSections = activeSecs.map(sec => {
        const qs = sec.questions.map(q => { const gIdx = flatQuestions.length; const copy = { ...q, originalIndex: gIdx, _secName: sec.name }; flatQuestions.push(copy); return copy; });
        return { secId: sec.secId, name: sec.name, questions: qs };
    });

    tcsState.questions = flatQuestions;
    tcsState.responses = {}; tcsState.currentQIdx = 0; tcsState.activeSectionIndex = 0;

    const tStr = String(tcsState.testMeta.time || "60").trim();
    if (tStr.includes("+")) {
        const parts = tStr.split("+").map(n => (parseInt(n) || 15) * 60);
        tcsState.isSectionalTiming = true;
        tcsState.sectionTimeAllocated = tcsState.activeSections.map((_, i) => parts[i] || parts[0] || 900);
        tcsState.sectionSecondsLeft = [...tcsState.sectionTimeAllocated];
        tcsState.secondsLeft = tcsState.sectionSecondsLeft[0];
    } else {
        tcsState.isSectionalTiming = false; tcsState.secondsLeft = (parseInt(tStr) || 60) * 60;
    }

    document.getElementById("start-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.remove("tcs-hidden");
    
    renderTcsTabs();
    loadQuestion(0);
    startTcsTimer();
};

function startTcsTimer() {
    if (tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    tcsState.timerInterval = setInterval(() => {
        if (tcsState.isSubmitted) return;
        
        const curIdx = tcsState.currentQIdx;
        if (!tcsState.responses[curIdx]) tcsState.responses[curIdx] = { status: "unattempted", timeSpent: 0 };
        tcsState.responses[curIdx].timeSpent++;
        
        const mmss = `${String(Math.floor(tcsState.responses[curIdx].timeSpent/60)).padStart(2,"0")}:${String(tcsState.responses[curIdx].timeSpent%60).padStart(2,"0")}`;
        document.getElementById("tcs-q-time").textContent = mmss;

        if (tcsState.secondsLeft <= 0) {
            if (tcsState.isSectionalTiming && tcsState.activeSectionIndex < tcsState.activeSections.length - 1) {
                tcsState.activeSectionIndex++;
                tcsState.secondsLeft = tcsState.sectionSecondsLeft[tcsState.activeSectionIndex];
                renderTcsTabs(); loadQuestion(tcsState.activeSections[tcsState.activeSectionIndex].questions[0].originalIndex); return;
            }
            clearInterval(tcsState.timerInterval); submitTest(); return;
        }

        tcsState.secondsLeft--;
        if (tcsState.isSectionalTiming) tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft;
        
        const hhmmss = `${String(Math.floor(tcsState.secondsLeft/3600)).padStart(2,"0")}:${String(Math.floor((tcsState.secondsLeft%3600)/60)).padStart(2,"0")}:${String(tcsState.secondsLeft%60).padStart(2,"0")}`;
        document.getElementById("tcs-timer-display").textContent = hhmmss;
    }, 1000);
}

function renderTcsTabs() {
    const wrap = document.getElementById("tcs-tabs-container"); wrap.innerHTML = "";
    tcsState.activeSections.forEach((sec, idx) => {
        wrap.innerHTML += `<div class="${idx === tcsState.activeSectionIndex ? "tcs-tab active" : "tcs-tab"}" onclick="switchTcsSection(${idx})">${sec.name}</div>`;
    });
}
window.switchTcsSection = function(idx) {
    if(tcsState.isSectionalTiming){ tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft; tcsState.secondsLeft = tcsState.sectionSecondsLeft[idx]; }
    tcsState.activeSectionIndex = idx; renderTcsTabs();
    loadQuestion(tcsState.activeSections[idx].questions[0].originalIndex);
};

function loadQuestion(idx) {
    tcsState.currentQIdx = idx;
    const q = tcsState.questions[idx];
    if (!tcsState.responses[idx]) tcsState.responses[idx] = { status: "unattempted", timeSpent: 0 };
    
    let fIdx = tcsState.activeSectionIndex;
    tcsState.activeSections.forEach((sec, sIdx) => { if(sec.questions.some(sq => sq.originalIndex === idx)) fIdx = sIdx; });
    if (fIdx !== tcsState.activeSectionIndex) {
        if(tcsState.isSectionalTiming){ tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft; tcsState.secondsLeft = tcsState.sectionSecondsLeft[fIdx]; }
        tcsState.activeSectionIndex = fIdx; renderTcsTabs();
    }
    
    document.getElementById("tcs-q-num").textContent = idx + 1;
    document.getElementById("tcs-footer-sec-info").textContent = q._secName;
    document.getElementById("tcs-live-pos").textContent = `+${parseFloat(q.positive_marks || 2)}`;
    document.getElementById("tcs-live-neg").textContent = `-${parseFloat(q.negative_marks || 0.25)}`;
    
    const txt = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi)) ? (q.question_hi || q.question_hindi) : (q.question || q.question_text || "");
    const qTxtBox = document.getElementById("tcs-q-text");
    qTxtBox.innerHTML = cleanHtml(txt);

    const optBox = document.getElementById("tcs-options-container"); optBox.innerHTML = "";
    const chosen = (tcsState.responses[idx] || {}).chosenOption;
    const letters = ["A", "B", "C", "D", "E"];
    const opts = [{ id: "1", text: q.option_1||q.opt1 }, { id: "2", text: q.option_2||q.opt2 }, { id: "3", text: q.option_3||q.opt3 }, { id: "4", text: q.option_4||q.opt4 }, q.option_5 ? { id: "5", text: q.option_5 } : null].filter(Boolean);

    opts.forEach((opt, oIdx) => {
        optBox.innerHTML += `<div class="${String(chosen) === String(opt.id) ? "tcs-option selected" : "tcs-option"}" onclick="selectTcsOption('${opt.id}')">
            <span class="tcs-opt-letter">${letters[oIdx] || opt.id}.</span><div style="flex:1;">${cleanHtml(opt.text)}</div></div>`;
    });
    if (window.MathJax) MathJax.typesetPromise([qTxtBox, optBox]).catch(()=>{});
}

window.selectTcsOption = function(id) { tcsState.responses[tcsState.currentQIdx] = { status: "attempted", chosenOption: id, timeSpent: tcsState.responses[tcsState.currentQIdx].timeSpent||0 }; loadQuestion(tcsState.currentQIdx); };
window.saveAndNext = function() { const r = tcsState.responses[tcsState.currentQIdx]; r.status = r.chosenOption ? "attempted" : "unattempted"; if (tcsState.currentQIdx < tcsState.questions.length-1) loadQuestion(tcsState.currentQIdx+1); };
window.markForReview = function() { const r = tcsState.responses[tcsState.currentQIdx]; r.status = r.chosenOption ? "marked_attempted" : "marked"; if (tcsState.currentQIdx < tcsState.questions.length-1) loadQuestion(tcsState.currentQIdx+1); };
window.clearResponse = function() { tcsState.responses[tcsState.currentQIdx] = { status: "unattempted", chosenOption: null, timeSpent: tcsState.responses[tcsState.currentQIdx].timeSpent||0 }; loadQuestion(tcsState.currentQIdx); };
window.nextQuestion = function() { if (tcsState.currentQIdx < tcsState.questions.length-1) loadQuestion(tcsState.currentQIdx+1); };
window.prevQuestion = function() { if (tcsState.currentQIdx > 0) loadQuestion(tcsState.currentQIdx-1); };
window.toggleTcsLangMode = function() { tcsState.lang = tcsState.lang==="en"?"hi":"en"; if(!document.getElementById("live-test-screen").classList.contains("tcs-hidden")) loadQuestion(tcsState.currentQIdx); else if(!document.getElementById("full-sol-screen").classList.contains("tcs-hidden")) renderFullSolutionContent(tcsState.activeFullSolIdx); };
window.toggleTcsFullScreen = function() { if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else if(document.exitFullscreen) document.exitFullscreen(); };

window.toggleTcsPalette = function() {
    const pal = document.getElementById("tcs-palette"); pal.classList.toggle("opacity-0"); pal.classList.toggle("pointer-events-none");
    pal.querySelector("div").classList.toggle("translate-x-full");
    if(!pal.classList.contains("opacity-0")) {
        const c = document.getElementById("tcs-accordion-container"); c.innerHTML = "";
        tcsState.activeSections.forEach((sec) => {
            let html = `<div class="mb-4"><div class="font-bold text-indigo-900 mb-2">${sec.name}</div><div class="grid grid-cols-5 gap-2">`;
            sec.questions.forEach(q => {
                const r = tcsState.responses[q.originalIndex];
                let bg = "bg-white border border-slate-300 text-slate-700";
                if(r?.status === "attempted") bg = "bg-green-600 text-white border-green-600";
                else if(r?.status === "marked") bg = "bg-orange-100 border-orange-400 text-orange-800";
                else if(r?.status === "marked_attempted") bg = "bg-orange-500 text-white border-orange-500";
                html += `<div class="${bg} rounded-lg h-9 flex items-center justify-center font-bold text-xs cursor-pointer" onclick="jumpToQuestion(${q.originalIndex})">${q.originalIndex+1}</div>`;
            });
            c.innerHTML += html + `</div></div>`;
        });
    }
};
window.jumpToQuestion = function(idx) { toggleTcsPalette(); loadQuestion(idx); };

window.handleDynamicSubmit = function() { prepareSubmit(); };
window.prepareSubmit = function() {
    if(!document.getElementById("tcs-palette").classList.contains("opacity-0")) toggleTcsPalette();
    document.getElementById("live-test-screen").classList.add("tcs-hidden"); document.getElementById("submit-screen").classList.remove("tcs-hidden");
    const c = document.getElementById("submit-summary-container"); c.innerHTML = "";
    tcsState.activeSections.forEach(sec => {
        let att = 0; sec.questions.forEach(q => { if(["attempted","marked_attempted"].includes(tcsState.responses[q.originalIndex]?.status)) att++; });
        c.innerHTML += `<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h3 class="font-bold text-indigo-900">${sec.name}</h3><div class="text-sm font-medium text-slate-600 mt-1">Attempted: <span class="text-indigo-600 font-black">${att}/${sec.questions.length}</span></div></div>`;
    });
};
window.closeSubmit = function() { document.getElementById("submit-screen").classList.add("tcs-hidden"); document.getElementById("live-test-screen").classList.remove("tcs-hidden"); };

window.submitTest = function() {
    if(tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    tcsState.isSubmitted = true;
    document.getElementById("submit-screen").classList.add("tcs-hidden"); document.getElementById("analysis-screen").classList.remove("tcs-hidden");
    
    let c = 0, score = 0, max = 0;
    tcsState.questions.forEach((q,i) => {
        const p = parseFloat(q.positive_marks||2), n = parseFloat(q.negative_marks||0.25); max+=p;
        const ans = String(q.answer||q.correct_option||"1").trim();
        if(tcsState.responses[i]?.chosenOption) { if(String(tcsState.responses[i].chosenOption)===ans){ c++; score+=p; } else { score-=n; } }
    });
    
    document.getElementById("res-score").textContent = score.toFixed(1); document.getElementById("res-acc").textContent = (c>0 ? Math.round(c/tcsState.questions.filter((_,i)=>tcsState.responses[i]?.chosenOption).length*100) : 0) + "%";
    document.getElementById("res-rank").textContent = score >= max*0.75 ? "#12" : "#148";

    const aCont = document.getElementById("analysis-sections-container"); aCont.innerHTML = "";
    tcsState.activeSections.forEach(sec => {
        let sS = 0; sec.questions.forEach(q => {
            const r = tcsState.responses[q.originalIndex]; const a = String(q.answer||q.correct_option||"1").trim();
            if(r?.chosenOption) { if(String(r.chosenOption)===a) sS+=parseFloat(q.positive_marks||2); else sS-=parseFloat(q.negative_marks||0.25); }
        });
        aCont.innerHTML += `<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center"><div class="font-bold text-slate-800">${sec.name}</div><div class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg font-black text-sm">Score: ${sS.toFixed(1)}</div></div>`;
    });
};

window.reAttemptCbtTest = function() { window.launchTcsCbtEngine(tcsState.activeTestKey); };
window.exitCbtTest = function() { if(tcsState.timerInterval) clearInterval(tcsState.timerInterval); handleBack(); };

window.openSolutions = function() { document.getElementById("analysis-screen").classList.add("tcs-hidden"); document.getElementById("solutions-screen").classList.remove("tcs-hidden"); filterSol('all'); };
window.closeSolutions = function() { document.getElementById("solutions-screen").classList.add("tcs-hidden"); document.getElementById("analysis-screen").classList.remove("tcs-hidden"); };
window.filterSol = function(filter, btn) {
    if(btn){ document.querySelectorAll(".flt-btn").forEach(b=>{b.classList.remove("flt-active","bg-indigo-600","text-white");b.classList.add("bg-white","text-slate-700");}); btn.classList.add("flt-active","bg-indigo-600","text-white"); btn.classList.remove("bg-white","text-slate-700"); }
    const c = document.getElementById("sol-list-container"); c.innerHTML = "";
    tcsState.questions.forEach((q,i) => {
        const r = tcsState.responses[i], a = String(q.answer||q.correct_option||"1").trim();
        const hasA = r?.chosenOption, isC = hasA && String(r.chosenOption)===a, isI = hasA && !isC;
        if((filter==="correct"&&!isC) || (filter==="incorrect"&&!isI) || (filter==="unattempted"&&hasA)) return;
        
        let ic = "➖", bg = "bg-slate-200 text-slate-600";
        if(isC) { ic = "✔"; bg = "bg-green-100 text-green-700"; } else if(isI) { ic = "✖"; bg = "bg-red-100 text-red-700"; }
        
        c.innerHTML += `<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 cursor-pointer flex gap-3" onclick="openFullSolution(${i})">
            <div class="${bg} w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">${ic}</div>
            <div><div class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Q ${i+1} • ${q._secName}</div><div class="text-sm text-slate-800 line-clamp-2">${cleanHtml(tcsState.lang==="hi"&&q.question_hi?q.question_hi:q.question||"")}</div></div>
        </div>`;
    });
    if(window.MathJax) MathJax.typesetPromise([c]).catch(()=>{});
};

window.openFullSolution = function(idx) { tcsState.activeFullSolIdx = idx; document.getElementById("solutions-screen").classList.add("tcs-hidden"); document.getElementById("full-sol-screen").classList.remove("tcs-hidden"); renderFullSolutionContent(idx); };
window.closeFullSol = function() { document.getElementById("full-sol-screen").classList.add("tcs-hidden"); document.getElementById("solutions-screen").classList.remove("tcs-hidden"); };
window.nextFullSol = function() { if(tcsState.activeFullSolIdx < tcsState.questions.length-1) renderFullSolutionContent(++tcsState.activeFullSolIdx); };
window.prevFullSol = function() { if(tcsState.activeFullSolIdx > 0) renderFullSolutionContent(--tcsState.activeFullSolIdx); };

function renderFullSolutionContent(idx) {
    const q = tcsState.questions[idx], r = tcsState.responses[idx], ans = String(q.answer||q.correct_option||"1").trim();
    document.getElementById("fs-q-num").textContent = `Q ${idx+1} (${q._secName})`;
    const qTxtBox = document.getElementById("fs-q-txt"); qTxtBox.innerHTML = cleanHtml(tcsState.lang==="hi"&&q.question_hi?q.question_hi:q.question);
    
    const ob = document.getElementById("fs-options-container"); ob.innerHTML = "";
    const opts = [{id:"1",t:q.option_1||q.opt1},{id:"2",t:q.option_2||q.opt2},{id:"3",t:q.option_3||q.opt3},{id:"4",t:q.option_4||q.opt4}].filter(o=>o.t);
    opts.forEach((opt, i) => {
        const isC = String(opt.id)===ans, isU = r?.chosenOption && String(r.chosenOption)===String(opt.id);
        let cls = "border border-slate-200 bg-white p-3 rounded-xl";
        if(isC) cls = "border-2 border-green-500 bg-green-50 text-green-900"; else if(isU) cls = "border-2 border-red-500 bg-red-50 text-red-900";
        ob.innerHTML += `<div class="${cls} mb-2 flex items-start gap-2"><div class="font-black">${["A","B","C","D"][i]||opt.id}.</div><div class="flex-1">${cleanHtml(opt.t)}</div>${isC?`<span class="bg-green-200 text-green-800 text-[10px] font-black px-2 py-0.5 rounded">✔ ANS</span>`:""}${isU&&!isC?`<span class="bg-red-200 text-red-800 text-[10px] font-black px-2 py-0.5 rounded">✖ YOU</span>`:""}</div>`;
    });
    document.getElementById("fs-exp-text").innerHTML = cleanHtml(tcsState.lang==="hi"&&q.explanation_hi?q.explanation_hi:q.explanation||"Direct Answer.");
    if(window.MathJax) MathJax.typesetPromise([qTxtBox, ob, document.getElementById("fs-exp-text")]).catch(()=>{});
}
