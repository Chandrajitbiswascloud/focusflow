# focusflow
An autonomous browser security agent that detects phishing websites, intercepts scam messages, blocks crypto wallet credential traps, and evicts tracking cookies in real-time. Built using Python (Flask), Scikit-Learn (Random Forest &amp; NLP), and Manifest V3.
## Directory Map

```text
focusflow/
├── .github/workflows/deploy.yml # GitHub Actions auto-deployment pipeline
├── backend/                  # FocusFlow SQLite3 + Express REST API Server
│   ├── server.js             # API controllers, JWT auth, SQLite schema mappings
│   ├── package.json          # Node dependency configurations
│   └── README.md             # Backend installation and API endpoints guide
│
├── extension/                # FocusFlow Chrome Blocker Extension (Manifest V3)
│   ├── manifest.json         # Extension permission declarations & rule access
│   ├── background.js         # Service worker executing netRequest blocking rules
│   ├── content.js            # Injected script syncing credentials/local unlocks
│   └── blocked.html          # Intercept lock overlay redirect target
│
├── src/                      # Source code (modular, React + ES modules compiled by Vite)
│   ├── index.css             # Main styling index containing Tailwind & Glassmorphism
│   ├── landing/              # Cinematic Space Exploration Landing Page App
│   │   ├── main.jsx          # Entry point mounting App
│   │   ├── App.jsx           # Parent Router layout coordinator
│   │   └── components/       # Custom React modules (HeroSection, FadingVideo, etc.)
│   │
│   └── dashboard/            # FocusFlow Habit & Study Economy Client App
│       ├── main.jsx          # Entry point mounting App
│       ├── App.jsx           # Habit tracking dashboard & Pomodoro timers
│       └── components/       # Component icons & utilities
│
├── index.html                # Entrypoint linking to src/landing/main.jsx
├── focusflow.html            # Entrypoint linking to src/dashboard/main.jsx
├── vite.config.js            # Vite multi-page routing and module bundler config
├── tailwind.config.js        # Extended Tailwind styling tokens configuration
├── postcss.config.js         # Autoprefixer & CSS compilation pipeline
├── sw.js                     # PWA offline asset-caching Service Worker
├── manifest.json             # PWA metadata configuration file
├── icon.svg                  # FocusFlow high-res icon vector asset
├── LICENSE                   # Project MIT License terms
└── package.json              # Workspace script runs & React dependencies
