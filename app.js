// =========================================================
// PAID TEST SERIES ONLY PORTAL ENGINE (app.js)
// Upgraded: Domain Buttons, HTML Download & Error Logger
// =========================================================
const AES_KEY = CryptoJS.enc.Utf8.parse("638udh3829162018");

// --- Error Logging System ---
window.errorLogs = [];
window.logError = function(title, msg) {
    const time = new Date().toLocaleTimeString();
    window.errorLogs.unshift(`[${time}] <b>${title}</b>: ${msg}`); // Prepend latest error
    const badge = document.getElementById("errorBadge");
    if(badge) badge.textContent = window.errorLogs.length;
    window.renderErrorLogs();
};

window.openErrorModal = function() {
    document.getElementById("errorModal").classList.remove("hidden");
    window.renderErrorLogs();
};

window.closeErrorModal = function() {
    document.getElementById("errorModal").classList.add("hidden");
};

window.clearErrorLogs = function() {
    window.errorLogs = [];
    const badge = document.getElementById("errorBadge");
    if(badge) badge.textContent = "0";
    window.renderErrorLogs();
};

window.renderErrorLogs = function() {
    const cont = document.getElementById("errorLogContainer");
    if(!cont) return;
    if(window.errorLogs.length === 0) {
        cont.innerHTML = "<div class='text-center text-slate-500 font-bold py-6'>✅ No errors found. System is running perfectly.</div>";
        return;
    }
    cont.innerHTML = window.errorLogs.map(e => `
        <div class="p-3 mb-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-mono break-all leading-relaxed shadow-sm">
            ${e}
        </div>
    `).join('');
};


// --- Multi-Domain Manager System ---
let savedDomains = [];
try {
    savedDomains = JSON.parse(localStorage.getItem("saved_api_domains")) || [];
} catch(e) {
    savedDomains = [];
}

if (!savedDomains || savedDomains.length === 0) {
    savedDomains = ["https://rozgarapinew.teachx.in"];
}

let API_BASE = localStorage.getItem("active_api_domain") || savedDomains[0];

function getSafeHostname(url) {
    try { return new URL(url).hostname; } catch(e) { return url.replace('https://','').replace('http://','').split('/')[0]; }
}

window.openDomainModal = function() {
    const modal = document.getElementById("domainModal");
    if (modal) modal.classList.remove("hidden");
    const input = document.getElementById("customDomainInput");
    if (input) input.value = ""; 
    window.renderDomains();
};

window.closeDomainModal = function() {
    const modal = document.getElementById("domainModal");
    if (modal) modal.classList.add("hidden");
};

// List View for Modal
window.renderDomains = function() {
    const list = document.getElementById("savedDomainsList");
    if (!list) return;
    list.innerHTML = savedDomains.map((d, i) => `
        <div class="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border ${d === API_BASE ? 'border-blue-400 bg-blue-50' : 'border-slate-200'} transition-all mb-2">
            <span class="text-[11px] font-bold ${d === API_BASE ? 'text-blue-700' : 'text-slate-700'} truncate flex-1 cursor-pointer" onclick="setActiveDomain('${d}')">
                ${d === API_BASE ? '✅ ' : '🌐 '} ${d}
            </span>
            <button onclick="removeDomain(${i})" class="text-rose-500 hover:text-rose-700 font-bold text-xs ml-3 px-2">✕</button>
        </div>
    `).join('');
};

// Premium Buttons for Home Screen
window.renderHomeDomains = function() {
    const cont = document.getElementById("homeDomainList");
    if(!cont) return;
    cont.innerHTML = savedDomains.map((d) => {
        const isActive = d === API_BASE;
        return `
        <div onclick="selectAndExploreDomain('${d}')" class="cursor-pointer relative overflow-hidden rounded-2xl p-5 shadow-lg transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-blue-600 to-indigo-700 scale-105 ring-4 ring-blue-300' : 'bg-gradient-to-br from-slate-700 to-slate-900 hover:scale-105 hover:-translate-y-1'} flex flex-col items-center justify-center min-w-[140px] flex-1 max-w-[200px]">
            <div class="text-3xl mb-2">${isActive ? '🌟' : '🏢'}</div>
            <div class="text-white font-black text-sm text-center w-full truncate px-1">${getSafeHostname(d)}</div>
            ${isActive ? '<div class="absolute top-3 right-3 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></div>' : ''}
        </div>
        `;
    }).join('');
};

window.saveCustomDomain = function() {
    const input = document.getElementById("customDomainInput");
    if (input && input.value.trim() !== "") {
        let url = input.value.trim();
        if (url.endsWith("/")) url = url.slice(0, -1);
        if (!url.startsWith("http")) url = "https://" + url;
        
        if (!savedDomains.includes(url)) {
            savedDomains.push(url);
            localStorage.setItem("saved_api_domains", JSON.stringify(savedDomains));
        }
        input.value = "";
        window.logError("Domain Setup", `Added new domain: ${url}`);
        window.setActiveDomain(url);
    } else {
        alert("Please enter a valid URL.");
    }
};

window.setActiveDomain = function(url) {
    API_BASE = url;
    localStorage.setItem("active_api_domain", url);
    window.renderDomains();
    window.renderHomeDomains();
    
    if (state.currentSlide === "slideExplorer") {
        window.openTestSeriesExplorer('paid_ts');
    }
    
    const statusBadge = document.getElementById("apiStatus");
    if (statusBadge) statusBadge.textContent = `● Connected: ${getSafeHostname(API_BASE)}`;
    window.closeDomainModal();
};

window.removeDomain = function(idx) {
    if (savedDomains.length <= 1) {
        alert("Portal chalane ke liye kam se kam 1 domain hona zaruri hai.");
        return;
    }
    const removingActive = savedDomains[idx] === API_BASE;
    window.logError("Domain Setup", `Removed domain: ${savedDomains[idx]}`);
    savedDomains.splice(idx, 1);
    localStorage.setItem("saved_api_domains", JSON.stringify(savedDomains));
    
    if (removingActive) {
        window.setActiveDomain(savedDomains[0]);
    } else {
        window.renderDomains();
        window.renderHomeDomains();
    }
};

window.selectAndExploreDomain = function(url) {
    window.setActiveDomain(url);
    window.openTestSeriesExplorer('paid_ts');
};

// --- HTML Download Engine ---
window.downloadPortalHtml = function() {
    try {
        const htmlContent = "<!doctype html>\n" + document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Coaching_Portal_${getSafeHostname(API_BASE)}.html`;
        a.click();
        URL.revokeObjectURL(url);
        window.logError("Download Success", `HTML Portal file saved for offline use.`);
    } catch(e) {
        window.logError("Download Error", e.message);
    }
};


// --- State Management ---
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


// --- API Caller With Logger ---
window.fetchRawJSON = async function(endpoint) {
    const statusBadge = document.getElementById("apiStatus");
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { "Client-Service": "Appx", "Auth-Key": "appxapi", "source": "website" }
        });
        if(!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        const json = await res.json();
        if (statusBadge) statusBadge.textContent = `● Connected: ${getSafeHostname(API_BASE)}`;
        return json;
    } catch(e) {
        if (statusBadge) statusBadge.textContent = "● Offline / Error";
        window.logError(`Fetch Failed`, `Endpoint: ${endpoint} | Error: ${e.message}`);
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
        grid.innerHTML = `<div class="col-span-full py-12 text-center font-extrabold text-slate-800">❌ No tests found. Check error logs or verify domain.</div>`;
        return;
    }

    const seen = new Set();
    combined.forEach(ts => {
        if (!ts || !ts.id || seen.has(String(ts.id))) return;
        seen.add(String(ts.id));
        const title = (ts.title || "Paid Test Series").replace(/'/g, "");
        const logo = (ts.logo || "https://placehold.co/600x320/4f46e5/ffffff?text=Test+Series").replace(/\\\//g, "/");
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
        const logo = (s.subject_logo || `https://placehold.co/80x80/4f46e5/ffffff?text=${encodeURIComponent(sname.slice(0, 3))}`).replace(/\\\//g, "/");
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
        const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(cipherB64.replace(/\\\//g, "/")) });
        const iv = CryptoJS.enc.Base64.parse(ivB64);
        const dec = CryptoJS.AES.decrypt(cipherParams, AES_KEY, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return dec.toString(CryptoJS.enc.Utf8).replace(/[\x00-\x1F\x7F]/g, "").trim();
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
        window.logError("Test Engine Error", "tcs-engine.js is missing or failed to load.");
        alert("Test Engine not loaded properly. Check logs.");
    }
};

window.filterGrid = function() {
    const q = document.getElementById("searchBox").value.toLowerCase();
    document.querySelectorAll("#mainGrid .grid-card").forEach(el => {
        el.style.display = el.innerText.toLowerCase().includes(q) ? "" : "none";
    });
};


// --- Init Execution ---
if (document.getElementById("apiStatus")) {
    try { document.getElementById("apiStatus").textContent = `● Connected: ${getSafeHostname(API_BASE)}`; } catch(e) {}
}

window.renderHomeDomains();
