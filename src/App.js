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

  // Utility Methods

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

  // Finds all available years within feature properties and generates array of year options
  const _getYearOptionsByFeatureId = useCallback(
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

          return [
            { value: null, label: 'All' },
            ...years.map((year) => ({ value: year, label: year })),
          ]
        }
      }
      return [{ value: null, label: 'All' }]
    },
    [imparedVehiclesData, selectedFeatureId]
  )

  // Event Handlers
  const _handlePolygonClick = ({ object: { id } }) => {
    setSelectedFeatureId(id)
  }

  const _handleNeighboorhoodChange = (featureId) => {
    setSelectedFeatureId(featureId ? +featureId : null)
    setSelectedYear(null)
  }

  const _handleYearChange = (year) => setSelectedYear(year)

  const _handleClearFilters = (e) => {
    e.preventDefault()
    setSelectedFeatureId(null)
    setSelectedYear(null)
  }

  // Memoized Consts
  const neighborhoodOptions = useMemo(() => {
    if (imparedVehiclesData) {
      const { features } = imparedVehiclesData

      return [
        { value: null, label: 'All' },
        ...features.map(({ id, properties }) => ({
          value: id,
          label: properties?.name,
        })),
      ]
    }
  }, [imparedVehiclesData])

  const selectedYearOptions = useMemo(
    () => _getYearOptionsByFeatureId(selectedFeatureId),
    [_getYearOptionsByFeatureId, selectedFeatureId]
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
            selectedYear={selectedYear}
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
              label="Neighborhood"
              name="neighborhood"
              options={neighborhoodOptions}
              onChange={_handleNeighboorhoodChange}
              selected={selectedFeatureId}
            />
          )}
          {neighborhoodOptions && (
            <Select
              label="Year"
              name="year"
              options={selectedYearOptions}
              onChange={_handleYearChange}
              selected={selectedYear}
              disabled={isNull(selectedFeatureId)}
            />
          )}

          <button
            className="button filter-group__clear-button"
            disabled={isNull(selectedFeatureId) && isNull(selectedFeatureId)}
            onClick={_handleClearFilters}
          >
            Clear All
          </button>
        </div>

        {imparedVehiclesData && (
          <RadialStackedBars
            data={imparedVehiclesData?.features}
            selectedFeatureId={selectedFeatureId}
            selectedYear={selectedYear}
            onStackSelected={_handleNeighboorhoodChange}
          />
        )}
      </aside>
    </div>
  )
}

export default App
