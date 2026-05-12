import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './hooks/useI18n.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
