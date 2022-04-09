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
      curEntity.components.position &&
      params.gameDuration > 2
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
      curEntity.components.fly.timeInFlight += params.frameDuration;
    }
  }
};

const computerInput = new ComputerInput();

export default computerInput;
