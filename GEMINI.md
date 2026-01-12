# Fit-O-Charity Chatbot

## Project Overview

**Fit-O-Charity Chatbot** (internal name: `ask-the-manual`) is a React-based application designed to answer user questions about a specific event (Fit-O-Charity) using Google's Gemini API and Retrieval-Augmented Generation (RAG).

The app allows administrators to upload documents (PDFs, etc.) which are indexed into a Gemini "File Search Store". Users can then chat with the bot, which uses these documents to provide grounded, accurate answers.

## Technology Stack

*   **Frontend Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (inferred)
*   **AI Integration:** Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash` model.

## Key Features

1.  **RAG (Retrieval-Augmented Generation):** Uploads documents to a Gemini File Search Store and uses them to ground answers.
2.  **Admin Panel:** Interface for configuring the API Key and managing the Knowledge Base (uploading/deleting documents).
3.  **Chat Interface:** A conversational UI for users to query the knowledge base.
4.  **Persistence:**
    *   **Local:** Uses `localStorage` to persist API keys and RAG store IDs for local development.
    *   **Production:** Supports `VITE_GEMINI_API_KEY` and `VITE_RAG_STORE_NAME` environment variables for deployed instances (Vercel/Netlify).

## Architecture

### Directory Structure

*   `src/` (implied root)
    *   `App.tsx`: The main entry point. Implements a state machine (`AppStatus`) managing transitions between 'Initializing', 'Welcome', 'Admin', 'Uploading', and 'Chatting' views.
    *   `services/geminiService.ts`: The core service layer interacting with the Google GenAI SDK. Handles:
        *   API Key management and validation.
        *   RAG Store creation (`ai.fileSearchStores.create`).
        *   File uploads (`ai.fileSearchStores.uploadToFileSearchStore`).
        *   Search/Generation (`ai.models.generateContent` with `fileSearch` tool).
    *   `components/`: UI components for different application states (`AdminPanel`, `ChatInterface`, `WelcomeScreen`, etc.).

### Environment Variables

The application uses the following environment variables (defined in `vite.config.ts`):

*   `VITE_GEMINI_API_KEY`: The Google Gemini API Key.
*   `VITE_RAG_STORE_NAME`: (Optional) A pre-configured File Search Store ID (e.g., `fileSearchStores/xyz...`) for read-only production deployments.

## Development

### Prerequisites
*   Node.js
*   Gemini API Key

### Commands

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Run Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Preview Build:**
    ```bash
    npm run preview
    ```

## Deployment

The project includes a detailed `DEPLOYMENT.md` guide for deploying to Vercel or Netlify.

**Key Steps:**
1.  Build the project.
2.  Push to GitHub.
3.  Import into Vercel/Netlify.
4.  Configure Environment Variables (`VITE_GEMINI_API_KEY`, `VITE_RAG_STORE_NAME`).

**Note:** For production, it is recommended to create the RAG store locally (via the Admin panel), copy the Store ID, and set it as the `VITE_RAG_STORE_NAME` environment variable in the deployment platform.
