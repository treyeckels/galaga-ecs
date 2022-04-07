/* =========================================================================
 *
 * render.js
 *  This script contains the game logic acts as a controller for the Entity
 *  Component System
 *
 * ========================================================================= */
function clearBoard() {}

// ECS - System - Render
// --------------------------------------
const Render = function systemRender() {
  this.name = "render";
};

Render.prototype.init = (entities, params) => {
  console.log("render");
  // Here, we've implemented systems as functions which take in an array of
  // entities. An optimization would be to have some layer which only
  // feeds in relevant entities to the system, but for demo purposes we'll
  // assume all entities are passed in and iterate over them.

  // This happens each tick, so we need to clear out the previous rendered
  // state
  console.log("entities", entities);
  let game = params.game;
  console.log("game", params);
  let curEntity;

  // iterate over all entities
  for (let entityId in entities) {
    curEntity = entities[entityId];
    console.log("cureEntity", curEntity);

    // Only run logic if entity has relevant components
    if (
      curEntity.components.position &&
      curEntity.components.playerControlled &&
      curEntity.components.position.isInStartPosition
    ) {
      curEntity.components.currentPosition = [
        (curEntity.components.appearance.domElement.getBoundingClientRect()
          .left /
          game.heroContainerEl.getBoundingClientRect().width) *
          100 +
          2,
        0
      ];
    } else if (
      curEntity.components.position &&
      curEntity.components.computerControlled &&
      curEntity.components.position.isInStartPosition &&
      curEntity.components.appearance
    ) {
      if (curEntity.components.appearance.isFirstElement) {
        const row = document.createElement("div");
        row.classList.add("row");
        row.appendChild(curEntity.components.appearance.domElement);
        curEntity.components.appearance.parentElement.appendChild(row);
      } else {
        curEntity.components.appearance.parentElement
          .querySelector(".row:last-child")
          .appendChild(curEntity.components.appearance.domElement);
      }
    }
  }
};

Render.prototype.update = (entities, params) => {};

const render = new Render();

export default render;
