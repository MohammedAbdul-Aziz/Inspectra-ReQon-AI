# src/agents/__init__.py

from .state import AgentState
from .graph import inspectra_graph
from .prompts import SYSTEM_PROMPT_CLASSIFIER, SYSTEM_PROMPT_INSPECTOR

# This allows you to import everything clearly in other files
__all__ = [
    "AgentState", 
    "inspectra_graph", 
    "SYSTEM_PROMPT_CLASSIFIER", 
    "SYSTEM_PROMPT_INSPECTOR"
]