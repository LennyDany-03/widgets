import { useEffect, useState } from "react";
import {
  currentMonitor,
  getCurrentWindow,
  PhysicalPosition,
  primaryMonitor,
} from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();
const OPACITY_STORAGE_KEY = "github-widget-opacity";

/* ── Position presets ── */
function clamp(value, min, max) {
  if (max < min) return Math.round(min);
  return Math.round(Math.min(Math.max(value, min), max));
}

function getInitialOpacity() {
  try {
    const saved = Number(localStorage.getItem(OPACITY_STORAGE_KEY));
    return Number.isFinite(saved) ? clamp(saved, 10, 100) : 100;
  } catch (_) {
    return 100;
  }
}

function applyWidgetOpacity(value) {
  const normalized = clamp(value, 10, 100) / 100;
  const root = document.documentElement;

  root.style.setProperty("--widget-panel-alpha", (normalized * 0.93).toFixed(2));
  root.style.setProperty("--widget-ring-alpha", (normalized * 0.19).toFixed(2));
  root.style.setProperty("--widget-ring-base-alpha", normalized.toFixed(2));
}

async function getWorkArea() {
  const monitor = (await currentMonitor()) ?? (await primaryMonitor());
  if (monitor) {
    return {
      x: monitor.workArea.position.x,
      y: monitor.workArea.position.y,
      width:  monitor.workArea.size.width,
      height: monitor.workArea.size.height,
      margin: Math.round(20 * monitor.scaleFactor),
    };
  }
  const dpr = window.devicePixelRatio || 1;
  return {
    x: 0, y: 0,
    width:  Math.round(window.screen.availWidth  * dpr),
    height: Math.round(window.screen.availHeight * dpr),
    margin: Math.round(20 * dpr),
  };
}

async function applyPreset(id) {
  const [wa, { width, height }] = await Promise.all([
    getWorkArea(),
    appWindow.outerSize(),
  ]);
  const minX = wa.x + wa.margin;
  const minY = wa.y + wa.margin;
  const maxX = wa.x + wa.width  - width  - wa.margin;
  const maxY = wa.y + wa.height - height - wa.margin;
  const centerX = wa.x + Math.round((wa.width  - width)  / 2);
  const centerY = wa.y + Math.round((wa.height - height) / 2);

  const map = {
    "top-left":     [minX, minY],
    "top-center":   [centerX, minY],
    "top-right":    [maxX, minY],
    "left-center":  [minX, centerY],
    "center":       [centerX, centerY],
    "right-center": [maxX, centerY],
    "bottom-left":  [minX, maxY],
    "bottom-center":[centerX, maxY],
    "bottom-right": [maxX, maxY],
  };

  const [x, y] = map[id] ?? map["top-left"];
  await appWindow.setPosition(
    new PhysicalPosition(clamp(x, minX, maxX), clamp(y, minY, maxY))
  );
}

/* 3 x 3 position grid */
const POS_GRID = [
  ["top-left",     "top-center",    "top-right"    ],
  ["left-center",  "center",        "right-center" ],
  ["bottom-left",  "bottom-center", "bottom-right" ],
];
const POS_META = {
  "top-left":     { icon: "↖", label: "Top Left"     },
  "top-center":   { icon: "↑", label: "Top Center"   },
  "top-right":    { icon: "↗", label: "Top Right"    },
  "left-center":  { icon: "←", label: "Left Center"  },
  "center":       { icon: "⊞", label: "Center"       },
  "right-center": { icon: "→", label: "Right Center" },
  "bottom-left":  { icon: "↙", label: "Bottom Left"  },
  "bottom-center":{ icon: "↓", label: "Bottom Center"},
  "bottom-right": { icon: "↘", label: "Bottom Right" },
};

/* ── Icons ── */
const GearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.13-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "auto", opacity: 0.4 }}>
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
  </svg>
);

const BackArrow = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>
  </svg>
);

/* ── Component ── */
export default function SettingsMenu({ onLogout }) {
  const [open,    setOpen]    = useState(false);
  const [view,    setView]    = useState("main"); // "main" | "position" | "visibility"
  const [opacity, setOpacity] = useState(getInitialOpacity);

  const close = () => { setOpen(false); setView("main"); };

  useEffect(() => {
    applyWidgetOpacity(opacity);
  }, [opacity]);

  useEffect(() => {
    const root = document.documentElement;

    if (open && view === "position") {
      root.style.setProperty("--widget-menu-bottom-room", "48px");
    } else {
      root.style.removeProperty("--widget-menu-bottom-room");
    }

    return () => root.style.removeProperty("--widget-menu-bottom-room");
  }, [open, view]);

  const handleOpacity = (e) => {
    const val = Number(e.target.value);
    setOpacity(val);
    applyWidgetOpacity(val);
    try { localStorage.setItem(OPACITY_STORAGE_KEY, String(val)); } catch (_) {}
  };

  const handleLogout = () => {
    close();
    onLogout?.();
  };

  // CSS gradient fill % for the slider track
  const sliderFill = `${((opacity - 10) / 90) * 100}%`;

  return (
    <div className="settings-wrap">
      <button
        className={`settings-btn${open ? " active" : ""}`}
        onClick={() => { setOpen(v => !v); setView("main"); }}
        title="Widget settings"
      >
        <GearIcon />
      </button>

      {open && (
        <>
          <div className="settings-backdrop" onClick={close} />

          <div className="settings-menu">

            {/* ── MAIN VIEW ── */}
            {view === "main" && (
              <>
                <span className="sm-title">Widget Settings</span>

                <button className="sm-row" onClick={() => setView("position")}>
                  <span className="sm-row-icon">⊹</span>
                  <span className="sm-row-label">Position</span>
                  <ChevronRight />
                </button>

                <button className="sm-row" onClick={() => setView("visibility")}>
                  <span className="sm-row-icon">◑</span>
                  <span className="sm-row-label">Visibility</span>
                  <ChevronRight />
                </button>

                <button className="sm-row sm-row-danger" onClick={handleLogout}>
                  <span className="sm-row-icon">↩</span>
                  <span className="sm-row-label">Logout</span>
                </button>
              </>
            )}

            {/* ── POSITION VIEW ── */}
            {view === "position" && (
              <>
                <button className="sm-back" onClick={() => setView("main")}>
                  <BackArrow /> Position
                </button>

                <div className="pos-grid">
                  {POS_GRID.map((row, ri) =>
                    row.map((id, ci) =>
                      id ? (
                        <button
                          key={id}
                          className="pos-btn"
                          title={POS_META[id].label}
                          onClick={async () => {
                            try { await applyPreset(id); } catch (_) {}
                            close();
                          }}
                        >
                          <span className="pos-icon">{POS_META[id].icon}</span>
                          <span className="pos-label">{POS_META[id].label}</span>
                        </button>
                      ) : (
                        <div key={`${ri}-${ci}`} className="pos-spacer" />
                      )
                    )
                  )}
                </div>
              </>
            )}

            {/* ── VISIBILITY VIEW ── */}
            {view === "visibility" && (
              <>
                <button className="sm-back" onClick={() => setView("main")}>
                  <BackArrow /> Visibility
                </button>

                <div className="vis-section">
                  <div className="vis-header">
                    <span className="vis-label">Opacity</span>
                    <span className="vis-value">{opacity}%</span>
                  </div>

                  <div className="vis-slider-wrap">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={opacity}
                      onChange={handleOpacity}
                      className="vis-slider"
                      style={{ "--fill": sliderFill }}
                    />
                  </div>

                  <div className="vis-ends">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </>
      )}
    </div>
  );
}
