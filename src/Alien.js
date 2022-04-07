import Character from "./Character";
import PubSub from "pubsub-js";
import {
  ALIEN_CLASS,
  IS_DIVING_CLASS,
  IS_FLYING_CLASS,
  ALIEN_TIME_START,
  ALIEN_DIVE_TIME
} from "./constants";
import { _isInViewport } from "./utils";

class Alien extends Character {
  constructor(name) {
    super(name);
    Alien.cacheElements();
  }

  static aliensMetaData = {
    boss: {
      healthPoints: 2,
      points: 100
    },
    bee: {
      healthPoints: 1,
      points: 10
    }
  };

  static alienTimer;
  static bossObserver;
  static observer;
  static isBossCapturing = false;
  static alienTime = ALIEN_TIME_START;
  static possibleNumCaptures = 1;
  static hasCapturedHero = false;

  static subscribeToEvents() {
    const mySubscriber = function (msg, data) {
      switch (msg) {
        case "CAPTURED":
          Alien.hasCapturedHero = true;
          break;
        case "PAUSE":
          Alien.pauseAliens();
          break;
        case "RESUME":
          Alien.resumeAliens();
          break;
        default:
          return;
      }
    };
    const capturedSubscription = PubSub.subscribe("CAPTURED", mySubscriber);
    const pauseSubscription = PubSub.subscribe("PAUSE", mySubscriber);
    const resumeSubscription = PubSub.subscribe("RESUME", mySubscriber);
  }

  static getIsCapturingCloud() {
    return document.querySelector("#capture-cloud");
  }

  static getIsCapturing() {
    return Alien.isBossCapturing;
  }

  static getBossContainer() {
    document.querySelector("#boss-container");
  }

  static clearAlienTimer() {
    clearInterval(Alien.alienTimer);
  }

  static getAliens() {
    return document.querySelectorAll("." + ALIEN_CLASS);
  }

  static getAliensContainer() {
    return document.querySelector("#aliens");
  }

  static setAlienTime(time) {
    Alien.alienTime = time;
  }

  static clearDivingClasses() {
    const aliens = Alien.getAliens();
    aliens.forEach(function (alien) {
      if (alien.classList.contains(IS_DIVING_CLASS)) {
        alien.classList.remove(IS_DIVING_CLASS);
      }
    });
  }

  static setObserver(observer) {
    Alien.observer = observer;
  }

  static getObserver() {
    return Alien.observer;
  }

  static pauseAliens() {
    clearInterval(Alien.alienTimer);
    const aliens = document.querySelectorAll(".alien");
    aliens.forEach(function (alien) {
      alien.classList.add("paused");
    });
  }

  static resumeAliens() {
    Alien.flyAliens();
    const aliens = document.querySelectorAll(".alien");
    aliens.forEach(function (alien) {
      alien.classList.remove("paused");
    });
  }

  static flyAliens() {
    let isInViewport = true;
    let alienDirection = "right";
    let alienPosition = -50;
    let isAlienFlying = false;
    let isBossCapturing = false;

    const aliensContainerEl = Alien.getAliensContainer();
    Alien.alienTimer = setInterval(function () {
      if (alienDirection === "right") {
        isInViewport = _isInViewport(aliensContainerEl, 10);

        if (isInViewport) {
          alienPosition += 10;
        } else {
          alienDirection = "left";
          alienPosition -= 10;
        }
      } else {
        isInViewport = _isInViewport(aliensContainerEl, -10);
        if (isInViewport) {
          alienPosition -= 10;
        } else {
          alienDirection = "right";
          alienPosition += 10;
        }
      }
      isAlienFlying = !isAlienFlying;
      if (isAlienFlying) {
        aliensContainerEl.classList.add(IS_FLYING_CLASS);
      } else {
        aliensContainerEl.classList.remove(IS_FLYING_CLASS);
      }

      aliensContainerEl.style.transform = "translateX(" + alienPosition + "%)";

      if (Alien.alienTime > ALIEN_DIVE_TIME) {
        var lastRow = aliensContainerEl.lastChild;
        var nextChild;
        if (lastRow && alienDirection === "left") {
          nextChild = lastRow.firstChild;
        } else if (lastRow && alienDirection === "right") {
          nextChild = lastRow.lastChild;
        }
        console.log("next child", nextChild);
        if (nextChild) {
          if (
            nextChild.classList.contains("boss") &&
            !Alien.isBossCapturing &&
            Alien.possibleNumCaptures > 0
          ) {
            // Alien.bossObserver.observe(nextChild);
            nextChild.addEventListener("animationend", function (evt) {
              const left = nextChild.getBoundingClientRect().left + "px";
              setTimeout(function () {
                console.log("animation end");
                // entry.target.classList.remove("is-diving", "is-diving-and-sticking");
                // entry.target.classList.add("hide")
                const clone = nextChild.cloneNode();
                //aliensContainerEl.removeChild(nextChild)

                const top =
                  aliensContainerEl.getBoundingClientRect().bottom + "px";
                clone.style.left = left;
                //clone.style.top = top;
                nextChild.remove();
                clone.classList.remove("is-diving", "is-diving-and-sticking");

                //entry.target.remove();
                document.querySelector("#boss-container").appendChild(clone);
                clone.style.transform = "translate(0, 55vh)";
                // document
                //   .querySelector("#boss-container")
                //   .classList.add("is-flying");
                // console.log(entry.target.classList);
                clone.classList.add("is-capturing");
                clone.appendChild(document.querySelector("#capture-cloud"));
                setTimeout(function () {
                  document
                    .querySelector("#capture-cloud")
                    .classList.add("fade");
                  document
                    .querySelector("#boss-container")
                    .appendChild(document.querySelector("#capture-cloud"));
                  clone.classList.remove("is-capturing");
                  //clone.classList.add("is-flying-to-top");

                  if (!Alien.hasCapturedHero) {
                    Alien.getAliensContainer()
                      .querySelector(".row:nth-child(1)")
                      .appendChild(clone);
                    Alien.getObserver().observe(clone);
                    clone.classList.add("is-diving");
                  } else {
                    // const newRow = document.createElement("div");
                    // newRow.classList.add("row");
                    Alien.getAliensContainer()
                      .querySelector(".row:first-child")
                      .appendChild(clone);
                    //newRow.appendChild(clone);
                  }
                  Alien.isBossCapturing = false;
                  Alien.possibleNumCaptures--;
                }, 3000);

                // console.log(entry.target.classList);

                // document.querySelector("#boss-container").appendChild(entry.target);
                // console.log(entry.target.classList);
                // entry.target.style.transform = `translateX(${left})`;
              }, 500);
            });
            nextChild.classList.add("is-diving-and-sticking");
            Alien.isBossCapturing = true;
            // document.querySelector("#boss-container").appendChild(nextChild);
          } else if (!Alien.isBossCapturing) {
            setTimeout(function () {
              let className = IS_DIVING_CLASS;
              nextChild.classList.add(className);
            }, 3000);
          }
        }
      }

      Alien.setAlienTime(Alien.alienTime + 1);
    }, ALIEN_TIME_START);
  }
}

export default Alien;
