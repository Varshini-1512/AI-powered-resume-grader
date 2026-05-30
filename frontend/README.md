# Resume Grader Frontend

React + Vite frontend for the Resume Grader MERN application. The app lets users register, log in, upload resumes, view ATS scores, review improvement suggestions, and download enhanced resume content.

## Tech Stack

- React 19
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- jsPDF and html2canvas
- React Hot Toast

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The API client is configured in `src/api/axios.js` and sends requests to:

```text
http://localhost:5000/api
```

Make sure the backend server is running before using upload, login, dashboard, or resume detail features.

## Available Scripts

```bash
npm run dev
```

Runs the Vite development server with hot module replacement.

```bash
npm run build
```

Creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for preview.

```bash
npm run lint
```

Runs ESLint across the frontend source.

## Project Structure

```text
src/
  api/            Axios API client
  assets/         Static images and visual assets
  components/     Shared UI components
  pages/          Route-level views
  store/          Zustand state management
  styles/         Shared style helpers
  utils/          Constants and resume checklist helpers
```

## Main Features

- User login and registration
- Protected dashboard routes
- Resume upload flow
- Resume history
- ATS score display
- Resume suggestions and checklist feedback
- Resume detail view with preview and download support
- Profile and password settings

## Backend Dependency

This frontend expects the backend to expose these API groups:

```text
/api/auth
/api/resume
```

If the backend URL changes, update the `baseURL` value in `src/api/axios.js`.

## Build Notes

Before creating a production build, confirm that:

- The backend API URL is correct.
- The backend CORS origin allows the deployed frontend URL.
- Authentication token storage behavior matches the deployment requirements.
