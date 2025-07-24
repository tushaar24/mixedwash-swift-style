import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx loaded");

const rootElement = document.getElementById("root");
console.log("Root element found:", !!rootElement);

if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-size: 20px;">ERROR: Root element not found</div>';
} else {
  console.log("Creating React root...");
  try {
    const root = createRoot(rootElement);
    console.log("React root created, rendering App...");
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("App rendered");
  } catch (error) {
    console.error("Error creating/rendering React app:", error);
    document.body.innerHTML = `<div style="padding: 20px; color: red; font-size: 20px;">ERROR: ${error}</div>`;
  }
}
