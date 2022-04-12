import PubSub from "pubsub-js";

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

Render.prototype.init = function (entities, params) {
  console.log("render");
  const self = this;
  const mySubscriber = function (msg, entities) {
    switch (msg) {
      case "PAUSE":
        self.handlePause(entities);
        break;
      case "RESUME":
        console.log("resume", entities);
        self.handleResume(entities);
        break;
      default:
        return;
    }
  };
  const pauseToken = PubSub.subscribe("PAUSE", mySubscriber);
  const resumeToken = PubSub.subscribe("RESUME", mySubscriber);
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
          100,
        0,
      ];
    } else if (
      curEntity.components.computerControlled &&
      curEntity.components.computerControlled.isEnemey &&
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

Render.prototype.update = (entities, params) => {
  const gameDuration = params.gameDuration;
  for (let entityId in entities) {
    const curEntity = entities[entityId];
    const velocity = curEntity.components.position.velocity;
    const domEle = curEntity.components.appearance.domElement;
    const frameCycleDuration = curEntity.components.position.frameCycleDuration;
    if (curEntity.components.fly) {
      if (curEntity.components.fly.isFlying) {
        domEle.classList.add("is-flying");
      } else {
        domEle.classList.remove("is-flying");
      }
    }

    if (curEntity.components.dive) {
      if (curEntity.components.dive.isDiving) {
        curEntity.components.appearance.domElement.classList.add("is-diving");
      }
    }

    if (
      curEntity.components.playerControlled &&
      curEntity.components.position
    ) {
      curEntity.components.appearance.domElement.style.setProperty(
        "--heroDelta",
        curEntity.components.position.pos.left + "px"
      );
    } else if (
      curEntity.components.computerControlled &&
      curEntity.components.position
    ) {
      curEntity.components.appearance.domElement.style.setProperty(
        "--heroDelta",
        curEntity.components.position.pos.left + "px"
      );
    }
  }
};

Render.prototype.handlePause = (entities) => {
  for (let entityId in entities) {
    const curEntity = entities[entityId];
    if (
      curEntity.components.appearance &&
      curEntity.components.dive &&
      curEntity.components.dive.isDiving
    ) {
      curEntity.components.appearance.domElement.classList.add("is-paused");
    }
  }
};

Render.prototype.handleResume = (entities) => {
  window.alert("curentity", "curEntity");
  console.log("entities", entities);
  for (let entityId in entities) {
    const curEntity = entities[entityId];
    if (curEntity.components.appearance) {
      curEntity.components.appearance.domElement.classList.remove("is-paused");
    }
  }
};

const render = new Render();

export default render;
