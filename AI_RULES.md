# AI Development Rules for Encontro Certo

This document outlines the technical stack and development rules for the "Encontro Certo" application. Following these guidelines is mandatory to ensure code quality, consistency, and maintainability.

## Tech Stack

The application is built on a modern, lightweight tech stack. Here are the core technologies:

-   **Framework**: React 19 with TypeScript for building a type-safe user interface.
-   **Build Tool**: Vite is used for fast development and optimized production builds.
-   **Routing**: React Router (`react-router-dom`) handles all client-side navigation.
-   **Styling**: Tailwind CSS is used exclusively for all styling. We build custom components using Tailwind classes.
-   **State Management**: React Context API is used for simple global state, primarily for authentication. Local state is managed with `useState`.
-   **AI Integration**: The Google Gemini SDK (`@google/genai`) powers all generative AI features.
-   **Backend (Mock)**: A mocked Supabase client in `src/services/supabaseService.ts` simulates all backend interactions, including authentication and data fetching.
-   **Icons**: Icons are implemented as inline SVGs within React components to keep the app lightweight.

## Library and Architecture Rules

To maintain a clean and simple codebase, please adhere to the following rules:

1.  **Styling**:
    -   **ONLY** use Tailwind CSS for styling.
    -   Do **NOT** introduce other styling methods like CSS-in-JS (e.g., Styled Components) or component libraries (e.g., Material-UI, Ant Design).
    -   Create new, small, and reusable components in `src/components/` for any UI element that will be used more than once.

2.  **State Management**:
    -   Use the existing `AuthContext` for user and session data.
    -   For component-level state, use the built-in `useState` and `useReducer` hooks.
    -   Do **NOT** add complex state management libraries like Redux or Zustand without explicit permission.

3.  **Routing**:
    -   All application routes **MUST** be defined within `src/App.tsx`.
    -   Page components should be lazy-loaded in `App.tsx` for better performance.
    -   New pages **MUST** be created in the `src/pages/` directory.

4.  **Backend and Data Fetching**:
    -   All interactions with the backend (even the mock one) **MUST** be handled through the service layer defined in `src/services/supabaseService.ts`.
    -   Do **NOT** use `fetch` or other data-fetching libraries directly inside components.

5.  **AI Features**:
    -   All logic related to the Gemini API **MUST** be encapsulated within `src/services/geminiService.ts`.
    -   This includes functions for content moderation, image analysis, and generating content like chat suggestions.

6.  **Dependencies**:
    -   Do **NOT** add any new third-party dependencies with `<dyad-add-dependency>` unless specifically requested by the user. Always attempt to solve problems using the existing tech stack first.