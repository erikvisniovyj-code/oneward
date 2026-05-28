# Compass - Fight Procrastination through Action

Compass is a minimalist, single-page cognitive productivity tool built with React, TypeScript, and Tailwind CSS. It is architected specifically to help users defeat procrastination by correcting a fundamental biological mismatch: the brain rewards dreaming about and planning a target (releasing dopamine for anticipation) instead of completing it. 

The core philosophy of Compass is simple: action buys the dream, never the other way around. The application refuses to celebrate planning, capturing, or list-making. It reserves positive feedback exclusively for the friction of starting and completing real actions.

---

## Core Philosophy & Design

### 1. No Reward for Planning
Capturing or "parking" a task provides no celebration, no visual flare, and no notifications. It is a quiet, mechanical storage process. Capturing does not change your progress.

### 2. Complete Action Over Lists
Instead of visual scatter, the suggestions engine guides you on exactly ONE task at any time, calculated dynamically by the Importance Engine based on wait time, active priorities, and human impacts.

### 3. Consequence-Driven Metrics
Procrastination thrives on simulated safety. Compass surfaces the real consequence of inaction by connecting chores directly to the specific people affected if the item remains ignored.

### 4. Noise Release as a Win
Decluttering your agenda and throwing away unneeded dreams ("burying noise") is celebrated with identical weight as task execution. Pruning your list keeps focus sharp.

---

## Key Features & App Structure

- **Screen 1: Capture**: A neat, distraction-free input box to park tasks quietly. Implements the Web Speech API for voice dictation with a graceful fallback. After parking, prompts with a quick consequence connection question.
- **Screen 2: Today (The Suggestion Engine)**: Scopes options down to a single task card. Includes a "Frog Mode" toggle which bypasses current fuel levels to suggest the oldest, hardest important tasks first, forcing you to use peak willpower.
- **Screen 3: Execute**: Demands high visual focus. Starts with a strict 2-minute "ignition" countdown designed purely to break starting friction. Once the 2 minutes elapse, it transitions into a count-up flow stopwatch with adaptive feedback ("You are in flow", "This is a real sprint"). Lets you log progress milestones on the fly.
- **Screen 4: The Mirror**: Tracks your proof of progress through a combination of metrics: weekly and monthly counts with self-comparisons to previous periods, a highlight list of long-hibernating tasks (waited >30 days) conquered, an active streak indicator, a separate count of buried noise tasks, and a horizontal live thread meter.
- **Backlog / Basement**: Stashes away parked intentions, allowing you to search files, tune prioritization weight details inline, or activate weekly reviews where you filter 3-5 tasks to prune context.

---

## Priorities Engine Logic

Each task is scored by combining:
- **Priority Thread (+100 or -100)**: Actions aligned with active life directions score higher; dormant directions are heavily penalized.
- **Inaction Consequence (up to +150)**: How bad is the outcome if deleted or ignored? This drives the calculation.
- **Leverage Potential (up to +40)**: Does doing this cancel, automate, or unlock other friction?
- **Avoidance Age (linear scale)**: The longer an important task has waited, the heavier its weight, urging you to face it.
- **Daydream Antagonist (inverted penalty)**: Ideas that feel incredibly pleasant to mere fantasizing are penalized slightly to protect you from the "imaginary success" trap.

---

## File Hierarchy

```text
/src
  ├── types.ts              # Fully typed model descriptions (AppState, Task, Direction)
  ├── data.ts               # Priorities engine score equations, auto-completers, and initial seeds
  ├── main.tsx              # Primary react hook target
  ├── App.tsx               # Screen coordinator & Global state synchronize mechanisms
  ├── components
        ├── Capture.tsx     # Parking interface & Web Speech logic
        ├── Today.tsx       # Suggerter screen & Frog Mode logic
        ├── Execute.tsx     # Action timer & Flow stopwatch tracker
        ├── Mirror.tsx      # Proof statistics & CSS horizontal bar graphics
        ├── Backlog.tsx     # Basement searches, review workflows, & inline tuning
        └── Coach.tsx       # Contextual behavior-driven advice line
```

---

## How to Run Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Setup Instructions
1. Install initial dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open the browser pointing to [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal output) to explore.

### Build and Package
To compile all modules and build optimized static assets:
```bash
npm run build
```
This command outputs fully compiled, static files in the `/dist` path, which can be deployed to static hosts (like Vercel, Cloud Run, or Netlify).
