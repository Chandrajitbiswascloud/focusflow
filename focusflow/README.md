# FocusFlow (Workspace: netfinance)

**Created and Built Entirely by Chandrajit Biswas**

> [!NOTE]
> The root directory of this repository is named `netfinance` (reflecting the original system setup context), but the workspace has been developed to house **FocusFlow**—the credit-based focus economy dashboard and blocker extension—alongside its space-exploration landing page.

---

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
```

---

## 1. FocusFlow Setup Guide

FocusFlow is designed with a **Local-First, Offline-Capable** architecture. It operates entirely offline using browser `localStorage` and synchronizes to the Chrome extension using `window.postMessage`, or hooks into the cloud database when the backend is active.

### A. Run Client Dashboard (PWA)
Simply double-click and open `focusflow.html` in any web browser, or serve it locally.

### B. Run Database Server (Optional)
To run with cloud synchronization:
```bash
cd backend
npm install
npm start
```
The server will initialize a SQLite database file `focusflow.db` and listen on `http://localhost:5000`. In `focusflow.html`, click **☁ Connect Account** to log in or register.

### C. Load & Run the Chrome Blocker Extension
1. Open **Google Chrome** and navigate to `chrome://extensions/`.
2. Turn on **Developer mode** (toggle in the top-right).
3. Click **Load unpacked** and select the `extension/` folder inside this repository.
4. Click **Details** on the FocusFlow extension card, scroll down, and toggle **Allow access to file URLs** to **ON** (this permits synchronization when running PWA files locally).
5. The extension will automatically intercept domains like `youtube.com` and `instagram.com` and redirect them to `blocked.html` unless unlocked with FocusFlow credits.

---

## 2. Running Local Development Server

To run the unified local development environment:
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. Open your browser to:
   * **Space Travel Landing Page**: `http://localhost:5173/` (or the port Vite outputs)
   * **FocusFlow Dashboard Client**: `http://localhost:5173/focusflow.html`

Both entry points are served via Vite using clean modular React (ES Modules) located under `src/landing/` and `src/dashboard/`.

---

## 3. Production Bundling & Build Tooling

To compile the PWA client dashboard and Cinematic Landing Page into a single highly-optimized production distribution:

1. **Install Dev Dependencies**:
   ```bash
   npm install
   ```
2. **Build Distribution**:
   ```bash
   npm run build
   ```
This invokes **Vite** to run Rollup module bundling, compiling the JSX code, and optimizing the styling scripts into the `dist/` directory.

---

## 4. Automatic GitHub Pages Deployment Pipeline

We have configured a **GitHub Actions Workflow** at `.github/workflows/deploy.yml` to automatically host your project:
* Whenever you run a `git push` to your repository on the `main` or `master` branches, GitHub will spin up an environment, run the Vite compiler, and deploy the optimized distribution assets to the `gh-pages` hosting branch.
* Your project will be live, shareable, and fully functional on the web!

---

## 5. Recommended Git Commit Guide (Conventional Commits)

To establish a clear and meaningful commit history, we recommend committing these architectural updates using the following Conventional Commit messages on your local terminal:

```bash
git add package.json vite.config.js postcss.config.js tailwind.config.js src/index.css
git commit -m "build: setup Vite bundler, PostCSS, and Tailwind build environment"

git add LICENSE
git commit -m "chore: add MIT License file"

git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for automatic GitHub Pages deployment"

git add focusflow.html extension/ README.md backend/README.md
git commit -m "feat(focusflow): enable local offline sync, fix extension manifest, and update developer guides"
```

---

## 6. Licensing

This project is licensed under the terms of the MIT License. See [LICENSE](file:///home/chandrajit/Documents/netfinance/LICENSE) for details.


