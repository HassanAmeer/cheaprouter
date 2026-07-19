# Prompt for Project Completion & Feature Enhancements

**Objective:**
Analyze the existing `cheapmodels` project and implement all missing features, API integrations, page structures, and UI/UX improvements. The goal is to transform the current UI into a fully functional, production-ready application with connected backends and interactive data visualization.

Please execute the following requirements step-by-step:

---

## 1. API Integrations & Connectivity
- **Integrate AI Providers:** Connect the application to major AI APIs, specifically **OpenAI, Anthropic (Claude), Google (Gemini), and ChatGPT**.
- **Unified Routing:** Set up proper API routes (e.g., Next.js Route Handlers) to securely handle requests to these third-party services.
- **Model Management:** Ensure the system can dynamically fetch and utilize models from these providers, tracking usage and token limits.

## 2. UI/UX Interactivity & Feedback
- **API Key "Test" Flow:** On the Providers or API Keys page, when a user adds or attaches an API key, add a **"Test" button**. 
  - Clicking this button must trigger a loading animation/spinner.
  - Upon completion, display a success or error Toast message (e.g., `"Successfully attached!"` or `"Invalid API Key"`).
- **Global Toast System:** Implement a global notification system (e.g., using `sonner` or `react-hot-toast`) for success, error, and info messages across the app.
- **Loading & Empty States:** Add skeleton loaders for all data-fetching components. Implement well-designed empty states for tables, charts, and lists.
- **Modals & Dialogs:** Build reusable modals for actions like "Generate Key", "Revoke Key", and "Add Provider".

## 3. Page-by-Page Improvements

### Landing Page
- **Fix Broken Routes:** Ensure all CTAs (e.g., `/chat`, `/cli`, `/pricing`) route to actual pages.
- **Navigation:** Add a responsive, blur-on-scroll navbar with a mobile hamburger menu.
- **Animations:** Implement scroll-reveal animations and hover micro-interactions to make the page feel premium and dynamic.

### Login / Signup
- **Authentication Flow:** Connect the UI to a real authentication provider (e.g., NextAuth, Supabase, or Firebase).
- **Protected Routes:** Ensure the `/dashboard` and all sub-routes are strictly gated and inaccessible to unauthenticated users.
- **Onboarding:** Create a post-signup onboarding flow (e.g., "Create your first API Key").

### Documentation Page (`/docs`)
- **Structure:** Convert the single page into a multi-section routing tree with a sidebar (e.g., Introduction, Quickstart, API Reference).
- **Interactivity:** Add interactive code blocks with a "Copy to Clipboard" button that triggers a success Toast.

### User Dashboard
- **Overview (`/dashboard/overview`):** Populate with real, summarized metrics.
- **API Keys (`/dashboard/keys`):** Make the table fully interactive. Implement generating, testing, copying (with toast), and revoking keys.
- **Providers (`/dashboard/providers`):** Complete the flow to connect/disconnect Open AI, Claude, and Gemini with the Test button workflow.
- **Settings (`/dashboard/settings`):** Make the settings form functional (saving user profile, updating billing info, handling state).

## 4. Analytics & Data Visualization (`/dashboard/analytics`)
Replace placeholder CSS charts with a real charting library (e.g., `Recharts`, `Chart.js`, or `Tremor`). Implement the following visual analytics:
- **Token Usage Over Time:** A line or area chart showing tokens spent daily/weekly/monthly.
- **Model Usage Breakdown:** A donut or pie chart visualizing the distribution of different models used (e.g., GPT-4 vs. Claude 3).
- **Cost Tracking:** A bar chart showing cost per provider or cost per day.
- **Recent Activity Table:** A detailed log showing:
  - Which model was used.
  - How many tokens were spent.
  - Timestamp of the request.
  - Success/Failure status.

## 5. Missing Pages to Build
- **`/chat` (Playground):** An interactive chat interface where users can select a model, send a prompt, and see the streamed response (to test their attached APIs).
- **`/cli`:** A page dedicated to CLI instructions, installation commands, and examples.
- **`/pricing`:** A dedicated pricing page with tier comparisons and a checkout flow.

---
**Execution Instructions:**
Start by setting up the global Toast and UI primitives, then implement the API connection and Test flow for Providers. Move on to building the missing pages and conclude by integrating the Analytics charting library. Ensure the code is clean, responsive, and follows modern React/Next.js best practices.
