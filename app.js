// =========================================================
// TEST SERIES PRO - SMART ENGINE (app.js)
// Auto-Path Appending & Fallback Method Included
// =========================================================

const PROXY_URL = "https://proplayer.allswbatch22.workers.dev/proxy?url="; 

let state = {
    currentDomain: "https://rozgarapinew.teachx.in",
    activeSeriesId: null,
    activeSeriesTitle: "",
    activeTsSubId: null,
    activeTsSubName: "",
    testMap: {}
};

// =====================================================
// SMART PAGE ROUTING (Prevents Overlap)
// =====================================================
window.goHome = function() {
    document.querySelectorAll(".app-page").forEach(el => {
        el.classList.add("hidden-page"); 
        el.classList.remove("active-page");
    });
    document.getElementById("page-home").classList.remove("hidden-page");
    document.getElementById("page-home").classList.add("active-page");
    if(typeof exitCbtTest === "function") exitCbtTest();
};

function showExplorer() {
    document.querySelectorAll(".app-page").forEach(el => {
        el.classList.add("hidden-page"); 
        el.classList.remove("active-page");
    });
    document.getElementById("page-explorer").classList.remove("hidden-page");
    document.getElementById("page-explorer").classList.add("active-page");
}

function showCbtSlide() {
    document.querySelectorAll(".app-page").forEach(el => {
        el.classList.add("hidden-page"); 
        el.classList.remove("active-page");
    });
    document.getElementById("page-cbt").classList.remove("hidden-page");
    document.getElementById("page-cbt").classList.add("active-page");
}

function showPdfSlide() {
    document.querySelectorAll(".app-page").forEach(el => {
        el.classList.add("hidden-page"); 
        el.classList.remove("active-page");
    });
    document.getElementById("page-pdf").classList.remove("hidden-page");
    document.getElementById("page-pdf").classList.add("active-page");
}

window.handleBack = function() {
    if(!document.getElementById("page-pdf").classList.contains("hidden-page")) {
        closePdfSlide(); return;
    }
    if(!document.getElementById("page-cbt").classList.contains("hidden-page")) {
        exitCbtTest(); return;
    }
    if(!document.getElementById("page-explorer").classList.contains("hidden-page")) {
        if(state.activeTsSubId) {
            openTestSeriesSubjects(state.activeSeriesId, state.activeSeriesTitle);
            state.activeTsSubId = null;
        } else {
            goHome();
        }
    }
};

// =====================================================
// SMART API CALLER (WITH FALLBACK METHOD)
// =====================================================
async function fetchAPI(endpoint) {
    const headers = {
        "Client-Service": "Appx",
        "Auth-Key": "appxapi",
        "source": "website",
        "User-ID": "000000" // Open access bypass
    };
    
    // First Method: Direct Fetch
    try {
        const res = await fetch(endpoint, { headers });
        const json = await res.json();
        
        if (json.data && Object.keys(json.data).length > 0) return json.data;
        if (json.test_titles && json.test_titles.length > 0) return json.test_titles;
        if (Array.isArray(json) && json.length > 0) return json;
        
        throw new Error("No data in first method");
    } catch (e) {
        console.warn("First method failed, applying Second Method (Proxy Fallback)...");
        
        // Second Method: Proxy Fetch Fallback
        try {
            const pRes = await fetch(PROXY_URL + encodeURIComponent(endpoint), { headers });
            const pJson = await pRes.json();
            
            if (pJson.data) return pJson.data;
            if (pJson.test_titles) return pJson.test_titles;
            return pJson;
        } catch (err) {
            console.error("Both methods failed:", err);
            return [];
        }
    }
}

// =====================================================
// SMART URL BUILDER & TEST EXPLORER
// =====================================================
window.startAppWithDomain = async function() {
    let input = document.getElementById("domainInput").value.trim();
    if(!input) input = "https://rozgarapinew.teachx.in";

    // Auto-fix URL (remove trailing slash, ensure https)
    if(input.endsWith("/")) input = input.slice(0, -1);
    if(!input.startsWith("http")) input = "https://" + input;

    state.currentDomain = input;
    
    // Change Button State
    const btn = document.querySelector("#page-home button");
    const oldText = btn.innerHTML;
    btn.innerHTML = "🔄 Fetching Tests...";
    btn.disabled = true;

    await openTestSeriesExplorer();

    btn.innerHTML = oldText;
    btn.disabled = false;
};

window.openTestSeriesExplorer = async function() {
    showExplorer();
    const grid = document.getElementById("mainGrid");
    grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-indigo-800">🔄 Loading Test Series...</div>`;
    
    document.getElementById("crumbText").textContent = "All Series";
    document.getElementById("headingText").textContent = "📚 Paid Test Series";
    
    // Auto-append the full path logic
    const fullUrl = `${state.currentDomain}/get/test_series?start=0&search=&client_api_url=&exam_id=`;
    
    let tsList = await fetchAPI(fullUrl);
    if (!Array.isArray(tsList)) tsList = Object.values(tsList || {});

    grid.innerHTML = "";
    if (!tsList || tsList.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-red-600">❌ No Test Series Found. Domain galat hai ya data nahi mila.</div>`;
        return;
    }

    tsList.forEach(ts => {
        if (!ts || (!ts.id && !ts.test_series_id)) return;
        const id = ts.id || ts.test_series_id;
        const title = (ts.title || ts.test_series_name || "Test Series").replace(/'/g, "");
        const logo = (ts.logo || ts.image || "https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series").replace(/\\\//g, "/");
        
        grid.innerHTML += `
            <div onclick="openTestSeriesSubjects('${id}', '${title}')" class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-lg transition-all hover:border-indigo-500">
                <div>
                    <img src="${logo}" onerror="this.src='https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series'" class="w-full h-44 object-cover">
                    <div class="p-4">
                        <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">SERIES #${id}</span>
                        <h3 class="font-black text-base text-slate-900 mt-2">${title}</h3>
                    </div>
                </div>
                <div class="px-4 pb-4">
                    <div class="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold w-full text-center text-xs py-2.5 rounded-xl shadow-md">Open Subjects ➔</div>
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

    const subApi = `${state.currentDomain}/get/testseries_subjects?testseries_id=${tsId}`;
    const subs = await fetchAPI(subApi);

    if (!subs || subs.length === 0 || (subs.length === 1 && String(subs[0].subjectid) === "-1")) {
        openTestSeriesTitles(tsId, "-1", tsTitle);
        return;
    }

    grid.innerHTML = "";
    subs.forEach(s => {
        const sname = (s.subject_name || "Mock Tests").replace(/'/g, "");
        grid.innerHTML += `
            <div onclick="openTestSeriesTitles('${tsId}', '${s.subjectid}', '${sname}')" class="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-lg transition-all hover:border-indigo-500">
                <div>
                    <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] font-black">SUBJECT #${s.subjectid}</span>
                    <h4 class="font-black text-base text-slate-900 mt-1">${sname}</h4>
                </div>
                <span class="text-indigo-600 text-xl font-black">➔</span>
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

    let ep = `${state.currentDomain}/get/test_titlev2?testseriesid=${tsId}&subject_id=${subId}&chapter_id=-1&userid=000000&search=&start=-1`;
    if(subId === "-1") ep = `${state.currentDomain}/get/test_titlev2?testseriesid=${tsId}&subject_id=-1&userid=000000&search=&start=-1`;

    const list = await fetchAPI(ep);
    
    if (!list || !list.length) {
        grid.innerHTML = `<div class="col-span-full bg-white p-10 rounded-2xl shadow-sm text-center font-bold text-slate-600 border border-slate-200">Is section mein abhi koi test uplabdh nahi hai.</div>`;
        return;
    }

    grid.innerHTML = "";
    list.forEach((t, idx) => {
        const tKey = `test_${t.id || idx}`;
        let pdfUrl = t.pdf_url || t.test_solutions_pdf || "";
        if(pdfUrl && !pdfUrl.startsWith("http")) pdfUrl = state.currentDomain + pdfUrl;
        
        state.testMap[tKey] = { ...t, seriesId: tsId, resolvedPdf: pdfUrl };
        const timeLabel = String(t.time || "60").includes("+") ? "Sectional Time" : `${t.time} Mins`;

        grid.innerHTML += `
            <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all hover:border-indigo-500">
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
                <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button onclick="launchCbtTest('${tKey}')" class="bg-indigo-600 text-white font-bold py-2.5 rounded-xl flex-1 text-xs shadow-md">🚀 Attempt Live Test</button>
                    ${pdfUrl ? `<button onclick="openTestPdf('${tKey}')" class="bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md">📄 PDF</button>` : ""}
                </div>
            </div>`;
    });
};

window.launchCbtTest = async function(tKey) {
    if (typeof window.launchTcsCbtEngine === "function") {
        await window.launchTcsCbtEngine(tKey);
    }
};

window.openTestPdf = function(tKey) {
    const t = state.testMap[tKey];
    if (!t || !t.resolvedPdf) return;
    
    document.getElementById("pdfTitle").textContent = `📄 ${t.title}`;
    document.getElementById("pdfFrame").src = `https://docs.google.com/viewer?url=${encodeURIComponent(t.resolvedPdf)}&embedded=true`;
    showPdfSlide();
};

window.closePdfSlide = function() {
    document.getElementById("pdfFrame").src = "";
    showExplorer();
};

window.filterGrid = function() {
    const q = document.getElementById("searchBox").value.toLowerCase();
    document.querySelectorAll("#mainGrid > div").forEach(el => {
        el.style.display = el.innerText.toLowerCase().includes(q) ? "" : "none";
    });
};
