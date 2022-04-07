import Character from "./Character";

class Hero extends Character {
  constructor(name, playerNum) {
    super(name);
    this.playerNum = playerNum;
    // this.gameElements = gameElements;
    // this.cacheElements();
    // Hero.setHeroInitialPosition();
  }

  static cacheElements(gameElements) {
    const heroContainerEl = gameElements.screen1El.querySelector(
      "#hero-container"
    );

    return {
      heroContainerEl,
      heroEl: heroContainerEl.querySelector("#hero"),
      crashEl: heroContainerEl.querySelector("#crash"),
      heroMissileEl: gameElements.screen1El.querySelector("#hero-missile")
    };
  }

  static getHeroEl() {
    return this.heroEl;
  }

  getHeroContainer() {
    return this.heroContainerEl;
  }

  // static setHeroInitialPosition() {
  //   return (this.getHeroEl().getBoundingClientRect().left /
  //       Hero.getHeroContainer().getBoundingClientRect().width) *
  //       100 +
  //     2;
  // }
}

export default Hero;
