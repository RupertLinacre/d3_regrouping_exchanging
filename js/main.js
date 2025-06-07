import { setupSVG } from './svgSetup.js';
import { initializeState, getCurrentState, decomposeFlat, decomposeRod, composeUnitsToRod, composeRodsToFlat } from './stateManager.js';
import { renderSquares } from './renderer.js';
import { calculateLayout } from './layoutEngine.js';
import { updateTextLabels } from './textDisplay.js';
import { COLUMN_GAP } from './constants.js';

const svgContext = setupSVG();
console.log("SVG Setup Complete", svgContext);

let currentNumber = parseInt(document.getElementById('number-input').value, 10);
initializeState(currentNumber);
console.log("Initial State:", getCurrentState());

function updateVisualization() {
  let squaresData = getCurrentState();
  // Calculate onesColumnXOffset based on svgContext.columnWidth and COLUMN_GAP
  const onesColumnIndex = 2; // 0:Hundreds, 1:Tens, 2:Ones
  const onesColumnX = onesColumnIndex * (svgContext.columnWidth + COLUMN_GAP); // COLUMN_GAP from constants

  calculateLayout(squaresData, svgContext.columnWidth, svgContext.chartHeight, onesColumnX);
  renderSquares(svgContext.g, squaresData);
  updateTextLabels(squaresData, svgContext);
}

// Initial render
updateVisualization();

// Event listener for input
document.getElementById('number-input').addEventListener('input', (event) => {
  currentNumber = parseInt(event.target.value, 10) || 0;
  currentNumber = Math.max(0, Math.min(999, currentNumber)); // Clamp
  event.target.value = currentNumber; // Update input if clamped
  initializeState(currentNumber);
  updateVisualization();
});

// Handle square clicks for decomposition
function handleSquareClick(clickedSquareData) {
  console.log("handleSquareClick called with:", clickedSquareData);
  
  let success = false;
  
  if (clickedSquareData.grouping === 'flat') {
    success = decomposeFlat(clickedSquareData.groupLeaderId);
    if (success) {
      console.log(`Successfully decomposed flat ${clickedSquareData.groupLeaderId} into 10 rods`);
      updateVisualization();
    }
  } else if (clickedSquareData.grouping === 'rod') {
    success = decomposeRod(clickedSquareData.groupLeaderId);
    if (success) {
      console.log(`Successfully decomposed rod ${clickedSquareData.groupLeaderId} into 10 units`);
      updateVisualization();
    }
  }
  
  if (!success) {
    console.warn("Decomposition failed for:", clickedSquareData);
  }
}

// Handle column right-clicks for composition
function handleColumnRightClick(columnType) {
  console.log(`handleColumnRightClick called with: ${columnType}`);
  
  let success = false;
  
  if (columnType === 'ones') {
    success = composeUnitsToRod();
    if (success) {
      console.log("Successfully composed 10 units into a rod");
      updateVisualization();
    }
  } else if (columnType === 'tens') {
    success = composeRodsToFlat();
    if (success) {
      console.log("Successfully composed 10 rods into a flat");
      updateVisualization();
    }
  }
  
  if (!success) {
    console.warn(`Composition failed for column: ${columnType}`);
  }
}

// Expose functions globally for renderer and svgSetup to access
window.handleSquareClick = handleSquareClick;
window.handleColumnRightClick = handleColumnRightClick;

// Development/debugging functions - expose to global scope
window.debugD3Regrouping = {
  getCurrentState,
  initializeState,
  updateVisualization,
  svgContext,
  getCurrentNumber: () => currentNumber
};