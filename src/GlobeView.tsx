import { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'

type CountryGeometry = {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][][] | number[][][][]
}

type CountryFeature = {
  type: 'Feature'
  properties: {
    ADM0_A3: string
    ADMIN: string
  }
  geometry: CountryGeometry
}

type CountryCollection = {
  type: 'FeatureCollection'
  features: CountryFeature[]
}

const HOME = { lat: 22, lng: 10, altitude: 2.2 }

export default function GlobeView() {
  const container = useRef<HTMLDivElement>(null)
  const globe = useRef<GlobeMethods | undefined>(undefined)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [countryError, setCountryError] = useState(false)

  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  // Check the local texture explicitly so a failed image does not leave a blank globe.
  useEffect(() => {
    const image = new Image()
    image.onerror = () => setError(true)
    image.src = '/earth.svg'
    return () => { image.onerror = null }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCountries() {
      try {
        const response = await fetch('/countries.geojson', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Country data request failed: ${response.status}`)
        }

        const data = (await response.json()) as CountryCollection

        if (
          data.type !== 'FeatureCollection' ||
          !Array.isArray(data.features)
        ) {
          throw new Error('Country data is not a GeoJSON feature collection')
        }

        setCountries(data.features)
      } catch {
        if (!controller.signal.aborted) {
          setCountryError(true)
        }
      }
    }

    void loadCountries()

    return () => controller.abort()
  }, [])

  function moveCamera(view: { lat?: number; lng?: number; altitude?: number }) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    globe.current?.pointOfView(view, reducedMotion ? 0 : 450)
  }

  function zoom(factor: number) {
    const altitude = globe.current?.pointOfView().altitude ?? HOME.altitude
    moveCamera({ altitude: Math.max(1.2, Math.min(4, altitude * factor)) })
  }

  function initialise() {
    if (!globe.current) return
    const controls = globe.current.controls()
    controls.autoRotate = false
    controls.enableDamping = false
    controls.zoomToCursor = false
    controls.enablePan = false
    controls.minDistance = 220
    controls.maxDistance = 500
    globe.current.pointOfView(HOME, 0)
    setReady(true)
  }

  return (
    <section className="globe-stage" aria-label="Interactive Earth" aria-describedby="globe-help">
      <div className="globe-canvas" ref={container}>
        {size.width > 0 && size.height > 0 && !error && (
          <Globe
            ref={globe}
            width={size.width}
            height={size.height}
            backgroundColor="#080f20"
            globeImageUrl="/earth.svg"
            atmosphereColor="#77c8ff"
            atmosphereAltitude={0.16}
            animateIn={false}
            onGlobeReady={initialise}
          />
        )}
      </div>
      {(!ready || error) && (
        <p className="globe-status" role="status">
          {error ? 'Earth texture could not load. Refresh the page to try again.' : 'Loading Earth…'}
        </p>
      )}
      <div className="globe-toolbar" aria-label="Globe controls">
        <button disabled={!ready || error} onClick={() => zoom(0.8)} aria-label="Zoom in">+</button>
        <button disabled={!ready || error} onClick={() => zoom(1.25)} aria-label="Zoom out">−</button>
        <button disabled={!ready || error} onClick={() => moveCamera(HOME)}>Reset view</button>
      </div>
      <p id="globe-help" className="globe-help">Drag to rotate · Scroll or pinch to zoom</p>
    </section>
  )
}
