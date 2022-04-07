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
  this.position = [0, 0];

  return this;
};
Components.Position.prototype.name = "position";

// playerControlled
// --------------------------------------
Components.PlayerControlled = function ComponentPlayerControlled(params) {
  this.pc = true;
  return this;
};
Components.PlayerControlled.prototype.name = "playerControlled";

// computerControlled
// --------------------------------------
Components.ComputerControlled = function ComponentPlayerControlled(params) {
  this.cc = true;
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
