// =========================================================
// RWA SKY PORTAL - EXACT TCS CBT MOCK TEST ENGINE (tcs-engine.js)
// Matches Screenshot 4 (Start + Optional Selector) & Screenshot 5 (Live CBT UI)
// =========================================================

(function injectExactTcsStyles() {
    if (document.getElementById("tcs-exact-fix-styles")) return;
    const st = document.createElement("style");
    st.id = "tcs-exact-fix-styles";
    st.innerHTML = `
        /* Fix parent transform breaking position:fixed (Removes blue border on left/top) */
        #slideTestAttempt,
        #slideTestAttempt.active-slide {
            animation: none !important;
            transform: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        .tcs-fullscreen-shell {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            background: #555555;
            z-index: 99999 !important;
            overflow: hidden;
        }

        /* STEP 1: START SCREEN EXACT MATCH (Screenshot 4) */
        #start-screen {
            background: #555555 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px !important;
            overflow-y: auto;
        }

        #start-screen .start-card {
            background: #ffffff !important;
            width: 100% !important;
            max-width: 460px !important;
            border-radius: 22px !important;
            padding: 22px 20px !important;
            max-height: 94vh !important;
            overflow-y: auto !important;
            box-shadow: 0 15px 35px rgba(0,0,0,0.45) !important;
            position: relative !important;
        }

        .tcs-sec-heading {
            font-size: 15px;
            font-weight: 800;
            color: #1a237e;
            margin: 10px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        #subjects-selection-container {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            position: relative !important;
            width: 100% !important;
            margin-bottom: 14px !important;
        }

        .tcs-sub-row {
            position: relative !important;
            width: 100% !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 13px 15px !important;
            border-radius: 11px !important;
            font-size: 14px !important;
            transition: all 0.18s ease !important;
            margin: 0 !important;
        }

        .tcs-sub-row.fixed-sub {
            background: #f0f4f8 !important;
            border: 1px solid #d9e2ec !important;
            border-left: 4px solid #1a237e !important;
        }

        .tcs-sub-row.opt-sub {
            background: #ffffff !important;
            border: 1px solid #ffcc80 !important;
            border-left: 4px solid #ff9800 !important;
            cursor: pointer !important;
        }

        .tcs-sub-row.opt-sub.selected {
            background: #e8f5e9 !important;
            border: 1.5px solid #4caf50 !important;
            border-left: 4px solid #4caf50 !important;
        }

        .tcs-sub-left {
            display: flex !important;
            align-items: center !important;
            gap: 9px !important;
            font-weight: 700 !important;
            color: #102a43 !important;
            text-align: left !important;
            line-height: 1.35 !important;
            padding-right: 8px !important;
        }

        .tcs-sub-pill {
            background: #d9e2ec !important;
            color: #334e68 !important;
            font-size: 12px !important;
            font-weight: 800 !important;
            padding: 4px 11px !important;
            border-radius: 14px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
        }

        .tcs-sub-row.opt-sub.selected .tcs-sub-pill {
            background: #c8e6c9 !important;
            color: #2e7d32 !important;
        }

        .tcs-opt-heading {
            font-size: 13.5px !important;
            font-weight: 800 !important;
            color: #e65100 !important;
            margin: 8px 0 2px 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }

        #start-screen .stats-box {
            position: relative !important;
            width: 100% !important;
            background: #f8f9fa !important;
            padding: 15px 16px !important;
            border-radius: 12px !important;
            border: 1px solid #e9ecef !important;
            margin-top: 14px !important;
            clear: both !important;
        }

        #start-screen .start-btn {
            background: #1c1c1e !important;
            color: #ffffff !important;
            border-radius: 10px !important;
            padding: 15px !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            margin-top: 16px !important;
            width: 100% !important;
            border: none !important;
            cursor: pointer !important;
        }

        /* STEP 2: LIVE TEST SCREEN EXACT MATCH (Screenshot 5) */
        #live-test-screen .tcs-q-badge {
            background: #757575 !important;
            color: #ffffff !important;
            width: 26px !important;
            height: 26px !important;
            border-radius: 50% !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: 800 !important;
            font-size: 12px !important;
            margin-right: 8px !important;
        }

        #live-test-screen .tcs-m-pos {
            background: transparent !important;
            color: #2e7d32 !important;
            font-weight: 800 !important;
            font-size: 13px !important;
            padding: 0 2px !important;
        }

        #live-test-screen .tcs-m-neg {
            background: transparent !important;
            color: #d32f2f !important;
            font-weight: 800 !important;
            font-size: 13px !important;
            padding: 0 2px !important;
        }

        #live-test-screen .tcs-option {
            border: 1px solid #eeeeee !important;
            border-radius: 10px !important;
            padding: 14px 16px !important;
            margin-bottom: 12px !important;
            font-size: 15px !important;
            display: flex !important;
            align-items: flex-start !important;
            cursor: pointer !important;
            background: #ffffff !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04) !important;
            transition: all 0.15s ease !important;
        }

        #live-test-screen .tcs-option.selected {
            border: 1.5px solid #1a237e !important;
            background: #e8eaf6 !important;
        }

        #live-test-screen .tcs-opt-letter {
            font-weight: 800 !important;
            color: #222222 !important;
            margin-right: 12px !important;
            min-width: 20px !important;
            flex-shrink: 0 !important;
        }

        #live-test-screen .tcs-option.selected .tcs-opt-letter {
            color: #1a237e !important;
        }
    `;
    document.head.appendChild(st);
})();

// =========================================================
// ENGINE STATE
// =========================================================
let tcsState = {
    activeTestKey: null,
    testMeta: null,
    rawAllQuestions: [],
    allParsedSections: [],      // Every section found in JSON (Compulsory + All Optionals)
    selectedOptionalByGroup: {}, // e.g. { "A": "sec_212" }
    activeSections: [],         // Only Compulsory + Chosen Optional sections
    questions: [],              // Active questions for the live test (e.g. 80 Qs)
    currentQIdx: 0,
    responses: {},              // idx -> { chosenOption, status, timeSpent }
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

// =========================================================
// SMART RWA SUBJECT & OPTIONAL DETECTOR
// =========================================================
const RWA_KNOWN_SECTION_IDS = {
    "206": "General Awareness",
    "207": "English",
    "208": "General Intelligence and Reasoning",
    "209": "Mathematics",
    "210": "English",
    "211": "Computer Knowledge",
    "212": "English",
    "213": "Hindi",
    "215": "Basic Law/Constitution/General Knowledge",
    "222": "Numerical & Mental Ability Test",
    "234": "Chemistry",
    "223": "Mental Aptitude/Intelligence/Reasoning"
    
};

function stripHtmlText(html) {
    if (!html) return "";
    return String(html)
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanQuestionHtml(rawHtml) {
    if (!rawHtml) return "";
    return String(rawHtml)
        .replace(/font-size:\s*\d+(\.\d+)?(pt|px)/gi, "")
        .replace(/<p>\s*(&nbsp;|\s)*\s*<\/p>/gi, "");
}

function detectSmartSubjectName(secId, questionsList, rawLabel) {
    const cleanRaw = String(rawLabel || "").trim();
    // If JSON already has a real descriptive subject name (not "Section 208" or just digits)
    if (
        cleanRaw &&
        !/^section\s*\d+$/i.test(cleanRaw) &&
        !/^part\s*[a-z0-9]+$/i.test(cleanRaw) &&
        !/^\d+$/.test(cleanRaw) &&
        cleanRaw.toLowerCase() !== "general" &&
        cleanRaw.toLowerCase() !== "uncategorized"
    ) {
        return cleanRaw;
    }

    const idStr = String(secId || "").trim();

    // Combine sample text from questions in this section
    let combinedText = "";
    const sampleCount = Math.min(questionsList.length, 25);
    for (let i = 0; i < sampleCount; i++) {
        const q = questionsList[i];
        combinedText += " " + stripHtmlText(q.question || q.question_text || "") +
                        " " + stripHtmlText(q.option_1 || "") +
                        " " + stripHtmlText(q.option_2 || "") +
                        " " + stripHtmlText(q.option_3 || "") +
                        " " + stripHtmlText(q.option_4 || "");
    }
    const lower = combinedText.toLowerCase();

    // Count Devanagari vs Latin characters
    const devMatches = combinedText.match(/[\u0900-\u097F]/g) || [];
    const latMatches = combinedText.match(/[a-zA-Z]/g) || [];
    const devCount = devMatches.length;
    const latCount = latMatches.length;

    // 1. Check English Language Section
    const engKeywords = [
        "synonym", "antonym", "idiom", "misspelt", "correctly spelt", "grammatical error",
        "passive voice", "active voice", "indirect speech", "direct speech", "one word substitution",
        "underlined segment", "fill in the blank", "appropriate option", "cloze", "comprehension"
    ];
    let engHits = 0;
    engKeywords.forEach(kw => { if (lower.includes(kw)) engHits += 2; });
    if (devCount === 0 && latCount > 150) engHits += 6;
    else if (devCount < latCount * 0.03 && latCount > 200) engHits += 4;
    if (idStr === "212" || idStr === "207" || idStr === "210") engHits += 3;

    // 2. Check Hindi Language Section
    const hindiKeywords = [
        "विलोम", "पर्यायवाची", "मुहावरा", "मुहावरे", "वर्तनी", "वाक्यांश", "संधि", "समास",
        "तत्सम", "तद्भव", "उपसर्ग", "प्रत्यय", "गद्यांश", "रिक्त स्थान", "एकार्थी", "अनेकार्थी",
        "लोकोक्ति", "पारिभाषिक शब्द", "पारिभाषिक", "रेखांकित", "समानार्थी", "शुद्ध वाक्य", "अशुद्ध", "त्रुटि"
    ];
    let hindiHits = 0;
    hindiKeywords.forEach(kw => { if (combinedText.includes(kw)) hindiHits += 2; });
    if (idStr === "213") hindiHits += 5;

    if (engHits >= 5 && engHits > hindiHits) return "English";
    if (hindiHits >= 4 && hindiHits >= engHits) return "Hindi";

    // 3. Score Reasoning, Mathematics, General Awareness, Computer
    const reasoningKeywords = [
        "जिस प्रकार", "उसी प्रकार", "संबंधित है", "श्रृंखला", "कूट भाषा", "कूटबद्ध", "दर्पण", "पासा",
        "कथन", "निष्कर्ष", "असंगत", "विषम", "आकृति", "कागज", "मोड़", "बैठे हैं", "दिशा", "रक्त संबंध",
        "शब्दकोश", "अक्षर-समूह", "प्रश्नवाचक चिन्ह", "(?)", "coding", "syllogism", "mirror", "analogy"
    ];
    const mathKeywords = [
        "प्रतिशत", "अनुपात", "समानुपाती", "औसत", "लाभ", "हानि", "ब्याज", "चक्रवृद्धि", "क्षेत्रफल",
        "आयतन", "त्रिभुज", "वृत्त", "बेलन", "शंकु", "चाल", "दूरी", "पाइप", "छूट", "अंकित मूल्य",
        "क्रय मूल्य", "विक्रय मूल्य", "विभाज्य", "ल.स.", "म.स.", "मूलधन", "समीकरण", "\\frac", "\\sqrt",
        "₹", "cm²", "km/h", "proportional", "interest", "triangle", "radius"
    ];
    const gaKeywords = [
        "संविधान", "अनुच्छेद", "राष्ट्रपति", "प्रधानमंत्री", "संसद", "पंचवर्षीय", "जनगणना", "नदी",
        "राष्ट्रीय उद्यान", "नृत्य", "त्योहार", "पुरस्कार", "इतिहास", "मुगल", "हड़प्पा", "गवर्नर",
        "अर्थव्यवस्था", "rbi", "मुख्यमंत्री", "राज्यपाल", "संशोधन", "मौलिक अधिकार", "मंदिर", "लेखक", "ओलंपिक"
    ];
    const compKeywords = [
        "ms word", "ms excel", "ctrl +", "shortcut key", "कंप्यूटर", "मेमोरी", "सॉफ्टवेयर", "इंटरनेट", "ब्राउज़र", "cpu"
    ];

    let rScore = (idStr === "208") ? 5 : 0;
    let mScore = (idStr === "209") ? 5 : 0;
    let gScore = (idStr === "206") ? 5 : 0;
    let cScore = (idStr === "211") ? 5 : 0;

    reasoningKeywords.forEach(kw => { if (lower.includes(kw)) rScore += 2; });
    mathKeywords.forEach(kw => { if (lower.includes(kw)) mScore += 2; });
    gaKeywords.forEach(kw => { if (lower.includes(kw)) gScore += 2; });
    compKeywords.forEach(kw => { if (lower.includes(kw)) cScore += 2; });

    if (RWA_KNOWN_SECTION_IDS[idStr] && Math.max(rScore, mScore, gScore, cScore) <= 5) {
        return RWA_KNOWN_SECTION_IDS[idStr];
    }

    const maxScore = Math.max(rScore, mScore, gScore, cScore);
    if (maxScore > 0) {
        if (cScore === maxScore && cScore >= 6) return "Computer Knowledge";
        if (rScore === maxScore) return "General Intelligence and Reasoning";
        if (mScore === maxScore) return "Mathematics";
        if (gScore === maxScore) return "General Awareness";
    }

    return RWA_KNOWN_SECTION_IDS[idStr] || `Section ${idStr}`;
}

// =========================================================
// LAUNCH TEST & FETCH QUESTIONS / SECTIONS
// =========================================================
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

    // Show Only Start Screen
    document.getElementById("start-screen").classList.remove("tcs-hidden");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("analysis-screen").classList.add("tcs-hidden");
    document.getElementById("solutions-screen").classList.add("tcs-hidden");
    document.getElementById("full-sol-screen").classList.add("tcs-hidden");

    document.getElementById("tcs-start-title").textContent = t.title || "(TCS Pattern) Mock Test";
    const subContainer = document.getElementById("subjects-selection-container");
    subContainer.innerHTML = `<div style="text-align:center; padding:18px; font-weight:700; color:#475569;">🔄 Loading Test Subjects & Questions...</div>`;

    // 1. Fetch Questions JSON
    let rawQUrl = t.test_questions_url || t.questions_url || "";
    if (rawQUrl) rawQUrl = rawQUrl.replace(/\\\//g, "/");

    let loadedQuestions = [];
    if (rawQUrl) {
        try {
            const res = await fetch(rawQUrl);
            const json = await res.json();
            if (Array.isArray(json)) loadedQuestions = json;
            else if (json.data && Array.isArray(json.data)) loadedQuestions = json.data;
            else if (json.questions && Array.isArray(json.questions)) loadedQuestions = json.questions;
        } catch {
            try {
                const proxyRes = await fetch(WORKER_RAW_PROXY + encodeURIComponent(rawQUrl));
                const proxyJson = await proxyRes.json();
                if (Array.isArray(proxyJson)) loadedQuestions = proxyJson;
                else if (proxyJson.data && Array.isArray(proxyJson.data)) loadedQuestions = proxyJson.data;
            } catch {}
        }
    }

    // 2. Also check if testMeta has a sections metadata URL
    let externalSecMap = {};
    let rawSecUrl = t.test_sections_url || t.test_section_url || t.section_url || "";
    if (rawSecUrl) {
        rawSecUrl = rawSecUrl.replace(/\\\//g, "/");
        try {
            const sRes = await fetch(rawSecUrl);
            const sJson = await sRes.json();
            const sArr = Array.isArray(sJson) ? sJson : (sJson.data || []);
            sArr.forEach(s => {
                const sid = String(s.id || s.section_id || s.part_id || "");
                if (sid) {
                    externalSecMap[sid] = {
                        name: s.title || s.section_title || s.name || s.part_title || "",
                        isOptional: String(s.is_optional || s.optional || "0") === "1",
                        optGroup: s.optional_group || "A"
                    };
                }
            });
        } catch {}
    }

    if (!loadedQuestions || loadedQuestions.length === 0) {
        loadedQuestions = DB.fallbackCbtQuestions;
    }

    tcsState.rawAllQuestions = loadedQuestions;

    // 3. Build Sections, Detect Real Subject Names & Optional Groups
    prepareAllSectionsAndRenderStart(externalSecMap);
};

function prepareAllSectionsAndRenderStart(externalSecMap) {
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
    const usedNamesCount = {};

    groupMap.forEach((secObj, secId) => {
        const ext = externalSecMap[secId] || {};
        const detectedName = detectSmartSubjectName(
            secId,
            secObj.questions,
            ext.name || secObj.rawLabel
        );

        let finalName = detectedName;
        if (usedNamesCount[finalName]) {
            usedNamesCount[finalName]++;
        } else {
            usedNamesCount[finalName] = 1;
        }

        const isLangSubject = (
            finalName === "English" ||
            finalName === "Hindi" ||
            finalName === "Marathi" ||
            finalName === "Bengali"
        );

        parsedSections.push({
            secId: secId,
            name: finalName,
            questions: secObj.questions,
            isExplicitOptional: Boolean(ext.isOptional || secObj.isExplicitOptional),
            isLangSubject: isLangSubject,
            isOptional: false,
            optGroup: ext.optGroup || "A"
        });
    });

    // Determine if Optional Subject Selection should be enabled
    // Case A: Explicitly marked optional in JSON
    // Case B: Test has BOTH English and Hindi (or multiple language sections) AND either show_sectionselector=="1" or 5+ sections or marks indicate 1 optional section
    const langSections = parsedSections.filter(s => s.isLangSubject);
    const firstQPosMarks = parseFloat((tcsState.rawAllQuestions[0] && tcsState.rawAllQuestions[0].positive_marks) || 2) || 2;
    const expectedActiveQs = t.marks ? Math.round(parseFloat(t.marks) / firstQPosMarks) : 0;

    const shouldEnableLangOptional = (
        langSections.length >= 2 &&
        (
            String(t.show_sectionselector) === "1" ||
            parsedSections.length >= 5 ||
            (expectedActiveQs > 0 && expectedActiveQs < tcsState.rawAllQuestions.length)
        )
    );

    parsedSections.forEach(sec => {
        if (sec.isExplicitOptional || (shouldEnableLangOptional && sec.isLangSubject)) {
            sec.isOptional = true;
            sec.optGroup = "A";
        }
    });

    // Sort compulsory sections in clean TCS order (General Awareness, General Intelligence and Reasoning, Mathematics)
    const fixedOrderPriority = {
        "General Awareness": 1,
        "General Intelligence and Reasoning": 2,
        "Mathematics": 3
    };
    const optionalOrderPriority = {
        "English": 1,
        "Hindi": 2
    };

    const fixedSecs = parsedSections
        .filter(s => !s.isOptional)
        .sort((a, b) => (fixedOrderPriority[a.name] || 99) - (fixedOrderPriority[b.name] || 99));

    const optionalSecs = parsedSections
        .filter(s => s.isOptional)
        .sort((a, b) => (optionalOrderPriority[a.name] || 99) - (optionalOrderPriority[b.name] || 99));

    tcsState.allParsedSections = [...fixedSecs, ...optionalSecs];

    // Default select first optional subject (e.g. English) in Group A
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
                <div class="tcs-sub-left">
                    <span style="font-size:16px;">✅</span>
                    <span>${sec.name}</span>
                </div>
                <span class="tcs-sub-pill">${sec.questions.length} Qs</span>
            </div>`;
    });

    if (optionalSecs.length > 0) {
        const chosenSecId = tcsState.selectedOptionalByGroup["A"];
        html += `<div class="tcs-opt-heading">📝 Select Any One Optional Subject (A):</div>`;
        optionalSecs.forEach(sec => {
            const isSel = String(sec.secId) === String(chosenSecId);
            html += `
                <div class="tcs-sub-row opt-sub ${isSel ? "selected" : ""}" onclick="selectOptionalSubject('A', '${sec.secId}')">
                    <div class="tcs-sub-left">
                        ${isSel ? `<span style="color:#2e7d32; font-weight:900; font-size:16px;">✓</span>` : ""}
                        <span>${sec.name}</span>
                    </div>
                    <span class="tcs-sub-pill">${sec.questions.length} Qs</span>
                </div>`;
        });
    }

    container.innerHTML = html;

    // Calculate Active Questions, Time & Marks dynamically (e.g. 80 Qs, 60 mins, 160 Marks)
    const activeSecs = getActiveChosenSections();
    let totalActiveQs = 0;
    let totalActiveMarks = 0;

    activeSecs.forEach(sec => {
        totalActiveQs += sec.questions.length;
        sec.questions.forEach(q => {
            totalActiveMarks += parseFloat(q.positive_marks || 2.0);
        });
    });

    if (t.marks && !isNaN(parseFloat(t.marks)) && optionalSecs.length > 0) {
        totalActiveMarks = parseFloat(t.marks);
    }

    const rawTimeStr = String(t.time || "60").trim();
    let totalMins = 60;
    if (rawTimeStr.includes("+")) {
        totalMins = rawTimeStr.split("+").reduce((acc, v) => acc + (parseInt(v.trim()) || 0), 0);
    } else {
        totalMins = parseInt(rawTimeStr) || 60;
    }

    const statsBox = document.querySelector("#start-screen .stats-box");
    if (statsBox) {
        statsBox.innerHTML = `
            <div class="start-info"><span>Total Questions:</span> <span id="stat-qs">${totalActiveQs}</span></div>
            <div class="start-info"><span>Total Time:</span> <span id="stat-time">${totalMins} mins</span></div>
            <div class="start-info"><span>Maximum Marks:</span> <span id="stat-marks">${Math.round(totalActiveMarks)}</span></div>
        `;
    }

    const startBtn = document.getElementById("tcs-start-btn");
    if (startBtn) startBtn.textContent = "Start Test";
}

window.selectOptionalSubject = function(groupKey, secId) {
    tcsState.selectedOptionalByGroup[groupKey] = String(secId);
    renderStartScreenUI();
};

function getActiveChosenSections() {
    const chosenOptId = tcsState.selectedOptionalByGroup["A"];
    return tcsState.allParsedSections.filter(sec => {
        if (!sec.isOptional) return true;
        return String(sec.secId) === String(chosenOptId);
    });
}

// =========================================================
// STEP 2: START LIVE CBT TEST
// =========================================================
window.startTest = function() {
    const t = tcsState.testMeta || {};
    const chosenSecs = getActiveChosenSections();

    // Build flat active questions array (1..80) and section mappings
    const flatQuestions = [];
    tcsState.activeSections = chosenSecs.map(sec => {
        const mappedQs = sec.questions.map(q => {
            const newGlobalIdx = flatQuestions.length;
            const qCopy = { ...q, originalIndex: newGlobalIdx, _sectionName: sec.name };
            flatQuestions.push(qCopy);
            return qCopy;
        });
        return {
            secId: sec.secId,
            name: sec.name,
            questions: mappedQs
        };
    });

    tcsState.questions = flatQuestions;
    tcsState.responses = {};
    tcsState.currentQIdx = 0;
    tcsState.activeSectionIndex = 0;

    // Setup Timing (Overall or Sectional like 15+15+15+15)
    const tStr = String(t.time || "60").trim();
    if (tStr.includes("+")) {
        const parts = tStr.split("+").map(n => (parseInt(n.trim()) || 15) * 60);
        tcsState.isSectionalTiming = true;
        tcsState.sectionTimeAllocated = tcsState.activeSections.map((_, i) => parts[i] || parts[0] || 900);
        tcsState.sectionSecondsLeft = [...tcsState.sectionTimeAllocated];
        tcsState.secondsLeft = tcsState.sectionSecondsLeft[0];
    } else {
        const totalMins = parseInt(tStr) || 60;
        tcsState.isSectionalTiming = false;
        tcsState.secondsLeft = totalMins * 60;
    }

    document.getElementById("start-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.remove("tcs-hidden");

    const fSecInfo = document.getElementById("tcs-footer-sec-info");
    if (fSecInfo) fSecInfo.textContent = "";

    renderTcsTabs();
    loadQuestion(0);
    startTcsTimer();
};

function formatMMSS(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
}

function formatHHMMSS(sec) {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const secs = String(sec % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
}

function startTcsTimer() {
    if (tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    tcsState.timerInterval = setInterval(() => {
        if (tcsState.isSubmitted) return;

        // 1. Increment Per-Question Time Spent (00:04 in Screenshot 5)
        const curIdx = tcsState.currentQIdx;
        if (!tcsState.responses[curIdx]) {
            tcsState.responses[curIdx] = { status: "unattempted", chosenOption: null, timeSpent: 0 };
        }
        tcsState.responses[curIdx].timeSpent = (tcsState.responses[curIdx].timeSpent || 0) + 1;

        const qTimeEl = document.getElementById("tcs-q-time");
        if (qTimeEl) {
            qTimeEl.textContent = formatMMSS(tcsState.responses[curIdx].timeSpent);
        }

        // 2. Decrement Main / Sectional Countdown Timer
        if (tcsState.secondsLeft <= 0) {
            if (tcsState.isSectionalTiming && tcsState.activeSectionIndex < tcsState.activeSections.length - 1) {
                // Auto move to next section when sectional timer expires
                tcsState.activeSectionIndex++;
                tcsState.secondsLeft = tcsState.sectionSecondsLeft[tcsState.activeSectionIndex];
                renderTcsTabs();
                const firstQ = tcsState.activeSections[tcsState.activeSectionIndex].questions[0];
                if (firstQ) loadQuestion(firstQ.originalIndex);
                return;
            }
            clearInterval(tcsState.timerInterval);
            submitTest();
            return;
        }

        tcsState.secondsLeft--;
        if (tcsState.isSectionalTiming) {
            tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft;
        }

        const timerEl = document.getElementById("tcs-timer-display");
        if (timerEl) timerEl.textContent = formatHHMMSS(tcsState.secondsLeft);
    }, 1000);
}

function renderTcsTabs() {
    const wrap = document.getElementById("tcs-tabs-container");
    if (!wrap) return;
    wrap.innerHTML = "";

    tcsState.activeSections.forEach((sec, idx) => {
        const isActive = idx === tcsState.activeSectionIndex;
        const cls = isActive ? "tcs-tab active" : "tcs-tab";
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
    const firstQInSec = tcsState.activeSections[secIdx].questions[0];
    if (firstQInSec) {
        loadQuestion(firstQInSec.originalIndex);
    }
};

function loadQuestion(globalIdx) {
    tcsState.currentQIdx = globalIdx;
    const q = tcsState.questions[globalIdx];
    if (!q) return;

    // Ensure response entry exists for per-question timer
    if (!tcsState.responses[globalIdx]) {
        tcsState.responses[globalIdx] = { status: "unattempted", chosenOption: null, timeSpent: 0 };
    }

    // Sync active section tab
    let foundSecIdx = tcsState.activeSectionIndex;
    tcsState.activeSections.forEach((sec, sIdx) => {
        if (sec.questions.some(sq => sq.originalIndex === globalIdx)) {
            foundSecIdx = sIdx;
        }
    });
    if (foundSecIdx !== tcsState.activeSectionIndex) {
        if (tcsState.isSectionalTiming) {
            tcsState.sectionSecondsLeft[tcsState.activeSectionIndex] = tcsState.secondsLeft;
            tcsState.secondsLeft = tcsState.sectionSecondsLeft[foundSecIdx];
        }
        tcsState.activeSectionIndex = foundSecIdx;
    }
    renderTcsTabs();

    // Update Question Number & Per-Question Timer (Screenshot 5 match)
    document.getElementById("tcs-q-num").textContent = globalIdx + 1;
    const qTimeEl = document.getElementById("tcs-q-time");
    if (qTimeEl) {
        qTimeEl.textContent = formatMMSS(tcsState.responses[globalIdx].timeSpent || 0);
    }

    // Format positive/negative marks cleanly (+2, -0.25)
    const posNum = parseFloat(q.positive_marks || 2);
    const negNum = parseFloat(q.negative_marks || 0.25);
    document.getElementById("tcs-live-pos").textContent = `+${Number.isInteger(posNum) ? posNum : posNum.toFixed(2)}`;
    document.getElementById("tcs-live-neg").textContent = `-${Number.isInteger(negNum) ? negNum : negNum}`;

    // Question Text
    const qTxtBox = document.getElementById("tcs-q-text");
    const rawQHtml = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi))
        ? (q.question_hi || q.question_hindi)
        : (q.question || q.question_text || "");
    qTxtBox.innerHTML = cleanQuestionHtml(rawQHtml);

    // Options with A., B., C., D. labels (Screenshot 5 match)
    const optBox = document.getElementById("tcs-options-container");
    optBox.innerHTML = "";

    const resp = tcsState.responses[globalIdx] || {};
    const chosen = resp.chosenOption;
    const letters = ["A", "B", "C", "D", "E"];

    const opts = [
        { id: "1", text: q.option_1 || q.opt1 },
        { id: "2", text: q.option_2 || q.opt2 },
        { id: "3", text: q.option_3 || q.opt3 },
        { id: "4", text: q.option_4 || q.opt4 },
        q.option_5 ? { id: "5", text: q.option_5 } : null
    ].filter(Boolean);

    opts.forEach((opt, oIdx) => {
        const isSel = String(chosen) === String(opt.id);
        const selClass = isSel ? "tcs-option selected" : "tcs-option";
        const letter = letters[oIdx] || opt.id;
        optBox.innerHTML += `
            <div class="${selClass}" onclick="selectTcsOption('${opt.id}')">
                <span class="tcs-opt-letter">${letter}.</span>
                <div style="flex: 1; word-break: break-word;">${cleanQuestionHtml(opt.text || "")}</div>
            </div>`;
    });

    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([qTxtBox, optBox]).catch(() => {});
    }
}

window.selectTcsOption = function(optId) {
    const idx = tcsState.currentQIdx;
    const prevTime = (tcsState.responses[idx] && tcsState.responses[idx].timeSpent) || 0;
    tcsState.responses[idx] = {
        status: "attempted",
        chosenOption: optId,
        timeSpent: prevTime
    };
    loadQuestion(idx);
};

window.saveAndNext = function() {
    const idx = tcsState.currentQIdx;
    const cur = tcsState.responses[idx] || { timeSpent: 0 };
    if (cur.chosenOption) {
        cur.status = "attempted";
    } else {
        cur.status = "unattempted";
    }
    tcsState.responses[idx] = cur;
    nextQuestion();
};

window.markForReview = function() {
    const idx = tcsState.currentQIdx;
    const cur = tcsState.responses[idx] || { timeSpent: 0 };
    const hasAns = Boolean(cur.chosenOption);
    tcsState.responses[idx] = {
        ...cur,
        status: hasAns ? "marked_attempted" : "marked"
    };
    nextQuestion();
};

window.clearResponse = function() {
    const idx = tcsState.currentQIdx;
    const prevTime = (tcsState.responses[idx] && tcsState.responses[idx].timeSpent) || 0;
    tcsState.responses[idx] = { status: "unattempted", chosenOption: null, timeSpent: prevTime };
    loadQuestion(idx);
};

window.nextQuestion = function() {
    if (tcsState.currentQIdx < tcsState.questions.length - 1) {
        loadQuestion(tcsState.currentQIdx + 1);
    }
};

window.prevQuestion = function() {
    if (tcsState.currentQIdx > 0) {
        loadQuestion(tcsState.currentQIdx - 1);
    }
};

window.toggleTcsLangMode = function() {
    tcsState.lang = tcsState.lang === "en" ? "hi" : "en";
    if (!document.getElementById("live-test-screen").classList.contains("tcs-hidden")) {
        loadQuestion(tcsState.currentQIdx);
    } else if (!document.getElementById("solutions-screen").classList.contains("tcs-hidden")) {
        renderSolutionsList(tcsState.activeSolFilter);
    } else if (!document.getElementById("full-sol-screen").classList.contains("tcs-hidden")) {
        renderFullSolutionContent(tcsState.activeFullSolIdx);
    }
};

window.toggleTcsFullScreen = function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
};

// =========================================================
// QUESTION PALETTE DRAWER
// =========================================================
window.toggleTcsPalette = function() {
    const palette = document.getElementById("tcs-palette");
    palette.classList.toggle("show");
    if (palette.classList.contains("show")) {
        renderTcsAccordionGrid();
    }
};

function renderTcsAccordionGrid() {
    const cont = document.getElementById("tcs-accordion-container");
    cont.innerHTML = "";

    tcsState.activeSections.forEach((sec, sIdx) => {
        let att = 0, una = 0, mar = 0;
        sec.questions.forEach(sq => {
            const r = tcsState.responses[sq.originalIndex];
            if (r && (r.status === "attempted" || r.status === "marked_attempted")) att++;
            else if (r && r.status === "marked") mar++;
            else una++;
        });

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

        cont.innerHTML += `
            <div class="tcs-accordion">
                <div class="tcs-acc-header" onclick="toggleGridSec(${sIdx})">
                    <span>${sec.name}</span>
                    <span>▼</span>
                </div>
                <div class="tcs-acc-stats">
                    <span>Attempted: ${att}</span>
                    <span>Marked: ${mar}</span>
                    <span>Unattempted: ${una}</span>
                </div>
                ${gridHtml}
            </div>`;
    });
}

window.toggleGridSec = function(sIdx) {
    const g = document.getElementById(`grid_sec_${sIdx}`);
    if (g) g.classList.toggle("open");
};

window.jumpToQuestion = function(globalIdx) {
    toggleTcsPalette();
    loadQuestion(globalIdx);
};

// =========================================================
// STEP 3: SUBMIT SUMMARY SCREEN
// =========================================================
window.handleDynamicSubmit = function() {
    prepareSubmit();
};

window.prepareSubmit = function() {
    document.getElementById("tcs-palette").classList.remove("show");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("submit-screen").classList.remove("tcs-hidden");

    const cont = document.getElementById("submit-summary-container");
    let cardsHtml = "";

    tcsState.activeSections.forEach(sec => {
        let att = 0, una = 0, mar = 0;
        sec.questions.forEach(sq => {
            const r = tcsState.responses[sq.originalIndex];
            if (r && (r.status === "attempted" || r.status === "marked_attempted")) att++;
            else if (r && r.status === "marked") mar++;
            else una++;
        });

        cardsHtml += `
            <div class="section-summary-card">
                <h3 style="font-weight:800; color:#1a237e; margin-bottom:10px;">${sec.name}</h3>
                <div class="stat-row"><span>Total Questions:</span> <strong>${sec.questions.length}</strong></div>
                <div class="stat-row"><span>Attempted:</span> <strong style="color:#2563eb;">${att}</strong></div>
                <div class="stat-row"><span>Marked for Review:</span> <strong style="color:#d97706;">${mar}</strong></div>
                <div class="stat-row"><span>Unattempted:</span> <strong style="color:#64748b;">${una}</strong></div>
            </div>`;
    });

    cont.innerHTML = cardsHtml;
};

window.closeSubmit = function() {
    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.remove("tcs-hidden");
};

// =========================================================
// STEP 4: RESULT & DEEP ANALYSIS SCREEN
// =========================================================
window.submitTest = function() {
    if (tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    tcsState.isSubmitted = true;

    document.getElementById("submit-screen").classList.add("tcs-hidden");
    document.getElementById("live-test-screen").classList.add("tcs-hidden");
    document.getElementById("analysis-screen").classList.remove("tcs-hidden");

    let correct = 0, incorrect = 0, unattempted = 0, score = 0;
    let timeCorr = 0, timeInc = 0, timeUna = 0;
    let maxMarks = 0;

    tcsState.questions.forEach((q, i) => {
        const pos = parseFloat(q.positive_marks || 2.0);
        const neg = parseFloat(q.negative_marks || 0.25);
        maxMarks += pos;

        const r = tcsState.responses[i] || {};
        const spent = r.timeSpent || 0;
        const correctAns = String(q.answer || q.correct_option || "1").trim();

        if (!r.chosenOption) {
            unattempted++;
            timeUna += spent;
        } else if (String(r.chosenOption) === correctAns) {
            correct++;
            score += pos;
            timeCorr += spent;
        } else {
            incorrect++;
            score -= neg;
            timeInc += spent;
        }
    });

    score = parseFloat(score.toFixed(2));
    maxMarks = Math.round(maxMarks);
    const accuracy = (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

    document.getElementById("res-score").textContent = `${score}/${maxMarks}`;
    document.getElementById("res-correct").textContent = correct;
    document.getElementById("res-incorrect").textContent = incorrect;
    document.getElementById("res-unatt").textContent = unattempted;
    document.getElementById("res-acc").textContent = `${accuracy}%`;
    document.getElementById("res-rank").textContent = score >= maxMarks * 0.75 ? "#12" : "#148";
    document.getElementById("res-perc").textContent = `${Math.min(99.8, Math.max(15, (score / (maxMarks || 1)) * 100 + 12)).toFixed(1)}%`;

    // Comparison Table
    document.getElementById("cmp-score").textContent = score;
    document.getElementById("cmp-top").textContent = (maxMarks * 0.88).toFixed(1);
    document.getElementById("cmp-avg").textContent = (maxMarks * 0.48).toFixed(1);
    document.getElementById("cmp-acc").textContent = `${accuracy}%`;
    document.getElementById("cmp-c").textContent = correct;
    document.getElementById("cmp-top-c").textContent = Math.round(tcsState.questions.length * 0.9);
    document.getElementById("cmp-avg-c").textContent = Math.round(tcsState.questions.length * 0.52);
    document.getElementById("cmp-w").textContent = incorrect;
    document.getElementById("cmp-top-w").textContent = Math.round(tcsState.questions.length * 0.04);
    document.getElementById("cmp-avg-w").textContent = Math.round(tcsState.questions.length * 0.18);

    // Donut Chart
    const totalQ = tcsState.questions.length || 1;
    const cDeg = (correct / totalQ) * 360;
    const wDeg = cDeg + (incorrect / totalQ) * 360;
    const donut = document.getElementById("res-donut");
    if (donut) {
        donut.style.background = `conic-gradient(#4caf50 0deg ${cDeg}deg, #e53935 ${cDeg}deg ${wDeg}deg, #5c6bc0 ${wDeg}deg 360deg)`;
    }

    // Time Stats Box
    document.getElementById("ts-box-corr").innerHTML = `Correct<br>${formatMMSS(timeCorr)}`;
    document.getElementById("ts-box-una").innerHTML = `Unattempted: ${formatMMSS(timeUna)}`;
    document.getElementById("ts-box-inc").innerHTML = `Incorrect<br>${formatMMSS(timeInc)}`;

    // Remark Banner
    const rem = document.getElementById("dynamic-remark");
    if (rem) {
        rem.style.display = "block";
        if (accuracy >= 80 && correct > 0) {
            rem.className = "remark-banner rem-excellent";
            rem.textContent = "🎉 Excellent Performance! Keep it up!";
        } else if (accuracy >= 50 && correct > 0) {
            rem.className = "remark-banner rem-great";
            rem.textContent = "👍 Good Attempt! Practice more to reach the top.";
        } else {
            rem.className = "remark-banner rem-poor";
            rem.textContent = "⚠️ Needs Improvement! Review full solutions carefully.";
        }
    }

    // Section-wise Analysis Cards
    const sCont = document.getElementById("analysis-sections-container");
    sCont.innerHTML = "";
    tcsState.activeSections.forEach(sec => {
        let sCorr = 0, sInc = 0, sUna = 0, sScore = 0;
        let stCorr = 0, stInc = 0, stUna = 0;

        sec.questions.forEach(sq => {
            const r = tcsState.responses[sq.originalIndex] || {};
            const ans = String(sq.answer || sq.correct_option || "1").trim();
            const pos = parseFloat(sq.positive_marks || 2.0);
            const neg = parseFloat(sq.negative_marks || 0.25);
            const sp = r.timeSpent || 0;

            if (!r.chosenOption) {
                sUna++;
                stUna += sp;
            } else if (String(r.chosenOption) === ans) {
                sCorr++;
                sScore += pos;
                stCorr += sp;
            } else {
                sInc++;
                sScore -= neg;
                stInc += sp;
            }
        });

        sCont.innerHTML += `
            <div class="a-card">
                <div class="subj-header">
                    <div class="subj-name">${sec.name}</div>
                    <div class="black-circle"><span>Score</span><span>${sScore.toFixed(1)}</span></div>
                </div>
                <div class="subj-q-stats">Total Questions: ${sec.questions.length}</div>
                <div class="time-split">
                    <div class="col"><div class="c-green">Correct</div><div class="val-num">${sCorr}</div><div class="val-time">${formatMMSS(stCorr)}</div></div>
                    <div class="col"><div class="c-red">Incorrect</div><div class="val-num">${sInc}</div><div class="val-time">${formatMMSS(stInc)}</div></div>
                    <div class="col"><div class="c-grey">Unattempted</div><div class="val-num">${sUna}</div><div class="val-time">${formatMMSS(stUna)}</div></div>
                </div>
            </div>`;
    });
};

window.reAttemptTcsTest = function() {
    window.launchTcsCbtEngine(tcsState.activeTestKey);
};

window.exitTcsTest = function() {
    if (tcsState.timerInterval) clearInterval(tcsState.timerInterval);
    showSlide("slideExplorer");
};

// =========================================================
// STEP 5: SOLUTIONS LIST SCREEN
// =========================================================
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

window.filterSol = function(filterType, btnEl) {
    document.querySelectorAll(".flt-btn").forEach(b => b.classList.remove("flt-active"));
    if (btnEl) btnEl.classList.add("flt-active");
    tcsState.activeSolFilter = filterType;
    renderSolutionsList(filterType);
};

function renderSolutionsList(filter) {
    const cont = document.getElementById("sol-list-container");
    cont.innerHTML = "";

    tcsState.questions.forEach((q, idx) => {
        const r = tcsState.responses[idx];
        const correctAns = String(q.answer || q.correct_option || "1").trim();
        const hasChosen = r && r.chosenOption;
        const isCorr = hasChosen && String(r.chosenOption) === correctAns;
        const isInc = hasChosen && !isCorr;
        const isUna = !hasChosen;

        if (filter === "correct" && !isCorr) return;
        if (filter === "incorrect" && !isInc) return;
        if (filter === "unattempted" && !isUna) return;

        let badgeClass = "st-una", iconHtml = "−";
        if (isCorr) { badgeClass = "st-corr"; iconHtml = "✓"; }
        else if (isInc) { badgeClass = "st-wr"; iconHtml = "✕"; }

        const qText = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi))
            ? (q.question_hi || q.question_hindi)
            : (q.question || q.question_text || "");

        cont.innerHTML += `
            <div class="sol-item" onclick="openFullSolution(${idx})" style="cursor:pointer;">
                <div class="sol-num-col">
                    <div class="sol-num">${idx + 1}
                        <div class="sol-status-icon ${badgeClass}">${iconHtml}</div>
                    </div>
                    <div class="sol-line"></div>
                </div>
                <div class="sol-card">
                    <span class="sol-sec-badge">${q._sectionName || "General"}</span>
                    <div class="sol-q-txt">${cleanQuestionHtml(qText)}</div>
                    <div style="font-size:12px; font-weight:800; color:#1a237e;">View Full Solution ➔</div>
                </div>
            </div>`;
    });

    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([cont]).catch(() => {});
    }
}

// =========================================================
// STEP 6: FULL SOLUTION SCREEN
// =========================================================
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
    const correctAns = String(q.answer || q.correct_option || "1").trim();

    document.getElementById("fs-q-num").textContent = `Question ${idx + 1} (${q._sectionName || ""})`;
    const tcBox = document.getElementById("fs-q-time-compare");
    if (tcBox) {
        tcBox.innerHTML = `<span class="time-compare-badge"><span class="tc-you">⏱️ You: ${formatMMSS(r.timeSpent || 0)}</span></span>`;
    }

    const qTxt = (tcsState.lang === "hi" && (q.question_hi || q.question_hindi))
        ? (q.question_hi || q.question_hindi)
        : (q.question || q.question_text || "");
    document.getElementById("fs-q-txt").innerHTML = cleanQuestionHtml(qTxt);

    const optBox = document.getElementById("fs-options-container");
    optBox.innerHTML = "";
    const letters = ["A", "B", "C", "D", "E"];

    const opts = [
        { id: "1", text: q.option_1 || q.opt1 },
        { id: "2", text: q.option_2 || q.opt2 },
        { id: "3", text: q.option_3 || q.opt3 },
        { id: "4", text: q.option_4 || q.opt4 },
        q.option_5 ? { id: "5", text: q.option_5 } : null
    ].filter(Boolean);

    opts.forEach((opt, oIdx) => {
        const isCorrectOpt = String(opt.id) === correctAns;
        const isUserChosen = r.chosenOption && String(r.chosenOption) === String(opt.id);

        let cls = "fs-opt";
        if (isCorrectOpt) cls = "fs-opt correct";
        else if (isUserChosen && !isCorrectOpt) cls = "fs-opt wrong";

        optBox.innerHTML += `
            <div class="${cls}">
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <strong style="color:#1a237e;">${letters[oIdx] || opt.id}.</strong>
                    <div>${cleanQuestionHtml(opt.text || "")}</div>
                </div>
                ${isCorrectOpt ? `<span class="fs-opt-perc">✓ Correct</span>` : ""}
                ${isUserChosen && !isCorrectOpt ? `<span style="font-size:11px;font-weight:800;color:#c62828;">✗ Your Ans</span>` : ""}
            </div>`;
    });

    const expText = (tcsState.lang === "hi" && (q.explanation_hi || q.solution_hi))
        ? (q.explanation_hi || q.solution_hi)
        : (q.solution_text || q.explanation || q.solution || "Detailed solution above.");
    document.getElementById("fs-exp-text").innerHTML = cleanQuestionHtml(expText);

    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([document.getElementById("full-sol-screen")]).catch(() => {});
    }
}

window.closeFullSol = function() {
    document.getElementById("full-sol-screen").classList.add("tcs-hidden");
    document.getElementById("solutions-screen").classList.remove("tcs-hidden");
};

window.nextFullSol = function() {
    if (tcsState.activeFullSolIdx < tcsState.questions.length - 1) {
        tcsState.activeFullSolIdx++;
        renderFullSolutionContent(tcsState.activeFullSolIdx);
    }
};

window.prevFullSol = function() {
    if (tcsState.activeFullSolIdx > 0) {
        tcsState.activeFullSolIdx--;
        renderFullSolutionContent(tcsState.activeFullSolIdx);
    }
};
