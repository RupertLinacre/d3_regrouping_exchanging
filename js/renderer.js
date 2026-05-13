import { UNIT_SIZE, ANIMATION_DURATION, COLORS, STAGGER_DELAY } from './constants.js?v=20260513e';

// Track ongoing animations so newer regrouping operations can restart from
// the current on-screen positions instead of waiting for older transitions.
let isAnimating = false;
let activeRenderId = 0;

export function isAnimationInProgress() {
  return isAnimating;
}

export function renderSquares(svgGroup, unitSquaresData, options = {}) {
  const nextData = unitSquaresData.slice();

  if (isAnimating || options.interrupt === true) {
    activeRenderId++;
    svgGroup.selectAll(".unit-square").interrupt();
  }

  performRender(svgGroup, nextData);
}

function performRender(svgGroup, unitSquaresData) {
  const renderId = ++activeRenderId;
  isAnimating = true;
  svgGroup.classed("is-animating", true);

  const squares = svgGroup.selectAll(".unit-square")
    .data(unitSquaresData, d => d.id);

  // Step 1: Handle exits.
  const exitingSquares = squares.exit();
  let exitTransition = null;
  if (!exitingSquares.empty()) {
    exitTransition = exitingSquares
      .interrupt("regroup")
      .transition()
      .duration(ANIMATION_DURATION * 0.45)
      .ease(d3.easeCubicInOut)
      .attr("opacity", 0)
      .remove()
      .on("interrupt", function () {
        d3.select(this).remove();
      });
  }

  // Step 2: Handle entering squares.
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
    .attr("transform", null)
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

  // Step 3: Handle updates (including new squares).
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
  // Interpolate from the element’s current fill to its new fill
  function fillTween(d) {
    // 'this' will be the <rect> DOM node
    const current = d3.select(this).attr("fill") || COLORS.UNIT_FILL_BASE;
    const target = getFillColor(d);
    const interp = d3.interpolateRgb(current, target);
    return t => interp(t);
  }

  // Capture current positions for smooth transitions
  allSquares.each(function (d) {
    const element = d3.select(this);
    const currentX = Number(element.attr('x'));
    const currentY = Number(element.attr('y'));

    // Store current position for transition
    element
      .attr('x', Number.isFinite(currentX) ? currentX : d.targetX)
      .attr('y', Number.isFinite(currentY) ? currentY : d.targetY)
      .attr("transform", null);
  });

  // Start the main transition
  const maxDelay = d3.max(unitSquaresData, d =>
    d.isRecentlyRegrouped ? (d.animationStaggerIndex || 0) * STAGGER_DELAY : 0
  ) || 0;

  const transition = allSquares
    .transition()
    .delay(function (d) {
      if (d.isRecentlyRegrouped) {
        return (d.animationStaggerIndex || 0) * STAGGER_DELAY;
      }
      return 0;
    })
    .duration(ANIMATION_DURATION)
    .ease(d3.easeCubicInOut)
    .attrTween("fill", fillTween)
    .attr("opacity", 1)
    .attr("x", d => d.targetX)
    .attr("y", d => d.targetY)
    .attr("transform", null);

  const transitionPromises = [];
  if (!allSquares.empty()) {
    transitionPromises.push(transition.end().catch(() => undefined));
  }
  if (exitTransition) {
    transitionPromises.push(exitTransition.end().catch(() => undefined));
  }

  if (transitionPromises.length > 0) {
    Promise.all(transitionPromises).then(() => onAnimationComplete(renderId));
  } else {
    queueMicrotask(() => onAnimationComplete(renderId));
  }

  // Fallback in case a browser drops transition completion events.
  setTimeout(() => {
    onAnimationComplete(renderId);
  }, maxDelay + ANIMATION_DURATION + 100);
}

function onAnimationComplete(renderId) {
  if (renderId !== activeRenderId) return;
  if (!isAnimating) return; // Already handled

  isAnimating = false;
  d3.selectAll(".is-animating").classed("is-animating", false);
}
