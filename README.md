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

The application currently runs entirely in the browser. No backend or database is required. The default road map needs no key; optional MapTiler imagery requires local configuration as described below.

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

## Optional bilingual road maps (MapTiler)

Cesium renders the globe with bundled Natural Earth II imagery at distance, fading into road tiles closer in. OpenStreetMap remains the default. MapTiler is enabled only when both configuration values below are present.

1. Create a MapTiler Cloud account and review the current plan limits. A free testing/non-commercial plan is available; do not enable paid billing unless intended.
2. In Map Designer, customise **Streets**. Configure country and city label layers with the **local/native name first** and **English translation underneath**, leaving street labels local. Global translation settings may affect other labels, so review the relevant country/place layers separately. Avoid duplicate lines where names match and retain local names when no English value is available.
3. Save/publish the custom map in MapTiler and copy its map ID. Confirm its **raster XYZ** preview includes the bilingual labels; Cesium does not execute MapTiler SDK language settings or a vector style JSON. Check plan support for custom raster output before proceeding.
4. Copy `.env.example` to `.env.local` and fill in:

```dotenv
VITE_MAPTILER_API_KEY=your_browser_api_key
VITE_MAPTILER_MAP_ID=your_saved_bilingual_map_id
```

5. Restrict the browser key to intended origins in MapTiler, including the local development address. Restart `npm run dev` after changing the environment file. Production hosting needs the same values set before building.

Vite embeds `VITE_` values in browser code: these keys are not server secrets. Use a dedicated restricted browser key, not an administrative credential. `.env.local` is excluded from Git; `.env.example` contains no key.

The integration requests 256px raster XYZ tiles through zoom 19, preserving the current camera-height fade and Natural Earth overview. MapTiler logo and OpenStreetMap attribution appear with the road layer; preserve any additional credits required by the selected map.

Before adopting the new style, compare London, Cairo, Tokyo and the Kenya/Somalia area at regional and street scales: check native/English country and city labels, local street names, roads, borders, water, green land areas and close-up detail. Check zooming both ways, tile errors, attribution and Safari rendering. Similar source data does not guarantee identical style or feature coverage.

Until an account, key and saved bilingual style are supplied, MapTiler tiles and bilingual output remain unverified. Invalid credentials or map IDs may produce blank road tiles; clear either configuration value and restart to return to OpenStreetMap.

References: [MapTiler language settings](https://docs.maptiler.com/guides/map-design/global-map-settings/), [Cesium integration](https://docs.maptiler.com/cesium/), [API](https://docs.maptiler.com/cloud/api/reference/), [pricing](https://www.maptiler.com/cloud/pricing/).
