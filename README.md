# Rapid Steps v2 — USMLE Step 1 Buzzword Atlas

A production-grade, cinematic web application and clinical atlas for medical students studying for the USMLE Step 1 exam. Built with Vite, React 18, TypeScript, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm, pnpm, or yarn

### Installation & Development
```bash
# Navigate to project directory
cd rapidsteps-v2

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will launch at `http://localhost:5173`.

### Production Build
```bash
# Typecheck and build production bundle
npm run build

# Preview production build locally
npm run preview
```
Production assets are generated in `dist/`.

---

## 🎨 Design System & Theme Engine

### 1. Theme Management
- **Automatic System Preference**: Reads `window.matchMedia('(prefers-color-scheme: dark)')` on first boot.
- **Persistent Toggle**: Stored in `localStorage` under key `rapidsteps_dark_mode` (`"1"` = dark, `"0"` = light; absent = follow system preference).
- **CSS Strategy**: Applies `.dark` class to `document.documentElement` to trigger Tailwind's `dark:` selectors seamlessly.

### 2. Motion & Accessibility
- **Reduced Motion**: Full adherence to `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- When active:
  - Particle neural canvas halts rendering loops.
  - Smooth scrolling falls back to instant jumps.
  - Spring-based animations and 3D tilts collapse into instant cuts or simple fades (`≤ 150ms`).
  - Custom pointer cursor is disabled.
- **Touch Devices**: Automatically disables custom cursor on coarse-pointer screens (`(pointer: coarse)`).
- **Interactive Specs**: See [INTERACTIONS.md](./INTERACTIONS.md) for the exhaustive state table across all UI components.

---

## 🔌 Integration Hooks & Backend Contracts

Rapid Steps v2 preserves the legacy JavaScript integration contracts so Supabase, Paddle, and Cloudflare Turnstile connect with zero code rewrites.

### 1. Supabase Authentication Hooks
Passwordless magic code authentication binds directly to:
- `#server-signin-email`: User email input.
- `#server-signin-code`: 6-digit confirmation code input.
- `#send-code-btn`: Triggers OTP dispatch to user email.
- `#verify-code-btn`: Validates OTP code against Supabase auth.
- **Session Token Storage**: Automatically mirrors token in `localStorage['sb-*-auth-token']`.

### 2. Paddle Billing & Checkout Hooks
Plan cards and modal checkout triggers connect via:
- `#unlock-modal-title`: Unlock modal container heading.
- `#unlock-plan-1m` (`$19` 1-month access).
- `#unlock-plan-6m` (`$50` 6-month access, **Most Popular**).
- `#unlock-plan-1y` (`$79` 12-month access).
- `#paddle-checkout-container`: Mount target for Paddle.js overlay/inline checkout.
- **Discounts**:
  - `STUDY10`: 10% off single plans.
  - `GROUP15`: 15% off group orders (3+ accounts).

### 3. Preserved DOM IDs & CSS Classes
To prevent breaking analytics, legacy scripts (`landing.js`, `nav-auth.js`), or scraper tests:
- **Navigation & Brand**: `.rs-logo`, `.rs-auth-btn`, `.site-nav`
- **Application Shell**: `.rs-app-shell`, `.rs-tabbar`, `.rs-tab`, `.rs-sheet`, `.rs-sheet-title`
- **Case Viewer**: `#case-title`, `#case-syndrome`, `#case-buzzword`, `#case-diagnosis`, `#case-vignette`, `#case-mechanism`, `#case-labs`, `#case-trap`, `#case-quiz`
- **Drill & Decoder**: `#drill-system-filter`, `#drill-syndrome-filter`, `#stem-decoder-title`, `#stem-decoder-input`, `#mistake-picked`, `#mistake-correct`, `#mistake-case`, `#mistake-note`

### 4. Deep Linking & URL Parameters
- `/#<caseId>`: Immediately selects and displays the specified case (e.g. `https://rapidsteps.tech/app/#psgn`).
- `?signin=1`: Opens the email authentication modal automatically on mount.
- `?plans=1`: Opens the pricing/unlock modal immediately.
- `?txn=<transaction_id>`: Displays successful checkout confirmation toast and unlocks session catalog.

---

## 💾 LocalStorage Schema Reference

| Key | Type | Description |
| :--- | :--- | :--- |
| `rapidsteps_dark_mode` | `"1"` \| `"0"` \| absent | Dark mode state (`"1"` dark, `"0"` light, absent = system preference) |
| `rapidsteps_recall_mode` | `"1"` \| `"0"` | Active Recall masking mode |
| `rapidsteps_view_mode` | `"tree"` \| `"map"` | Atlas view mode |
| `step1_mastered_cases` | `string[]` (JSON) | Array of mastered case IDs |
| `rapidsteps_bookmarks` | `string[]` (JSON) | Array of bookmarked case IDs |
| `rapidsteps_flags` | `string[]` (JSON) | Array of flagged/review case IDs |
| `rapidsteps_focus_mode` | `"1"` \| absent | Fullscreen zen mode state |
| `rapidsteps_study_size` | `"normal"` \| `"large"` | Text scaling preference |
| `rapidsteps_review_log` | `Record<string, { timestamp: number, correct: boolean }>` | Spaced repetition log |

---

## 📂 Project Architecture

```
rapidsteps-v2/
├── public/                     # High-res static assets & PWA manifest
│   ├── favicon.svg             # 64x64 SVG icon with navy→rust gradient
│   ├── logo-wordmark.svg       # Standalone vector wordmark
│   ├── og-image.png            # 1200x630 OpenGraph social share card
│   ├── icon-180.png            # Apple touch icon
│   ├── icon-192.png            # Android PWA icon
│   ├── icon-512.png            # High-res PWA icon
│   ├── icon-maskable-512.png   # PWA maskable adaptive icon
│   ├── manifest.webmanifest    # PWA configuration
│   ├── robots.txt              # Search engine directives
│   └── sitemap.xml             # 6 canonical site routes
├── src/
│   ├── app/                    # Atlas application shell & clinical engines
│   │   ├── shell.tsx           # Main split-pane / mobile sheet container
│   │   ├── learn-tree.tsx      # System accordion explorer
│   │   ├── map-view.tsx        # Interactive SVG spatial node map
│   │   ├── case-panel.tsx      # Full clinical case viewer & recall quizzer
│   │   ├── drill.tsx           # NBME-style stem question bank
│   │   ├── decoder.tsx         # Natural language stem keyword decoder
│   │   ├── frameworks.tsx      # 5-Step diagnostic algorithmic frameworks
│   │   ├── search.tsx          # Cmd+K / instant fuzzy search modal
│   │   ├── shortcuts-modal.tsx # Keyboard cheatsheet modal (?)
│   │   └── account.tsx         # Supabase magic-link auth & unlock dialogs
│   ├── components/             # Shared presentation components
│   │   ├── ErrorBoundary.tsx   # Friendly fallback UI for render errors
│   │   ├── canvas-network/     # Neural vascular particle canvas
│   │   ├── footer/             # Site footer with legal links
│   │   ├── logo/               # Vector wordmark component
│   │   ├── nav/                # Glassmorphic top navigation bar
│   │   └── theme-toggle/       # Dark/light theme switcher
│   ├── lib/                    # Foundation utilities & medical catalog
│   │   ├── atlas-data.ts       # Manifest + runtime system loader (fetch from /data/systems/)
│   │   ├── cardio-data.ts      # Shared atlas content types
│   │   ├── catalog.ts          # 16 systems, sample cases, frameworks, stems
│   │   ├── cn.ts               # Tailwind class merger
│   │   ├── cursor.ts           # Interactive lerping cursor
│   │   ├── motion.ts           # Cubic bezier curves and motion helpers
│   │   └── storage.ts          # Typed local storage wrapper
│   ├── pages/                  # Public marketing & legal routes
│   │   ├── home/               # Cinematic landing page
│   │   ├── pricing/            # Standalone pricing with guarantee
│   │   ├── terms/              # Terms of Service (effective 26 Oct 2026)
│   │   ├── privacy/            # Privacy Policy (effective 26 Oct 2026)
│   │   ├── refunds/            # 14-day refund guarantee policy
│   │   └── not-found/          # Custom 404 page
│   ├── styles/                 # Global styles & design tokens
│   │   └── index.css           # Glassmorphism, animations, print rules
│   ├── app.tsx                 # React Router routing configuration
│   └── main.tsx                # React root mount
├── INTERACTIONS.md             # Detailed component interaction table
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## ⚖️ License & Medical Disclaimer

Rapid Steps is an educational review tool created by medical students for medical students preparing for the USMLE Step 1 examination. It does not provide medical advice, diagnosis, or clinical management recommendations. For questions or institutional inquiries, contact `support@rapidsteps.tech`.
