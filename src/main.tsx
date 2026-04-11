import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from '@/context/ThemeContext';
import { DesignProvider } from '@/context/DesignContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <DesignProvider>
        <App />
      </DesignProvider>
    </ThemeProvider>
  </StrictMode>,
)
