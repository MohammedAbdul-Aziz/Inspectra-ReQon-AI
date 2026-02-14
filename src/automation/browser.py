import asyncio
from playwright.async_api import async_playwright

class BrowserManager:
    def __init__(self):
        self.pw = None
        self.browser = None
        self.context = None

    async def start(self, headless=False):
        self.pw = await async_playwright().start()
        # Launch Chromium (standard for AI agents)
        self.browser = await self.pw.chromium.launch(headless=headless)
        # Create a new context with a standard user agent
        self.context = await self.browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent="Mozilla/5.0 (X11; Linux x86_64) Inspectra-ReQon-AI/1.0"
        )
        return await self.context.new_page()

    async def stop(self):
        if self.context: await self.context.close()
        if self.browser: await self.browser.close()
        if self.pw: await self.pw.stop()