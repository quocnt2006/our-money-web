
Purpose

This file gives concise, repository-specific guidance for AI coding agents working on OurMoney Web. It preserves the project's Angular + TypeScript conventions and highlights patterns, commands, and integration points discovered in the codebase.

Quick start (local)

- **Dev server:** `npm run start` (runs `ng serve`) — see `package.json` scripts.
- **Build:** `npm run build` (runs `ng build`).
- **Tests:** `npm run test` (runs `ng test` — Vitest via Angular CLI wrapper).

Big-picture architecture

- Small Angular app (Angular 21) using standalone components and signals; entry is `src/app/app.ts` and routes in [src/app/app.routes.ts](src/app/app.routes.ts).
- Pages live in [src/app/pages](src/app/pages) (e.g., [src/app/pages/login.page.ts](src/app/pages/login.page.ts) and [src/app/pages/dashboard.page.ts](src/app/pages/dashboard.page.ts)).
- Pages live in [src/app/pages](src/app/pages) (e.g., [src/app/pages/login.page.ts](src/app/pages/login.page.ts), [src/app/pages/signup.page.ts](src/app/pages/signup.page.ts), and [src/app/pages/dashboard.page.ts](src/app/pages/dashboard.page.ts)).
- Environment config (API base) in [src/environments/environment.ts](src/environments/environment.ts) (`apiUrl` used by pages/services).

Key integration points & examples

- Authentication: login POST endpoint invoked from [src/app/pages/login.page.ts](src/app/pages/login.page.ts) to `${environment.apiUrl}/api/Auth/login`. After success it navigates to `/dashboard`.
 - Authentication: login and signup flows are now handled by an NgRx feature located under `src/app/store`.
	 - Actions: [src/app/store/auth.actions.ts](src/app/store/auth.actions.ts)
	 - Reducer: [src/app/store/auth.reducer.ts](src/app/store/auth.reducer.ts)
	 - Effects (perform HTTP calls): [src/app/store/auth.effects.ts](src/app/store/auth.effects.ts)
	 - Selectors: [src/app/store/auth.selectors.ts](src/app/store/auth.selectors.ts)
	 - Models: [src/app/store/auth.models.ts](src/app/store/auth.models.ts)
	 - Pages dispatch `login` / `signup` actions and select loading/error from the store (see [src/app/pages/login/login.page.ts](src/app/pages/login/login.page.ts) and [src/app/pages/signup/signup.page.ts](src/app/pages/signup/signup.page.ts)).
 - Interceptor: an `AuthInterceptor` is registered to attempt token refresh on 401 responses when using HttpOnly cookies: [src/app/interceptors/auth.interceptor.ts](src/app/interceptors/auth.interceptor.ts). The app now relies on HttpOnly cookies for access/refresh tokens and sends credentials with auth requests.
- Router: top-level routes in [src/app/app.routes.ts](src/app/app.routes.ts) — root -> login, `/dashboard` -> Dashboard.
 - Registration: sign-up POST endpoint is `${environment.apiUrl}/api/Auth/register`. The client helper lives at [src/app/services/user.service.ts](src/app/services/user.service.ts) and the page is [src/app/pages/signup.page.ts](src/app/pages/signup.page.ts).
	- Register payload example: `{ name: string, email: string, password: string, familyId: 0, role: 'user' }`.

Project-specific conventions

- Prefer Signals for local state (`signal()` used in components). Use `update()` / `set()` instead of mutating objects directly.
- Use Reactive Forms (`FormBuilder` + `formGroup`) for pages that accept input (see login page).
- Pages use external templates and styles by convention: `*.page.ts` components reference `*.page.html` and `*.page.css` in the same folder (see `src/app/pages/*.page.*`).
- Previously some components used inline templates; new pages use external files to keep template, logic and styles separated.
- Accessibility is enforced in templates (ARIA labels, `aria-busy`, form validation messaging); preserve these patterns.

Developer workflows & checks

- Use `npm run start` for development; app runs at `http://localhost:4200` by default.
- Verify API URL overrides by editing [src/environments/environment.ts](src/environments/environment.ts).
- Keep changes minimal and focused; this repo follows simple, single-responsibility components.

Deployment (Azure Static Web Apps)

- A GitHub Actions workflow is provided to build and deploy the app to Azure Static Web Apps on push to `main`: [.github/workflows/azure-static-web-apps.yml](.github/workflows/azure-static-web-apps.yml).
- The workflow builds the Angular app with `npm run build` and deploys the `dist/our-money-web` output folder.
- Before the workflow can deploy, add a repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN` containing the deployment token from the Azure Static Web Apps resource (or use the token generated when creating a Static Web App via the GitHub integration).
- To trigger deployment manually or test locally, run:

	- Install deps: `npm ci`
	- Build: `npm run build`

Note: Azure Static Web Apps expects the built files at `dist/your-project-name` — this project uses `dist/our-money-web` by default.

Proxy / CORS during development

- A local reverse-proxy is provided at `proxy.conf.json` to forward `/api` requests to the backend at `http://localhost:5000` and to rewrite cookie domains. The `start` script has been updated to use it: `npm run start` will run `ng serve --proxy-config proxy.conf.json`.
- This proxy allows the browser to send/receive HttpOnly cookies to the backend without CORS issues. Ensure the backend sets cookies with appropriate SameSite and Secure attributes for your environment.

Quick pointers for edits

- Adding a page: create `src/app/pages/<name>.page.ts`, `<name>.page.html`, `<name>.page.css`; register route in [src/app/app.routes.ts](src/app/app.routes.ts).
- Adding HTTP helpers: place services under `src/app/services`, use `inject(HttpClient)` and `environment.apiUrl` for base URL (see `src/app/services/user.service.ts`).
 - Adding HTTP helpers: place services under `src/app/services`, use `inject(HttpClient)` and `environment.apiUrl` for base URL (see `src/app/services/user.service.ts`). The `UserService` includes `login`, `register`, and `refresh` helpers that set `{ withCredentials: true }` so the browser sends/receives HttpOnly cookies. Effects perform the calls; prefer using NgRx actions for auth flows.

What agents should do first

- Read `src/app/app.routes.ts`, `src/app/pages/login.page.ts`, and `src/environments/environment.ts` to understand auth flows and routing.
- When modifying authentication, mirror the POST to `${environment.apiUrl}/api/Auth/login` and preserve the UI loading/error handling pattern used in `LoginPage`.
 - When modifying authentication or registration, mirror the POST to `${environment.apiUrl}/api/Auth/login` or `${environment.apiUrl}/api/Auth/register` and preserve the UI loading/error handling pattern used in `LoginPage`/`SignupPage`.

Notes / constraints discovered

- Angular v21 features (standalone components, signals) are used—avoid adding NgModule boilerplate.
- Tests use `ng test` (Vitest) — run after edits.
- Tailwind/postcss dev deps exist but styles are primarily component-scoped.
 - File naming and locations matter: components use the `.page.ts` convention, templates `.page.html`, styles `.page.css`, services under `src/app/services`.

If anything is ambiguous, ask for the desired UX or API contract before changing auth or routes.

