import { useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import isNull from 'lodash/isNull'

const RadialStackedBars = ({
  width,
  height,
  innerRadius,
  data,
  selectedFeatureId,
  selectedYear,
  onStackSelected,
  ...props
}) => {
  const [svg, setSvg] = useState(null)
  const outerRadius = Math.min(width, height) / 2
  const columnsColors = ['#98abc5', '#8a89a6', '#7b6888', '#d0743c', '#ff8c00']
  const columns = useMemo(() => [2010, 2011, 2012, 2013, 2014], [])

  // Memoize transformed data for D3 consumption
  const _data = useMemo(
    () =>
      data.map(({ id, properties }) => {
        return {
          id,
          label: properties.name,
          ...columns.reduce(
            (accum, current) => ({
              ...accum,
              [current]: !isNull(properties[current]) ? properties[current] : 0,
            }),
            {}
          ),
          total: !isNull(properties.total) ? properties.total : 0,
        }
      }),
    [data, columns]
  )

  const x = d3
    .scaleBand()
    .domain(_data.map((d) => d.label))
    .range([0, 2 * Math.PI])
    .align(0)
  const y = d3
    .scaleRadial()
    .domain([0, d3.max(_data, (d) => d.total)])
    .range([innerRadius, outerRadius])
  const z = d3.scaleOrdinal().domain(columns).range(columnsColors)
  const arc = d3
    .arc()
    .innerRadius((d) => y(d[0]))
    .outerRadius((d) => y(d[1]))
    .startAngle((d) => x(d.data.label))
    .endAngle((d) => {
      return x(d.data.label) + x.bandwidth()
    })
    .padAngle(0.01)
    .padRadius(innerRadius)

  // Initial Mount
  useEffect(() => {
    !svg && _drawChartCanvas()
  }, [])

  useEffect(() => {
    if (svg) {
      const className = `class-${selectedFeatureId}`
      svg.selectAll(`path.${className}`).style('opacity', 1)
      svg.selectAll(`path:not(.${className})`).style('opacity', 0.3)
    }
    if (!selectedFeatureId) {
      svg.selectAll(`path`).style('opacity', 1)
    }
  }, [svg, selectedFeatureId])

  const _drawChartCanvas = () => {
    const _svg = d3
      .select('.radial-stacked-bars')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('margin', 'auto')
      .style('font', '10px sans-serif')

    _drawStackBars(_svg)

    // Add measurement rings
    _svg.append('g').call(_yAxis)

    // Add Legend to the Center of the Graph
    _svg.append('g').call(_legend)

    // Add the labels
    _labels(_svg)

    setSvg(_svg)
  }

  const _drawStackBars = (svg) => {
    const series = d3.stack().keys(columns)(_data)
    svg
      .append('g')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', (d) => z(d.key))
      .selectAll('path')
      .data((d) => d)
      .join('path')
      .attr('class', (d) => `class-${d.data.id}`)
      .attr('data-id', (d) => d.data.id)
      .attr('d', arc)
      .on('click', function (d) {
        const className = this.className?.baseVal
        const id = this.getAttribute('data-id')
        svg.selectAll(`path.${className}`).style('opacity', 1)
        svg.selectAll(`path:not(.${className})`).style('opacity', 0.3)
        onStackSelected(id)
      })
  }

  const _yAxis = (g) =>
    g
      .attr('text-anchor', 'middle')
      .call((g) =>
        g
          .append('text')
          .attr('y', (d) => -y(y.ticks(5).pop()))
          .attr('dy', '-1em')
          .attr('fill', '#666')
          .style('font', 'bold 16px sans-serif')
          .attr('stroke', '#fff')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-width', 1)
          .text('Accidents')
      )
      .call((g) =>
        g
          .selectAll('g')
          .data(y.ticks(5).slice(1))
          .join('g')
          .attr('fill', 'none')
          .call((g) =>
            g
              .append('circle')
              .attr('stroke', '#999')
              .attr('stroke-opacity', 0.5)
              .attr('r', y)
          )
          .call((g) =>
            g
              .append('text')
              .attr('y', (d) => -y(d))
              .attr('dy', '0.35em')
              .attr('stroke', '#fff')
              .attr('stroke-width', 5)
              .text(y.tickFormat(5, 's'))
              .clone(true)
              .attr('fill', '#999')
              .attr('stroke', 'none')
          )
      )

  const _labels = (svg) => {
    svg
      .append('g')
      .selectAll('g')
      .data(_data)
      .enter()
      .append('g')
      .attr('text-anchor', function (d) {
        return (x(d.label) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
          Math.PI
          ? 'end'
          : 'start'
      })
      .attr('transform', function (d) {
        return (
          'rotate(' +
          (((x(d.label) + x.bandwidth() / 2) * 180) / Math.PI - 90) +
          ')' +
          'translate(' +
          (y(d['total']) + 10) +
          ',0)'
        )
      })
      .append('text')
      .text(function (d) {
        return d.label
      })
      .attr('transform', function (d) {
        return (x(d.label) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
          Math.PI
          ? 'rotate(180)'
          : 'rotate(0)'
      })
      .style('font-size', '11px')
      .attr('alignment-baseline', 'middle')
  }

  const _legend = (g) =>
    g
      .append('g')
      .selectAll('g')
      .data(columns.reverse())
      .join('g')
      .attr(
        'transform',
        (d, i) => `translate(-20,${(i - (columns.length - 1) / 2) * 20})`
      )
      .call((g) =>
        g.append('rect').attr('width', 16).attr('height', 18).attr('fill', z)
      )
      .call((g) =>
        g
          .append('text')
          .attr('x', 24)
          .attr('y', 9)
          .attr('dy', '0.35em')
          .text((d) => d)
      )

  return <div className="radial-stacked-bars"></div>
}

RadialStackedBars.defaultProps = {
  width: 800,
  height: 800,
  innerRadius: 180,
  onStackSelected: (id) => {},
}

export default RadialStackedBars
