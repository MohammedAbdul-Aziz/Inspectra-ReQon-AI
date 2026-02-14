import asyncio
import os
from dotenv import load_dotenv

# Import Automation components
from src.automation import BrowserManager, TelemetryCollector, SmartActions
# Import Agent components
from src.agents import inspectra_graph

# Load environment variables
load_dotenv()

async def run_inspectra(target_url: str):
    """
    The main execution entry point called by the UI/Backend.
    """
    print(f"🚀 Starting Autonomous Scan for: {target_url}")
    
    # 1. Initialize the State for LangGraph
    # This matches the AgentState TypedDict we defined in src/agents/state.py
    initial_state = {
        "target_url": target_url,
        "current_page_url": target_url,
        "visited_urls": [],
        "page_data": {},
        "page_type": None,
        "defects": [],
        "hygiene_score": 100.0,
        "next_action": "start"
    }

    try:
        # 2. Invoke the Graph
        # We use astream to follow the AI's logic in real-time
        async for output in inspectra_graph.astream(initial_state):
            for key, value in output.items():
                print(f"🧠 Node '{key}' completed.")
                # If your teammate uses WebSockets, they would 'emit' the value here
        
        print(f"✅ Inspection complete for {target_url}")
        
    except Exception as e:
        print(f"❌ Critical Error in Brain: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # For local CLI testing, you can still use a hardcoded URL
    # But in production, the FastAPI 'app.py' will call 'run_inspectra(url_from_ui)'
    import sys
    url = sys.argv[1] if len(sys.argv) > 1 else "https://github.com/login"
    asyncio.run(run_inspectra(url))