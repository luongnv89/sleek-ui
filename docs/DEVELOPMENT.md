# Development Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Git

## Setup

```bash
git clone https://github.com/luongnv89/sleek-ui.git
cd sleek-ui
npm install
npm run dev
```

Open http://localhost:5173 — the catalog loads with hot module replacement.

## Project Layout

```
src/
├── App.tsx                    # Root component + HomePage
├── main.tsx                   # Entry point, ThemeProvider wrapper
├── components/
│   ├── AppliedDesignBanner.tsx # Bottom bar for active design
│   ├── DesignDetail.tsx        # Per-design page
│   ├── TokenTable.tsx          # CSS token display
│   └── ui/                    # shadcn/ui + custom components
├── context/
│   └── ThemeContext.tsx        # CSS var injection, localStorage
├── data/
│   ├── designs.ts              # Runtime transform of design JSONs
│   └── designs/               # Bundled design JSON files
└── types/
    └── design-types.ts         # TypeScript interfaces

public/
├── designs/                   # Static JSON served by GitHub Pages
├── schema/                    # JSON Schema for design.v1.json
├── logo/                      # SVG logos and brand showcase
└── previews/                  # Design thumbnail images
```

## Common Tasks

### Add a new design

1. Create `public/designs/{slug}.json` — this is what agents fetch
2. Create `src/data/designs/{slug}.json` — same file, bundled into the app
3. Run `npm run validate:designs` to confirm it passes schema validation
4. The catalog picks it up automatically (no registration needed)

### Update the design schema

Edit `public/schema/design.v1.json`. All designs must re-validate after changes:

```bash
npm run validate:designs
```

### Build for production

```bash
npm run build
# Output in dist/
```

### Preview production build locally

```bash
npm run build && npm run preview
```

## Debugging Tips

- **Design not showing up**: check that both `public/designs/` and `src/data/designs/` have the file, and that `name` in the JSON matches the filename.
- **Apply button does nothing**: open DevTools → Console; `applyDesign` errors appear there. Usually a missing `tokens.colors.light` key.
- **Fonts not loading**: check `fonts.urls[].url` is a valid Google Fonts CSS URL.
- **Schema validation fails**: run `npm run validate:designs` and read the AJV error path — it points to the exact field.

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool and dev server |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | latest | Accessible UI primitives |
| react-router-dom | 6 | Client-side routing (HashRouter) |
| lucide-react | 0.441 | Icon library |
