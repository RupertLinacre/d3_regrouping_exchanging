let allUnitSquares = [];
let nextDisplayOrder = 0;

function giveNewDisplayOrder(squares) {
  squares.forEach(sq => {
    sq.displayOrder = nextDisplayOrder++;
  });
}

// Generates the core data for each unit square
function createUnitSquare(id) {
  return {
    id: `unit-${id}`,        // Unique ID for D3 keying
    originalValueIndex: id, // Its index if all units were in a line 0 to N-1
    displayOrder: id,
    grouping: 'unit',     // 'unit', 'rod', 'flat'
    groupLeaderId: `unit-${id}`, // ID of the first unit in its current group
    indexInGroup: 0,      // e.g., 0-9 for unit in rod, 0-99 for unit in flat
    targetX: 0,           // Target X calculated by layoutEngine
    targetY: 0            // Target Y calculated by layoutEngine
  };
}

function applyCanonicalGrouping(squares) {
  const totalCount = squares.length;
  const hundreds = Math.floor(totalCount / 100);
  const tens = Math.floor((totalCount % 100) / 10);
  const ones = totalCount % 10;

  let squareIndex = 0;

  // Process flats (hundreds)
  for (let h = 0; h < hundreds; h++) {
    const flatLeaderId = `unit-${squareIndex}`;
    for (let i = 0; i < 100; i++) {
      squares[squareIndex].grouping = 'flat';
      squares[squareIndex].groupLeaderId = flatLeaderId;
      squares[squareIndex].indexInGroup = i;
      squareIndex++;
    }
  }

  // Process rods (tens)
  for (let t = 0; t < tens; t++) {
    const rodLeaderId = `unit-${squareIndex}`;
    for (let i = 0; i < 10; i++) {
      squares[squareIndex].grouping = 'rod';
      squares[squareIndex].groupLeaderId = rodLeaderId;
      squares[squareIndex].indexInGroup = i;
      squareIndex++;
    }
  }

  // Process remaining units (ones)
  for (let o = 0; o < ones; o++) {
    squares[squareIndex].grouping = 'unit';
    squares[squareIndex].groupLeaderId = squares[squareIndex].id;
    squares[squareIndex].indexInGroup = 0;
    squareIndex++;
  }
}

function resetRegroupedFlags() {
  allUnitSquares.forEach(sq => {
    sq.isRecentlyRegrouped = false;
  });
}

function lastRodLeader() {
  let max = -1, leader = null;
  allUnitSquares.forEach(sq => {
    if (sq.grouping === 'rod' && sq.displayOrder > max) {
      max = sq.displayOrder; leader = sq.groupLeaderId;
    }
  });
  return leader;
}

function lastFlatLeader() {
  let max = -1, leader = null;
  allUnitSquares.forEach(sq => {
    if (sq.grouping === 'flat' && sq.displayOrder > max) {
      max = sq.displayOrder; leader = sq.groupLeaderId;
    }
  });
  return leader;
}

export function initializeState(number) {
  allUnitSquares = [];
  nextDisplayOrder = number;
  for (let i = 0; i < number; i++) {
    allUnitSquares.push(createUnitSquare(i));
  }
  applyCanonicalGrouping(allUnitSquares);
  return allUnitSquares;
}

export function getCurrentState() {
  return [...allUnitSquares]; // Return a copy
}

export function decomposeFlat() {
  const flatLeaderId = lastFlatLeader();
  if (!flatLeaderId) return false;

  resetRegroupedFlags();
  const flatSquares = allUnitSquares.filter(
    sq => sq.groupLeaderId === flatLeaderId && sq.grouping === 'flat'
  );
  if (flatSquares.length !== 100) return false;

  // explode into 10 rods
  for (let r = 0; r < 10; r++) {
    const leader = flatSquares[r * 10].id;
    for (let i = 0; i < 10; i++) {
      const sq = flatSquares[r * 10 + i];
      sq.grouping = 'rod';
      sq.groupLeaderId = leader;
      sq.indexInGroup = i;
      sq.isRecentlyRegrouped = true;
    }
  }
  giveNewDisplayOrder(flatSquares);
  return true;
}

export function decomposeRod() {
  const rodLeaderId = lastRodLeader();
  if (!rodLeaderId) return false;

  resetRegroupedFlags();
  const rodSquares = allUnitSquares.filter(
    sq => sq.groupLeaderId === rodLeaderId && sq.grouping === 'rod'
  );
  if (rodSquares.length !== 10) return false;

  rodSquares.forEach(sq => {
    sq.isRecentlyRegrouped = true;
    sq.grouping = 'unit';
    sq.groupLeaderId = sq.id;
    sq.indexInGroup = 0;
  });
  giveNewDisplayOrder(rodSquares);   // <-- key line
  return true;
}

export function composeUnitsToRod() {
  resetRegroupedFlags();
  // Get all current 'unit' squares
  const unitSquares = allUnitSquares.filter(square => square.grouping === 'unit');

  if (unitSquares.length < 10) {
    console.warn(`Need at least 10 units to compose a rod, found ${unitSquares.length}`);
    return false;
  }

  // select TEN units with the **highest** displayOrder
  const selectedUnits = unitSquares
    .sort((a, b) => b.displayOrder - a.displayOrder)
    .slice(0, 10);

  // Use the first unit's ID as the new rod leader
  const newRodLeaderId = selectedUnits[0].id;

  // Convert these 10 units to a rod
  selectedUnits.forEach((square, index) => {
    square.grouping = 'rod';
    square.groupLeaderId = newRodLeaderId;
    square.indexInGroup = index;
    square.isRecentlyRegrouped = true;
  });

  giveNewDisplayOrder(selectedUnits);
  return true;
}

export function composeRodsToFlat() {
  resetRegroupedFlags();
  // Identify all current conceptual rods (group by groupLeaderId where grouping === 'rod')
  const rodGroups = {};
  allUnitSquares
    .filter(square => square.grouping === 'rod')
    .forEach(square => {
      if (!rodGroups[square.groupLeaderId]) {
        rodGroups[square.groupLeaderId] = [];
      }
      rodGroups[square.groupLeaderId].push(square);
    });

  const rodLeaderIds = Object.keys(rodGroups);

  if (rodLeaderIds.length < 10) {
    console.warn(`Need at least 10 rods to compose a flat, found ${rodLeaderIds.length}`);
    return false;
  }

  // Select the 10 rod leaders with the highest displayOrder
  const selectedRodIds = rodLeaderIds
    .map(leaderId => {
      const leaderSquare = allUnitSquares.find(sq => sq.id === leaderId);
      return { leaderId, displayOrder: leaderSquare.displayOrder };
    })
    .sort((a, b) => b.displayOrder - a.displayOrder)
    .slice(0, 10)
    .map(item => item.leaderId);

  const selectedSquares = [];
  selectedRodIds.forEach(rodId => {
    selectedSquares.push(...rodGroups[rodId]);
  });

  if (selectedSquares.length !== 100) {
    console.warn(`Expected 100 squares for flat composition, found ${selectedSquares.length}`);
    return false;
  }

  // Use the first square's ID as the new flat leader
  const newFlatLeaderId = selectedSquares[0].id;

  // Convert these 100 squares to a flat
  selectedSquares.forEach((square, index) => {
    square.grouping = 'flat';
    square.groupLeaderId = newFlatLeaderId;
    square.indexInGroup = index;
    square.isRecentlyRegrouped = true;
  });

  giveNewDisplayOrder(selectedSquares);
  return true;
}