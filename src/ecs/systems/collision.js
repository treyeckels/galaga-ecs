import { _isOverlapping } from "../../utils";

const Collision = function systemCollision() {
  this.name = "collision";
};

Collision.prototype.init = (entities, params) => {};

Collision.prototype.update = (entities, params) => {
  const heroEntity = entities[params.player1Id];
  const game = params.game;
  for (let entityId in entities) {
    const curEntity = entities[entityId];
    if (
      curEntity.components.appearance &&
      curEntity.components.dive &&
      curEntity.components.dive.isDiving
    ) {
      const isOverlapping = _isOverlapping(
        curEntity.components.appearance.domElement,
        heroEntity.components.appearance.domElement
      );
      if (isOverlapping) {
        curEntity.components.health.value--;
        return;
        // game.handlePlayerCollision(curEntity);
      }

      const isAtEndOfScreen = _isOverlapping(
        game.heroContainerEl,
        curEntity.components.appearance.domElement
      );

      if (isAtEndOfScreen) {
        curEntity.components.health.value--;
        return;
      }
    }
  }
};

const collision = new Collision();

export default collision;
