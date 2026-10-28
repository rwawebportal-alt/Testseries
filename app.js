// =========================================================
// PAID TEST SERIES ONLY - MINI APP (app.js)
// =========================================================

const WORKER_RAW_PROXY = "https://proplayer.allswbatch22.workers.dev/proxy?url=";

// 1. DYNAMIC API & TOKEN INJECTION (NEW FEATURE)
let API_BASE = localStorage.getItem("custom_api_domain") || "https://rozgarapinew.teachx.in";
let USER_TOKEN = localStorage.getItem("custom_user_token") || "";

window.changeDomainAndToken = function() {
    const newDomain = prompt("Naya API Domain URL dalein (e.g. https://api.newdomain.com):", API_BASE);
    if (newDomain) {
        localStorage.setItem("custom_api_domain", newDomain);
        API_BASE = newDomain;
        
        const newToken = prompt("Agar API ke liye Auth Token chahiye, toh yahan dalein (Optional):", USER_TOKEN);
        if (newToken !== null) {
            localStorage.setItem("custom_user_token", newToken);
            USER_TOKEN = newToken;
        }
        alert("✅ Naya Domain set ho gaya hai! Test Series reload ho rahi hai...");
        openTestSeriesExplorer('paid_ts');
    }
};

// 2. FALLBACK DATABASE (Only Paid Test Series kept)
const DB = {
    paidTestSeries: [
        { id: "708", title: "SSC GD Test Series 2026", logo: "https://appx-content-v2.classx.co.in/subject/2026-07-08-0_5839850466807497.png" },
        { id: "776", title: "MP Police Constable 2026", logo: "https://appx-content-v2.classx.co.in/subject/2026-09-18-0_25895258012558897.jpeg" }
    ],
    tsSubjects: {
        "708": [{ subjectid: "-1", subject_name: "Uncategorized", subject_logo: "" }]
    },
    tsTitles: {
        "708_-1": [
            { id: "41288", title: "SSC GD Test 01", test_series_id: "708", free_flag: "0", time: "60", questions: "100", marks: "160" }
        ]
    }
};

let state = {
    currentSlide: "slideExplorer",
    previousSlide: "slideExplorer",
    activeSeriesId: null,
    activeSeriesTitle: "",
    activeTsSubId: null,
    activeTsSubName: "",
    testMap: {}
};

// Remove Login Check (Always returns true now)
function enforceCompulsoryLogin() { return true; }

function showSlide(slideId) {
    state.previousSlide = state.currentSlide;
    state.currentSlide = slideId;
    ["slideExplorer", "slideTestAttempt", "slidePdf"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === slideId) {
                el.classList.remove("hidden-slide");
                el.classList.add("active-slide");
            } else {
                el.classList.remove("active-slide");
                el.classList.add("hidden-slide");
            }
        }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.goHomeHub = function() {
    openTestSeriesExplorer('paid_ts');
};

window.handleGlobalBack = function() {
    if (state.currentSlide === "slidePdf") {
        closePdfSlide();
        return;
    }
    if (state.currentSlide === "slideTestAttempt") {
        if (typeof exitCbtTest === 'function') exitCbtTest();
        else showSlide("slideExplorer");
        return;
    }
    if (state.currentSlide === "slideExplorer") {
        if (state.view === "ts_tests" && state.activeTsSubId !== "-1") {
            openTestSeriesSubjects(state.activeSeriesId, state.activeSeriesTitle);
            return;
        }
        openTestSeriesExplorer('paid_ts');
    }
};

// 3. CORE API FETCH LOGIC (Using Dynamic API_BASE and TOKEN)
async function fetchAPI(endpoint, fallbackGetter) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                "Client-Service": "Appx",
                "Auth-Key": "appxapi",
                "source": "website",
                "Authorization": USER_TOKEN
            }
        });
        const json = await res.json();
        if (json && json.data && (Array.isArray(json.data) ? json.data.length > 0 : Object.keys(json.data).length > 0)) {
            return json.data;
        }
        if (json && json.test_titles && Array.isArray(json.test_titles) && json.test_titles.length > 0) {
            return json.test_titles;
        }
    } catch (e) {
        console.warn("API Fetch Failed from", API_BASE, e);
    }
    return fallbackGetter ? fallbackGetter() : [];
}

// 4. TEST SERIES EXPLORER (Only Paid)
window.openTestSeriesExplorer = async function(mode) {
    state.tsMode = "paid_ts";
    state.view = "ts_list";
    showSlide("slideExplorer");

    const grid = document.getElementById("mainGrid");
    if(grid) grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-slate-800">🔄 Loading Test Series from ${API_BASE}...</div>`;

    const [p0, p10] = await Promise.all([
        fetchAPI(`/get/test_series?start=0`, () => []),
        fetchAPI(`/get/test_series?start=10`, () => [])
    ]);

    let combined = [...(Array.isArray(p0) ? p0 : []), ...(Array.isArray(p10) ? p10 : []), ...(DB.paidTestSeries || [])];
    const seen = new Set();
    
    if(grid) {
        grid.innerHTML = `
        <div onclick="changeDomainAndToken()" class="grid-card overflow-hidden cursor-pointer flex flex-col justify-between" style="border-color: #059669; background: #ecfdf5;">
            <div class="p-4 text-center">
                <h3 class="font-black text-lg text-emerald-700 mt-2">⚙️ Add New Domain</h3>
                <p class="text-xs font-bold text-slate-600 mt-1 truncate" style="max-width: 100%;">Current: ${API_BASE}</p>
            </div>
            <div class="px-4 pb-4">
                <div class="btn-watch w-full text-center text-xs" style="background: #059669;">Change API URL ➔</div>
            </div>
        </div>`;
    }

    combined.forEach(ts => {
        if (!ts || !ts.id || seen.has(String(ts.id))) return;
        seen.add(String(ts.id));
        const title = (ts.title || "Paid Test Series").replace(/'/g, "");
        const logo = (ts.logo || "https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series").replace(/\\//g, "/");
        if(grid) grid.innerHTML += `
            <div onclick="openTestSeriesSubjects('${ts.id}', '${title}')" class="grid-card overflow-hidden cursor-pointer flex flex-col justify-between">
                <div>
                    <img src="${logo}" onerror="this.src='https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series'" class="w-full h-44 object-cover">
                    <div class="p-4">
                        <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">SERIES #${ts.id}</span>
                        <h3 class="font-black text-base text-slate-900 mt-2">${ts.title}</h3>
                    </div>
                </div>
                <div class="px-4 pb-4">
                    <div class="btn-watch w-full text-center text-xs">Open Test Subjects ➔</div>
                </div>
            </div>`;
    });
};

window.openTestSeriesSubjects = async function(tsId, tsTitle) {
    state.activeSeriesId = tsId;
    state.activeSeriesTitle = tsTitle;
    state.view = "ts_subjects";

    const grid = document.getElementById("mainGrid");
    if(grid) grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">Loading Subjects...</div>`;

    const subs = await fetchAPI(`/get/testseries_subjects?testseries_id=${tsId}`, () => DB.tsSubjects[tsId] || []);

    if (!subs || subs.length === 0 || (subs.length === 1 && String(subs[0].subjectid) === "-1")) {
        openTestSeriesTitles(tsId, "-1", tsTitle);
        return;
    }

    if(grid) grid.innerHTML = "";
    subs.forEach(s => {
        const sname = (s.subject_name || "Mock Tests").replace(/'/g, "");
        const logo = (s.subject_logo || `https://placehold.co/80x80/4f46e5/ffffff?text=${encodeURIComponent(sname.slice(0, 3))}`).replace(/\\//g, "/");
        grid.innerHTML += `
            <div onclick="openTestSeriesTitles('${tsId}', '${s.subjectid}', '${sname}')" class="grid-card p-4 flex items-center gap-4 cursor-pointer">
                <img src="${logo}" class="w-16 h-16 rounded-2xl object-cover shadow-md">
                <div class="flex-1">
                    <h4 class="font-black text-base text-slate-900 mt-1">${s.subject_name}</h4>
                    <p class="text-xs text-blue-600 font-extrabold mt-1">Open Mock Tests ➔</p>
                </div>
            </div>`;
    });
};

window.openTestSeriesTitles = async function(tsId, subId, subName) {
    state.view = "ts_tests";
    state.activeSeriesId = tsId;
    state.activeTsSubId = String(subId);
    state.activeTsSubName = subName;

    const grid = document.getElementById("mainGrid");
    if(grid) grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">Fetching Tests...</div>`;

    const ep = String(subId) === "-1"
        ? `/get/test_titlev2?testseriesid=${tsId}&subject_id=-1&chapter_id=-1&search=&start=-1`
        : `/get/test_titlev2?testseriesid=${tsId}&subject_id=${subId}&chapter_id=-1&search=&start=-1`;

    let list = await fetchAPI(ep, () => (DB.tsTitles ? DB.tsTitles[`${tsId}_${subId}`] : []));
    renderTestTitlesGrid(list, tsId);
};

function formatCardTimeLabel(rawTime) {
    const str = String(rawTime || "60").trim();
    if (str.includes("+")) {
        const parts = str.split("+").map(n => parseInt(n.trim()) || 0);
        return `${parts.reduce((a, b) => a + b, 0)} Mins (Sec)`;
    }
    return `${str} Mins`;
}

function renderTestTitlesGrid(list, tsId) {
    const grid = document.getElementById("mainGrid");
    if (!list || !list.length) {
        if(grid) grid.innerHTML = `<div class="col-span-full p-10 text-center font-bold text-slate-600">No tests available.</div>`;
        return;
    }

    if(grid) grid.innerHTML = "";
    list.forEach((t, idx) => {
        const tKey = `test_${t.id || idx}`;
        const pdfUrl = t.pdf_url || t.test_solutions_pdf || t.pdf_summary_link || "";
        state.testMap[tKey] = { ...t, seriesId: tsId || t.test_series_id, resolvedPdf: pdfUrl, test_questions_url: t.test_questions_url };
        const timeLabel = formatCardTimeLabel(t.time);

        if(grid) grid.innerHTML += `
            <div class="grid-card p-5 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">TEST #${t.id || (idx + 1)}</span>
                        <span class="text-[11px] font-extrabold text-emerald-700">⏱️ ${timeLabel}</span>
                    </div>
                    <h4 class="font-black text-base text-slate-900 mt-2">${t.title}</h4>
                    <div class="flex gap-2.5 mt-2 text-xs font-bold text-slate-600 flex-wrap">
                        <span>❓ ${t.questions || 50} Qs</span>
                        <span>🏆 ${t.marks || 100} Marks</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-sky-100">
                    <button onclick="launchCbtTest('${tKey}')" class="btn-watch flex-1 text-xs">🚀 Attempt Live Test</button>
                    ${pdfUrl ? `<button onclick="openTestPdf('${tKey}')" class="btn-pdf1 text-xs">📄 Test PDF</button>` : ""}
                </div>
            </div>`;
    });
}

window.openTestPdf = function(tKey) {
    const t = state.testMap[tKey];
    if (!t || !t.resolvedPdf) return;
    state.currentPdfUrl = t.resolvedPdf;
    const pdfFrame = document.getElementById("pdfFrame");
    if(pdfFrame) pdfFrame.src = `https://docs.google.com/viewer?url=${encodeURIComponent(t.resolvedPdf)}&embedded=true`;
    showSlide("slidePdf");
};

window.closePdfSlide = function() {
    const pdfFrame = document.getElementById("pdfFrame");
    if(pdfFrame) pdfFrame.src = "";
    showSlide(state.previousSlide || "slideExplorer");
};

window.launchCbtTest = async function(tKey) {
    if (typeof window.launchTcsCbtEngine === "function") {
        await window.launchTcsCbtEngine(tKey);
    } else {
        alert("TCS Engine script not found!");
    }
};

// AUTO LAUNCH & CLEANUP ON LOAD
window.addEventListener("DOMContentLoaded", () => {
    // Hide unneeded UI elements logically based on old UI
    const navAuth = document.getElementById('navAuthArea');
    if(navAuth) navAuth.style.display = 'none';
    const subTabs = document.getElementById('subTabs');
    if(subTabs) subTabs.style.display = 'none';
    
    // Hide top bar links that are useless now
    document.querySelectorAll('.btn-nav').forEach(btn => {
        if(btn.innerText.includes('Home') || btn.innerText.includes('Free') || btn.innerText.includes('My Token')) {
            btn.style.display = 'none';
        }
    });

    // Start App Directly in Paid Test Series
    openTestSeriesExplorer('paid_ts');
});
