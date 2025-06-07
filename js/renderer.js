import { UNIT_SIZE } from './constants.js';

export function renderSquares(svgGroup, unitSquaresData) {
  const squares = svgGroup.selectAll(".unit-square")
    .data(unitSquaresData, d => d.id);

  squares.enter()
    .append("rect")
    .attr("class", "unit-square")
    .attr("width", UNIT_SIZE)
    .attr("height", UNIT_SIZE)
    .attr("fill", "steelblue") // Temporary color
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .attr("x", (d, i) => d.targetX) // Will use targetX/Y later
    .attr("y", (d, i) => d.targetY)
  .merge(squares) // Apply to updating elements as well
    // For now, no transition on x,y, just direct set
    .attr("x", d => d.targetX)
    .attr("y", d => d.targetY);

  squares.exit().remove();
}