# Technical Architecture & Deep Dive

## 1. System Architecture
The "Whole Home OS" follows a **Client-Side RAG (Retrieval Augmented Generation)** architecture. Unlike traditional smart assistants that rely on rigid Intent/Slot filling (like Alexa), this system uses a generative approach to interpret context.

### Data Flow Pipeline:
1.  **State Capture:** The React frontend captures the current state of all devices (Lights, AC, Security) into a JSON object.
2.  **Prompt Engineering:** This JSON state is injected into a System Prompt: *"You are a Smart Home OS. Current State: {JSON}..."*
3.  **Token Optimization:** Before sending to the AI, we analyze token usage. If the prompt exceeds limits, a compression algorithm removes redundant keys.
4.  **Generative Inference:** Google Gemini 3 Flash processes the natural language request (e.g., "It's too dark") and determines the necessary state changes.
5.  **Structured Output:** The AI returns a strict JSON array of actions `[{ device_id: "light_1", action: "turn_on" }]`.
6.  **State Execution:** The frontend parses this JSON and updates the React State, triggering UI re-renders.

## 2. Tech Stack Decisions
* **Framework:** React (Vite) was chosen for its near-instant HMR (Hot Module Replacement) and lightweight bundle size compared to Next.js.
* **Styling:** Tailwind CSS allows for a composable "Cyberpunk" aesthetic using utility classes for glassmorphism (`backdrop-blur`) and neon glows.
* **AI Model:** **Google Gemini 3 Flash** was selected over GPT-4o for its superior latency-to-cost ratio, which is critical for a real-time voice interface.

## 3. Key Features Implementation
### Token Compression Algorithm
To ensure low latency and stay within rate limits, the application implements a custom compression service (`geminiService.ts`). It analyzes the prompt length and, if necessary, strips non-essential metadata (like device descriptions) while preserving unique IDs and current states.

### Dynamic Personality Engine
The system supports hot-swapping "System Prompts" to change the AI's persona. This is implemented via a React Context that passes a `persona` string to the API call, effectively re-initializing the LLM context on every turn without losing conversation history.