class SmartActions:
    def __init__(self, page):
        self.page = page

    async def navigate(self, url: str):
       
       try:

        # 1. Use 'domcontentloaded' instead of 'networkidle' for speed
        # 2. Add a custom timeout (e.g., 15 seconds)
        await self.page.goto(url, wait_until="domcontentloaded", timeout=15000)
        
        # 3. Optional: Wait a small buffer for heavy JS
        await self.page.wait_for_timeout(2000) 
       except Exception as e:
        raise Exception(f"Navigation Failed: {str(e)}")

    async def smart_click(self, selector):
        # Ensure element is visible and stable before clicking
        await self.page.wait_for_selector(selector, state="visible")
        await self.page.click(selector)
        await self.page.wait_for_load_state("networkidle")

    async def handle_login(self, username, password, user_field="#user", pass_field="#pass"):
        # Simplified auth handler - your agent will decide the selectors later
        await self.page.fill(user_field, username)
        await self.page.fill(pass_field, password)
        await self.page.keyboard.press("Enter")
        await self.page.wait_for_load_state("networkidle")