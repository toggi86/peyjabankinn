import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CompetitionProvider } from "./context/CompetitionContext.jsx";
import "./index.css"; // Tailwind

// --- Import i18n configuration ---
import "./i18n"; // <-- make sure this points to src/i18n.js

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CompetitionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CompetitionProvider>
    </AuthProvider>
  </React.StrictMode>
);
