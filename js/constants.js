export const SVG_WIDTH = 1400; // Further increased width to prevent sum equation clipping
export const SVG_HEIGHT = 630;
export const MARGIN = { top: 90, right: 150, bottom: 100, left: 20 };
export const COLUMN_LABELS = ["Hundreds", "Tens", "Ones"];
export const COLUMN_GAP = 25;
export const UNIT_SIZE = 12;
export const LAYOUT_PADDING = 8;
export const ANIMATION_DURATION = 800;

// Color scheme
export const COLORS = {
  UNIT_FILL: "#2E8B57", // Sea green - pedagogically appropriate base-10 block color
  UNIT_STROKE: "#FFFFFF", // White grid lines for clear internal structure
  UNIT_STROKE_WIDTH: 1,
  COLUMN_BG: "#F8F9FA", // Light gray column backgrounds
  COLUMN_BORDER: "#DEE2E6", // Subtle column borders
  TEXT_PRIMARY: "#212529", // Dark text for digits
  TEXT_SECONDARY: "#6C757D", // Medium gray for expanded values
  TEXT_TERTIARY: "#ADB5BD", // Light gray for phrases
  HIGHLIGHT_HOVER: "#20B2AA" // Slightly brighter green for hover states
};