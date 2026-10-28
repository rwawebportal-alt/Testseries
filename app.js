// =========================================================
// PAID TEST SERIES MULTI-COACHING SCANNER ENGINE (app.js)
// =========================================================
const AES_KEY = CryptoJS.enc.Utf8.parse("638udh3829162018");

let API_BASE = "https://rozgarapinew.teachx.in"; // Default Fallback
let allCoachingsList = [];
let validCoachings = []; // Those with tests > 0

// State Management
let state = {
    currentSlide: "slideHome",
    previousSlide: "slideHome",
    tsMode: "paid_ts",
    activeSeriesId: null,
    activeSeriesTitle: "",
    activeTsSubId: null,
    activeTsSubName: "",
    testMap: {},
    currentPdfUrl: ""
};

// Safely get hostname
function getSafeHostname(url) {
    try {
        return new URL(url).hostname;
    } catch(e) {
        return url.replace('https://','').replace('http://','').split('/')[0];
    }
}

// Load JSON automatically
async function loadCoachingsJSON() {
    try {
        const res = await fetch("threeapis.json");
        if (res.ok) {
            allCoachingsList = await res.json();
            console.log("Loaded Coachings:", allCoachingsList.length);
        }
    } catch(e) {
        console.error("Failed to load threeapis.json", e);
    }
}

// Ensure loaded on boot
loadCoachingsJSON();


// ==========================================
// MASS SCANNER LOGIC (Find Active Tests)
// ==========================================
window.startScanning = async function() {
    const btn = document.getElementById("scanBtn");
    const progressArea = document.getElementById("scanProgressArea");
    const progressBar = document.getElementById("scanProgressBar");
    const countText = document.getElementById("scanCountText");
    const grid = document.getElementById("coachingGrid");
    const statusText = document.getElementById("scanStatusText");
    
    try {
        // 1. Immediate UI Feedback
        btn.disabled = true;
        btn.classList.add("opacity-50", "cursor-not-allowed");
        btn.innerHTML = "⏳ Initializing Scanner...";
        
        if (progressArea) progressArea.classList.remove("hidden");
        if (statusText) statusText.textContent = "Loading database...";
        
        // 2. Fetch JSON if not loaded
        if (!allCoachingsList || allCoachingsList.length === 0) {
            try {
                // cache-busting parameter
                const res = await fetch("threeapis.json?v=" + new Date().getTime());
                if (res.ok) {
                    allCoachingsList = await res.json();
                } else {
                    throw new Error("HTTP " + res.status);
                }
            } catch(e) {
                alert("Error loading threeapis.json: Please ensure the file is uploaded. Details: " + e.message);
                btn.innerHTML = "❌ Scan Failed. Retry";
                btn.disabled = false;
                btn.classList.remove("opacity-50", "cursor-not-allowed");
                return;
            }
        }

        if (allCoachingsList.length === 0) {
            alert("No coachings found in threeapis.json!");
            btn.innerHTML = "❌ Empty File. Retry";
            btn.disabled = false;
            btn.classList.remove("opacity-50", "cursor-not-allowed");
            return;
        }

        // 3. Setup UI for Scanning
        btn.innerHTML = "🚀 Scanning APIs In Progress...";
        if (statusText) statusText.textContent = "Checking domains...";
        grid.innerHTML = "";
        
        validCoachings = [];
        let processed = 0;
        const total = allCoachingsList.length;
        if (countText) countText.textContent = `0 / ${total}`;
        if (progressBar) progressBar.style.width = "0%";
        document.getElementById("totalCoachingsBadge").textContent = "0";

        // 4. Concurrent Queue Logic
        const MAX_CONCURRENT = 12; // Test 12 parallel requests
        let currentIndex = 0;

        const scanWorker = async () => {
            while (currentIndex < total) {
                const i = currentIndex++;
                const coaching = allCoachingsList[i];
                let api = coaching.api;
                if (api.endsWith('/')) api = api.slice(0, -1);
                
                try {
                    const ep = `${api}/get/test_series?start=0&search=&client_api_url=&exam_id=`;
                    
                    // Fallback for older WebViews that don't support AbortSignal.timeout
                    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
                    let timeoutId = null;
                    let fetchOpts = { headers: { "Client-Service": "Appx", "Auth-Key": "appxapi", "source": "website" } };
                    
                    if (controller) {
                        fetchOpts.signal = controller.signal;
                        timeoutId = setTimeout(() => controller.abort(), 7000); // 7 seconds timeout
                    }
                    
                    const res = await fetch(ep, fetchOpts).catch(() => null);
                    
                    if (timeoutId) clearTimeout(timeoutId);

                    if (res && res.ok) {
                        const json = await res.json();
                        let testCount = 0;
                        if (json && json.data && Array.isArray(json.data)) {
                            testCount = json.data.length;
                        } else if (json && json.total) {
                            testCount = parseInt(json.total) || 0;
                        }
                        
                        if (testCount > 0) {
                            validCoachings.push({
                                name: coaching.name,
                                api: api,
                                total_tests: json.total || testCount
                            });
                            // Update UI instantly when one is found
                            document.getElementById("totalCoachingsBadge").textContent = validCoachings.length;
                            window.renderCoachingGrid(validCoachings);
                        }
                    }
                } catch(e) {
                    // Fail silently for bad APIs
                }
                
                processed++;
                if (progressBar) progressBar.style.width = Math.round((processed / total) * 100) + "%";
                if (countText) countText.textContent = `${processed} / ${total}`;
            }
        };

        const workers = [];
        for (let w = 0; w < MAX_CONCURRENT; w++) {
            workers.push(scanWorker());
        }
        
        await Promise.all(workers);
        
        // 5. Completion
        btn.disabled = false;
        btn.classList.remove("opacity-50", "cursor-not-allowed");
        btn.innerHTML = "✅ Scan Complete! Re-Scan";
        if (statusText) statusText.textContent = "Scan Completed!";
        
        if (validCoachings.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500 font-bold">No active coachings with test series found.</div>`;
        }

    } catch (error) {
        alert("Unexpected error: " + error.message);
        btn.disabled = false;
        btn.classList.remove("opacity-50", "cursor-not-allowed");
        btn.innerHTML = "❌ Error Occurred. Retry";
    }
};

window.renderCoachingGrid = function(list) {
    const grid = document.getElementById("coachingGrid");
    
    if (!list || list.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500 font-bold">No active coachings found yet...</div>`;
        return;
    }
    
    grid.innerHTML = list.map(c => `
        <div onclick="selectCoaching('${c.name}', '${c.api}')" class="bg-white p-5 rounded-2xl border-2 border-indigo-100 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group">
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        ${c.name.charAt(0).toUpperCase()}
                    </span>
                    <h3 class="font-black text-slate-800 text-base truncate flex-1">${c.name}</h3>
                </div>
                <p class="text-[10px] text-slate-400 font-mono truncate ml-10">${getSafeHostname(c.api)}</p>
            </div>
            <div class="text-right ml-3 shrink-0">
                <span class="block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-lg">${c.total_tests} Tests</span>
            </div>
        </div>
    `).join('');
};

window.filterCoachings = function() {
    const q = document.getElementById("coachingSearchBox").value.toLowerCase();
    const filtered = validCoachings.filter(c => c.name.toLowerCase().includes(q) || c.api.toLowerCase().includes(q));
    window.renderCoachingGrid(filtered);
};

window.selectCoaching = function(name, api) {
    API_BASE = api;
    
    const statusBadge = document.getElementById("apiStatus");
    if (statusBadge) statusBadge.textContent = `● Connected: ${name}`;
    
    window.openTestSeriesExplorer('paid_ts');
};


// --- Navigation Engine ---
window.showSlide = function(slideId) {
    if (state.currentSlide !== slideId) state.previousSlide = state.currentSlide;
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
};

window.goHomeHub = function() {
    if (typeof window.exitCbtTest === "function") {
        try { window.exitCbtTest(); } catch (e) {}
    }
    window.showSlide("slideHome");
};

window.handleGlobalBack = function() {
    if (state.currentSlide === "slidePdf") {
        window.closePdfSlide();
        return;
    }
    if (state.currentSlide === "slideTestAttempt") {
        if (typeof window.exitCbtTest === "function") window.exitCbtTest();
        else window.showSlide("slideExplorer");
        return;
    }
    if (state.currentSlide === "slideExplorer") {
        if (state.view === "ts_tests") {
            if (state.activeTsSubId === "-1") window.openTestSeriesExplorer(state.tsMode);
            else window.openTestSeriesSubjects(state.activeSeriesId, state.activeSeriesTitle);
            return;
        }
        if (state.view === "ts_subjects") {
            window.openTestSeriesExplorer(state.tsMode);
            return;
        }
        window.goHomeHub();
    }
};


// --- API Caller ---
window.fetchRawJSON = async function(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { "Client-Service": "Appx", "Auth-Key": "appxapi", "source": "website" }
        });
        return await res.json();
    } catch {
        return null;
    }
};

window.fetchAPI = async function(endpoint) {
    const json = await window.fetchRawJSON(endpoint);
    if (json) {
        if (json.data && (Array.isArray(json.data) ? json.data.length > 0 : Object.keys(json.data).length > 0)) {
            return json.data;
        }
        if (json.test_titles && Array.isArray(json.test_titles) && json.test_titles.length > 0) {
            return json.test_titles;
        }
    }
    return [];
};


// --- Test Series Explorer ---
window.openTestSeriesExplorer = async function(mode) {
    state.tsMode = mode;
    state.view = "ts_list";
    window.showSlide("slideExplorer");

    const grid = document.getElementById("mainGrid");
    grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-slate-800">🔄 Loading Paid Test Series from ${getSafeHostname(API_BASE)}...</div>`;
    document.getElementById("crumbText").textContent = "Official Exam Series";
    document.getElementById("headingText").textContent = "🏆 Paid Test Series";

    const [p0, p10, p20] = await Promise.all([
        window.fetchAPI(`/get/test_series?start=0&search=&client_api_url=&exam_id=`),
        window.fetchAPI(`/get/test_series?start=10&search=&client_api_url=&exam_id=`),
        window.fetchAPI(`/get/test_series?start=20&search=&client_api_url=&exam_id=`)
    ]);

    let combined = [...(Array.isArray(p0) ? p0 : []), ...(Array.isArray(p10) ? p10 : []), ...(Array.isArray(p20) ? p20 : [])];

    grid.innerHTML = "";
    if (combined.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-slate-800">❌ No tests found for this coaching.</div>`;
        return;
    }

    const seen = new Set();
    combined.forEach(ts => {
        if (!ts || !ts.id || seen.has(String(ts.id))) return;
        seen.add(String(ts.id));
        const title = (ts.title || "Paid Test Series").replace(/'/g, "");
        const logo = (ts.logo || "https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series").replace(/\\//g, "/");
        grid.innerHTML += `
            <div onclick="openTestSeriesSubjects('${ts.id}', '${title}')" class="grid-card overflow-hidden cursor-pointer flex flex-col justify-between">
                <div>
                    <img src="${logo}" onerror="this.src='https://placehold.co/600x320/4f46e5/ffffff?text=Paid+Test+Series'" class="w-full h-44 object-cover">
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
    document.getElementById("crumbText").textContent = `Test Series #${tsId}`;
    document.getElementById("headingText").textContent = tsTitle;

    const grid = document.getElementById("mainGrid");
    grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">Loading Subjects...</div>`;

    const subs = await window.fetchAPI(`/get/testseries_subjects?testseries_id=${tsId}`);

    if (!subs || subs.length === 0 || (subs.length === 1 && String(subs[0].subjectid) === "-1")) {
        window.openTestSeriesTitles(tsId, "-1", tsTitle);
        return;
    }

    grid.innerHTML = "";
    subs.forEach(s => {
        const sname = (s.subject_name || "Mock Tests").replace(/'/g, "");
        const logo = (s.subject_logo || `https://placehold.co/80x80/4f46e5/ffffff?text=${encodeURIComponent(sname.slice(0, 3))}`).replace(/\\//g, "/");
        grid.innerHTML += `
            <div onclick="openTestSeriesTitles('${tsId}', '${s.subjectid}', '${sname}')" class="grid-card p-4 flex items-center gap-4 cursor-pointer">
                <img src="${logo}" onerror="this.src='https://placehold.co/80x80/4f46e5/ffffff?text=TEST'" class="w-16 h-16 rounded-2xl object-cover shadow-md">
                <div class="flex-1">
                    <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] font-black">SUBJECT #${s.subjectid}</span>
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

    document.getElementById("crumbText").textContent = state.activeSeriesTitle;
    document.getElementById("headingText").textContent = `📝 ${subName}`;

    const grid = document.getElementById("mainGrid");
    grid.innerHTML = `<div class="col-span-full py-10 text-center font-bold text-slate-700">Fetching Mock Tests...</div>`;

    const ep = String(subId) === "-1"
        ? `/get/test_titlev2?testseriesid=${tsId}&subject_id=-1&chapter_id=-1&userid=-1&search=&start=-1`
        : `/get/test_titlev2?testseriesid=${tsId}&subject_id=${subId}&chapter_id=-1&userid=-1&search=&start=-1`;

    let list = await window.fetchAPI(ep);
    if ((!list || list.length === 0) && String(subId) !== "-1") {
        const epAlt = `/get/test_titlev2?testseriesid=${tsId}&subject_id=${subId}&userid=-1&search=&start=-1`;
        list = await window.fetchAPI(epAlt);
    }
    window.renderTestTitlesGrid(list, tsId);
};


// --- Utility Encoders / Formatters ---
window.decryptAppX = function(encStr) {
    if (!encStr || typeof encStr !== "string") return "";
    if (encStr.startsWith("http")) return encStr.trim();
    if (!encStr.includes(":")) return encStr.trim();
    try {
        const [cipherB64, ivB64] = encStr.split(":");
        const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(cipherB64.replace(/\\//g, "/")) });
        const iv = CryptoJS.enc.Base64.parse(ivB64);
        const dec = CryptoJS.AES.decrypt(cipherParams, AES_KEY, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return dec.toString(CryptoJS.enc.Utf8).replace(/[ -]/g, "").trim();
    } catch { return ""; }
};

window.resolvePdfUrl = function(encPdf, signedPdf) {
    const dec = window.decryptAppX(encPdf);
    if (dec && dec.startsWith("http")) return dec;
    if (signedPdf && signedPdf.startsWith("http")) return signedPdf;
    if (signedPdf && signedPdf.includes("URLPrefix=")) {
        try {
            const b64 = signedPdf.split("URLPrefix=")[1].split("&")[0].split("~")[0];
            const decoded = atob(decodeURIComponent(b64));
            if (decoded.startsWith("http")) return decoded;
        } catch {}
    }
    return signedPdf || dec || "";
};

window.formatCardTimeLabel = function(rawTime) {
    const str = String(rawTime || "60").trim();
    if (str.includes("+")) {
        const parts = str.split("+").map(n => parseInt(n.trim()) || 0);
        const sum = parts.reduce((a, b) => a + b, 0);
        return `${sum} Mins (Sec)`;
    }
    return `${str} Mins`;
};


// --- Test Grid Engine ---
window.renderTestTitlesGrid = function(list, tsId) {
    const grid = document.getElementById("mainGrid");
    if (!list || !list.length) {
        grid.innerHTML = `<div class="col-span-full p-10 text-center font-bold text-slate-600">No tests available in this section.</div>`;
        return;
    }

    grid.innerHTML = "";
    list.forEach((t, idx) => {
        const tKey = `test_${t.id || idx}`;
        const pdfUrl = window.resolvePdfUrl(t.pdf_url || t.test_solutions_pdf || t.pdf_summary_link, t.pdf_url);
        state.testMap[tKey] = { ...t, seriesId: tsId || t.test_series_id, resolvedPdf: pdfUrl };

        const timeLabel = window.formatCardTimeLabel(t.time);
        const isSectional = String(t.time || "").includes("+") || String(t.restrict_part_switching) === "1";
        const hasOptional = String(t.show_sectionselector) === "1";

        grid.innerHTML += `
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
                        ${isSectional ? `<span class="text-rose-600">🔒 Sectional</span>` : ""}
                        ${hasOptional ? `<span class="text-amber-700">📝 Optional Sub</span>` : ""}
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-sky-100">
                    <button onclick="launchCbtTest('${tKey}')" class="btn-watch flex-1 text-xs">🚀 Attempt Live Test</button>
                    ${pdfUrl ? `<button onclick="openTestPdf('${tKey}')" class="btn-pdf1 text-xs">📄 Test PDF</button>` : ""}
                </div>
            </div>`;
    });
};

window.openTestPdf = function(tKey) {
    const t = state.testMap[tKey];
    if (!t || !t.resolvedPdf) return;
    state.currentPdfUrl = t.resolvedPdf;
    document.getElementById("pdfTitle").textContent = `📄 ${t.title} (Paper PDF)`;
    document.getElementById("rawPdfLink").href = t.resolvedPdf;
    window.showSlide("slidePdf");
    window.setPdfMode("appx");
};

window.setPdfMode = function(mode) {
    const frame = document.getElementById("pdfFrame");
    const u = state.currentPdfUrl;
    if (!u) return;
    if (mode === "appx") {
        frame.src = `https://pdfweb.classx.co.in/pdfjs-latest/web/viewer.html?file=${encodeURIComponent(u)}&save_flag=1&is_encrypted=0`;
    } else {
        frame.src = `https://docs.google.com/viewer?url=${encodeURIComponent(u)}&embedded=true`;
    }
};

window.closePdfSlide = function() {
    document.getElementById("pdfFrame").src = "";
    window.showSlide(state.previousSlide || "slideExplorer");
};


// --- Launch Test Engine ---
window.launchCbtTest = async function(tKey) {
    if (typeof window.launchTcsCbtEngine === "function") {
        await window.launchTcsCbtEngine(tKey);
    } else {
        alert("Test Engine not loaded properly.");
    }
};

window.filterGrid = function() {
    const q = document.getElementById("searchBox").value.toLowerCase();
    document.querySelectorAll("#mainGrid .grid-card").forEach(el => {
        el.style.display = el.innerText.toLowerCase().includes(q) ? "" : "none";
    });
};
