import { useState, useEffect } from 'react'

import './App.scss'

import { GeoData } from 'services/GeoData'

function App() {
  const [imparedVehiclesData, setImparedVehiclesData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const geoJson = await GeoData.getImparedVehicles()
      setImparedVehiclesData(geoJson)
    }
    fetchData()
  }, [])

  useEffect(() => {
    console && console.log('imparedVehiclesData', imparedVehiclesData)
  }, [imparedVehiclesData])

  return <div className="App"></div>
}

export default App
