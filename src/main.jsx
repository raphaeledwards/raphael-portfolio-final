import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async';
import './index.css' // CRITICAL: This line loads Tailwind

// Only the homepage mounts the interactive SPA. Every other route is a
// prerendered static page (scripts/prerender.js) with its own real content
// and canonical tag; mounting the SPA there would overwrite both with the
// homepage's, which is what caused Search Console's duplicate-content and
// soft-404 flags. Those pages still get analytics via the side effect below.
// isHomePath must match the check in index.html's two inline scripts.
const isHomePath = window.location.pathname === '/' || window.location.pathname === '/index.html';

if (isHomePath) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>,
  )
} else {
  import('./firebase')
}