// Setup the system
// --------------------------------------
let heroPosition = 0;

function handleHeroFireMissile(evt) {}

function handleHeroMoveLeft(evt) {
  evt.preventDefault();
  // const newPos = heroPosition - 3;
  // if (newPos <= 1) {
  //   return;
  // }
  // heroEl.style.left = heroPosition - 3 + "%";
  // heroPosition = newPos;
}

function handleHeroMoveRight(evt) {
  evt.preventDefault();
  // const isCapturing = Alien.getIsCapturing();
  // if (isCaptured) {
  //   return;
  // }
  console.log("move right");
  heroPosition = heroPosition + 3;
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

function handleKeyPress(evt) {
  console.log("keypress");
  const key = evt.key;
  switch (key.toLowerCase()) {
    case "arrowright":
      console.log("foo");
      handleHeroMoveRight(evt);
      break;
    case "arrowleft":
      handleHeroMoveLeft(evt);
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

UserInput.prototype.init = () => {
  console.log("user input");
  document.addEventListener("keydown", handleKeyPress);
};

UserInput.prototype.update = (entities, params) => {
  // Here, we've implemented systems as functions which take in an array of
  // entities. An optimization would be to have some layer which only
  // feeds in relevant entities to the system, but for demo purposes we'll
  // assume all entities are passed in and iterate over them.
  const curEntity = params.playerControlled;

  // We can change component data based on input, which cause other
  // systems (e.g., rendering) to be affected
  //curEntity.components.appearance.domElement.setAttribute("data-move", "10%");
  curEntity.components.appearance.domElement.style.setProperty(
    "--heroDelta",
    `${heroPosition}%`
  );
  console.log("moveit");
  curEntity.components.appearance.domElement.classList.add("hero-move");
  curEntity.components.appearance.domElement.classList.remove("move");
};

const userInput = new UserInput();

export default userInput;
