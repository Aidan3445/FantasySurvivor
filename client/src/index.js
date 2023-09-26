import React from "react";
import { createRoot } from "react-dom/client";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import "./index.css";
import App from "./App";

if (process.env.NODE_ENV === "production") disableReactDevTools();

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
