// Vendor Imports
import { useState, useEffect } from 'react'

// Source Imports
import { MAPBOX_TOKEN } from 'constants/environment'
import { GeoData } from 'services/GeoData'
import Map from 'components/Map'
import RadialStackedBars from 'components/RadialStackedBars'

// Styles
import './App.scss'

function App() {
  const [imparedVehiclesData, setImparedVehiclesData] = useState(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const geoJSON = await GeoData.getImparedVehicles()
      setImparedVehiclesData(geoJSON)
    }
    fetchData()
  }, [])

  useEffect(() => {
    console && console.log('imparedVehiclesData', imparedVehiclesData)
  }, [imparedVehiclesData])

  // Replaces properties of total null with argument total and returns new array
  // const _getReplacedNullTotalsWith = (geoJSON, total = 0) => {
  //   const { features } = geoJSON
  //   const _features = features.map((feature) => {
  //     const { properties } = feature
  //     return properties?.total === null
  //       ? { ...feature, properties: { ...properties, total } }
  //       : feature
  //   })
  //   return { ...geoJSON, features: _features }
  // }

  const _handlePolygonClick = ({ object: { id } }) => {
    setSelectedFeatureId(id)
  }

  return (
    <div className="App">
      <div className="map">
        {imparedVehiclesData && (
          <Map
            data={imparedVehiclesData}
            width="100%"
            height="100%"
            token={MAPBOX_TOKEN}
            selectedFeatureId={selectedFeatureId}
            onPolygonClick={_handlePolygonClick}
          />
        )}
      </div>
      <aside>
        <header>
          <h1>Impared Car Accidents</h1>
          <em>Washington DC, 2010-2014</em>
        </header>
        <div className="filter-group">
          <select name="neighborhood">
            <option value={null} selected disabled>
              Select
            </option>
          </select>
          <select name="year">
            <option value={null} selected disabled>
              Select
            </option>
          </select>
        </div>
        <RadialStackedBars />
      </aside>
    </div>
  )
}

export default App
