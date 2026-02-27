# Contributing to Solemia NutriPal

Welcome! This document provides guidelines for engineers and developers to contribute to and maintain the Solemia NutriPal project.

## 🏗️ Project Structure

The project follows a clean, categorized organization to ensure maintainability:

-   `api/`: Vercel Serverless Functions (Mercado Pago webhooks, preference creation).
-   `data/`: Static JSON data files for tests and demos.
-   `docs/`: Product reference documents and sales protocols.
-   `scripts/`: Maintenance, database verification, and demo data setup scripts.
-   `src/`: Application source code.
    -   `assets/`: Images, logos, and global styles.
        -   `brand/`: Official logos and brand guidelines.
    -   `components/`: React components.
        -   `modals/`: Specialized modal windows for user interactions.
        -   `ui/`: Reusable, low-level UI elements and animations.
    -   `hooks/`: Custom React hooks for shared logic.
    -   `lib/`: Core library initializations (Supabase client).
    -   `pages/`: Main view components (Dashboard, LandingPage, etc.).
    -   `templates/`: UI reference templates and "vibe" designs.

## 🛠️ Development Workflow

1.  **Environment Setup**: Copy `.env.example` to `.env` and fill in necessary credentials.
2.  **Scripts**: Use the `scripts/` directory for database maintenance.
    -   `node scripts/verify_db.js`: Run this to check DB schema health.
3.  **Linting**: Run `npm run lint` before committing changes.

## ✍️ Coding Standards

-   **Component Structure**: Use functional components with hooks.
-   **Styling**: Use global variables in `index.css` for design consistency (Plum palette).
-   **Naming**: Use PascalCase for components and camelCase for logic/functions.
-   **Security**: Always respect RLS policies in Supabase; never expose sensitive keys on the client.

## 🚀 Commits

Please follow [Conventional Commits](https://www.conventionalcommits.org/):
-   `feat:`: New features.
-   `fix:`: Bug fixes.
-   `docs:`: Documentation changes.
-   `style:`: Formatting, missing semi colons, etc; no code change.
-   `refactor:`: Refactoring production code.

---

© 2026 Solemia Nutrición.
