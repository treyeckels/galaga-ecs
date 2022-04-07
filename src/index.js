import UUID from "uuidjs";
import PubSub from "pubsub-js";
import {
  HIDE_CLASS,
  CRASH_CLASS,
  IS_DIVING_CLASS,
  ALIEN_CLASS,
  IS_FLYING_CLASS,
  ALIEN_TIME_START
} from "./constants";

import { _isOverlapping, _isInViewport } from "./utils";
import { levels } from "./levels";

import Hero from "./Hero";
import Alien from "./Alien";

var screen0El = document.querySelector("#screen-0");
var screen1El = document.querySelector("#screen-1");
var screen2El = document.querySelector("#screen-2");
var aliensOuterContainerEl = screen1El.querySelector("#aliens-container");
var aliensContainerEl = screen1El.querySelector("#aliens");

const heroElements = Hero.cacheElements({
  screen1El
});

const heroContainerEl = heroElements.heroContainerEl;
const heroEl = heroElements.heroEl;
const crashEl = heroElements.crashEl;
const heroMissileEl = heroElements.heroMissileEl;

var player1ScoreEl = screen1El.querySelector("#player1 .score");
var livesLeftContainersEl = screen1El.querySelectorAll(".lives-left");
var interstitialEl = screen1El.querySelector("#interstitial");
var numLivesLeftEl = interstitialEl.querySelector("#num-lives-left");
var startButtonEl = screen0El.querySelector("#start-button");
const continueButtonEl = screen2El.querySelector("#continue-button");
const audioEl = document.querySelector("#audio");
const controlsLeftEl = document.querySelector("#controls-left");
const controlsRightEl = document.querySelector("#controls-right");
const controlsFireEl = document.querySelector("#controls-fire");
const controlsOpenEl = document.querySelector("#controls-open");
const controlsContainerEl = document.querySelector("#controls");
const controlsOpenContainerEl = document.querySelector(
  "#controls-open-container"
);
const controlsPauseEl = document.querySelector("#controls-pause");

let player1 = new Hero("player1", 1);

let observer;
let bossObserver;
let playTimeOut;
let continueTimer;
let heroPosition;
let player1Score = 0;
let player1Lives = 3;
let isPlaying = 1;
let level = 0;
let isCaptured = false;
let isGamePaused = false;
let sounds = {
  theme: "Galaga_Theme_Song.mp3",
  start: "Galaga_Level_Start_Sound_Effect.mp3",
  alienIsFlying: "Galaga_Flying_Enemy_Sound_Effect.mp3"
};

const aliensMetaData = Alien.aliensMetaData;

function init() {
  // heroEl.style.left = heroEl.getBoundingClientRect().left + "px";
  // document.getElementById("app").style.height = window.innerHeight + "px";
  Alien.subscribeToEvents();
  var mySubscriber = function (msg, data) {
    //window.alert(data)
  };
  var token = PubSub.subscribe("MY TOPIC", mySubscriber);
  ///PubSub.publish("MY TOPIC", "hello world!");
  playSound(sounds.theme, true);
  addEventListeners();
  createObserver();
}

function playSound(sound, isLooping) {
  audioEl.src = `/src/sound/${sound}`;
  audioEl.loop = isLooping;
  audioEl.play();
}

function endSound(sound) {
  audioEl.pause();
}

function setState(state) {
  switch (state) {
    case 0:
      endSound();
      screen0El.classList.add(HIDE_CLASS);
      screen2El.classList.add(HIDE_CLASS);
      screen1El.classList.remove(HIDE_CLASS);
      heroEl.classList.remove(CRASH_CLASS);
      crashEl.classList.remove(CRASH_CLASS);

      populateAliens();

      heroPosition =
        (heroEl.getBoundingClientRect().left /
          heroContainerEl.getBoundingClientRect().width) *
          100 +
        2;

      // playSound(sounds.start);
      break;
    case 1:
      crashEl.style.left = heroEl.getBoundingClientRect().left + "px";
      heroEl.classList.add(CRASH_CLASS);
      crashEl.classList.add(CRASH_CLASS);
      player1Lives--;
      if (!player1Lives) {
        setTimeout(function () {
          setState(2);
        }, 3000);
      } else {
        setTimeout(function () {
          setState(3);
        }, 3000);
      }
      const lifeLeft = livesLeftContainersEl[isPlaying - 1].firstElementChild;
      if (lifeLeft) {
        lifeLeft.remove();
      }
      break;
    case 2:
      screen1El.classList.add(HIDE_CLASS);
      screen2El.classList.remove(HIDE_CLASS);
      Alien.clearAlienTimer();
      document.querySelectorAll("." + ALIEN_CLASS).forEach((alien) => {
        observer.unobserve(alien);
        alien.remove();
      });
      clearTimeout(playTimeOut);
      let countDown = 10;
      continueTimer = setInterval(() => {
        if (!countDown) {
          clearInterval(continueTimer);
          continueButtonEl.innerText = "";
          setState(4);
        }
        continueButtonEl.innerText = "Continue " + countDown;
        countDown--;
      }, 1000);
      break;
    case 3:
      Alien.clearAlienTimer();
      heroEl.classList.remove(CRASH_CLASS);
      crashEl.classList.remove(CRASH_CLASS);
      numLivesLeftEl.innerText =
        livesLeftContainersEl[isPlaying - 1].children.length;
      interstitialEl.classList.remove(HIDE_CLASS);

      Alien.setAlienTime(ALIEN_TIME_START);
      aliensContainerEl.classList.add(HIDE_CLASS);
      aliensContainerEl.style.transform = "translateX(-50%)";
      heroEl.style.left = "calc(50% + 1px)";
      heroPosition =
        (heroEl.getBoundingClientRect().left /
          heroContainerEl.getBoundingClientRect().width) *
          100 +
        2;
      playTimeOut = setTimeout(function () {
        interstitialEl.classList.add(HIDE_CLASS);
        aliensContainerEl.classList.remove(HIDE_CLASS);
        play();
      }, 3000);
      break;
    case 4:
      window.alert("foo");
      break;
    default:
      return;
  }
}

function handleIntersect(entries) {
  entries.forEach(function (entry) {
    console.log("intersect");
    var parentNode = entry.target.parentNode;
    if (_isOverlapping(entry.target, heroEl)) {
      observer.unobserve(entry.target);
      entry.target.remove();
      if (
        parentNode &&
        parentNode.childNodes &&
        !parentNode.childNodes.length
      ) {
        parentNode.remove();
      }
      setState(1);
    } else if (
      entry.boundingClientRect.bottom >
      heroContainerEl.getBoundingClientRect().top
    ) {
      observer.unobserve(entry.target);
      entry.target.remove();
      if (!parentNode.childNodes.length) {
        parentNode.remove();
      }
    }
  });
}

function createObserver() {
  let options = {
    root: Alien.getAliensContainer(),
    threshold: [0.01]
  };
  observer = new IntersectionObserver(handleIntersect, options);
  Alien.setObserver(observer);
}

function play() {
  console.log("play");
  playSound(sounds.start);
  Alien.clearDivingClasses();
  Alien.flyAliens();
}

function pauseResume() {
  if (isGamePaused) {
    PubSub.publish("RESUME", "");
  } else {
    PubSub.publish("PAUSE", "");
  }
  controlsPauseEl.querySelector("i").classList.toggle("fa-circle-pause");
  controlsPauseEl.querySelector("i").classList.toggle("fa-circle-play");
  isGamePaused = !isGamePaused;
}

function populateAliens() {
  aliensContainerEl.innerHTML = "";
  Object.keys(levels[level]).forEach(function (key) {
    var num = levels[level][key];
    var row = document.createElement("div");
    var i;
    var alien;
    row.classList.add("row");
    for (i = 0; i < num; i++) {
      alien = document.createElement("div");
      alien.classList.add("alien");
      alien.classList.add(key);
      alien.setAttribute("data-healthpoints", aliensMetaData[key].healthPoints);
      alien.setAttribute("data-points", aliensMetaData[key].points);
      observer.observe(alien);
      row.appendChild(alien);

      alien.addEventListener("animationend", () => {
        if (
          alien.classList.contains("boss") &&
          alien.classList.contains("is-diving-and-sticking")
        ) {
          // alien.classList.remove("is-diving-and-sticking");
          // alien.classList.remove("is-diving");
          // const left = alien.getBoundingClientRect().left + "px";
          // document.querySelector("#boss-container").appendChild(alien);
          // alien.style.transform = `translateX(${left})`;
        }
      });
    }
    aliensContainerEl.appendChild(row);
  });
  aliensContainerEl.style.height =
    aliensOuterContainerEl.getBoundingClientRect().height + "px";
}

function fireMissile(missileEl, leftPos) {
  var position = 10;
  var interval = setInterval(function () {
    position = position + 10;
    missileEl.style.bottom = position.toString() + "%";

    var possibleAliens = screen1El.querySelectorAll("." + ALIEN_CLASS);
    var overLappingAlien = [...possibleAliens].find(function (el) {
      return _isOverlapping(el, missileEl);
    });

    if (overLappingAlien) {
      var alienHealthPoints = parseInt(
        overLappingAlien.getAttribute("data-healthpoints"),
        10
      );
      if (alienHealthPoints - 1 === 0) {
        clearInterval(interval);
        missileEl.remove();
        overLappingAlien.remove();
        missileEl.remove();
        var points = parseInt(overLappingAlien.getAttribute("data-points"), 10);
        player1Score = player1Score + points;
        player1ScoreEl.innerText = player1Score;
        var lastRow = aliensContainerEl.lastChild;
        if (!lastRow.children.length) {
          lastRow.remove();
        }
        return;
      } else {
        clearInterval(interval);
        overLappingAlien.setAttribute(
          "data-healthpoints",
          (alienHealthPoints - 1).toString()
        );
        missileEl.remove();
        return;
      }
    }

    if (position >= 100) {
      clearInterval(interval);
      missileEl.remove();
    }
  }, 100);
}

function handleCapture() {
  PubSub.publish("CAPTURED", "");
  isCaptured = true;
  const cloud = Alien.getIsCapturingCloud();
  const rectangle = cloud.getBoundingClientRect();
  console.log("height", rectangle.height);
  const center = rectangle.width / 4;
  console.log(center);
  const heroElRectangle = heroEl.getBoundingClientRect();
  const up = rectangle.top / 2 - heroElRectangle.top / 2;
  console.log("up", up);
  heroEl.style.setProperty("--up", `${up}px`);
  heroEl.style.setProperty("--center", `calc(${center}px - 25%)`);
  // heroEl.style.transform = `scale(2) translate(calc(${center}px - 25%)`;
  heroEl.classList.add("is-captured");
  cloud.classList.add("fade");
  const clone = heroEl.cloneNode();
  clone.classList.add("is-attached-to-boss");
  //cloud.parentElement.appendChild(clone);
  setTimeout(function () {
    document.querySelector("#boss-container").appendChild(cloud);
    heroPosition =
      (heroEl.getBoundingClientRect().left /
        heroContainerEl.getBoundingClientRect().width) *
        100 +
      2;
    heroEl.style.left = heroPosition;
  }, 2000);
}

function handleHeroMoveLeft(evt) {
  evt.preventDefault();
  const newPos = heroPosition - 3;
  if (newPos <= 1) {
    return;
  }
  heroEl.style.left = heroPosition - 3 + "%";
  heroPosition = newPos;
}

function handleHeroMoveRight(evt) {
  evt.preventDefault();
  const isCapturing = Alien.getIsCapturing();
  if (isCaptured) {
    return;
  }
  let newPos;

  newPos = heroPosition + 3;
  if (newPos >= 98) {
    return;
  }
  heroEl.style.left = newPos + "%";
  heroPosition = newPos;
  if (isCapturing) {
    const isOverlapping = _isOverlapping(heroEl, Alien.getIsCapturingCloud());
    if (isOverlapping) {
      handleCapture();
    }
  }
}

function handleHeroFireMissile(evt) {
  evt.preventDefault();
  var copyEl = heroMissileEl.cloneNode();
  screen1El.appendChild(copyEl);
  copyEl.style.left = heroPosition - 3 + "%";
  copyEl.classList.remove(HIDE_CLASS);
  copyEl.id = UUID.genV4();
  fireMissile(copyEl, heroPosition);
}

function handleKeyPress(evt) {
  if (isCaptured) {
    return;
  }

  var key = evt.key;
  switch (key.toLowerCase()) {
    case "arrowright":
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

function setupGame() {
  setState(0);
  play();
}

function handleContinue() {
  clearInterval(continueTimer);
  setupGame();
  continueButtonEl.innerText = "";
  for (let i = 0; i < 3; i++) {
    const div = document.createElement("div");
    div.classList.add("life");
    livesLeftContainersEl[isPlaying - 1].append(div);
  }
}

function handleOpenControls(evt) {
  evt.preventDefault();
  controlsOpenContainerEl.classList.add("hide");
  controlsContainerEl.classList.remove("hide");
}

function addEventListeners() {
  document.addEventListener("keydown", handleKeyPress);
  startButtonEl.addEventListener("click", setupGame);
  continueButtonEl.addEventListener("click", handleContinue);
  controlsLeftEl.addEventListener("click", handleHeroMoveLeft);
  controlsRightEl.addEventListener("click", handleHeroMoveRight);
  controlsFireEl.addEventListener("click", handleHeroFireMissile);
  controlsLeftEl.addEventListener("touchend", handleHeroMoveLeft);
  controlsRightEl.addEventListener("touchend", handleHeroMoveRight);
  //controlsFireEl.addEventListener("touchend", handleHeroFireMissile);
  controlsOpenEl.addEventListener("click", handleOpenControls);
  // controlsOpenEl.addEventListener("touchstart", handleOpenControls);
  controlsPauseEl.addEventListener("click", pauseResume);
}

init();
