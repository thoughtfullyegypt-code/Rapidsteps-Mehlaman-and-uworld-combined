# Rapid Steps Interaction Specification (`INTERACTIONS.md`)

This document defines the comprehensive interaction physics, micro-interactions, state machines, easing curves, and accessibility contracts implemented throughout the Rapid Steps v2 codebase.

---

## 1. Motion Principles & Standardized Curves

To prevent visual cacophony, all transitions throughout Rapid Steps map strictly to four standardized timing curves:

| Curve Name | Value | Duration | Purpose / Context |
| :--- | :--- | :--- | :--- |
| **Standard** | `cubic-bezier(0.2, 0.0, 0, 1.0)` | 200ms – 240ms | Color shifts, opacity, background crossfades, elevation shadows |
| **Emphasized** | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | 280ms – 360ms | Sheet slide-in, modal scale-in, tab line glide, drawer expand |
| **Spring** | `cubic-bezier(0.34, 1.56, 0.64, 1.0)` | 300ms – 400ms | Magnetic cards, checkmark reveals, bookmark bounce, chip pop |
| **Exit / Fast**| `cubic-bezier(0.3, 0.0, 0.8, 0.15)` | 150ms – 180ms | Dialog dismissal, dropdown collapse, toast fade-out |

### `prefers-reduced-motion: reduce` Rewrite Rule
When `prefers-reduced-motion: reduce` is detected (via CSS media query `@media (prefers-reduced-motion: reduce)` or `motion.ts` utility):
1. **Springs, flips, shakes, and 3D tilts are completely disabled.**
2. Transitions collapse to simple opacity fades with a cap of `≤ 150ms`.
3. Particle canvas simulation halts rendering animation frames.
4. Smooth inertial scrolling (Lenis) is disabled in favor of native instant scrolling.
5. Custom cursor morphing is suppressed.

---

## 2. Interaction Contract Matrix

Every interactive element follows deliberate tactile feedback across six discrete interaction states:

| Element | Idle | Hover | Press / Active | Focus-Visible | Disabled / Loading | Transition (Duration, Easing) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary CTA Button** (`.rs-btn-primary`) | Solid orange `#C2410C`, white bold text, subtle shadow `0 4px 14px rgba(194,65,12,0.3)` | `#EA580C`, translateY(-1px), shadow expands `0 8px 24px rgba(194,65,12,0.4)` | `#9A3412`, translateY(1px), scale(0.98), shadow shrinks | 2px solid `#38BDF8`, 2px offset | Opacity 0.5, cursor `not-allowed`, pulse spinner | 200ms `standard` |
| **Secondary Button** (`.rs-btn-secondary`) | Glass background `rgba(255,255,255,0.06)`, border `rgba(255,255,255,0.12)` | Glass `rgba(255,255,255,0.12)`, border `rgba(255,255,255,0.25)`, translateY(-1px) | Scale(0.98), background `rgba(255,255,255,0.16)` | 2px solid `#38BDF8`, 2px offset | Opacity 0.45, cursor `not-allowed` | 180ms `standard` |
| **Ghost / Icon Button** (`.rs-btn-icon`) | Transparent, text muted slate (`#64748B` / `#94A3B8`) | Background `rgba(255,255,255,0.08)`, text brightens | Scale(0.92), background `rgba(255,255,255,0.14)` | Ring-2 `#38BDF8` with ring-offset-2 | Opacity 0.35, pointer-events `none` | 150ms `standard` |
| **Text Link** (`a:not([class*="btn"])`) | Inline colored, subtle underline or border-b transparent | Underline decoration thickness 2px, opacity 100% | Opacity 70% | 2px outline `#38BDF8` with rounded corners | Muted gray `#475569`, cursor default | 150ms `standard` |
| **Magnetic Card** (`.rs-card-tilt`) | Flat transform `rotateX(0deg) rotateY(0deg) translateZ(0)` | 3D perspective tilt towards mouse pointer, glow highlight follows cursor | Scale(0.99) | Ring-2 `#38BDF8` around card container | Static without tilt, glow hidden | 350ms `spring` exit / instant tracking |
| **Pricing Card (Tier 1/2/3)** | Border `slate-200` (light) / `white/10` (dark), base elevation | Border orange (highlighted tier) or `white/20`, scale(1.015), glow radial | Scale(0.99) | 2px solid `#FF8C1A` offset 3px | Dimmed when modal checkout active | 240ms `emphasized` |
| **Bento Grid Tile** | Dark glass card, static preview state, muted badges | Border lightens, demo controls pulse, cursor morphs to `pointer` | Scale(0.995) | Ring-2 `#38BDF8` around tile perimeter | Not applicable (always interactive) | 220ms `standard` |
| **FAQ Accordion Header** (`.rs-faq-btn`) | Neutral question text, chevron rotated 0deg | Text brightens to orange, subtle row background tint | Scale(0.998) | Visible focus border with rounded-xl | Static if non-collapsible | 260ms `emphasized` (chevron rotates 180deg) |
| **FAQ Accordion Content** | Collapsed `grid-rows-[0fr]`, opacity 0, pointer-events none | Not applicable | Not applicable | Focus stays on trigger | Not applicable | 300ms `emphasized` grid row expansion |
| **Nav Link** | Text slate-600 / slate-400, no pill | Background `white/10`, text slate-900 / white | Scale(0.96) | 2px solid `#38BDF8` ring | Disabled during modal transitions | 160ms `standard` |
| **Logo** (`.rs-logo`) | Original dual-path SVG mark, sharp contrast | Opacity 85%, scale(1.02) | Scale(0.96) | Ring-2 `#38BDF8` offset 4px around logo anchor | Static | 200ms `standard` |
| **Theme Toggle** | Moon / sun icon with subtle rounded background | Rotate(15deg), background `white/12` | Rotate(-20deg) scale(0.9) | Ring-2 `#38BDF8` | Not disabled | 250ms `spring` icon swap |
| **Custom Cursor** (`.rs-cursor`) | 8px dot + 32px lagging ring, lerping `0.15` | Ring expands to 52px, opacity 0.5, border orange | Ring contracts to 24px, dot expands to 12px | Hidden on keyboard navigation | Hidden on coarse pointers (touch screens) | Real-time `requestAnimationFrame` lerp |
| **Map Node (Free)** | Emerald border, dot green, badge "FREE" | Scale(1.08), shadow `0 0 16px rgba(16,185,129,0.4)` | Scale(0.96) | Ring-2 `#10B981` offset 2px | Not disabled | 200ms `spring` |
| **Map Node (Locked)** | Slate border, padlock icon, opacity 0.75 | Padlock jiggles 4deg, opacity 1.0, preview tooltip | Scale(0.96) -> triggers unlock modal | Ring-2 `#F59E0B` | Not disabled | 220ms `spring` |
| **Map Node (Mastered)** | Solid checkmark badge, cyan border glow | Scale(1.06), pulse glow | Scale(0.96) | Ring-2 `#06B6D4` | Not disabled | 200ms `spring` |
| **System Accordion Row** | Collapsed header showing system name and progress fraction | Background `white/5`, arrow rotates 90deg | Scale(0.995) | Ring-2 `#38BDF8` offset 1px | If 0 cases, muted | 280ms `emphasized` drawer unfold |
| **Case Section Accordion** | Section title, chevron right, preview snippet | Row tint, border-l 2px orange | Scale(0.99) | Visible focus border | Locked section displays lock pill | 240ms `emphasized` |
| **Drill Option (Idle)** | Border `slate-200` / `white/10`, radio empty | Border orange, background `orange/5` | Scale(0.99) | Ring-2 `#FF8C1A` | Option locked after submission | 180ms `standard` |
| **Drill Option (Selected)** | Border `orange-500`, background `orange/10` | Subtle brightness boost | Scale(0.99) | Ring-2 `#FF8C1A` | Disabled when question graded | 180ms `standard` |
| **Drill Option (Correct)** | Emerald border `#10B981`, background `emerald/15`, check icon | Not applicable (graded state) | Not applicable | Ring-2 `#10B981` | Disabled with explanation expanded | 260ms `spring` bounce check |
| **Drill Option (Incorrect)** | Red border `#EF4444`, background `red/15`, cross icon, shake animation | Not applicable (graded state) | Not applicable | Ring-2 `#EF4444` | Disabled with explanation expanded | 260ms `spring` with 4px shake |
| **Active Recall Mask** | Blur `blur(6px)`, text hidden or masked with pill | Hover previews hint "Click or press Space to reveal" | Instant unmask on click | Ring-2 `#38BDF8` | Disabled in read-only mode | 200ms `standard` filter deblur |
| **Bookmark / Flag Icon** | Outline bookmark/flag, opacity 60% | Opacity 100%, scale(1.15) | Scale(0.85) -> spring pop to 1.25 -> 1.0 | Ring-2 `#F59E0B` | Disabled during network sync | 300ms `spring` |
| **Search Trigger & Field** | Glass pill with `[/]` shortcut badge | Border `slate-400` / `white/20`, shortcut kbd glows | Opens modal instantly | Focus inside input: caret blue, no ring | Disabled if offline (never) | 200ms `emphasized` modal overlay |
| **Search Result Row** | Muted item row with system pill | Highlighted background `blue/10`, arrow indicator | Selected and navigated via `#<caseId>` | Arrow navigation selection state | Not applicable | 120ms `standard` |
| **Breadcrumb Chip** | Text slate-400, small pill | Text white, underline | Scale(0.95) | Ring-2 `#38BDF8` | Current page item has `aria-current="page"` | 150ms `standard` |
| **App Tab Item** (`.rs-tab`) | Slate text, indicator bar hidden | Text white / slate-900 | Scale(0.94) | Ring-2 `#38BDF8` on tab | Disabled if view unavailable | 240ms `emphasized` sliding indicator |
| **Toast Notification** | Off-screen or hidden | Hover pauses auto-dismiss countdown timer | Swiping right dismisses toast | Focus lands on action button inside | Dismissing fades out and scales to 0.95 | 280ms `spring` entry / 160ms `exit` |
| **Modal Dialog** (`.rs-modal`) | Unmounted or backdrop opacity 0, scale 0.95 | Cursor on backdrop shows close pointer | Clicking outside dismisses modal | Trapped inside modal container | Submit button shows spinner while busy | 280ms `emphasized` scale+fade |
| **Bottom Sheet** (`.rs-sheet`) | Offscreen translateY(100%) | Drag handle hover indicates grabbable | Dragging tracks touch pointer 1:1 with inertia | Focus trapped in sheet container | Disabled during route transition | 320ms `emphasized` sheet slide |
| **Skeleton Loader** | Shimmer gradient moving left-to-right across bone | Shimmer continues steadily | Non-clickable | Non-focusable (`aria-hidden="true"`) | In `prefers-reduced-motion`: static solid gray | 1.4s infinite linear shimmer loop |
| **Cheatsheet / Tooltip** (`?`) | Hidden | Fade-in after 300ms hover delay | Instant appearance on touch hold | Visible on element focus | Auto-dismissed on Esc | 180ms `standard` fade |
| **Sign-in Input Field** | Inset border `slate-300` / `white/15`, neutral placeholder | Border `slate-400` / `white/25` | Cursor active | Border `#38BDF8`, glow ring `0 0 0 3px rgba(56,189,248,0.2)` | Background gray-100, cursor `not-allowed` | 180ms `standard` |
| **Locked Case CTA Pill** | Padlock + "Unlock 1,079 Cases" orange button | Button brightens, subtle pulse | Triggers unlock modal with preselected tier | Ring-2 `#FF8C1A` offset 2px | Spinner during checkout init | 200ms `standard` |

---

## 3. Touch, Pointer, and Keyboard Parity

1. **No Hover-Only Information**:
   - Any tooltip or detail exposed via pointer hover is equally accessible via keyboard focus (`focus-visible`) and tap / long-press on touch devices.
   - On touch devices (`@media (pointer: coarse)`), custom cursor elements are suppressed from rendering and memory.
2. **Touch Target Sizing**:
   - Every tap target is strictly `≥ 44px × 44px` physical touch area (padded via invisible touch-target wrappers where optical visual elements are smaller).
3. **Keyboard Navigability**:
   - `Tab` / `Shift+Tab`: Logical sequential navigation through all interactive controls.
   - `Enter` / `Space`: Activates buttons, toggles checkboxes, unmasks Active Recall blocks, submits forms.
   - `ArrowUp` / `ArrowDown`: Navigates search results, drill question options, and system lists.
   - `Escape`: Dismisses open modals, search overlays, cheatsheets, and mobile sheets.
   - Global hotkeys:
     - `/` or `Cmd+K` / `Ctrl+K`: Opens quick buzzword search modal.
     - `?`: Opens keyboard shortcut cheatsheet.
     - `R`: Toggles Active Recall masking mode.
     - `F`: Toggles fullscreen Focus Mode.
     - `Esc`: Closes dialogs or exits Focus Mode.
