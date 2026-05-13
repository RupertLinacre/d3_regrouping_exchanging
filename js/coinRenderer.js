import { ANIMATION_DURATION, COIN_IMAGES, COLORS } from './constants.js?v=20260513h';

export function renderCoins(coinGroup, coinTokens) {
  coinGroup.selectAll(".coin-token")
    .interrupt();

  const coins = coinGroup.selectAll(".coin-token")
    .data(coinTokens, d => d.id);

  coins.exit()
    .transition()
    .duration(ANIMATION_DURATION * 0.35)
    .ease(d3.easeCubicInOut)
    .attr("opacity", 0)
    .remove();

  const enteringCoins = coins.enter()
    .append("g")
    .attr("class", d => `coin-token coin-${d.type}`)
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .attr("opacity", 0);

  enteringCoins.append("circle")
    .attr("class", "coin-fallback")
    .attr("cx", d => d.size / 2)
    .attr("cy", d => d.size / 2)
    .attr("r", d => d.size / 2)
    .attr("fill", d => fallbackFill(d.type))
    .attr("stroke", COLORS.TEXT_PRIMARY)
    .attr("stroke-width", 1);

  enteringCoins.append("image")
    .attr("class", "coin-image")
    .attr("width", d => d.size)
    .attr("height", d => d.size)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .on("load", function () {
      setImageLoaded(d3.select(this), true);
    })
    .on("error", function (event, d) {
      tryNextImage(d3.select(this), d);
    })
    .each(function (d) {
      setInitialImage(d3.select(this), d);
    });

  enteringCoins.append("text")
    .attr("class", "coin-label")
    .attr("x", d => d.size / 2)
    .attr("y", d => d.size / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("font-family", "system-ui, -apple-system, sans-serif")
    .style("font-size", d => `${Math.max(7, d.size * 0.34)}px`)
    .style("font-weight", "700")
    .style("fill", COLORS.TEXT_PRIMARY)
    .style("pointer-events", "none")
    .text(d => d.label);

  enteringCoins.merge(coins)
    .attr("class", d => `coin-token coin-${d.type}`)
    .select(".coin-fallback")
    .attr("cx", d => d.size / 2)
    .attr("cy", d => d.size / 2)
    .attr("r", d => d.size / 2)
    .attr("fill", d => fallbackFill(d.type));

  enteringCoins.merge(coins)
    .select(".coin-image")
    .attr("width", d => d.size)
    .attr("height", d => d.size)
    .each(function (d) {
      const image = d3.select(this);
      if (image.attr("data-coin-type") !== d.type) {
        setInitialImage(image, d);
      }
    });

  enteringCoins.merge(coins)
    .select(".coin-label")
    .attr("x", d => d.size / 2)
    .attr("y", d => d.size / 2)
    .style("font-size", d => `${Math.max(7, d.size * 0.34)}px`)
    .text(d => d.label);

  enteringCoins.merge(coins)
    .transition()
    .duration(ANIMATION_DURATION)
    .ease(d3.easeCubicInOut)
    .attr("opacity", 1)
    .attr("transform", d => `translate(${d.x}, ${d.y})`);
}

function setInitialImage(image, datum) {
  const candidates = imageHrefs(datum.type);
  image
    .attr("data-coin-type", datum.type)
    .attr("data-candidate-index", 0)
    .attr("href", candidates[0]);
  setImageLoaded(image, false);
}

function tryNextImage(image, datum) {
  const candidates = imageHrefs(datum.type);
  const nextIndex = Number(image.attr("data-candidate-index")) + 1;

  if (nextIndex >= candidates.length) {
    setImageLoaded(image, false);
    return;
  }

  image
    .attr("data-candidate-index", nextIndex)
    .attr("href", candidates[nextIndex]);
}

function setImageLoaded(image, isLoaded) {
  const token = d3.select(image.node().parentNode);
  token.select(".coin-fallback").attr("opacity", isLoaded ? 0 : 1);
  token.select(".coin-label").attr("opacity", isLoaded ? 0 : 1);
}

function imageHrefs(type) {
  if (type === 'pound') return COIN_IMAGES.pound;
  if (type === 'tenPence') return COIN_IMAGES.tenPence;
  return COIN_IMAGES.penny;
}

function fallbackFill(type) {
  if (type === 'pound') return '#d6b25e';
  if (type === 'tenPence') return '#bfc5ca';
  return '#c98248';
}
