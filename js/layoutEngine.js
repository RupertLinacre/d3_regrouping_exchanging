import { UNIT_SIZE, LAYOUT_PADDING, COLUMN_GAP } from './constants.js';

export function calculateLayout(unitSquaresData, columnWidth, chartHeight, onesColumnXOffset) {
  const hundredsColumnX = 0;
  const tensColumnX = columnWidth + COLUMN_GAP;

  // Step 1: Handle 'unit' squares in Ones column
  const unitSquares = unitSquaresData.filter(square => square.grouping === 'unit');
  layoutUnitsInColumn(unitSquares, onesColumnXOffset, columnWidth, chartHeight);

  // Step 2: Handle 'rod' squares in Tens column
  const rodSquares = unitSquaresData.filter(square => square.grouping === 'rod');
  layoutRodsInColumn(rodSquares, tensColumnX, columnWidth, chartHeight);

  // Step 3: Handle 'flat' squares in Hundreds column
  const flatSquares = unitSquaresData.filter(square => square.grouping === 'flat');
  layoutFlatsInColumn(flatSquares, hundredsColumnX, columnWidth, chartHeight);

  // Step 4: Set off-screen positions for any unhandled squares
  unitSquaresData.forEach(square => {
    if (square.targetX === 0 && square.targetY === 0 &&
      square.grouping !== 'unit' &&
      !unitSquares.includes(square) &&
      !rodSquares.includes(square) &&
      !flatSquares.includes(square)) {
      square.targetX = -1000;
      square.targetY = -1000;
    }
  });
}

function layoutUnitsInColumn(unitSquares, columnX, columnWidth, chartHeight) {
  // Sort unit squares by their displayOrder for consistent layout
  unitSquares.sort((a, b) => a.displayOrder - b.displayOrder);

  const blockWidth = columnWidth - 2 * LAYOUT_PADDING;
  const unitsPerRow = Math.floor(blockWidth / (UNIT_SIZE + 2));
  const gap = 2;

  unitSquares.forEach((square, i) => {
    const row = Math.floor(i / unitsPerRow);
    const col = i % unitsPerRow;

    // --- colour: alternate every 10 units ---
    const groupIndex = Math.floor(i / 10); // 0–9, 10–19, 20–29, …
    square.colorCategory = (groupIndex % 2 === 0)
      ? 'base' // dark for even groups
      : 'highlightGroup'; // light for odd groups

    square.targetX = columnX + LAYOUT_PADDING + col * (UNIT_SIZE + gap);
    square.targetY = chartHeight - LAYOUT_PADDING - UNIT_SIZE - row * (UNIT_SIZE + gap);
  });
  // Remove any old color logic for units (e.g., if totalUnitsInColumn >= 10 ...)

  // --- REMOVE DUPLICATE/OLD FUNCTION DEFINITIONS BELOW ---
  // (If any duplicate layoutUnitsInColumn or layoutRodsInColumn exist below, delete them)
}

function layoutRodsInColumn(rodSquares, columnX, columnWidth, chartHeight) {
  // Group rod squares by their groupLeaderId
  const rodGroups = {};
  rodSquares.forEach(square => {
    if (!rodGroups[square.groupLeaderId]) {
      rodGroups[square.groupLeaderId] = [];
    }
    rodGroups[square.groupLeaderId].push(square);
  });

  // Sort rodIds by the displayOrder of the first square in each group
  const rodIds = Object.keys(rodGroups).sort((a, b) => {
    const aLeader = rodSquares.find(sq => sq.id === a);
    const bLeader = rodSquares.find(sq => sq.id === b);
    return aLeader.displayOrder - bLeader.displayOrder;
  });

  const blockWidth = columnWidth - 2 * LAYOUT_PADDING;
  const rodWidth = UNIT_SIZE;
  const rodHeight = 10 * UNIT_SIZE;
  const rodsPerRow = Math.floor(blockWidth / (rodWidth + 5));
  const gap = 5;

  rodIds.forEach((rodId, rodIndex) => {
    const row = Math.floor(rodIndex / rodsPerRow);
    const col = rodIndex % rodsPerRow;

    // --- colour: alternate every 10 rods ---
    const groupIndex = Math.floor(rodIndex / 10); // 0–9 rods, 10–19 rods, …
    const currentRodColorCategory = (groupIndex % 2 === 0)
      ? 'base'
      : 'highlightGroup';

    const rodX = columnX + LAYOUT_PADDING + col * (rodWidth + gap);
    const rodY = chartHeight - LAYOUT_PADDING - rodHeight - row * (rodHeight + gap);

    // Position each unit square within this rod
    rodGroups[rodId].forEach(square => {
      square.colorCategory = currentRodColorCategory;
      square.targetX = rodX;
      square.targetY = rodY + square.indexInGroup * UNIT_SIZE;
    });
  });
  // Remove any old color logic for rods (e.g., if ((rodIndex % 10) === 9) ...)
}

function layoutFlatsInColumn(flatSquares, columnX, columnWidth, chartHeight) {
  // Group flat squares by their groupLeaderId
  const flatGroups = {};
  flatSquares.forEach(square => {
    if (!flatGroups[square.groupLeaderId]) {
      flatGroups[square.groupLeaderId] = [];
    }
    flatGroups[square.groupLeaderId].push(square);
  });

  // Sort flatIds by the displayOrder of the first square in each group
  const flatIds = Object.keys(flatGroups).sort((a, b) => {
    const aLeader = flatSquares.find(sq => sq.id === a);
    const bLeader = flatSquares.find(sq => sq.id === b);
    return aLeader.displayOrder - bLeader.displayOrder;
  });

  const blockWidth = columnWidth - 2 * LAYOUT_PADDING;
  const flatWidth = 10 * UNIT_SIZE;
  const flatHeight = 10 * UNIT_SIZE;
  const flatsPerRow = Math.max(1, Math.floor(blockWidth / (flatWidth + 5)));
  const gap = 5;

  flatIds.forEach((flatId, flatIndex) => {
    const row = Math.floor(flatIndex / flatsPerRow);
    const col = flatIndex % flatsPerRow;

    const flatX = columnX + LAYOUT_PADDING + col * (flatWidth + gap);
    const flatY = chartHeight - LAYOUT_PADDING - flatHeight - row * (flatHeight + gap);

    // Position each unit square within this flat
    flatGroups[flatId].forEach(square => {
      const colInFlat = square.indexInGroup % 10;
      const rowInFlat = Math.floor(square.indexInGroup / 10);

      square.targetX = flatX + colInFlat * UNIT_SIZE;
      square.targetY = flatY + rowInFlat * UNIT_SIZE;
    });
  });
}