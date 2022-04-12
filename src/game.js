import PubSub from "pubsub-js";
import Entity from "./ecs/Entity";
import Components from "./ecs/Components";
import render from "./ecs/systems/render";
import userInput from "./ecs/systems/userInput";
import computerinput from "./ecs/systems/computerInput";
import collision from "./ecs/systems/collision";
import life from "./ecs/systems/life";
import { levels } from "./levels";
// import "./styles.css";

const ECS = {
  Components: {},

  Systems: [],
  Entities: [],
  game: {},

  score: 0,
};

/* =========================================================================
 *
 * game.js
 *  This script contains the game logic acts as a controller for the Entity
 *  Component System
 *
 * ========================================================================= */
const Game = function Game() {
  // This is our "main" function which controls everything. We setup the
  // systems to loop over, setup entities, and setup and kick off the game
  // loop.
  const self = this;
  this.level = 0;
  this._running = true;

  this.heroContainerEl = document.querySelector("#hero-container");
  this.heroEl = document.querySelector("#hero");
  this.alienContainerEl = document.querySelector("#aliens");
  this.controlsOpenEl = document.querySelector("#controls-open");
  this.controlsContainerEl = document.querySelector("#controls");
  this.controlsOpenContainerEl = document.querySelector(
    "#controls-open-container"
  );
  console.log("container", this.controlsOpenContainerEl);
  this.controlsPauseEl = document.querySelector("#controls-pause");
  this.levelScreenEl = document.querySelector("#level-screen");

  this.controlsOpenEl.addEventListener(
    "click",
    this.handleOpenControls.bind(this)
  );
  this.controlsPauseEl.addEventListener("click", this.pauseResume.bind(this));

  // Set up Intersection Observer
  let options = {
    root: this.alienContainerEl,
    threshold: [0.01],
  };
  this.observer = new IntersectionObserver(this.handleIntersect, options);

  // Create some entities
  // ----------------------------------
  let entities = {}; // object containing { id: entity  }
  // Create alien entities
  entities = {
    ...entities,
    ...this.handlePopulateAliens(),
  };

  // ALIEN container entity
  let alienContainerEntity = new Entity();
  alienContainerEntity
    .addComponent(
      new Components.Appearance({
        domElement: this.alienContainerEl,
        parentElement: this.alienContainerEl.parentElement,
      })
    )
    .addComponent(
      new Components.Position({
        isInStartPosition: true,
        left: window.innerWidth / 2,
      })
    )
    .addComponent(
      new Components.ComputerControlled({
        isEnemy: false,
      })
    )
    .addComponent(new Components.Fly());
  entities[alienContainerEntity.id] = alienContainerEntity;
  // PLAYER entity
  // ----------------------------------
  // Make the last entity the "PC" entity - it must be player controlled,
  // have health and collision components
  this.player1 = new Entity();
  this.player1
    .addComponent(
      new Components.Appearance({
        domElement: document.querySelector("#hero"),
        parentElement: this.heroContainerEl,
      })
    )
    .addComponent(
      new Components.Position({
        isInStartPosition: true,
      })
    )
    .addComponent(new Components.PlayerControlled())
    .addComponent(new Components.Collision());

  // we can also edit any component, as it's just data
  entities[this.player1.id] = this.player1;
  this.player1Id = this.player1.id;

  // store reference to entities
  ECS.Entities = entities;

  // Setup systems
  // ----------------------------------
  // Setup the array of systems. The order of the systems is likely critical,
  // so ensure the systems are iterated in the right order
  ECS.Systems = [
    // ECS.systems.collision,
    // ECS.systems.decay,
    render,
    userInput,
    computerinput,
    collision,
    life,
  ];

  this.initSystems(this.player1);
  this.showLevel();
  this.gameTime = new Date().getTime();
  this.time;
  this.gameDuration;
  this.previousTime = new Date().getTime();
  this.frameDuration;
  this.numFrames = 0;
  this.gameLoop = () => {
    console.log("gameloop this", this);
    this.numFrames++;
    // Simple game loop
    this.time = new Date().getTime();
    this.gameDuration = (this.time - this.gameTime) / 1000;
    console.log("game Duration", this.gameDuration);
    this.frameDuration = (this.time - this.previousTime) / 1000;
    this.previousTime = this.time;
    for (var i = 0, len = ECS.Systems.length; i < len; i++) {
      console.log("system update");
      // Call the system and pass in entities
      // NOTE: One optimal solution would be to only pass in entities
      // that have the relevant components for the system, instead of
      // forcing the system to iterate over all entities
      ECS.Systems[i].update(ECS.Entities, {
        game: this,
        playerControlled: this.player1,
        player1Id: this.player1Id,
        gameDuration: this.gameDuration,
        frameDuration: this.frameDuration,
        numFrames: this.numFrames,
      });
    }

    // Run through the systems.
    // continue the loop
    if (self._running !== false) {
      requestAnimationFrame(self.gameLoop);
    }
  };
  // Game loop
  // ----------------------------------
  // this.gameLoop = function gameLoop() {
  //   // this._running = true; // is the game going?

  //   this.endGame = function endGame() {
  //     self._running = false;
  //     window.alert("game over");
  //     // document.getElementById('final-score').innerHTML = ECS.score;
  //     // document.getElementById('game-over').className = '';

  //     // // set a small timeout to make sure we set the background
  //     // setTimeout(function(){
  //     //     document.getElementById('game-canvas').className = 'game-over';
  //     // }, 100);
  //   };
  requestAnimationFrame(self.gameLoop);

  return this;
};

// Game.prototype.runGameLoop = function () {

// };

Game.prototype.showLevel = function () {
  let time = 2;
  this.levelScreenEl.textContent = `Level ${this.level}`;
  this.levelScreenEl.classList.remove("hide");
  const interval = setInterval(() => {
    if (time === 0) {
      this.levelScreenEl.classList.add("hide");
      clearInterval(interval);
    } else {
      time--;
    }
  }, 1000);
};

Game.prototype.initSystems = function (entity) {
  for (let i = 0, len = ECS.Systems.length; i < len; i++) {
    ECS.Systems[i].init(ECS.Entities, {
      game: this,
      playerControlled: entity,
      player1Id: this.player1Id,
    });
  }
};

Game.prototype.endLevel = function (systems, entity) {
  debugger;
  this._running = false;
  this.level++;
  // window.alert("end level");
  this.initSystems(systems, entity);
  this.showLevel();
  this._running = true;
  requestAnimationFrame(this.gameLoop);
  // document.getElementById('final-score').innerHTML = ECS.score;
  // document.getElementById('game-over').className = '';

  // // set a small timeout to make sure we set the background
  // setTimeout(function(){
  //     document.getElementById('game-canvas').className = 'game-over';
  // }, 100);
};

Game.prototype.handlePopulateAliens = function () {
  const entities = {};
  Object.keys(levels[this.level]).forEach((key) => {
    const num = levels[this.level][key];
    for (let i = 0; i < num; i++) {
      let entity = new Entity();
      const alien = document.createElement("div");
      alien.classList.add("alien");
      alien.classList.add(key);
      entity
        .addComponent(
          new Components.Appearance({
            domElement: alien,
            parentElement: this.alienContainerEl,
            isFirstElement: i === 0,
            islastElement: i === num - 1,
          })
        )
        .addComponent(
          new Components.ComputerControlled({
            isEnemy: true,
          })
        )
        .addComponent(
          new Components.Position({
            isInStartPosition: true,
          })
        )
        .addComponent(new Components.Collision())
        .addComponent(new Components.Dive())
        .addComponent(new Components.Health(1));
      entities[entity.id] = entity;
    }
  });

  return entities;
};

Game.prototype.handleOpenControls = function (evt) {
  evt.preventDefault();
  console.log("this", this);
  this.controlsOpenContainerEl.classList.add("hide");
  this.controlsContainerEl.classList.remove("hide");
};

Game.prototype.pauseResume = function () {
  if (this._running) {
    PubSub.publish("PAUSE", ECS.Entities);
    console.log("pause");
  } else {
    console.log("resume");
    PubSub.publish("RESUME", ECS.Entities);
    requestAnimationFrame(this.gameLoop);
  }
  this.controlsPauseEl.querySelector("i").classList.toggle("fa-circle-pause");
  this.controlsPauseEl.querySelector("i").classList.toggle("fa-circle-play");
  this._running = !this._running;
};

Game.prototype.handleIntersect = function (entries) {
  entries.forEach(function (entry) {
    console.log("intersect");
    const parentNode = entry.target.parentNode;
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
};

Game.prototype.removeEntity = function (entity) {
  delete ECS.Entities[entity.id];
};

// Kick off the game
ECS.game = new Game();
