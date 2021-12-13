import { scaleLinear } from 'd3-scale'

// https://github.com/visgl/deck.gl/blob/8.6-release/examples/website/geojson/app.js
export const colorScale = (range = 0, max = 10) =>
  scaleLinear()
    .domain([0, max])
    .range([
      [255, 217, 217],
      [255, 124, 10],
    ])(range)
