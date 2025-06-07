import { setupSVG } from './svgSetup.js';
import { initializeState, getCurrentState } from './stateManager.js';

const svgContext = setupSVG();
console.log("SVG Setup Complete", svgContext);

let currentNumber = parseInt(document.getElementById('number-input').value, 10);
initializeState(currentNumber);
console.log("Initial State:", getCurrentState());