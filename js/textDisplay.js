import { digitToWord, expandedValue, digitPhrase } from './utils.js';
import { COLORS } from './constants.js';

export function updateTextLabels(allUnitSquares, svgContext) {
  // Count conceptual groups
  const counts = countConceptualGroups(allUnitSquares);
  
  // Column information
  const columns = [
    { name: 'hundreds', count: counts.flats, place: 'hundreds' },
    { name: 'tens', count: counts.rods, place: 'tens' },
    { name: 'ones', count: counts.units, place: 'ones' }
  ];
  
  columns.forEach((column, index) => {
    const textGroup = d3.select(`.column-text-${column.name}`);
    
    // Clear previous text
    textGroup.selectAll('text').remove();
    
    // Generate text content
    const digit = column.count.toString();
    const expanded = expandedValue(column.count, column.place).toString();
    const phrase = digitPhrase(column.count, column.place);
    
    // Position text elements within the column
    const columnWidth = svgContext.columnWidth;
    const centerX = columnWidth / 2;
    
    // Add digit
    textGroup.append('text')
      .attr('x', centerX)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('class', 'digit-text')
      .style('font-size', '28px')
      .style('font-weight', 'bold')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', COLORS.TEXT_PRIMARY)
      .text(digit);
    
    // Add expanded value
    textGroup.append('text')
      .attr('x', centerX)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('class', 'expanded-text')
      .style('font-size', '18px')
      .style('font-weight', '500')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', COLORS.TEXT_SECONDARY)
      .text(expanded);
    
    // Add phrase
    textGroup.append('text')
      .attr('x', centerX)
      .attr('y', 70)
      .attr('text-anchor', 'middle')
      .attr('class', 'phrase-text')
      .style('font-size', '16px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', COLORS.TEXT_TERTIARY)
      .text(phrase);
  });
}

function countConceptualGroups(allUnitSquares) {
  // Count flats
  const flatGroups = {};
  const rodGroups = {};
  let units = 0;
  
  allUnitSquares.forEach(square => {
    if (square.grouping === 'flat') {
      if (!flatGroups[square.groupLeaderId]) {
        flatGroups[square.groupLeaderId] = true;
      }
    } else if (square.grouping === 'rod') {
      if (!rodGroups[square.groupLeaderId]) {
        rodGroups[square.groupLeaderId] = true;
      }
    } else if (square.grouping === 'unit') {
      units++;
    }
  });
  
  return {
    flats: Object.keys(flatGroups).length,
    rods: Object.keys(rodGroups).length,
    units: units
  };
}