import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceTracking } from './utils/performance'

// Initialize performance tracking
initPerformanceTracking();

createRoot(document.getElementById("root")!).render(<App />);
