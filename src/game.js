import PubSub from "pubsub-js";
import Entity from "./ecs/Entity";
import Components from "./ecs/Components";
import render from "./ecs/systems/render";
import userInput from "./ecs/systems/userInput";
import { levels } from "./levels";
// import "./styles.css";

const ECS = {
  Components: {},

  Systems: {},
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
  this.alienContainerEl = document.querySelector("#aliens");
  this.controlsOpenEl = document.querySelector("#controls-open");
  this.controlsContainerEl = document.querySelector("#controls");
  this.controlsOpenContainerEl = document.querySelector(
    "#controls-open-container"
  );
  console.log("container", this.controlsOpenContainerEl);
  this.controlsPauseEl = document.querySelector("#controls-pause");

  this.controlsOpenEl.addEventListener(
    "click",
    this.handleOpenControls.bind(this)
  );
  this.controlsPauseEl.addEventListener("click", this.pauseResume.bind(this));

  // Create some entities
  // ----------------------------------
  var entities = {}; // object containing { id: entity  }
  // Create alien entities
  Object.keys(levels[this.level]).forEach((key) => {
    const num = levels[this.level][key];
    for (let i = 0; i < num; i++) {
      let entity = new Entity();

      console.log("num", num);
      const alien = document.createElement("div");
      alien.classList.add("alien");
      alien.classList.add(key);
      entity.addComponent(
        new Components.Appearance({
          domElement: alien,
          parentElement: this.alienContainerEl,
          isFirstElement: i === 0,
          islastElement: i === num - 1,
        })
      );
      entity.addComponent(new Components.ComputerControlled());
      entity.addComponent(
        new Components.Position({
          isInStartPosition: true,
        })
      );
      entity.addComponent(new Components.Collision());
      entities[entity.id] = entity;
    }
  });
  // Create a bunch of random entities
  // for(var i=0; i < 20; i++){
  //     entity = new ECS.Entity();
  //     entity.addComponent( new ECS.Components.Appearance());
  //     entity.addComponent( new ECS.Components.Position());

  //     // % chance for decaying rects
  //     if(Math.random() < 0.8){
  //         entity.addComponent( new ECS.Components.Health() );
  //     }

  //     // NOTE: If we wanted some rects to not have collision, we could set it
  //     // here. Could provide other gameplay mechanics perhaps?
  //     entity.addComponent( new ECS.Components.Collision());

  //     entities[entity.id] = entity;
  // }

  // PLAYER entity
  // ----------------------------------
  // Make the last entity the "PC" entity - it must be player controlled,
  // have health and collision components
  let entity = new Entity();
  entity.addComponent(
    new Components.Appearance({
      domElement: document.querySelector("#hero"),
      parentElement: this.heroContainerEl,
    })
  );
  entity.addComponent(
    new Components.Position({
      isInStartPosition: true,
    })
  );
  entity.addComponent(new Components.PlayerControlled());
  entity.addComponent(new Components.Collision());

  // we can also edit any component, as it's just data
  entities[entity.id] = entity;

  // store reference to entities
  ECS.entities = entities;

  // Setup systems
  // ----------------------------------
  // Setup the array of systems. The order of the systems is likely critical,
  // so ensure the systems are iterated in the right order
  var systems = [
    // ECS.systems.collision,
    // ECS.systems.decay,
    render,
    userInput,
  ];

  for (let i = 0, len = systems.length; i < len; i++) {
    systems[i].init(ECS.entities, {
      game: self,
      playerControlled: entity,
    });
  }

  // Game loop
  // ----------------------------------
  this.gameLoop = function gameLoop() {
    // Simple game loop
    for (var i = 0, len = systems.length; i < len; i++) {
      // Call the system and pass in entities
      // NOTE: One optimal solution would be to only pass in entities
      // that have the relevant components for the system, instead of
      // forcing the system to iterate over all entities
      systems[i].update(ECS.entities, {
        game: self,
        playerControlled: entity,
      });
    }

    // Run through the systems.
    // continue the loop
    if (self._running !== false) {
      requestAnimationFrame(self.gameLoop);
    }
  };
  // Kick off the game loop
  // for (let i = 0; i < 3; i++) {
  //   gameLoop();
  // }
  requestAnimationFrame(this.gameLoop);
  // this._running = true; // is the game going?

  // Lose condition
  // ----------------------------------

  this.endGame = function endGame() {
    self._running = false;
    window.alert("game over");
    // document.getElementById('final-score').innerHTML = ECS.score;
    // document.getElementById('game-over').className = '';

    // // set a small timeout to make sure we set the background
    // setTimeout(function(){
    //     document.getElementById('game-canvas').className = 'game-over';
    // }, 100);
  };

  return this;
};

Game.prototype.handleOpenControls = function (evt) {
  evt.preventDefault();
  console.log("this", this);
  this.controlsOpenContainerEl.classList.add("hide");
  this.controlsContainerEl.classList.remove("hide");
};

Game.prototype.pauseResume = function () {
  if (this._running) {
    PubSub.publish("PAUSE", "");
    console.log("pause");
  } else {
    console.log("resume");
    PubSub.publish("RESUME", "");
    requestAnimationFrame(this.gameLoop);
  }
  this.controlsPauseEl.querySelector("i").classList.toggle("fa-circle-pause");
  this.controlsPauseEl.querySelector("i").classList.toggle("fa-circle-play");
  this._running = !this._running;
};

// Kick off the game
ECS.game = new Game();
