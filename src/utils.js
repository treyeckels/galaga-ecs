function _isOverlapping(el1, el2) {
  var alienCoords = el1.getBoundingClientRect();
  var missileCoords = el2.getBoundingClientRect();
  return !(
    missileCoords.top > alienCoords.bottom ||
    missileCoords.right < alienCoords.left ||
    missileCoords.bottom < alienCoords.top ||
    missileCoords.left > alienCoords.right
  );
}

function _isInViewport(ele, step) {
  var rect = ele.getBoundingClientRect();
  var nextStep = (step / 100) * document.documentElement.clientWidth;
  return (
    rect.left + nextStep >= 0 &&
    rect.right + nextStep <=
      (window.innerWidth || document.documentElement.clientWidth)
  );
}

export { _isOverlapping, _isInViewport };
