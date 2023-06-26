import type { Map } from "leaflet"

type Leaflet = typeof import("leaflet") // eslint-disable-line
type Coordinate = [number, number]
type Callback = (map: Map, leaflet: Leaflet) => void
type MapInjection = (callback: Callback) => void

export { Leaflet, Coordinate, Callback, MapInjection }
