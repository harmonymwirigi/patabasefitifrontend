// File: frontend/src/main.tsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./api/axiosConfig"; // Import axios configuration

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);