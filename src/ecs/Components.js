const Components = {};
/* =========================================================================
 *
 * Components.js
 *  This contains all components for the tutorial (ideally, components would
 *  each live in their own module)
 *
 *  Components are just data.
 *
 * ========================================================================= */

// Appearance
// --------------------------------------
Components.Appearance = function ComponentAppearance(params) {
  // Appearance specifies data for color and size
  params = params || {};

  this.domElement = params.domElement;
  this.parentElement = params.parentElement || null;
  this.isFirstElement = params.isFirstElement || false;
  this.isLastItem = params.isLastItem || false;

  return this;
};
Components.Appearance.prototype.name = "appearance";

// Health
// --------------------------------------
Components.Health = function ComponentHealth(value) {
  value = value || 20;
  this.value = value;

  return this;
};
Components.Health.prototype.name = "health";

// Position
// --------------------------------------
Components.Position = function ComponentPosition(params) {
  params = params || {};
  this.isInStartPosition = params.isInStartPosition || false;
  this.pos = {
    left: params.left != null ? params.left : 0,
    top: 0,
  };
  this.velocity = 0.1;
  this.frameCycleDuration = 0;
  this.direction = params.direction || "right";

  return this;
};
Components.Position.prototype.name = "position";

// Flying
// --------------------------------------
Components.Fly = function ComponentPosition(params) {
  params = params || {};
  this.timeInFlight = 0;
  this.timeOutOfFlight = 0;
  this.isFlying = false;

  return this;
};
Components.Fly.prototype.name = "fly";

// playerControlled
// --------------------------------------
Components.PlayerControlled = function ComponentPlayerControlled(params) {
  this.pc = true;
  return this;
};
Components.PlayerControlled.prototype.name = "playerControlled";

// computerControlled
// --------------------------------------
Components.ComputerControlled = function ComponentComputerControlled(params) {
  this.cc = true;
  this.isEnemey = params.isEnemey !== null ? params.isEnemy : true;
  return this;
};
Components.ComputerControlled.prototype.name = "computerControlled";

// Collision
// --------------------------------------
Components.Collision = function ComponentCollision(params) {
  this.collides = true;
  return this;
};
Components.Collision.prototype.name = "collision";

export default Components;
