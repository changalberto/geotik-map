import geoData from '__mock__/annotatedData.geojson'

export class GeoData {
  static async getImparedVehicles() {
    return await fetch(geoData)
      .then((resp) => resp.json())
      .then((data) => data)
  }
}
