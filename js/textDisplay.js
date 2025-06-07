import { digitToWord, expandedValue } from './utils.js'; // Ensure digitToWord is imported
import { COLORS } from './constants.js';

export function updateTextLabels(allUnitSquares, svgContext) {
  // Count conceptual groups (this part remains the same)
  const counts = countConceptualGroups(allUnitSquares);

  // Column information (this part remains the same)
  const columns = [
    { name: 'hundreds', count: counts.flats, place: 'hundreds' },
    { name: 'tens', count: counts.rods, place: 'tens' },
    { name: 'ones', count: counts.units, place: 'ones' }
  ];

  columns.forEach((column) => { // Removed 'index' as it's not used in new logic
    const textGroup = d3.select(`.column-text-${column.name}`);

    // Clear previous text
    textGroup.selectAll('text').remove();

    // --- NEW TEXT GENERATION LOGIC ---

    // Generate text content for Line 1
    let line1Text;
    if (column.place === 'hundreds') {
      const countWord = (column.count >= 0 && column.count <= 9) ? digitToWord(column.count) : column.count.toString();
      line1Text = `${countWord} ${column.count === 1 ? 'hundred' : 'hundreds'}`;
    } else if (column.place === 'tens') {
      line1Text = `${column.count} ${column.count === 1 ? 'ten' : 'tens'}`;
    } else { // ones
      // This logic will produce "1 one", "4 ones".
      line1Text = `${column.count} ${column.count === 1 ? 'one' : 'ones'}`;
    }

    // Generate text content for Line 2
    const currentExpandedValue = expandedValue(column.count, column.place);
    const line2Text = `= ${currentExpandedValue} square${currentExpandedValue === 1 ? '' : 's'}`;

    // --- NEW TEXT APPENDING AND STYLING ---
    const columnWidth = svgContext.columnWidth;
    const centerX = columnWidth / 2;

    // Add Line 1 Text (e.g., "two hundreds" or "3 tens")
    textGroup.append('text')
      .attr('x', centerX)
      .attr('y', 25) // Position from the top of the grey box
      .attr('text-anchor', 'middle')
      .style('font-size', '20px') // Larger font size
      .style('font-weight', 'bold')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', COLORS.TEXT_PRIMARY) // Black/dark color
      .text(line1Text);

    // Add Line 2 Text (e.g., "= 200 squares")
    textGroup.append('text')
      .attr('x', centerX)
      .attr('y', 50) // Position below Line 1 (25 (y1) + 20 (fontsize1) + 5 (spacing))
      .attr('text-anchor', 'middle')
      .style('font-size', '18px') // Slightly smaller or adjusted as preferred
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', COLORS.TEXT_PRIMARY) // Black/dark color
      .text(line2Text);
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