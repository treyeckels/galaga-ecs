import { _isOverlapping } from "../../utils";

const Life = function systemCollision() {
  this.name = "life";
};

Life.prototype.init = (entities, params) => {};

Life.prototype.update = (entities, params) => {
  const heroEntity = entities[params.player1Id];
  const game = params.game;
  for (let entityId in entities) {
    const curEntity = entities[entityId];
    if (
      curEntity.components.appearance &&
      curEntity.components.health &&
      curEntity.components.health.value === 0
    ) {
      curEntity.components.appearance.domElement.classList.add("is-paused");
      curEntity.components.appearance.domElement.classList.add("is-fading");
      curEntity.components.appearance.domElement.remove();
      game.removeEntity(curEntity);
    }
  }
  console.log("entities", entities);
  const hasAlienLife = Object.values(entities).some((entity) => {
    return entity.components.health && entity.components.computerControlled;
  });
  console.log("hasAlienLife", hasAlienLife);
  if (hasAlienLife) {
    return;
  }

  game.endLevel();
};

const life = new Life();

export default life;
