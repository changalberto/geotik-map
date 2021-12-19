// Vendor Imports
import { useState, useEffect, useMemo, useCallback } from 'react'
import { isNull, isEmpty } from 'lodash'

// Source Imports
import { MAPBOX_TOKEN } from 'constants/environment'
import { GeoData } from 'services/GeoData'
import Map from 'components/Map'
import RadialStackedBars from 'components/RadialStackedBars'
import Select from 'components/Select'

// Styles
import './App.scss'

function App() {
  const [imparedVehiclesData, setImparedVehiclesData] = useState(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)

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

  // const _getNeighborhoodOptions = () => {}

  // Utility Methods
  const getYearOptionsByFeatureId = useCallback(
    (id) => {
      if (!isNull(id)) {
        const { features } = imparedVehiclesData
        const selectedFeature = features.find(
          ({ id }) => id === selectedFeatureId
        )

        if (!isEmpty(selectedFeature)) {
          const { properties } = selectedFeature
          const years = Object.keys(properties).filter((key) =>
            key.startsWith('20')
          )
          console.log('years', years)
          return [
            { value: null, label: 'All' },
            ...years.map((year) => ({ value: year, label: year })),
          ]
        }
      }
      return [{ value: null, label: 'None' }]
    },
    [imparedVehiclesData, selectedFeatureId]
  )

  // Event Handlers
  const _handlePolygonClick = ({ object: { id } }) => {
    setSelectedFeatureId(id)
  }

  const _handleNeighboorhoodChange = (featureId) => {
    setSelectedFeatureId(+featureId)
    setSelectedYear(null)
    console.log('_handleNeighboorhoodChange', featureId)
  }

  const _handleYearChange = (year) => {
    setSelectedYear(year)
    console.log('_handleYearChange', year)
  }

  // Memoized Consts
  const neighborhoodOptions = useMemo(() => {
    if (imparedVehiclesData) {
      const { features } = imparedVehiclesData

      return features.map(({ id, properties }) => ({
        value: id,
        label: properties?.name,
      }))
    }
  }, [imparedVehiclesData])

  const selectedYearOptions = useMemo(
    () => getYearOptionsByFeatureId(selectedFeatureId),
    [getYearOptionsByFeatureId, selectedFeatureId]
  )

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
          {neighborhoodOptions && (
            <Select
              name="neighborhood"
              options={neighborhoodOptions}
              onChange={_handleNeighboorhoodChange}
              selected={selectedFeatureId}
            />
          )}
          {neighborhoodOptions && (
            <Select
              name="year"
              options={selectedYearOptions}
              onChange={_handleYearChange}
              selected={selectedYear}
              disabled={isNull(selectedFeatureId)}
            />
          )}
        </div>
        <RadialStackedBars />
      </aside>
    </div>
  )
}

export default App
