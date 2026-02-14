/**
 * Inspectra ReQon AI - Project Sentinel
 * Final Script: Playwright-Ready Validation & State Persistence
 */

// --- DOM Elements ---
const analyzeBtn = document.getElementById('analyze-btn');
const urlInput = document.getElementById('url-input');
const logEl = document.getElementById('activity-log');
const scoreVal = document.getElementById('score-value');
const scoreFill = document.getElementById('score-fill');
const issuesList = document.getElementById('issues-list');
const suggestionsList = document.getElementById('suggestions-list');
const statusText = document.getElementById('status-text');
const uploadTrigger = document.getElementById('upload-trigger');
const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('file-preview-container');
const fileNameDisplay = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file');
const newProjectBtn = document.getElementById('new-project-sidebar');
const projectHistory = document.getElementById('project-history');

// --- State Management ---
let scans = [];

const dummyIssues = [
    { type: 'Functional', desc: 'Broken redirect on Login submit button', sev: 'Critical' },
    { type: 'Accessibility', desc: 'Hero image missing alt text attribute', sev: 'Minor' },
    { type: 'Performance', desc: 'LCP (Largest Contentful Paint) > 2.5s', sev: 'Major' },
    { type: 'UX', desc: 'Conflicting CTA colors on Checkout page', sev: 'Major' }
];

const dummyFixes = [
    "Increase z-index of .modal-overlay to 9999",
    "Add 'aria-label' to mobile hamburger menu",
    "Compress assets in /public/images/hero.png",
    "Standardize button-primary color to #f5824a"
];

// --- Helper Functions ---

/**
 * Playwright-ready URL Validation
 * Ensures the string is a valid absolute URL with http/https protocol.
 */
function isValidPlaywrightUrl(string) {
    try {
        const url = new URL(string);
        const hasProtocol = url.protocol === "http:" || url.protocol === "https:";
        // Ensures there is at least one dot in the domain (e.g., .com, .io)
        const hasTld = url.hostname.includes('.'); 
        return hasProtocol && hasTld;
    } catch (_) {
        return false;
    }
}

function addLog(text, isThinking = false) {
    const p = document.createElement('p');
    p.className = 'log-entry';
    const ts = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    p.innerHTML = `<span class="log-ts">[${ts}]</span> ${isThinking ? '<i>' + text + '</i>' : text}`;
    logEl.prepend(p);
}

function resetDashboard() {
    urlInput.value = "";
    urlInput.disabled = false;
    urlInput.style.borderColor = "var(--border)";
    imageUpload.value = "";
    previewContainer.classList.add('preview-hidden');
    logEl.innerHTML = '<p class="dim">Awaiting input URL to begin autonomous inspection...</p>';
    issuesList.innerHTML = '<p class="dim center">No issues detected yet.</p>';
    suggestionsList.innerHTML = '<p class="dim center">Waiting for analysis...</p>';
    scoreVal.innerText = "--";
    scoreFill.style.width = "0%";
    statusText.innerText = "Ready";
    statusText.style.color = "var(--text-dim)";
    statusText.style.background = "#27272a";
}

// --- Core Logic ---

async function startAnalysis() {
    const rawUrl = urlInput.value.trim();
    const hasImage = imageUpload.files.length > 0;

    // 1. Validation (Playwright Compatibility)
    if (!hasImage) {
        if (!rawUrl) {
            alert("Please enter a destination URL.");
            return;
        }
        if (!isValidPlaywrightUrl(rawUrl)) {
            alert("Invalid Format: Playwright requires an absolute URL starting with http:// or https://");
            urlInput.style.borderColor = "#ef4444";
            return;
        }
    }

    const activeTarget = hasImage ? imageUpload.files[0].name : rawUrl;

    // 2. UI Reset
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Analyzing...";
    logEl.innerHTML = "";
    issuesList.innerHTML = "";
    suggestionsList.innerHTML = "";
    urlInput.style.borderColor = "var(--border)";
    
    statusText.innerText = "Inspecting...";
    statusText.style.background = "#f5824a22";
    statusText.style.color = "#f5824a";

    // 3. Simulation
    if (hasImage) {
        addLog(`Image Source: ${activeTarget}. Initiating Computer Vision Scan...`);
    } else {
        addLog(`Initializing Playwright browser context...`);
        addLog(`Navigating to ${activeTarget}`, true);
    }
    
    await new Promise(r => setTimeout(r, 1000));
    addLog(`Scanning DOM tree and network logs...`);
    await new Promise(r => setTimeout(r, 800));

    // Detection Loop
    for (const issue of dummyIssues) {
        addLog(`[Detected] ${issue.type}: ${issue.desc}`);
        const div = document.createElement('div');
        div.className = 'issue-item';
        div.innerHTML = `<strong>${issue.type}</strong><br><span class="dim">${issue.desc}</span>`;
        issuesList.appendChild(div);
        await new Promise(r => setTimeout(r, 400));
    }

    // Results Generation
    const finalScore = Math.floor(Math.random() * (92 - 68 + 1)) + 68;
    scoreVal.innerText = finalScore;
    scoreFill.style.width = finalScore + "%";

    dummyFixes.forEach(fix => {
        const div = document.createElement('div');
        div.className = 'fix-item';
        div.innerText = `Suggested: ${fix}`;
        suggestionsList.appendChild(div);
    });

    addLog(`Analysis finalized. Hygiene Score: ${finalScore}/100`);
    statusText.innerText = "Completed";
    statusText.style.background = "#10b98122";
    statusText.style.color = "#10b981";
    analyzeBtn.disabled = false;
    analyzeBtn.innerText = "Analyze";
}

// --- Navigation & History ---

newProjectBtn.addEventListener('click', () => {
    const currentName = urlInput.value || (imageUpload.files[0] ? imageUpload.files[0].name : "");
    const currentScore = scoreVal.innerText;

    // Save state if analysis was completed
    if (currentScore !== "--") {
        scans.push({
            id: Date.now(),
            name: currentName,
            score: currentScore,
            logs: logEl.innerHTML,
            issues: issuesList.innerHTML,
            suggestions: suggestionsList.innerHTML,
            status: statusText.innerHTML,
            statusStyle: { bg: statusText.style.background, color: statusText.style.color }
        });
        renderHistory();
    }
    resetDashboard();
});

function renderHistory() {
    projectHistory.innerHTML = scans.length === 0 ? '<p class="history-empty">No recent scans</p>' : '';
    
    scans.slice().reverse().forEach(scan => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `<span>${scan.name}</span> <small style="float:right; color:var(--accent)">${scan.score}</small>`;
        item.onclick = () => loadScan(scan.id);
        projectHistory.appendChild(item);
    });
}

function loadScan(id) {
    const scan = scans.find(s => s.id === id);
    if (!scan) return;

    urlInput.value = scan.name;
    scoreVal.innerText = scan.score;
    scoreFill.style.width = scan.score + "%";
    logEl.innerHTML = scan.logs;
    issuesList.innerHTML = scan.issues;
    suggestionsList.innerHTML = scan.suggestions;
    statusText.innerHTML = scan.status;
    statusText.style.background = scan.statusStyle.bg;
    statusText.style.color = scan.statusStyle.color;
}

// --- Event Listeners ---

analyzeBtn.addEventListener('click', startAnalysis);

uploadTrigger.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        fileNameDisplay.innerText = `📎 Attached: ${this.files[0].name}`;
        previewContainer.classList.remove('preview-hidden');
        urlInput.value = "";
        urlInput.disabled = true;
        urlInput.placeholder = "Pixel inspection active...";
    }
});

removeFileBtn.addEventListener('click', () => {
    imageUpload.value = "";
    previewContainer.classList.add('preview-hidden');
    urlInput.disabled = false;
    urlInput.placeholder = "Enter URL or upload a screenshot...";
});