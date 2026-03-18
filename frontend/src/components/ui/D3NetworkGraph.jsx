import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function D3NetworkGraph({ data, className = '' }) {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || !svgRef.current) return

    const width = 600
    const height = 400

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Create simulation
    const simulation = d3
      .forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Add links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', 'rgba(124, 58, 237, 0.3)')
      .attr('stroke-width', 2)

    // Add nodes
    const node = svg
      .append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 12)
      .attr('fill', (d, i) => {
        const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b']
        return colors[i % colors.length]
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )

    // Add labels
    const label = svg
      .append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.label || d.id)
      .attr('font-size', 10)
      .attr('fill', '#a78bfa')
      .attr('text-anchor', 'middle')
      .attr('dy', -20)

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

      label.attr('x', (d) => d.x).attr('y', (d) => d.y)
    })

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [data])

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
