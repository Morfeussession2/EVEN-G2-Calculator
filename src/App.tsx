import React, { useMemo } from "react";
import { Routes, Route } from "react-router";
import { DrawerShell } from "even-toolkit/web";
import { useGlasses } from "even-toolkit/useGlasses";
import { line, glassHeader } from "even-toolkit/types";
import type { DisplayData, GlassNavState } from "even-toolkit/types";
import type { CalculatorEngine, CalculatorState } from "./calculator/CalculatorEngine";
import { DashboardScreen } from "./screens/DashboardScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { deriveScreen } from "./glass-router";

interface AppProps {
  calculator: CalculatorEngine;
}

const AppLayout: React.FC = () => {
  const menuItems = useMemo(() => [
    { id: "/", label: "Calculator", section: "App" },
  ], []);

  const bottomItems = useMemo(() => [
    { id: "/settings", label: "Settings", section: "System" },
  ], []);

  return (
    <DrawerShell
      title="Calculator"
      items={menuItems}
      bottomItems={bottomItems}
      getPageTitle={(path: string) => {
        if (path === "/") return "Calculator";
        if (path === "/settings") return "Settings";
        return "Calculator";
      }}
      deriveActiveId={(path: string) => path}
    />
  );
};

export const App: React.FC<AppProps> = ({ calculator }) => {
  // ── Glasses Logic (The "Pattern") ──
  useGlasses<CalculatorState>({
    appName: "Calculator",
    deriveScreen,
    getSnapshot: () => calculator.getState(),

    // Mode per screen
    getPageMode: (screen: string) => "text",

    // Convert web state to glasses display lines
    toDisplayData: (state: CalculatorState): DisplayData => {
      const lines = [...glassHeader("CALCULATOR")];

      if (state.error) {
        lines.push(line(`ERROR: ${state.error}`, "normal", true));
      } else {
        lines.push(line(state.inputMask || "0", "meta"));
        lines.push(line(`= ${state.resultValue}`, "normal", true));
      }

      return { lines };
    },

    // Handle physical buttons on G2
    onGlassAction: (action, nav: GlassNavState, state: CalculatorState) => {
      if (action.type === "SELECT_HIGHLIGHTED") {
        calculator.pressClear();
      }
      return nav;
    },
  });

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardScreen calculator={calculator} />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
    </Routes>
  );
};
