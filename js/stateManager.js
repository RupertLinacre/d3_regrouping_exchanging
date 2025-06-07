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

export function decomposeFlat(flatLeaderId) {
  // Find all squares with this flatLeaderId
  const flatSquares = allUnitSquares.filter(square => 
    square.groupLeaderId === flatLeaderId && square.grouping === 'flat'
  );
  
  if (flatSquares.length !== 100) {
    console.warn(`Expected 100 squares for flat ${flatLeaderId}, found ${flatSquares.length}`);
    return false;
  }
  
  // Convert flat to 10 rods
  for (let rodIndex = 0; rodIndex < 10; rodIndex++) {
    const rodStartIndex = rodIndex * 10;
    const rodLeaderId = flatSquares[rodStartIndex].id; // First square in each rod becomes leader
    
    // Update the 10 squares that form this rod
    for (let unitIndex = 0; unitIndex < 10; unitIndex++) {
      const squareIndex = rodStartIndex + unitIndex;
      const square = flatSquares[squareIndex];
      
      square.grouping = 'rod';
      square.groupLeaderId = rodLeaderId;
      square.indexInGroup = unitIndex;
    }
  }
  
  return true;
}

export function decomposeRod(rodLeaderId) {
  // Find all squares with this rodLeaderId
  const rodSquares = allUnitSquares.filter(square => 
    square.groupLeaderId === rodLeaderId && square.grouping === 'rod'
  );
  
  if (rodSquares.length !== 10) {
    console.warn(`Expected 10 squares for rod ${rodLeaderId}, found ${rodSquares.length}`);
    return false;
  }
  
  // Convert rod to 10 individual units
  rodSquares.forEach(square => {
    square.grouping = 'unit';
    square.groupLeaderId = square.id; // Each becomes its own leader
    square.indexInGroup = 0;
  });
  
  return true;
}