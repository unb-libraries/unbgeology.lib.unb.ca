import type { Map, Layer, LayerGroup } from "leaflet"

export type Leaflet = typeof import("leaflet") // eslint-disable-line
export type Coordinate = [number, number]
export type Callback = (map: Map | LayerGroup, leaflet: Leaflet) => void | Promise<void>
export type MapInjection = () => Promise<Map>
export type LayerAddInjection = (layer: Layer) => void
export type LayerRemoveInjection = (layer: Layer) => void
