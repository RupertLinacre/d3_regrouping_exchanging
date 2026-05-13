import { setupSVG } from './svgSetup.js?v=20260513e';
import { initializeState, getCurrentState, decomposeFlat, decomposeRod, composeUnitsToRod, composeRodsToFlat } from './stateManager.js';
import { renderSquares } from './renderer.js?v=20260513e';
import { calculateLayout } from './layoutEngine.js?v=20260513e';
import { updateTextLabels } from './textDisplay.js?v=20260513e';
import { COLUMN_GAP } from './constants.js?v=20260513e';


const svgContext = setupSVG();
console.log("SVG Setup Complete", svgContext);
const mainTitleElement = document.getElementById('main-title');


let currentNumber = parseInt(document.getElementById('number-input').value, 10);
initializeState(currentNumber);
console.log("Initial State:", getCurrentState());

function updateMainTitle(number) {
  if (mainTitleElement) {
    mainTitleElement.textContent = `Visualisation of the number ${number}`;
  }
}

function updateVisualization(options = {}) {
  let squaresData = getCurrentState();
  // Calculate onesColumnXOffset based on svgContext.columnWidth and COLUMN_GAP
  const onesColumnIndex = 2; // 0:Hundreds, 1:Tens, 2:Ones
  const onesColumnX = onesColumnIndex * (svgContext.columnWidth + COLUMN_GAP); // COLUMN_GAP from constants

  calculateLayout(squaresData, svgContext.columnWidth, svgContext.chartHeight, onesColumnX);
  renderSquares(svgContext.g, squaresData, options);
  updateTextLabels(squaresData, svgContext, currentNumber);
}


// Initial render
updateVisualization();
updateMainTitle(currentNumber);

// Event listener for input
document.getElementById('number-input').addEventListener('input', (event) => {
  currentNumber = parseInt(event.target.value, 10) || 0;
  currentNumber = Math.max(0, Math.min(999, currentNumber)); // Clamp
  event.target.value = currentNumber; // Update input if clamped
  initializeState(currentNumber);
  updateVisualization({ interrupt: true });
  updateMainTitle(currentNumber);
});

// Handle square clicks for decomposition
function handleSquareClick(squareData) {
  if (!squareData) return;           // safety

  let success = false;
  if (squareData.grouping === 'flat') {
    success = decomposeFlat(squareData.groupLeaderId);
  } else if (squareData.grouping === 'rod') {
    success = decomposeRod(squareData.groupLeaderId);
  }

  if (success) updateVisualization();
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

function handleTransferButtonClick(action) {
  let success = false;

  if (action === 'decompose-hundreds') {
    success = decomposeFlat();
  } else if (action === 'compose-hundreds') {
    success = composeRodsToFlat();
  } else if (action === 'decompose-tens') {
    success = decomposeRod();
  } else if (action === 'compose-tens') {
    success = composeUnitsToRod();
  }

  if (success) updateVisualization();
}

// Expose functions globally for renderer and svgSetup to access
window.handleSquareClick = handleSquareClick;
window.handleColumnRightClick = handleColumnRightClick;
window.handleTransferButtonClick = handleTransferButtonClick;

// Development/debugging functions - expose to global scope
window.debugD3Regrouping = {
  getCurrentState,
  initializeState,
  updateVisualization,
  svgContext,
  getCurrentNumber: () => currentNumber
};
