import json
import os
from pathlib import Path
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama

# Absolute pathing for .env stability on Linux
base_dir = Path(__file__).resolve().parent.parent.parent
env_path = base_dir / ".env"
load_dotenv(dotenv_path=env_path)

from .state import AgentState
from .prompts import SYSTEM_PROMPT_INSPECTOR
from src.automation import BrowserManager, TelemetryCollector, SmartActions
from src.inspectors.scoring import calculate_hygiene_score

# --- Nodes ---

async def perception_node(state: AgentState):
    url_to_scan = state["current_page_url"]
    print(f"🌐 [Perception] Navigating to: {url_to_scan}")

    bm = BrowserManager()
    page = await bm.start(headless=True)
    
    try:
        telemetry = TelemetryCollector(page)
        actions = SmartActions(page)
        await telemetry.start_listening()
        await actions.navigate(url_to_scan)

        page_data = await telemetry.capture_state(filename=f"scans/latest_scan.png")
        
        # Return only the keys that need updating
        return {
            "page_data": page_data,
            "visited_urls": state.get("visited_urls", []) + [url_to_scan]
        }
    except Exception as e:
        print(f"⚠️ [Perception Error]: {e}")
        return {"page_data": {"error": str(e)}}
    finally:
        await bm.stop()
    
async def reason_node(state: AgentState):
    print("🧠 [Reasoning] Analyzing telemetry with Ollama (Llama 3)...")
    
    llm = ChatOllama(
        model="llama3.2", 
        format="json", 
        temperature=0 
    )
    
    # Pre-processing features (Data Scientist approach)
    raw_tree = state["page_data"].get("accessibility_tree", "No tree available")
    tree_str = json.dumps(raw_tree) if isinstance(raw_tree, dict) else str(raw_tree)
    
    telemetry_summary = {
        "logs": state["page_data"].get("console_logs", [])[:10],
        "accessibility_tree_fragment": tree_str[:2500] # Slightly more context
    }
    
    # 3. Refined "Grounding" Prompt
    # We explicitly tell it to return [] if no issues are found.
    prompt = f"""
    You are a professional QA Web Inspector. Your task is to extract real technical issues from the provided JSON data.
    
    CRITICAL RULES:
    1. Only report issues present in the 'logs' or 'accessibility_tree_fragment'.
    2. If no clear errors (like 404s, failed scripts, or missing aria-labels) are found, return "defects": [].
    3. Do NOT invent issues.
    4. Severity: 5 (Critical/Crash), 1 (Minor/Typo).
    5. IGNORE the 'Root' role. Only report accessibility issues for interactive elements like buttons, links, and inputs that are missing names or labels.
    6. If a link has an 'href', it is likely valid; do not flag it for a missing 'name' attribute.
    7. If the page looks standard (like Google), be very conservative with penalties.
    8. If the page is a known login page (like GitHub's), expect some console warnings but only flag critical ones (like failed API calls or missing form labels).
    9. Only report a 'Missing Aria Label' if the button has NO text content.
   
    DATA TO ANALYZE:
    {json.dumps(telemetry_summary)}

    RESPONSE FORMAT (JSON ONLY):
    {{
        "page_type": "string",
        "defects": [
            {{"type": "string", "severity": 1-5, "description": "string"}}
        ]
    }}
    """
    
    response = await llm.ainvoke(prompt)
    
    print(f"DEBUG - Raw Ollama Output: {response.content}")

    try:
        findings = json.loads(response.content)
    except Exception as e:
        print(f"⚠️ JSON Parse Error: {e}")
        findings = {"defects": [], "page_type": "Error"}

    # Ensure defects is a list
    defects = findings.get("defects", [])
    if not isinstance(defects, list):
        defects = []

    # Calculate score using your scoring.py
    score = calculate_hygiene_score(defects)
    
    print(f"📊 [Result] Score: {score} | Issues: {len(defects)}")
    
    return {
        "defects": defects,
        "page_type": findings.get("page_type"),
        "hygiene_score": score,
        "next_action": "stop"
    }
# --- Routing ---

def should_reason(state: AgentState):
    return "reason" if "error" not in state["page_data"] else END

def should_continue(state: AgentState):
    return END 

# --- Graph Construction ---

workflow = StateGraph(AgentState)

workflow.add_node("perceive", perception_node)
workflow.add_node("reason", reason_node)

workflow.set_entry_point("perceive")
workflow.add_conditional_edges("perceive", should_reason)
workflow.add_conditional_edges("reason", should_continue)

inspectra_graph = workflow.compile()