from typing import TypedDict, List, Optional, Annotated
import operator

class AgentState(TypedDict):
    # Input from UI
    target_url: str
    
    # Tracking
    current_page_url: str
    visited_urls: Annotated[List[str], operator.add]
    
    # Data from Telemetry
    page_data: dict # Screenshot path, accessibility tree, logs
    
    # AI Analysis
    page_type: Optional[str] # e.g., "Login", "Dashboard"
    defects: Annotated[List[dict], operator.add]
    hygiene_score: float
    
    # Control flow
    next_action: str # "navigate", "click", "stop"
    action_details: Optional[dict] # e.g., {"selector": "#login-btn"}