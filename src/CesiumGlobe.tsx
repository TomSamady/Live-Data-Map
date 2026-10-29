import { useEffect, useRef, useState } from 'react'
import {
    buildModuleUrl,
    Cartesian3,
    Color,
    Credit,
    ImageryLayer,
    OpenStreetMapImageryProvider,
    TileMapServiceImageryProvider,
    UrlTemplateImageryProvider,
    Viewer,
    GeoJsonDataSource,
    ScreenSpaceEventType,
    ColorMaterialProperty,
    CallbackProperty
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export default function CesiumGlobe() {
    const container = useRef<HTMLDivElement>(null)

    const [selectedCountryName, setSelectedCountryName] =
        useState<string | null>(null)

    useEffect(() => {
        if (!container.current) return

        const viewer = new Viewer(container.current, {
            baseLayer: ImageryLayer.fromProviderAsync(
                TileMapServiceImageryProvider.fromUrl(
                    buildModuleUrl('Assets/Textures/NaturalEarthII'),
                ),
            ),
            baseLayerPicker: false,
            geocoder: false,
            animation: false,
            timeline: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            fullscreenButton: false,
            homeButton: false,
            selectionIndicator: false,
            infoBox: false,
        })

        viewer.screenSpaceEventHandler.removeInputAction(
            ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
        )

        // MapTiler's saved style controls bilingual labels; the key only grants access.
        const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY?.trim()
        const mapTilerMapId = import.meta.env.VITE_MAPTILER_MAP_ID?.trim()
        const useMapTiler = Boolean(mapTilerKey && mapTilerMapId)

        const roadProvider = useMapTiler
            ? new UrlTemplateImageryProvider({
                url: `https://api.maptiler.com/maps/${encodeURIComponent(mapTilerMapId!)}/256/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTilerKey!)}`,
                tileWidth: 256,
                tileHeight: 256,
                maximumLevel: 19,
                enablePickFeatures: false,
                credit: new Credit(
                    '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler" width="100" height="30" /></a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
                    true,
                ),
            })
            : new OpenStreetMapImageryProvider({
                url: 'https://tile.openstreetmap.org/',
                maximumLevel: 19,
            })

        const roadLayer = viewer.imageryLayers.addImageryProvider(roadProvider)

        roadLayer.show = false
        roadLayer.alpha = 0

        function updateImagery() {
            const height = viewer.camera.positionCartographic.height

            const roadsFullyVisibleBelow = 2_000_000
            const roadsHiddenAbove = 6_000_000

            const opacity =
                (roadsHiddenAbove - height) /
                (roadsHiddenAbove - roadsFullyVisibleBelow)

            roadLayer.alpha = Math.max(0, Math.min(1, opacity))
            roadLayer.show = roadLayer.alpha > 0
        }

        updateImagery()

        const removeImageryListener =
            viewer.scene.preRender.addEventListener(updateImagery)

        viewer.scene.globe.baseColor = Color.fromCssColorString('#174975')

        viewer.camera.setView({
            destination: Cartesian3.fromDegrees(10, 22, 20_000_000),
        })

        let selectedCountryCode: string | undefined

        const normalColour =
            Color.fromCssColorString('#83d8c0').withAlpha(0.08)

        const selectedColour =
            Color.fromCssColorString('#ff4fa3').withAlpha(0.55)

        async function loadCountries() {
            try {
                const countries = await GeoJsonDataSource.load(
                    '/countries.geojson',
                    {
                        stroke: Color.fromCssColorString('#83d8c0'),
                        strokeWidth: 1,
                        fill: Color.fromCssColorString('#83d8c0').withAlpha(0.08),
                        credit: 'Country boundaries: Natural Earth',
                    },
                )

                if (viewer.isDestroyed()) return

                for (const country of countries.entities.values) {
                    if (!country.polygon) continue

                    const code = country.properties?.ADM0_A3?.getValue(
                        viewer.clock.currentTime,
                    )

                    country.polygon.material = new ColorMaterialProperty(
                        new CallbackProperty(() => {
                            return (
                                typeof code === 'string' &&
                                code === selectedCountryCode
                            )
                                ? selectedColour
                                : normalColour
                        }, false),
                    )
                }

                await viewer.dataSources.add(countries)
            } catch (error) {
                if (viewer.isDestroyed()) return

                console.error('Could not load country boundaries:', error)
            }
        }

        void loadCountries()
        const removeSelectionListener =
            viewer.selectedEntityChanged.addEventListener((entity) => {
                const time = viewer.clock.currentTime

                const name = entity?.properties?.ADMIN?.getValue(time)
                const code = entity?.properties?.ADM0_A3?.getValue(time)

                selectedCountryCode =
                    typeof code === 'string' ? code : undefined

                setSelectedCountryName(
                    typeof name === 'string' ? name : null,
                )
            })

        return () => {
            removeSelectionListener()
            removeImageryListener()
            viewer.destroy()
        }
    }, [])

    return (
        <section className="globe-stage" aria-label="Interactive Earth">
            <div className="globe-canvas" ref={container} />
            <p className="country-status" role="status">
                {selectedCountryName
                    ? `Selected: ${selectedCountryName}`
                    : 'Click a country to explore'}
            </p>
        </section>
    )
}
