import React from "react";
import { SettingsGroup, ListItem, Toggle, SectionHeader } from "even-toolkit/web";

export const SettingsScreen: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <SectionHeader title="System Settings" className="mb-6" />
      
      <div className="space-y-8">
        <SettingsGroup label="Interaction">
          <ListItem
            title="Vibrate on Press"
            subtitle="Feel haptic feedback on G2"
            leading={<div className="w-5 h-5 bg-accent-warning rounded-sm" />}
            trailing={<Toggle checked={true} onChange={() => {}} />}
          />
          <ListItem
            title="High Precision"
            subtitle="Use 12 decimal places"
            trailing={<Toggle checked={false} onChange={() => {}} />}
          />
        </SettingsGroup>

        <SettingsGroup label="Theme">
          <ListItem
            title="Auto-light theme"
            subtitle="Following 2025 Even Realities Guidelines"
            trailing={<Toggle checked={true} disabled onChange={() => {}} />}
          />
        </SettingsGroup>
      </div>
    </div>
  );
};
