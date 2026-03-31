import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { CalculatorEngine } from "./calculator/CalculatorEngine";
import { App } from "./App";
import "./styles.css";

const calculator = new CalculatorEngine();

const container = document.getElementById("app");
if (!container) throw new Error("Missing #app container");

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App calculator={calculator} />
    </BrowserRouter>
  </React.StrictMode>
);
