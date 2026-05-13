import {
  SVG_WIDTH,
  SVG_HEIGHT,
  MARGIN,
  COLUMN_LABELS,
  COLUMN_GAP,
  COLORS,
  BLOCK_ROW_HEIGHT,
  COIN_ROW_GAP,
  COIN_ROW_HEIGHT
} from './constants.js?v=20260513f';

export function setupSVG() {
  const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);

  const chartWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = BLOCK_ROW_HEIGHT;
  const coinRowY = chartHeight + COIN_ROW_GAP;
  const coinRowHeight = COIN_ROW_HEIGHT;

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

  COLUMN_LABELS.forEach((label, i) => {
    const xPos = i * (columnWidth + COLUMN_GAP);
    g.append("rect")
      .attr("class", `coin-bg coin-${label.toLowerCase()}`)
      .attr("x", xPos)
      .attr("y", coinRowY)
      .attr("width", columnWidth)
      .attr("height", coinRowHeight)
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
  const coinG = g.append("g").attr("class", "coin-token-group");

  addTransferControls(g, columnWidth, chartHeight / 2, 'blocks');
  addTransferControls(g, columnWidth, coinRowY + coinRowHeight / 2, 'coins');

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

  return { svg, g, coinG, chartWidth, chartHeight, columnWidth, coinRowY, coinRowHeight };
}

function addTransferControls(g, columnWidth, centerY, rowName) {
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
      y: centerY - 22,
      label: '➡️',
      action: boundary.forwardAction,
      rowName
    });

    addTransferButton(g, {
      x: boundary.x,
      y: centerY + 22,
      label: '⬅️',
      action: boundary.backwardAction,
      rowName
    });
  });
}

function addTransferButton(g, { x, y, label, action, rowName }) {
  const buttonSize = 34;
  const button = g.append("g")
    .attr("class", `transfer-button transfer-button-${rowName} transfer-${action}`)
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
