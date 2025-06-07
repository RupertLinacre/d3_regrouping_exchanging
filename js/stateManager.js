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

export function initializeState(number) {
  allUnitSquares = [];
  for (let i = 0; i < number; i++) {
    allUnitSquares.push(createUnitSquare(i));
  }
  // For now, all are 'unit' type, no canonical grouping yet
  return allUnitSquares;
}

export function getCurrentState() {
  return [...allUnitSquares]; // Return a copy
}