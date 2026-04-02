# VenturePulse — File Placement Guide

## Folder Structure to Create

```
src/
├── main.jsx                          ← REPLACE existing
├── App.jsx                           ← REPLACE existing
├── App.css                           ← keep existing (no change)
├── index.css                         ← keep existing (no change)
│
├── context/
│   └── AuthContext.jsx               ← NEW (create folder + file)
│
├── data/
│   └── startupData.js                ← NEW (create folder + file)
│
├── Components/
│   ├── navBar.jsx                    ← REPLACE existing
│   ├── list.jsx                      ← REPLACE existing
│   ├── landingPage.jsx               ← keep existing
│   ├── allStartups.jsx               ← keep existing
│   ├── heading.jsx                   ← keep existing
│   ├── newScroll.jsx                 ← keep existing
│   ├── WayWire.jsx                   ← keep existing (no longer used by router)
│   │
│   ├── StartupDetailPage.jsx         ← NEW (generic dashboard for ALL startups)
│   │
│   ├── auth/
│   │   ├── Login.jsx                 ← NEW (create folder + file)
│   │   └── Register.jsx              ← NEW
│   │
│   └── dashboards/
│       ├── StartupDashboard.jsx      ← NEW (from previous output, user's own dashboard)
│       └── BankerDashboard.jsx       ← NEW (from previous output)
```

## How It All Works

### Routing
| URL | Component |
|-----|-----------|
| `/` | LandingPage |
| `/companies` | AllStartups (directory) |
| `/startup-detail?name=<name>` | StartupDetailPage (any startup) |
| `/login` | Login |
| `/register` | Register |
| `/startup-dashboard` | StartupDashboard (protected, startup only) |
| `/banker-dashboard` | BankerDashboard (protected, banker only) |

### Startup Directory → Detail Flow
Every startup card in `/companies` is now a clickable link:
```
/startup-detail?name=%23WayWire   →   WayWire dashboard
/startup-detail?name=%26TV+Communications  →  &TV dashboard
```
The `StartupDetailPage` reads the `?name=` param, looks up financial data from `startupData.js`, and renders the full dashboard with charts + XGBoost.

### Auth Flow
- `AuthContext.jsx` provides `login`, `register`, `logout`, `currentUser` across the whole app
- Login/Register store user in `localStorage` under key `vp_current_user`
- NavBar shows Login/Signup buttons when logged out, and username + Logout when logged in
- Protected routes redirect to `/login` if not authenticated

### Install recharts (if not already)
```bash
npm install recharts
```

## Notes
- `startupData.js` contains real Excel data for all 18 directory startups
- XGBoost is implemented from scratch in JS (no library needed) in `StartupDetailPage.jsx`
- Each startup gets its own accent color and emoji for visual differentiation
