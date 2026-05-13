import { SVG_WIDTH, SVG_HEIGHT, MARGIN, COLUMN_LABELS, COLUMN_GAP, COLORS } from './constants.js?v=20260513e';

export function setupSVG() {
  const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);

  const chartWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  const columnWidth = (chartWidth - (COLUMN_GAP * (COLUMN_LABELS.length - 1))) / COLUMN_LABELS.length;

  // Column backgrounds
  COLUMN_LABELS.forEach((label, i) => {
    const xPos = i * (columnWidth + COLUMN_GAP);
    g.append("rect")
      .attr("class", `column-bg column-${label.toLowerCase()}`)
      .attr("x", xPos)
      .attr("y", 0)
      .attr("width", columnWidth)
      .attr("height", chartHeight)
      .attr("fill", COLORS.COLUMN_BG)
      .attr("stroke", COLORS.COLUMN_BORDER);
  });

  // Placeholder for column text info

  COLUMN_LABELS.forEach((label, i) => {
    const xPos = i * (columnWidth + COLUMN_GAP);
    g.append("g")
      .attr("class", `column-text-group column-text-${label.toLowerCase()}`)
      .attr("transform", `translate(${xPos}, 0)`);
  });

  // Add a group for the sum equation display
  g.append("g").attr("class", "sum-equation-group");

  addTransferControls(g, columnWidth, chartHeight);

  // Add right-click listeners to column backgrounds for composition
  g.select(".column-bg.column-ones")
    .on("contextmenu", function (event) {
      event.preventDefault();
      console.log("Right-clicked Ones column");
      if (window.handleColumnRightClick) {
        window.handleColumnRightClick('ones');
      }
    });

  g.select(".column-bg.column-tens")
    .on("contextmenu", function (event) {
      event.preventDefault();
      console.log("Right-clicked Tens column");
      if (window.handleColumnRightClick) {
        window.handleColumnRightClick('tens');
      }
    });

  return { svg, g, chartWidth, chartHeight, columnWidth };
}

function addTransferControls(g, columnWidth, chartHeight) {
  const boundaries = [
    {
      x: columnWidth + COLUMN_GAP / 2,
      forwardAction: 'decompose-hundreds',
      backwardAction: 'compose-hundreds'
    },
    {
      x: 2 * columnWidth + COLUMN_GAP + COLUMN_GAP / 2,
      forwardAction: 'decompose-tens',
      backwardAction: 'compose-tens'
    }
  ];

  boundaries.forEach(boundary => {
    addTransferButton(g, {
      x: boundary.x,
      y: chartHeight / 2 - 22,
      label: '➡️',
      action: boundary.forwardAction
    });

    addTransferButton(g, {
      x: boundary.x,
      y: chartHeight / 2 + 22,
      label: '⬅️',
      action: boundary.backwardAction
    });
  });
}

function addTransferButton(g, { x, y, label, action }) {
  const buttonSize = 34;
  const button = g.append("g")
    .attr("class", `transfer-button transfer-${action}`)
    .attr("transform", `translate(${x - buttonSize / 2}, ${y - buttonSize / 2})`)
    .style("cursor", "pointer")
    .attr("role", "button")
    .attr("aria-label", action)
    .on("click", function (event) {
      event.stopPropagation();
      if (window.handleTransferButtonClick) {
        window.handleTransferButtonClick(action);
      }
    })
    .on("contextmenu", function (event) {
      event.preventDefault();
      event.stopPropagation();
    });

  button.append("rect")
    .attr("width", buttonSize)
    .attr("height", buttonSize)
    .attr("rx", 5)
    .attr("fill", "#FFFFFF")
    .attr("stroke", COLORS.UNIT_FILL_BASE)
    .attr("stroke-width", 2);

  button.append("text")
    .attr("x", buttonSize / 2)
    .attr("y", buttonSize / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("font-size", "19px")
    .style("font-weight", "700")
    .style("font-family", "system-ui, -apple-system, sans-serif")
    .style("fill", COLORS.TEXT_PRIMARY)
    .style("pointer-events", "none")
    .text(label);
}
