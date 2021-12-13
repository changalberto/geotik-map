// Vendor Imports
import { useState, useEffect } from 'react'
import {
  MapView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight,
} from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import { StaticMap } from 'react-map-gl'

// Source Imports
import * as MapUtils from 'utils/map-utils'

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
})

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true,
})

// https://deck.gl/docs/api-reference/layers/polygon-layer
// This is an object that contains material props for lighting effect applied on extruded polygons.
// Check the lighting guide for configurable settings.
const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51],
}

// Center into DC coordinates
const DC_COORDINATES = {
  latitude: 38.895,
  longitude: -77.0366,
}

const initilaViewState = {
  ...DC_COORDINATES,
  zoom: 11,
  minZoom: 8,
  pitch: 55,
  bearing: 0,
}

// https://visgl.github.io/react-map-gl/docs/api-reference/interactive-map
const Map = ({
  data,
  token,
  width = '100%',
  height = '100vh',
  selectedFeatureId = null,
  onPolygonClick = (info) => {},
  ...props
}) => {
  const _maxTotal = Math.max(
    ...[...data?.features].map(({ properties }) => properties.total)
  )

  const _filterFeatureById = (featureId) => {
    const { features } = data
    return { ...data, features: [features.find(({ id }) => id === featureId)] }
  }

  const _getTooltip = ({ object }) => {
    if (object) {
      const { properties } = object
      return {
        html: `
          <div style="font-size: 16px; margin-bottom: 7px;"><b>${
            properties.name
          }</b> (${getTotalOrNA(properties.total)})</div>
          <div style="font-size: 12px;"><b>2010</b>: ${getTotalOrNA(
            properties[2010]
          )}</div>
          <div style="font-size: 12px;"><b>2011</b>: ${getTotalOrNA(
            properties[2011]
          )}</div>
          <div style="font-size: 12px;"><b>2012</b>: ${getTotalOrNA(
            properties[2012]
          )}</div>
          <div style="font-size: 12px;"><b>2013</b>: ${getTotalOrNA(
            properties[2013]
          )}</div>
          <div style="font-size: 12px;"><b>2014</b>: ${getTotalOrNA(
            properties[2014]
          )}</div>
        `,
      }
    }
    return null
  }

  const getTotalOrNA = (value) => {
    return value === null ? 'N/A' : value
  }

  const layers = [
    // Flat Polygons Layer
    new GeoJsonLayer({
      id: 'flat-polygons-layer',
      data,
      opacity: 0.8,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: true,
      getElevation: 0,
      getFillColor: ({ properties }) =>
        MapUtils.colorScale(properties?.total, _maxTotal),
      getLineColor: [0, 0, 0],
      pickable: true,
      onClick: (info) => onPolygonClick(info),
    }),

    // Extruded Polygons Layer
    selectedFeatureId &&
      new GeoJsonLayer({
        id: 'extruded-polygons-layer',
        data: _filterFeatureById(selectedFeatureId),
        opacity: 0.7,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        getElevation: ({ properties }) => Math.max(properties?.total, 1) * 25, // Accument elevation by 25 times for extrution emphasis
        getFillColor: ({ properties }) =>
          MapUtils.colorScale(properties?.total, _maxTotal),
        getLineColor: [255, 255, 255],
        material,
        pickable: true,
      }),
  ]

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight })
    lightingEffect.shadowColor = [0, 0, 0, 0.5]
    return [lightingEffect]
  })

  return (
    <DeckGL
      initialViewState={{ ...initilaViewState }}
      layers={layers}
      effects={effects}
      controller={true}
      getTooltip={_getTooltip}
    >
      <MapView id="map" width={width} controller={true}>
        <StaticMap
          mapStyle="mapbox://styles/mapbox/light-v10"
          reuseMaps
          mapboxApiAccessToken={token}
          preventStyleDiffing={true}
        />
      </MapView>
    </DeckGL>
  )
}

export default Map
