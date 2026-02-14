# src/automation/__init__.py
from .browser import BrowserManager
from .telemetry import TelemetryCollector
from .actions import SmartActions

__all__ = ["BrowserManager", "TelemetryCollector", "SmartActions"]