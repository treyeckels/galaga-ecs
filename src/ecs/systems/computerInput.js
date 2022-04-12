import PubSub from "pubsub-js";
import { _isOverlapping, _isInViewport } from "../../utils";

// Setup the system
// --------------------------------------
let isPaused = false;

const mySubscriber = function (msg, data) {
  switch (msg) {
    case "PAUSE":
      console.log("pause");
      isPaused = true;
      break;
    case "RESUME":
      console.log("resume");
      isPaused = false;
      break;
    default:
      return;
  }
};
const pauseToken = PubSub.subscribe("PAUSE", mySubscriber);
const resumeToken = PubSub.subscribe("RESUME", mySubscriber);

const ComputerInput = function systemComputerInput() {
  this.name = "computerinput";
};

ComputerInput.prototype.init = (entities, params) => {};

ComputerInput.prototype.update = (entities, params) => {
  for (let entityId in entities) {
    const curEntity = entities[entityId];
    if (
      curEntity.components.computerControlled &&
      !curEntity.components.computerControlled.isEnemy &&
      curEntity.components.position
    ) {
      let stepConstant = 10;
      if (curEntity.components.position.direction === "left") {
        stepConstant = -10;
      }

      let step = stepConstant * curEntity.components.position.velocity;
      const isInViewport = _isInViewport(
        curEntity.components.appearance.domElement,
        step
      );

      if (isInViewport) {
        curEntity.components.position.pos.left =
          curEntity.components.position.pos.left + step;
      } else {
        if (curEntity.components.position.direction === "left") {
          curEntity.components.position.direction = "right";
          stepConstant = 10;
        } else {
          curEntity.components.position.direction = "left";
          stepConstant = -10;
        }
        step = stepConstant * curEntity.components.position.velocity;
        curEntity.components.position.pos.left =
          curEntity.components.position.pos.left + step;
      }
      curEntity.components.position.frameCycleDuration += params.frameDuration;
    }

    if (curEntity.components.fly) {
      if (
        curEntity.components.fly.isFlying &&
        curEntity.components.fly.timeInFlight >= 0.75
      ) {
        curEntity.components.fly.isFlying = false;
        curEntity.components.fly.timeInFlight = 0;
        curEntity.components.fly.timeOutOfFlight = 0;
      } else if (
        curEntity.components.fly.isFlying &&
        curEntity.components.fly.timeInFlight < 0.75
      ) {
        curEntity.components.fly.timeInFlight += params.frameDuration;
      } else if (
        !curEntity.components.fly.isFlying &&
        curEntity.components.fly.timeOutOfFlight >= 0.75
      ) {
        curEntity.components.fly.isFlying = true;
        curEntity.components.fly.timeInFlight = 0;
        curEntity.components.fly.timeOutOfFlight = 0;
      } else if (
        !curEntity.components.fly.isFlying &&
        curEntity.components.fly.timeOutOfFlight < 0.75
      ) {
        console.log("frameduration", params.frameDuration);
        curEntity.components.fly.timeOutOfFlight += params.frameDuration;
      }
    }

    if (
      curEntity.components.dive &&
      !curEntity.components.dive.isDiving &&
      params.gameDuration > 4
    ) {
      const d = Math.floor(Math.random() * 1000);
      console.log("random num", d);
      if (d < 1) {
        curEntity.components.dive.isDiving = true;
      }
    }
  }
};

const computerInput = new ComputerInput();

export default computerInput;
