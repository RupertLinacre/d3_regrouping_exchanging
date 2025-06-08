import { UNIT_SIZE, ANIMATION_DURATION, COLORS, STAGGER_DELAY } from './constants.js';

// Track ongoing animations to prevent conflicts
let isAnimating = false;
let pendingUpdate = null;

export function renderSquares(svgGroup, unitSquaresData) {
  // If currently animating, queue this update
  if (isAnimating) {
    pendingUpdate = { svgGroup, unitSquaresData };
    return;
  }

  performRender(svgGroup, unitSquaresData);
}

function performRender(svgGroup, unitSquaresData) {
  isAnimating = true;

  const squares = svgGroup.selectAll(".unit-square")
    .data(unitSquaresData, d => d.id);

  // Step 1: Handle immediate cleanup of any lingering elements
  svgGroup.selectAll(".unit-square")
    .filter(function (d) {
      // Remove any squares that aren't in the new dataset
      return !unitSquaresData.find(square => square.id === d?.id);
    })
    .interrupt()
    .remove();

  // Step 2: Handle exits first (with immediate removal if interrupted)
  const exitingSquares = squares.exit();
  if (!exitingSquares.empty()) {
    exitingSquares
      .interrupt()
      .transition()
      .duration(ANIMATION_DURATION / 2)
      .attr("opacity", 0)
      .attr("transform", "scale(0)")
      .remove()
      .on("interrupt", function () {
        // If interrupted, remove immediately
        d3.select(this).remove();
      });
  }

  // Step 3: Handle entering squares
  const getFillColor = d => {
    if (d.grouping === 'unit' || d.grouping === 'rod') {
      if (d.colorCategory === 'highlightGroup') {
        return COLORS.UNIT_FILL_HIGHLIGHT_GROUP;
      } else {
        return COLORS.UNIT_FILL_BASE;
      }
    }
    return COLORS.UNIT_FILL_BASE;
  };

  const enteringSquares = squares.enter()
    .append("rect")
    .attr("class", d => {
      let classes = "unit-square";
      if (d.grouping === 'flat' || d.grouping === 'rod') {
        classes += " groupable-element";
      }
      return classes;
    })
    .attr("width", UNIT_SIZE)
    .attr("height", UNIT_SIZE)
    .attr("fill", getFillColor)
    .attr("stroke", COLORS.UNIT_STROKE)
    .attr("stroke-width", COLORS.UNIT_STROKE_WIDTH)
    .attr("opacity", 0)
    .attr("x", d => d.targetX)
    .attr("y", d => d.targetY)
    .attr("transform", "scale(0)")
    .style("cursor", d => (d.grouping === 'flat' || d.grouping === 'rod') ? "pointer" : "default")
    .on("mouseenter", function (event, d) {
      if (d.grouping === 'flat' || d.grouping === 'rod') {
        d3.select(this).attr("fill", COLORS.HIGHLIGHT_HOVER);
      }
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).attr("fill", getFillColor(d));
    })
    .on("click", function (event, d) {
      if (d.grouping === 'flat' || d.grouping === 'rod') {
        if (window.handleSquareClick) {
          window.handleSquareClick(d);      // <-- pass the datum!
        }
      }
    })
    .on("contextmenu", function (event, d) {
      event.preventDefault();
      // Determine which column this square is in based on its grouping
      let columnType = null;
      if (d.grouping === 'unit') {
        columnType = 'ones';
      } else if (d.grouping === 'rod') {
        columnType = 'tens';
      }

      if (columnType && window.handleColumnRightClick) {
        console.log(`Right-clicked square ${d.id} in ${columnType} column`);
        window.handleColumnRightClick(columnType);
      }
    });

  // Step 4: Handle updates (including new squares)
  const allSquares = enteringSquares.merge(squares);

  // Update classes and click handlers for all squares
  allSquares
    .attr("class", d => {
      let classes = "unit-square";
      if (d.grouping === 'flat' || d.grouping === 'rod') {
        classes += " groupable-element";
      }
      return classes;
    })
    .attr("fill", getFillColor)
    .style("cursor", d => (d.grouping === 'flat' || d.grouping === 'rod') ? "pointer" : "default")
    .on("click", function (event, d) {
      if (d.grouping === 'flat' || d.grouping === 'rod') {
        if (window.handleSquareClick) {
          window.handleSquareClick(d);      // <-- pass the datum!
        }
      }
    })
    .on("contextmenu", function (event, d) {
      event.preventDefault();
      // Determine which column this square is in based on its grouping
      let columnType = null;
      if (d.grouping === 'unit') {
        columnType = 'ones';
      } else if (d.grouping === 'rod') {
        columnType = 'tens';
      }

      if (columnType && window.handleColumnRightClick) {
        console.log(`Right-clicked square ${d.id} in ${columnType} column`);
        window.handleColumnRightClick(columnType);
      }
    });

  // Capture current positions for smooth transitions
  allSquares.each(function (d) {
    const element = d3.select(this);
    const currentX = +element.attr('x') || d.targetX;
    const currentY = +element.attr('y') || d.targetY;

    // Store current position for transition
    element
      .attr('x', currentX)
      .attr('y', currentY);
  });

  // Start the main transition
  const transition = allSquares
    .transition()
    .delay(function (d) {
      if (d.isRecentlyRegrouped) {
        return (d.animationStaggerIndex || 0) * STAGGER_DELAY;
      }
      return 0;
    })
    .duration(ANIMATION_DURATION)
    .attr("opacity", 1)
    .attr("x", d => d.targetX)
    .attr("y", d => d.targetY)
    .attr("transform", "scale(1)")
    .on("end", function () {
      onAnimationComplete();
    })
    .on("interrupt", function () {
      onAnimationComplete();
    });

  // Set a fallback timer in case transition events don't fire
  setTimeout(() => {
    onAnimationComplete();
  }, ANIMATION_DURATION + 100);
}

function onAnimationComplete() {
  if (!isAnimating) return; // Already handled

  isAnimating = false;

  // Process any pending update
  if (pendingUpdate) {
    const { svgGroup, unitSquaresData } = pendingUpdate;
    pendingUpdate = null;

    // Use a small delay to ensure DOM is stable
    setTimeout(() => {
      performRender(svgGroup, unitSquaresData);
    }, 10);
  }
}