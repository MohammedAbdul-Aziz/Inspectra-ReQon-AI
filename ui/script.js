/**
 * Inspectra ReQon AI - Project Sentinel
 * Final Script: Full Integration with Live Scanner & Laser Animation
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

// Live Scanner Elements
const scannerLaser = document.getElementById('scanner-laser');
const liveFrame = document.getElementById('live-frame');
const viewportOverlay = document.getElementById('viewport-overlay');
const statusDot = document.getElementById('status-dot');
const statusLabel = document.getElementById('status-label');
const scanningUrlText = document.getElementById('scanning-url');

// Modal Elements
const modal = document.getElementById('preview-modal');
const closeModal = document.getElementById('close-modal');
const previewFrame = document.getElementById('preview-frame');
const viewSiteBtn = document.getElementById('view-site-btn');

// --- State Management ---
let scans = [];

// --- Helper Functions ---

function isValidPlaywrightUrl(string) {
    try {
        const url = new URL(string);
        const hasProtocol = url.protocol === "http:" || url.protocol === "https:";
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
    viewSiteBtn.classList.add('view-btn-hidden'); 
    
    // Reset Live Scanner UI
    liveFrame.src = "";
    liveFrame.style.opacity = "0";
    scannerLaser.style.display = "none";
    viewportOverlay.style.display = "flex";
    statusDot.className = "dot";
    statusLabel.innerText = "Offline";
    scanningUrlText.innerText = "Idle";

    logEl.innerHTML = '<p class="dim">Awaiting input URL to begin autonomous inspection...</p>';
    issuesList.innerHTML = '<p class="dim center">No issues detected yet.</p>';
    suggestionsList.innerHTML = '<p class="dim center">Waiting for analysis...</p>';
    scoreVal.innerText = "--";
    scoreFill.style.width = "0%";
    statusText.innerText = "Ready";
    statusText.style.color = "var(--text-dim)";
    statusText.style.background = "#27272a";
}

// --- Core Logic: Backend & Scanner Integration ---

async function startAnalysis() {
    const rawUrl = urlInput.value.trim();
    const hasImage = imageUpload.files.length > 0;

    if (!hasImage) {
        if (!rawUrl) return alert("Please enter a destination URL.");
        if (!isValidPlaywrightUrl(rawUrl)) {
            alert("Invalid Format: Use an absolute URL (http:// or https://)");
            urlInput.style.borderColor = "#ef4444";
            return;
        }
    }

    // UI Reset & Scanner Activation
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Analyzing...";
    logEl.innerHTML = "";
    issuesList.innerHTML = "";
    suggestionsList.innerHTML = "";
    
    statusText.innerText = "Inspecting...";
    statusText.style.background = "#f5824a22";
    statusText.style.color = "#f5824a";

    // Activate Live Scanner Visuals
    if (!hasImage) {
        scanningUrlText.innerText = rawUrl;
        viewportOverlay.style.display = "none";
        liveFrame.src = rawUrl;
        liveFrame.style.opacity = "0.6"; // Dim during scan
        scannerLaser.style.display = "block"; // Start Laser
        statusDot.className = "dot dot-online";
        statusLabel.innerText = "Online";
        addLog(`Synchronizing Playwright viewport with ${rawUrl}...`);
    }

    addLog(`Initiating autonomous session with Python Engine...`);

    try {
        const response = await fetch('http://127.0.0.1:8000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: rawUrl })
        });

        if (!response.ok) throw new Error('Engine unreachable. Ensure main.py is running.');

        const data = await response.json();

        // Finish Visual Scan
        scannerLaser.style.display = "none";
        liveFrame.style.opacity = "1";
        addLog(`DOM element traversal complete.`);

        // Update Score & Issues
        scoreVal.innerText = data.score;
        scoreFill.style.width = data.score + "%";
        
        if (data.issues.length === 0) {
            issuesList.innerHTML = '<p class="dim center" style="color:#10b981">No issues detected! Quality is optimal.</p>';
        } else {
            data.issues.forEach(issue => {
                const div = document.createElement('div');
                div.className = 'issue-item';
                div.innerHTML = `<strong>${issue.type}</strong><br><span class="dim">${issue.desc}</span>`;
                issuesList.appendChild(div);
            });
        }

        data.logs.forEach(msg => addLog(msg));
        statusText.innerText = "Completed";
        statusText.style.background = "#10b98122";
        statusText.style.color = "#10b981";

        if (!hasImage) showViewButton(rawUrl);

    } catch (error) {
        addLog(`Critical Error: ${error.message}`);
        statusText.innerText = "Error";
        statusText.style.background = "#ef444422";
        statusText.style.color = "#ef4444";
        scannerLaser.style.display = "none";
        statusDot.className = "dot";
        statusLabel.innerText = "Error";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "Analyze";
    }
}

// --- Modal & Navigation Logic ---

function showViewButton(url) {
    viewSiteBtn.classList.remove('view-btn-hidden');
    viewSiteBtn.onclick = () => {
        previewFrame.src = url;
        modal.style.display = 'flex';
    };
}

closeModal.onclick = () => {
    modal.style.display = 'none';
    previewFrame.src = ""; 
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        previewFrame.src = "";
    }
};

newProjectBtn.addEventListener('click', () => {
    const currentScore = scoreVal.innerText;
    if (currentScore !== "--") {
        scans.push({
            id: Date.now(),
            name: urlInput.value || "Image Analysis",
            score: currentScore,
            logs: logEl.innerHTML,
            issues: issuesList.innerHTML,
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
        urlInput.disabled = true;
        urlInput.placeholder = "Visual AI Scan active...";
    }
});

removeFileBtn.addEventListener('click', () => {
    imageUpload.value = "";
    previewContainer.classList.add('preview-hidden');
    urlInput.disabled = false;
    urlInput.placeholder = "Enter URL or upload a screenshot...";
});