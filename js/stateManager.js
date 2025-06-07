let allUnitSquares = [];

// Generates the core data for each unit square
function createUnitSquare(id) {
  return {
    id: `unit-${id}`,        // Unique ID for D3 keying
    originalValueIndex: id, // Its index if all units were in a line 0 to N-1
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

export function initializeState(number) {
  allUnitSquares = [];
  for (let i = 0; i < number; i++) {
    allUnitSquares.push(createUnitSquare(i));
  }
  applyCanonicalGrouping(allUnitSquares);
  return allUnitSquares;
}

export function getCurrentState() {
  return [...allUnitSquares]; // Return a copy
}