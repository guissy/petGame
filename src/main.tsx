import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './paper/App.tsx'
import './tailwindcss.css'

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>,
)
