import { useState } from "react";
import { getCurrentWindow, LogicalPosition } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

const PRESETS = [
  { id: "top-left",     label: "Top Left",     icon: "↖" },
  { id: "top-right",    label: "Top Right",    icon: "↗" },
  { id: "bottom-left",  label: "Bottom Left",  icon: "↙" },
  { id: "bottom-right", label: "Bottom Right", icon: "↘" },
  { id: "center",       label: "Center",       icon: "⊞" },
];

async function applyPreset(id) {
  const sw  = window.screen.availWidth;
  const sh  = window.screen.availHeight;
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = await appWindow.outerSize();
  const ww  = Math.round(width  / dpr);
  const wh  = Math.round(height / dpr);
  const m   = 20;

  const map = {
    "top-left":     new LogicalPosition(m,          m          ),
    "top-right":    new LogicalPosition(sw - ww - m, m         ),
    "bottom-left":  new LogicalPosition(m,           sh - wh - m),
    "bottom-right": new LogicalPosition(sw - ww - m, sh - wh - m),
    "center":       new LogicalPosition(
      Math.round((sw - ww) / 2),
      Math.round((sh - wh) / 2)
    ),
  };

  await appWindow.setPosition(map[id]);
}

const GearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.13-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
  </svg>
);

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="settings-wrap">
      <button
        className={`settings-btn${open ? " active" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="Move widget"
      >
        <GearIcon />
      </button>

      {open && (
        <>
          <div className="settings-backdrop" onClick={() => setOpen(false)} />
          <div className="settings-menu">
            <span className="settings-title">Move widget to</span>
            {PRESETS.map(({ id, label, icon }) => (
              <button
                key={id}
                className="settings-option"
                onClick={async () => { await applyPreset(id); setOpen(false); }}
              >
                <span className="settings-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
