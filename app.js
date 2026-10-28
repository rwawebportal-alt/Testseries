// =========================================================
// TEST PRO - SMART ENGINE (app.js)
// Slide Routing, Debug Logger & Triple Fallback API
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
// DEBUG LOGGER SYSTEM
// =====================================================
function logDebug(msg, type = "info") {
    const box = document.getElementById("debugLogContent");
    if(!box) return;
    const time = new Date().toLocaleTimeString();
    let color = type === "error" ? "text-rose-400" : (type === "warn" ? "text-amber-400" : "text-emerald-400");
    box.innerHTML += `<div class="mb-1"><span class="text-slate-500">[${time}]</span> <span class="${color}">${msg}</span></div>`;
    box.scrollTop = box.scrollHeight;
    console.log(`[${type.toUpperCase()}] ${msg}`);
}

window.toggleDebugBox = function() {
    const overlay = document.getElementById("debugBoxOverlay");
    overlay.classList.toggle("hidden");
};

window.clearDebugLogs = function() {
    document.getElementById("debugLogContent").innerHTML = "> Logs cleared...<br>";
};

window.copyDebugLogs = function() {
    const text = document.getElementById("debugLogContent").innerText;
    navigator.clipboard.writeText(text);
    alert("Debug logs copied to clipboard!");
};

// =====================================================
// SLIDE NAVIGATION ENGINE (NO OVERLAPS)
// =====================================================
window.showSlide = function(slideId) {
    document.querySelectorAll(".slide-page").forEach(el => {
        if(el.id === slideId) {
            el.classList.remove("hidden-slide");
            el.classList.add("active-slide");
        } else {
            el.classList.add("hidden-slide");
            el.classList.remove("active-slide");
        }
    });
};

window.goHome = function() {
    if(typeof exitCbtTest === "function") exitCbtTest();
    showSlide("page-home");
};

// =====================================================
// TRIPLE FALLBACK API CALLER
// =====================================================
async function fetchAPI(endpoint, isTestSeriesDetails = false, seriesId = null) {
    const headers = {
        "Client-Service": "Appx",
        "Auth-Key": "appxapi",
        "source": "website",
        "User-ID": "000000" // Bypass
    };
    
    // METHOD 1: Direct Fetch
    try {
        logDebug(`[Method 1] Direct fetch: ${endpoint}`);
        const res = await fetch(endpoint, { headers });
        const json = await res.json();
        
        if (json.data && Object.keys(json.data).length > 0) return json.data;
        if (json.test_titles && json.test_titles.length > 0) return json.test_titles;
        if (Array.isArray(json) && json.length > 0) return json;
        throw new Error("Empty data in Method 1");
    } catch (e1) {
        logDebug(`Method 1 Failed: ${e1.message}`, "warn");
        
        // METHOD 2: Proxy Fetch
        try {
            logDebug(`[Method 2] Proxy fetch for: ${endpoint}`);
            const pRes = await fetch(PROXY_URL + encodeURIComponent(endpoint), { headers });
            const pJson = await pRes.json();
            
            if (pJson.data && Object.keys(pJson.data).length > 0) return pJson.data;
            if (pJson.test_titles && pJson.test_titles.length > 0) return pJson.test_titles;
            if (Array.isArray(pJson) && pJson.length > 0) return pJson;
            throw new Error("Empty data in Method 2");
        } catch (e2) {
            logDebug(`Method 2 Failed: ${e2.message}`, "warn");
            
            // METHOD 3: Specific Alternative API (Only for subjects/series details)
            if(isTestSeriesDetails && seriesId) {
                try {
                    const fallbackUrl = `${state.currentDomain}/Test_Series/test_series_by_id?id=${seriesId}`;
                    logDebug(`[Method 3] Alternative API fetch: ${fallbackUrl}`);
                    
                    // Try direct alternative
                    let altRes = await fetch(fallbackUrl, { headers }).catch(() => null);
                    if(!altRes || !altRes.ok) {
                        // Try proxy alternative
                        altRes = await fetch(PROXY_URL + encodeURIComponent(fallbackUrl), { headers });
                    }
                    
                    const altJson = await altRes.json();
                    if (altJson.data) return altJson.data;
                    if (Array.isArray(altJson)) return altJson;
                    throw new Error("Empty data in Method 3");
                } catch (e3) {
                    logDebug(`Method 3 Failed: ${e3.message}`, "error");
                    return [];
                }
            }
            
            logDebug("All fetch methods exhausted.", "error");
            return [];
        }
    }
}

// =====================================================
// APP LOGIC
// =====================================================
window.startAppWithDomain = async function() {
    let input = document.getElementById("domainInput").value.trim();
    if(!input) input = "sciencemagnet.classx.co.in";

    if(input.endsWith("/")) input = input.slice(0, -1);
    if(!input.startsWith("http")) input = "https://" + input;

    state.currentDomain = input;
    logDebug(`Domain set to: ${state.currentDomain}`);
    
    await openTestSeriesExplorer();
};

window.openTestSeriesExplorer = async function() {
    showSlide("page-series");
    const grid = document.getElementById("seriesGrid");
    grid.innerHTML = `<div class="py-12 text-center font-black text-indigo-700 animate-pulse">🔄 Loading Test Series...</div>`;
    
    const fullUrl = `${state.currentDomain}/get/test_series?start=0&search=&client_api_url=&exam_id=`;
    
    let tsList = await fetchAPI(fullUrl);
    if (!Array.isArray(tsList)) tsList = Object.values(tsList || {});

    if (!tsList || tsList.length === 0) {
        grid.innerHTML = `<div class="py-10 text-center font-bold text-rose-600">❌ No Test Series Found. Check Debug Logs.</div>`;
        return;
    }

    grid.innerHTML = "";
    tsList.forEach(ts => {
        if (!ts || (!ts.id && !ts.test_series_id)) return;
        const id = ts.id || ts.test_series_id;
        const title = (ts.title || ts.test_series_name || "Test Series").replace(/'/g, "");
        const logo = (ts.logo || ts.image || "https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series").replace(/\\\//g, "/");
        
        grid.innerHTML += `
            <div onclick="openTestSeriesSubjects('${id}', '${title}')" class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-sm mb-4">
                <img src="${logo}" onerror="this.src='https://placehold.co/600x320/4f46e5/ffffff?text=Test'" class="w-full h-40 object-cover">
                <div class="p-4">
                    <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">SERIES #${id}</span>
                    <h3 class="font-black text-base text-slate-900 mt-2">${title}</h3>
                </div>
            </div>`;
    });
};

window.openTestSeriesSubjects = async function(tsId, tsTitle) {
    state.activeSeriesId = tsId;
    state.activeSeriesTitle = tsTitle;
    document.getElementById("subPageTitle").textContent = tsTitle;

    showSlide("page-subjects");
    const grid = document.getElementById("subjectsGrid");
    grid.innerHTML = `<div class="py-10 text-center font-bold text-slate-700 animate-pulse">Loading Subjects...</div>`;

    const subApi = `${state.currentDomain}/get/testseries_subjects?testseries_id=${tsId}`;
    
    // Pass 'true' and 'tsId' to enable Method 3 (Third Fallback)
    const subs = await fetchAPI(subApi, true, tsId);

    if (!subs || subs.length === 0 || (subs.length === 1 && String(subs[0].subjectid) === "-1")) {
        logDebug(`No subjects found, directly loading tests for series ${tsId}`);
        openTestSeriesTitles(tsId, "-1", tsTitle);
        return;
    }

    grid.innerHTML = "";
    subs.forEach(s => {
        const sname = (s.subject_name || s.name || "Mock Tests").replace(/'/g, "");
        const sId = s.subjectid || s.id;
        grid.innerHTML += `
            <div onclick="openTestSeriesTitles('${tsId}', '${sId}', '${sname}')" class="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-sm mb-3">
                <div>
                    <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] font-black">SUB #${sId}</span>
                    <h4 class="font-black text-sm sm:text-base text-slate-900 mt-1">${sname}</h4>
                </div>
                <span class="text-indigo-600 font-black">➔</span>
            </div>`;
    });
};

window.openTestSeriesTitles = async function(tsId, subId, subName) {
    state.activeTsSubId = String(subId);
    state.activeTsSubName = subName;
    document.getElementById("testPageTitle").textContent = subName;

    showSlide("page-tests");
    const grid = document.getElementById("testsGrid");
    grid.innerHTML = `<div class="py-10 text-center font-bold text-slate-700 animate-pulse">Fetching Mock Tests...</div>`;

    let ep = `${state.currentDomain}/get/test_titlev2?testseriesid=${tsId}&subject_id=${subId}&chapter_id=-1&userid=000000&search=&start=-1`;
    if(subId === "-1") ep = `${state.currentDomain}/get/test_titlev2?testseriesid=${tsId}&subject_id=-1&userid=000000&search=&start=-1`;

    const list = await fetchAPI(ep);
    
    if (!list || !list.length) {
        grid.innerHTML = `<div class="bg-white p-10 rounded-2xl shadow-sm text-center font-bold text-slate-600 border border-slate-200">Is section mein abhi koi test uplabdh nahi hai.</div>`;
        return;
    }

    grid.innerHTML = "";
    list.forEach((t, idx) => {
        const tKey = `test_${t.id || idx}`;
        let pdfUrl = t.pdf_url || t.test_solutions_pdf || "";
        if(pdfUrl && !pdfUrl.startsWith("http")) pdfUrl = state.currentDomain + (pdfUrl.startsWith("/") ? "" : "/") + pdfUrl;
        
        state.testMap[tKey] = { ...t, seriesId: tsId, resolvedPdf: pdfUrl };
        const timeLabel = String(t.time || "60").includes("+") ? "Sectional Time" : `${t.time} Mins`;

        grid.innerHTML += `
            <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm mb-4">
                <div class="flex justify-between items-center gap-2 mb-2">
                    <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">TEST #${t.id || (idx + 1)}</span>
                    <span class="text-[11px] font-extrabold text-slate-500">⏱️ ${timeLabel}</span>
                </div>
                <h4 class="font-black text-sm sm:text-base text-slate-900 mb-2">${t.title}</h4>
                <div class="flex gap-3 text-xs font-bold text-slate-600 mb-4">
                    <span class="text-rose-600">❓ ${t.questions || 100} Qs</span>
                    <span class="text-amber-600">🏆 ${t.marks || 100} Marks</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="launchCbtTest('${tKey}')" class="bg-indigo-600 text-white font-bold py-2.5 rounded-xl flex-1 text-xs shadow-md">🚀 Attempt Live</button>
                    ${pdfUrl ? `<button onclick="openTestPdf('${tKey}')" class="bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md">📄 PDF</button>` : ""}
                </div>
            </div>`;
    });
};

window.launchCbtTest = async function(tKey) {
    if (typeof window.launchTcsCbtEngine === "function") {
        await window.launchTcsCbtEngine(tKey);
    } else {
        logDebug("TCS Engine not loaded!", "error");
    }
};

window.openTestPdf = function(tKey) {
    const t = state.testMap[tKey];
    if (!t || !t.resolvedPdf) return;
    
    document.getElementById("pdfTitle").textContent = t.title;
    document.getElementById("pdfFrame").src = `https://docs.google.com/viewer?url=${encodeURIComponent(t.resolvedPdf)}&embedded=true`;
    showSlide("page-pdf");
};

window.closePdfSlide = function() {
    document.getElementById("pdfFrame").src = "";
    showSlide("page-tests");
};
