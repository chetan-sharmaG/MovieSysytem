# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Project-specific notes & optimizations ✅

- This repository has been refactored to improve runtime and bundle performance:
	- Centralized the GROQ client into `src/groqClient.js` so the SDK init is not duplicated.
	- Centralized and normalized `fetchMovieDetails` (caching in sessionStorage) in `src/util.js`.
	- Lazy-loaded some large UI components (`GeneratedResponse`, `PopularSection`) using `React.lazy` + `Suspense` to reduce initial bundle size.
	- Memoized frequently re-rendered components (`CardLayout`, `PopularSection`, `RecommendationCard`) using `React.memo`.
	- Removed stray debug logging and duplicate fetch implementations.

## Environment variables & secrets 🔐

This project expects a GROQ API key to be provided via Vite environment variables. Do **not** commit `.env` to source control. Instead copy `.env.example` -> `.env` and add the real key locally:

```bash
cp .env.example .env
# then edit .env and add your API key
```

The project already ignores `.env` via .gitignore.

