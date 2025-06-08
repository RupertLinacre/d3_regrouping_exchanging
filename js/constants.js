export const SVG_WIDTH = 1400; // Further increased width to prevent sum equation clipping
export const SVG_HEIGHT = 630;
export const MARGIN = { top: 90, right: 150, bottom: 100, left: 20 };
export const COLUMN_LABELS = ["Hundreds", "Tens", "Ones"];
export const COLUMN_GAP = 25;
export const UNIT_SIZE = 12;
export const LAYOUT_PADDING = 8;
export const ANIMATION_DURATION = 800;

// Stagger delay for regrouping animations (ms)
export const STAGGER_DELAY = 125;

// Color scheme
// For d3.color, we need to use d3 in this file. Import d3 if not already available in the global scope where this is used.
export const COLORS = {
  UNIT_FILL_BASE: "#2E8B57", // dark green
  UNIT_FILL_HIGHLIGHT_GROUP: (typeof d3 !== 'undefined' ? d3.color("#2E8B57").brighter(0.8).toString() : "#6FCF97"), // light green, fallback if d3 not available
  UNIT_STROKE: "#FFFFFF", // White grid lines for clear internal structure
  UNIT_STROKE_WIDTH: 1,
  COLUMN_BG: "#F8F9FA", // Light gray column backgrounds
  COLUMN_BORDER: "#DEE2E6", // Subtle column borders
  TEXT_PRIMARY: "#212529", // Dark text for digits
  TEXT_SECONDARY: "#6C757D", // Medium gray for expanded values
  TEXT_TERTIARY: "#ADB5BD", // Light gray for phrases
  HIGHLIGHT_HOVER: "#20B2AA" // Slightly brighter green for hover states
};