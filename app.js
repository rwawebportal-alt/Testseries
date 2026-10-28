// =========================================================
// PAID TEST SERIES MINI APP - ENGINE (app.js)
// No Login, No Token Manager - Direct Access
// =========================================================

const DEFAULT_TEST_API = "https://rozgarapinew.teachx.in/get/test_series?start=0&search=&client_api_url=&exam_id=";
const PROXY_URL = "https://proplayer.allswbatch22.workers.dev/proxy?url="; // Add proxy if facing CORS

let state = {
    currentSlide: "slideHome",
    previousSlide: "slideHome",
    activeSeriesId: null,
    activeSeriesTitle: "",
    activeTsSubId: null,
    activeTsSubName: "",
    testMap: {},
    customApiMode: false,
    currentApiUrl: DEFAULT_TEST_API 
};

// =====================================================
// API CALLER (WITH PROXY FALLBACK)
// =====================================================
async function fetchAPI(endpoint) {
    const headers = {
        "Client-Service": "Appx",
        "Auth-Key": "appxapi",
        "source": "website",
        "User-ID": "000000" // Default generic ID for open access
    };
    
    try {
        const res = await fetch(endpoint, { headers });
        const json = await res.json();
        return (json.data || json.test_titles || json); 
    } catch (e) {
        console.warn("Direct fetch failed, trying proxy...", e);
        try {
            const proxyRes = await fetch(PROXY_URL + encodeURIComponent(endpoint), { headers });
            const proxyJson = await proxyRes.json();
            return (proxyJson.data || proxyJson.test_titles || proxyJson);
        } catch (err) {
            console.error("API Fetch Error:", err);
            return [];
        }
    }
}

// =====================================================
// CUSTOM API URL LOADER
// =====================================================
window.loadCustomApiTestSeries = async function() {
    const input = document.getElementById("customApiUrlInput").value.trim();
    if (!input) {
        alert("Please enter a valid API URL.");
        return;
    }
    
    state.customApiMode = true;
    state.currentApiUrl = input;
    
    openTestSeriesExplorer();
};

// =====================================================
// SLIDE NAVIGATION ENGINE
// =====================================================
function showSlide(slideId) {
    if (state.currentSlide !== slideId) {
        state.previousSlide = state.currentSlide;
    }
    state.currentSlide = slideId;

    ["slideHome", "slideExplorer", "slideTestAttempt", "slidePdf"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === slideId) {
            el.classList.remove("hidden-slide");
            el.classList.add("active-slide");
        } else {
            el.classList.remove("active-slide");
            el.classList.add("hidden-slide");
        }
    });

    const topNav = document.getElementById("topHeaderNav");
    if (topNav) {
        if (slideId === "slideHome") topNav.classList.remove("hidden");
        else topNav.classList.add("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.goHomeHub = function() {
    state.customApiMode = false; // Reset to default when going home
    state.currentApiUrl = DEFAULT_TEST_API;
    
    if (typeof window.exitTcsTest === "function") window.exitTcsTest();
    showSlide("slideHome");
};

window.handleGlobalBack = function() {
    if (state.currentSlide === "slidePdf") {
        closePdfSlide();
        return;
    }
    if (state.currentSlide === "slideTestAttempt") {
        if(typeof window.exitTcsTest === "function") window.exitTcsTest();
        return;
    }
    if (state.currentSlide === "slideExplorer") {
        if (state.activeTsSubId) {
            // We are inside tests, go back to subjects
            openTestSeriesSubjects(state.activeSeriesId, state.activeSeriesTitle);
            state.activeTsSubId = null;
        } else {
            // Go home
            goHomeHub();
        }
    }
};

// =====================================================
// TEST SERIES EXPLORER (PAID TS & CUSTOM API)
// =====================================================
window.openTestSeriesExplorer = async function() {
    showSlide("slideExplorer");
    const grid = document.getElementById("mainGrid");
    
    if(state.customApiMode) {
        document.getElementById("crumbText").textContent = "Custom Link";
        document.getElementById("headingText").textContent = "🌐 Loaded Custom Tests";
        grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-indigo-800">🔄 Loading Custom API Tests...</div>`;
    } else {
        document.getElementById("crumbText").textContent = "Official Tests";
        document.getElementById("headingText").textContent = "🏆 Paid Test Series";
        grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-indigo-800">🔄 Loading Official Test Series...</div>`;
    }

    let tsList = await fetchAPI(state.currentApiUrl);
    
    if (!Array.isArray(tsList)) {
        tsList = Object.values(tsList || {}); // Fallback if object is returned
    }

    grid.innerHTML = "";
    if (!tsList || tsList.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">❌ No Test Series Found. Check API.</div>`;
        return;
    }

    tsList.forEach(ts => {
        if (!ts || (!ts.id && !ts.test_series_id)) return;
        const id = ts.id || ts.test_series_id;
        const title = (ts.title || ts.test_series_name || "Test Series").replace(/'/g, "");
        const logo = (ts.logo || ts.image || "https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series").replace(/\\\//g, "/");
        
        grid.innerHTML += `
            <div onclick="openTestSeriesSubjects('${id}', '${title}')" class="grid-card overflow-hidden cursor-pointer flex flex-col justify-between">
                <div>
                    <img src="${logo}" onerror="this.src='https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series'" class="w-full h-44 object-cover">
                    <div class="p-4">
                        <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">SERIES #${id}</span>
                        <h3 class="font-black text-base text-slate-900 mt-2">${title}</h3>
                    </div>
                </div>
                <div class="px-4 pb-4">
                    <div class="btn-watch w-full text-center text-xs">Open Subjects ➔</div>
                </div>
            </div>`;
    });
};

window.openTestSeriesSubjects = async function(tsId, tsTitle) {
    state.activeSeriesId = tsId;
    state.activeSeriesTitle = tsTitle;
    document.getElementById("crumbText").textContent = `Series #${tsId}`;
    document.getElementById("headingText").textContent = tsTitle;

    const grid = document.getElementById("mainGrid");
    grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">Loading Subjects...</div>`;

    const subApi = `https://rozgarapinew.teachx.in/get/testseries_subjects?testseries_id=${tsId}`;
    const subs = await fetchAPI(subApi);

    if (!subs || subs.length === 0 || (subs.length === 1 && String(subs[0].subjectid) === "-1")) {
        openTestSeriesTitles(tsId, "-1", tsTitle);
        return;
    }

    grid.innerHTML = "";
    subs.forEach(s => {
        const sname = (s.subject_name || "Mock Tests").replace(/'/g, "");
        grid.innerHTML += `
            <div onclick="openTestSeriesTitles('${tsId}', '${s.subjectid}', '${sname}')" class="grid-card p-5 flex items-center justify-between cursor-pointer">
                <div>
                    <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] font-black">SUBJECT #${s.subjectid}</span>
                    <h4 class="font-black text-base text-slate-900 mt-1">${sname}</h4>
                </div>
                <span class="btn-watch text-xs">Open Tests ➔</span>
            </div>`;
    });
};

window.openTestSeriesTitles = async function(tsId, subId, subName) {
    state.activeTsSubId = String(subId);
    state.activeTsSubName = subName;
    document.getElementById("crumbText").textContent = state.activeSeriesTitle;
    document.getElementById("headingText").textContent = `📝 ${subName}`;

    const grid = document.getElementById("mainGrid");
    grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">Fetching Mock Tests...</div>`;

    const uid = "000000";
    let ep = `https://rozgarapinew.teachx.in/get/test_titlev2?testseriesid=${tsId}&subject_id=${subId}&chapter_id=-1&userid=${uid}&search=&start=-1`;
    
    // Fallback if -1 fails
    if(subId === "-1") ep = `https://rozgarapinew.teachx.in/get/test_titlev2?testseriesid=${tsId}&subject_id=-1&userid=${uid}&search=&start=-1`;

    const list = await fetchAPI(ep);
    renderTestTitlesGrid(list, tsId);
};

function resolvePdfUrl(encPdf, signedPdf) {
    if(signedPdf && signedPdf.startsWith("http")) return signedPdf;
    if(encPdf && encPdf.startsWith("http")) return encPdf;
    return signedPdf || encPdf || ""; 
}

function renderTestTitlesGrid(list, tsId) {
    const grid = document.getElementById("mainGrid");

    if (!list || !list.length) {
        grid.innerHTML = `<div class="col-span-full bg-white p-10 rounded-2xl shadow text-center font-bold text-slate-600 border border-slate-200">Is section mein abhi koi test uplabdh nahi hai.</div>`;
        return;
    }

    grid.innerHTML = "";
    list.forEach((t, idx) => {
        const tKey = `test_${t.id || idx}`;
        const pdfUrl = resolvePdfUrl(t.pdf_url || t.test_solutions_pdf, t.pdf_url);
        
        state.testMap[tKey] = {
            ...t,
            seriesId: tsId,
            resolvedPdf: pdfUrl
        };

        const timeLabel = String(t.time || "60").includes("+") ? "Sectional Time" : `${t.time} Mins`;

        grid.innerHTML += `
            <div class="grid-card p-5 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">TEST #${t.id || (idx + 1)}</span>
                        <span class="text-[11px] font-extrabold text-emerald-700">⏱️ ${timeLabel}</span>
                    </div>
                    <h4 class="font-black text-base text-slate-900 mt-2">${t.title}</h4>
                    <div class="flex gap-2.5 mt-2 text-xs font-bold text-slate-600 flex-wrap">
                        <span>❓ ${t.questions || 100} Qs</span>
                        <span>🏆 ${t.marks || 100} Marks</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-indigo-100">
                    <button onclick="launchCbtTest('${tKey}')" class="btn-watch flex-1 text-xs">🚀 Attempt Live Test</button>
                    ${pdfUrl ? `<button onclick="openTestPdf('${tKey}')" class="btn-watch bg-emerald-600 text-xs">📄 PDF</button>` : ""}
                </div>
            </div>`;
    });
}

// =====================================================
// CBT LAUNCHER & PDF
// =====================================================
window.launchCbtTest = async function(tKey) {
    if (typeof window.launchTcsCbtEngine === "function") {
        await window.launchTcsCbtEngine(tKey);
    } else {
        alert("TCS Engine Loading...");
    }
};

window.openTestPdf = function(tKey) {
    const t = state.testMap[tKey];
    if (!t || !t.resolvedPdf) return;
    
    document.getElementById("pdfTitle").textContent = `📄 ${t.title}`;
    document.getElementById("pdfFrame").src = `https://docs.google.com/viewer?url=${encodeURIComponent(t.resolvedPdf)}&embedded=true`;
    showSlide("slidePdf");
};

window.closePdfSlide = function() {
    document.getElementById("pdfFrame").src = "";
    showSlide("slideExplorer");
};

// =====================================================
// SEARCH FILTER
// =====================================================
window.filterGrid = function() {
    const q = document.getElementById("searchBox").value.toLowerCase();
    document.querySelectorAll("#mainGrid .grid-card").forEach(el => {
        el.style.display = el.innerText.toLowerCase().includes(q) ? "" : "none";
    });
};
