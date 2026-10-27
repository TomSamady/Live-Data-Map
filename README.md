# Live Data Map

An interactive 3D globe for exploring geography and global information through a browser.

Live Data Map starts with a navigable Earth and is being developed toward country discovery and source-backed information layers, including an estimated ISS position. The current application is an early frontend prototype; live data integrations are planned.

## Current features

- Interactive Earth with drag rotation and scroll or pinch zoom.
- Zoom buttons and a reset control that restores the initial view.
- Globe sizing that follows the available screen space.
- Local map texture with Natural Earth attribution.
- Loading and texture-error messages.
- Reduced-motion support for button-driven camera transitions.

Country selection, search, profiles and the ISS layer are not implemented yet. Desktop rendering, drag rotation, zoom-in and reset have been checked manually. Real-device mobile performance and accessibility testing remain outstanding.

## Technology

| Area | Technology |
| --- | --- |
| Interface | React 19 and TypeScript |
| Globe rendering | React Globe.GL and Three.js |
| Development and build | Vite 8 |
| Code quality | ESLint and typescript-eslint |
| Package management | npm with a committed lockfile |

The application currently runs entirely in the browser. No backend, database, API keys or environment variables are required.

## Getting started

### Requirements

- Node.js 24 LTS and npm. Development has been checked with Node.js `24.22.1` and npm `11.19.1`.
- A modern browser with WebGL support.

### Install and run

From the project directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Vite may select another port if that port is occupied. The development server updates the page when source files change.

### Check and build

```bash
npm run lint
npm run build
```

The build runs the TypeScript compiler and generates the production site in `dist/`. To serve that build locally:

```bash
npm run preview
```

`preview` is a local build check, not a production hosting service.

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Check source files with ESLint. |
| `npm run build` | Type-check and produce the production build. |
| `npm run preview` | Serve the production build locally. |

## Project structure

```text
public/
  countries.geojson   Country boundary data for upcoming selection work
  earth.svg           Local Earth map texture
  earth-source.txt    Map provenance and attribution
src/
  App.tsx             Application layout
  App.css             Layout and globe styling
  GlobeView.tsx       Globe rendering, sizing and camera controls
  index.css           Global styles
  main.tsx            React entry point
index.html            HTML entry point
package.json          Dependencies and development scripts
package-lock.json     Resolved dependency versions
vite.config.ts        Vite configuration
```

`GlobeView` wraps React Globe.GL, measures its container with `ResizeObserver` and manages camera actions through the globe instance. `App` provides the surrounding header, controls area and attribution footer.

The current Earth texture is a static visual map. Its visible borders are not clickable country polygons. `countries.geojson` is present for the next implementation stage and is not yet loaded by the globe.

## Data and attribution

The Earth texture is derived from [Natural Earth](https://www.naturalearthdata.com/) country geometry. Natural Earth map data is in the [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Source details and the inspected dataset checksum are recorded in [`public/earth-source.txt`](public/earth-source.txt).

Natural Earth uses de facto boundary conventions. Map features and territories should not be interpreted as a definitive count of sovereign countries.

Future country profiles will retain source links and reference years. Calculated satellite positions will be labelled as estimates and include orbital-data freshness information.

## Development roadmap

- [ ] Country polygon rendering, selection and highlighting.
- [ ] Country search using the same identifiers as globe selection.
- [ ] Responsive country details with clearly labelled sample profiles.
- [ ] Reviewed country facts, population and representative dishes.
- [ ] ISS position, details and explicit follow controls.
- [ ] Shared data fetching, caching and stale-data handling.
- [ ] Mobile performance, accessibility and deployment checks.

Java with Spring Boot and PostgreSQL are planned when shared upstream access and persistent content are needed. They are not part of the current setup. Country lift-and-flip animation remains a later feasibility experiment.

## Deployment

Run `npm run build` and deploy the contents of `dist/` to a static web host. `dist/` and `node_modules/` are generated locally and excluded from Git; commit the source files and `package-lock.json` instead.

The current 3D bundle triggers Vite's large-chunk warning. Loading cost and mobile performance need assessment before public release. Hosting below a URL subdirectory will also require configuring Vite's base path and reviewing the root-relative asset URLs.

## Dependency compatibility

TypeScript is pinned to `6.0.3` because the installed typescript-eslint release requires TypeScript below `6.1.0`. Upgrade these dependencies together and check both lint and build rather than bypassing peer-dependency checks.

There is no automated test suite configured yet. Passing lint and build does not verify browser interactions; use manual browser checks for camera behaviour, resizing and input controls.
