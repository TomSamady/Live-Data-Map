import CesiumGlobe from './CesiumGlobe'
import './App.css'

export default function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div><p className="eyebrow">Explore our world</p><h1>Live Data Map<span>.</span></h1></div>
        <span className="prototype-badge">Globe prototype</span>
      </header>
    <CesiumGlobe />
      <footer className="app-footer">
        <p>A world of discovery starts here. Country search and profiles are coming next.</p>
        <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Made with Natural Earth</a>
      </footer>
    </main>
  )
}
