from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright
import uvicorn
import asyncio

app = FastAPI()

# Enable CORS so your local HTML file can talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_url(data: dict):
    target_url = data.get("url")
    if not target_url:
        raise HTTPException(status_code=400, detail="URL is required")

    async with async_playwright() as p:
        # Launching the Chromium engine you just installed
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            # 1. Start Navigation
            await page.goto(target_url, wait_until="networkidle", timeout=30000)
            
            # 2. Autonomous Inspection Logic
            detected_issues = []
            logs = [f"Successfully connected to {target_url}", "Parsing DOM tree..."]
            
            # --- Check 1: Missing Alt Tags (Accessibility) ---
            images_missing_alt = await page.eval_on_selector_all(
                "img:not([alt])", "imgs => imgs.length"
            )
            if images_missing_alt > 0:
                detected_issues.append({
                    "type": "Accessibility",
                    "desc": f"Found {images_missing_alt} images missing 'alt' attributes.",
                    "sev": "Minor"
                })
                logs.append(f"Visual Audit: {images_missing_alt} accessibility violations.")

            # --- Check 2: SEO & Meta Data ---
            title = await page.title()
            if not title:
                detected_issues.append({
                    "type": "UX/SEO",
                    "desc": "Page title is missing or empty.",
                    "sev": "Major"
                })
            
            # --- Check 3: SSL/Security ---
            is_https = target_url.startswith("https://")
            if not is_https:
                detected_issues.append({
                    "type": "Security",
                    "desc": "Site is not using HTTPS. Information Security risk.",
                    "sev": "Critical"
                })

            # 3. Calculate Product Hygiene Score
            # Starting at 100, deducting based on severity
            score = 100
            for issue in detected_issues:
                if issue["sev"] == "Critical": score -= 25
                elif issue["sev"] == "Major": score -= 15
                else: score -= 5
            
            score = max(0, score) # Ensure score doesn't go negative

            return {
                "url": target_url,
                "score": score,
                "issues": detected_issues,
                "logs": logs,
                "title": title
            }

        except Exception as e:
            return {"error": str(e), "logs": [f"Error: {str(e)}"]}
        finally:
            await browser.close()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)