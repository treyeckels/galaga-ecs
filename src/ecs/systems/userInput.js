import PubSub from "pubsub-js";
import { isMethodDeclaration } from "typescript";
import { _isOverlapping, _isInViewport } from "../../utils";

// Setup the system
// --------------------------------------
let isPaused = false;
let heroPosition;
let heroDirection;

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

function handleHeroFireMissile(evt) {}

function handleHeroMoveLeft(evt, game) {
  evt.preventDefault();

  // const isCapturing = Alien.getIsCapturing();
  // if (isCaptured) {
  //   return;
  // }
  const hero = game.heroEl;
  const newPosition = heroPosition - 10;
  // if (heroPosition >= 98) {
  //   return;
  // }
  console.log("move left");
  const isInViewport = _isInViewport(hero, -10);
  if (isInViewport) {
    console.log("move right");
    heroPosition = newPosition;
  }
  // if (newPos >= 98) {
  //   return;
  // }
  // heroEl.style.left = newPos + "%";
  // heroPosition = newPos;
  // if (isCapturing) {
  //   const isOverlapping = _isOverlapping(heroEl, Alien.getIsCapturingCloud());
  //   if (isOverlapping) {
  //     handleCapture();
  //   }
  // }
}

function handleHeroMoveRight(evt, game) {
  evt.preventDefault();
  const hero = game.heroEl;

  // const isCapturing = Alien.getIsCapturing();
  // if (isCaptured) {
  //   return;
  // }
  heroDirection = "right";
  const newPosition = heroPosition + 10;
  const isInViewport = _isInViewport(hero, 10);

  if (isInViewport) {
    console.log("move right");
    heroPosition = newPosition;
  }

  // if (heroPosition >= 98) {
  //   return;
  // }

  // if (newPos >= 98) {
  //   return;
  // }
  // heroEl.style.left = newPos + "%";
  // heroPosition = newPos;
  // if (isCapturing) {
  //   const isOverlapping = _isOverlapping(heroEl, Alien.getIsCapturingCloud());
  //   if (isOverlapping) {
  //     handleCapture();
  //   }
  // }
}

function handleKeyPress(evt, game) {
  console.log("isPaused", isPaused);
  if (isPaused) {
    return;
  }
  console.log("keypress");
  const key = evt.key;
  switch (key.toLowerCase()) {
    case "arrowright":
      console.log("foo");
      handleHeroMoveRight(evt, game);
      break;
    case "arrowleft":
      handleHeroMoveLeft(evt, game);
      break;
    case "x":
      handleHeroFireMissile(evt);
      break;
    default:
      return;
  }
}

const UserInput = function systemUserInput() {
  this.name = "userInput";
};

UserInput.prototype.init = (entities, params) => {
  console.log("user input");
  const game = params.game;
  const heroEl = game.heroEl;
  heroPosition = heroEl.getBoundingClientRect().left;
  console.log("heroPosition", heroPosition);

  document.addEventListener("keydown", function (evt) {
    handleKeyPress(evt, game);
  });
};

UserInput.prototype.update = (entities, params) => {
  // Here, we've implemented systems as functions which take in an array of
  // entities. An optimization would be to have some layer which only
  // feeds in relevant entities to the system, but for demo purposes we'll
  // assume all entities are passed in and iterate over them.
  console.log("userinput update");
  const curEntity = params.playerControlled;
  curEntity.components.position.pos.left = heroPosition;

  // We can change component data based on input, which cause other
  // systems (e.g., rendering) to be affected
  //curEntity.components.appearance.domElement.setAttribute("data-move", "10%");
  // curEntity.components.appearance.domElement.style.setProperty(
  //   "--heroDelta",
  //   heroPosition + "px"
  // );
};

const userInput = new UserInput();

export default userInput;
