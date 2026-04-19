# Glance — GitHub Contribution Widget

A lightweight desktop widget built with **Tauri + React** that displays your GitHub contribution graph, streak, and stats — always on your desktop.

---

## Features

- **Live contribution graph** — pulls your real GitHub data via the GraphQL API
- **Streak tracking** — shows your current day streak at a glance
- **Competitor mode** — search any GitHub user and compare their graph to yours
- **9-position snap** — snap the widget to any corner or edge of your screen
- **Theme switcher** — Green and Blue themes
- **Opacity control** — adjust widget transparency (10%–100%)
- **Launch on startup** — optional autostart with Windows
- **Always on top** — floats above other windows, stays on your desktop

---

## Download

Head to the [Releases](../../releases/latest) page and download:

```
Glance_0.1.0_x64-setup.exe
```

Run the installer and you're good to go.

---

## Setup

1. Download and run `Glance_0.1.0_x64-setup.exe`
2. On first launch, enter your **GitHub username** and a **Personal Access Token**
3. The widget appears on your desktop — drag it anywhere or use the position snap

---

## Getting a GitHub Token

1. Go to **GitHub → Settings → Developer Settings → Personal Access Tokens**
2. Click **Generate new token (classic)**
3. Enable the `read:user` scope
4. Copy the token and paste it into Glance on first launch

> The token is stored locally on your machine and never sent anywhere except the GitHub API.

---

## Settings

Click the **gear icon** (⚙) in the widget header to open settings:

| Setting | Description |
|---|---|
| Position | Snap the widget to one of 9 screen positions |
| Visibility | Adjust widget opacity (10%–100%) |
| Theme | Switch between Green and Blue themes |
| Start on startup | Toggle Windows autostart |
| Logout | Clear your saved credentials |

---

## Competitor Mode

Click the **people icon** in the header to search for any GitHub username. Their contribution graph will be shown side-by-side with your stats for a quick comparison. Previously viewed profiles are saved for quick access.

---

## Requirements

- Windows 10 / 11 (x64)
- GitHub Personal Access Token (`read:user` scope)

---

## Tech Stack

- [Tauri v2](https://tauri.app/) — native desktop shell (Rust)
- [React 19](https://react.dev/) — UI
- [Vite](https://vitejs.dev/) — build tool
- GitHub GraphQL API — contribution data

---

## Building from Source

```bash
# Install dependencies
npm install

# Development
npm run tauri dev

# Production build
npm run tauri build
```

Requires [Rust](https://www.rust-lang.org/tools/install) and the [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/).

---

## License

MIT
