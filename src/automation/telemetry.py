class TelemetryCollector:
    def __init__(self, page):
        self.page = page
        self.logs = []
        self.network_errors = []

    async def start_listening(self):
        # Catch JS Console Errors
        self.page.on("console", lambda msg: self.logs.append(f"LOG: {msg.text}") if msg.type == "error" else None)
        self.page.on("pageerror", lambda exc: self.logs.append(f"EXCEPTION: {exc}"))
        
        # Defensive handling for network failures
        def handle_failure(req):
            failure = req.failure
            # If failure is an object with error_text, use it. If it's already a string, use that.
            error_msg = getattr(failure, 'error_text', str(failure)) if failure else "Unknown Error"
            self.network_errors.append(f"FAILED: {req.url} - {error_msg}")

        self.page.on("requestfailed", handle_failure)

    async def capture_state(self, filename="snapshot.png"):
        # 1. Visual Snapshot
        try:
            await self.page.screenshot(path=filename, timeout=10000) 
        except Exception as e:
            # We print so you know it failed, but we don't crash the whole script
            print(f"⚠️ Screenshot failed: {e}")
        
        # 2. Accessibility Tree
        # If the snapshot fails or returns a string (like "Tree Unavailable"), 
        # we return a dict to keep the rest of the code from crashing.
        try:
            tree = await self.page.accessibility.snapshot()
            if not isinstance(tree, dict):
                tree = {"role": "Root", "name": "Fallback", "note": str(tree)}
        except Exception:
            tree = {"role": "Root", "name": "Error capturing tree"}
        
        return {
            "screenshot": filename,
            "accessibility_tree": tree,
            "console_logs": self.logs,
            "network_errors": self.network_errors
        }