🕵️‍♂️ Inspectra-ReQon-AIThe Autonomous Sentinel for Digital Hygiene & Functional IntegrityInspectra-ReQon-AI is a next-generation, self-driven QA inspector that evolves traditional automated testing into a truly autonomous agentic workflow.

Moving beyond simple "record-and-replay," it independently navigates complex web ecosystems, identifies patterns, and maps defects through a Defect Knowledge Graph.

🚀 Core Features🤖 Autonomous Discovery: Navigate complex sites using LangGraph & Playwright without manual scripts.

🔑 Intelligent Auth: Seamlessly handles OAuth2, SSO, and Token-based authorization cycles.

🧠 Cognitive Classification: Multimodal AI identifies page types (Dashboards, Wizards, Forms) by control composition.

📊 Defect Knowledge Graph: A Neo4j-powered map linking Pages → Elements → Issues → Severity.

📉 Hygiene Scoring: Real-time algorithmic health index based on defect density and impact.

🛠️ The Tech StackLayerTechnologyOrchestrationLangChain / LangGraphAutomationPlaywright (Python)IntelligenceGPT-4o / Claude 3.5 SonnetKnowledge BaseNeo4j / ChromaDBTelemetryBrowser Console / Network HAR

🏗️ System ArchitectureCode snippetgraph TD

    A[Target URL] --> B[Agentic Crawler]
    B --> C{Multimodal Brain}
    C -->|Detects| D[Functional/UI Bugs]
    C -->|Classifies| E[Hygiene Issues]
    D & E --> F[Defect Knowledge Graph]
    F --> G[Hygiene Score Engine]
    G --> H[Interactive Dashboard]
  

📂 Project Structure

    ├── 📂 src/
    │   ├── 📂 agents/              # The "Brain" (LangGraph Orchestration)
    │   │   ├── __init__.py
    │   │   ├── graph.py            # Main LangGraph definition (Nodes & Edges)
    │   │   ├── state.py            # TypedDict/Pydantic state definitions
    │   │   └── prompts.py          # System prompts for Page Classification & Bug Inspection
    │   ├── 📂 automation/          # The "Body" (Playwright & Browser control)
    │   │   ├── __init__.py
    │   │   ├── browser.py          # Browser initialization & Context management
    │   │   ├── actions.py          # High-level actions (click, type, handle_auth)
    │   │   └── telemetry.py        # Log capture (Console, Network HAR, Screenshot)
    │   ├── 📂 knowledge/           # The "Memory" (Data Persistence)
    │   │   ├── __init__.py
    │   │   ├── graph_db.py         # Neo4j connection & Cypher queries
    │   │   └── vector_db.py        # ChromaDB setup & Page structural embeddings
    │   ├── 📂 inspectors/          # AI Bug Detection Modules
    │   │   ├── __init__.py
    │   │   ├── functional.py       # Logic for detecting broken links/failed forms
    │   │   ├── visual.py           # Vision-based UI/Hygiene detection
    │   │   └── scoring.py          # The Weighted Decay Hygiene Score algorithm
    │   └── 📄 main.py               # Entry point to trigger a scan
    ├── 📂 dashboard/               # Frontend 
    │   ├── 📂 src/
    │   │   ├── 📂 components/      # UI components (Graph visualizer, Score cards)
    │   │   └── App.js              # Main dashboard logic
    │   └── package.json
    ├── 📄 .env                     # API keys (OpenAI, Neo4j Credentials)
    ├── 📄 requirements.txt         # Backend dependencies
    └── 📄 README.md                # Project documentation
⚡ Quick StartClone the repository

Bashgit clone https://github.com/MohammedAbdul-Aziz/Inspectra-ReQon-AI.git

Install DependenciesBashpip install -r requirements.txt

playwright install

Initialize the SentinelBashpython main.py --url "https://target-app.com" --auth "sso"
