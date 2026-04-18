import { useState } from "react";

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

export default function CompetitorMenu({ competitors, activeUsername, onSelect, onAddNew }) {
  const [open, setOpen] = useState(false);

  const isActive    = Boolean(activeUsername);
  const hasStored   = competitors.length > 0;

  return (
    <div className="comp-wrap">
      <button
        className={`comp-btn${isActive ? " comp-viewing" : hasStored ? " comp-has" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="Compare contributors"
      >
        <UsersIcon />
        {hasStored && !isActive && <span className="comp-dot" />}
      </button>

      {open && (
        <>
          <div className="settings-backdrop" onClick={() => setOpen(false)} />
          <div className="comp-menu">
            <span className="sm-title">Competitors</span>

            {competitors.map(c => (
              <button
                key={c.username}
                className={`comp-item${activeUsername === c.username ? " comp-item-active" : ""}`}
                onClick={() => {
                  onSelect(activeUsername === c.username ? null : c.username);
                  setOpen(false);
                }}
              >
                {c.avatarUrl
                  ? <img src={c.avatarUrl} className="comp-avatar" alt="" draggable="false" />
                  : <span className="comp-avatar-ph">?</span>
                }
                <span className="comp-name">@{c.username}</span>
                {activeUsername === c.username && <span className="comp-check">✓</span>}
              </button>
            ))}

            {hasStored && <div className="comp-divider" />}

            <button
              className="comp-add-btn"
              onClick={() => { onAddNew(); setOpen(false); }}
            >
              <span className="comp-plus">+</span>
              Add competitor
            </button>
          </div>
        </>
      )}
    </div>
  );
}
