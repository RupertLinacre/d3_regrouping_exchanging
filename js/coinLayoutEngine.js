import {
  COLUMN_GAP,
  LAYOUT_PADDING,
  COIN_SIZE_MAX,
  COIN_SIZE_MIN
} from './constants.js?v=20260513f';

export function calculateCoinLayout(unitSquaresData, svgContext) {
  const coinGroups = groupCoinsByPlace(unitSquaresData);
  const columns = [
    { type: 'pound', columnX: 0, tokens: coinGroups.pounds },
    {
      type: 'tenPence',
      columnX: svgContext.columnWidth + COLUMN_GAP,
      tokens: coinGroups.tenPences
    },
    {
      type: 'penny',
      columnX: 2 * (svgContext.columnWidth + COLUMN_GAP),
      tokens: coinGroups.pennies
    }
  ];

  columns.forEach(column => {
    layoutCoinsInColumn(
      column.tokens,
      column.type,
      column.columnX,
      svgContext.columnWidth,
      svgContext.coinRowY,
      svgContext.coinRowHeight
    );
  });

  return columns.flatMap(column => column.tokens);
}

function groupCoinsByPlace(unitSquaresData) {
  const flats = new Map();
  const rods = new Map();
  const pennies = [];

  unitSquaresData.forEach(square => {
    if (square.grouping === 'flat') {
      addGroupedToken(flats, square, 'pound', '£1');
    } else if (square.grouping === 'rod') {
      addGroupedToken(rods, square, 'tenPence', '10p');
    } else if (square.grouping === 'unit') {
      pennies.push(createCoinToken(square.id, square.displayOrder, 'penny', '1p'));
    }
  });

  return {
    pounds: sortTokens([...flats.values()]),
    tenPences: sortTokens([...rods.values()]),
    pennies: sortTokens(pennies)
  };
}

function addGroupedToken(map, square, type, label) {
  const existing = map.get(square.groupLeaderId);
  if (!existing || square.displayOrder < existing.displayOrder) {
    map.set(
      square.groupLeaderId,
      createCoinToken(square.groupLeaderId, square.displayOrder, type, label)
    );
  }
}

function createCoinToken(sourceId, displayOrder, type, label) {
  return {
    id: `coin-${type}-${sourceId}`,
    sourceId,
    displayOrder,
    type,
    label,
    x: 0,
    y: 0,
    size: COIN_SIZE_MAX
  };
}

function sortTokens(tokens) {
  return tokens.sort((a, b) => a.displayOrder - b.displayOrder);
}

function layoutCoinsInColumn(tokens, coinType, columnX, columnWidth, rowY, rowHeight) {
  if (tokens.length === 0) return;

  const availableWidth = columnWidth - 2 * LAYOUT_PADDING;
  const availableHeight = rowHeight - 2 * LAYOUT_PADDING;
  const gap = 4;
  const coinSize = chooseCoinSize(tokens.length, coinType, availableWidth, availableHeight, gap);
  const displaySize = displayCoinSize(coinType, coinSize);
  const coinsPerRow = Math.max(1, Math.floor((availableWidth + gap) / (displaySize + gap)));

  tokens.forEach((token, index) => {
    const row = Math.floor(index / coinsPerRow);
    const col = index % coinsPerRow;

    token.size = displaySize;
    token.x = columnX + LAYOUT_PADDING + col * (displaySize + gap);
    token.y = rowY + rowHeight - LAYOUT_PADDING - displaySize - row * (displaySize + gap);
  });
}

function displayCoinSize(type, baseSize) {
  if (type === 'penny') return baseSize;
  if (type === 'pound') return baseSize * 4;
  return baseSize * 2;
}

function chooseCoinSize(count, coinType, availableWidth, availableHeight, gap) {
  for (let size = COIN_SIZE_MAX; size >= COIN_SIZE_MIN; size--) {
    const displaySize = displayCoinSize(coinType, size);
    const coinsPerRow = Math.max(1, Math.floor((availableWidth + gap) / (displaySize + gap)));
    const rows = Math.ceil(count / coinsPerRow);
    const neededHeight = rows * displaySize + Math.max(0, rows - 1) * gap;
    if (neededHeight <= availableHeight) return size;
  }

  return COIN_SIZE_MIN;
}
