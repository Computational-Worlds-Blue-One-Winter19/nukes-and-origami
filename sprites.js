function loadSpriteSheets() {

  /** The Crane spritesheet configuration */
  sprite.crane = {
    default: {
      image: AM.getAsset('./img/crane-sheet.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 220,
        frameHeight: 165,
        frameCount: 4,
        timePerFrame: 0.1,
        scale: 0.6,
        flip: false
      }
    }
  }

  /** Experiment: mini-sized Crane projectiles */
  sprite.miniCrane = {
    default: {
      image: AM.getAsset('./img/mini-crane-sheet.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 55,
        frameHeight: 41,
        frameCount: 4,
        timePerFrame: 0.1,
        scale: 0.5,
        flip: false
      }
    }
  }

  sprite.bat = {
    default: {
      image: AM.getAsset('./img/bat-sheet.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 330,
        frameHeight: 190,
        frameCount: 4,
        timePerFrame: 0.1,
        scale: 0.3,
        flip: false
      }
    }
  }

  sprite.owl = {
    default: {
      image: AM.getAsset('./img/owl.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 620,
        frameHeight: 330,
        frameCount: 10,
        timePerFrame: 0.1,
        scale: 0.3,
        flip: false
      }
    }
  }

  sprite.dove = {
    default: {
      image: AM.getAsset('./img/dove.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 617,
        frameHeight: 330,
        frameCount: 6,
        timePerFrame: 0.1,
        scale: 0.3,
        flip: false
      }
    }
  }

  sprite.rainbowBall = {
    default: {
      image: AM.getAsset('./img/rainbow_ball.png'),
      dimension: {
        originX: 0,
        originY: 0,
        // LOL THIS BALL IMAGE IS BIGGER THAN 4K
        frameWidth: 3035,
        frameHeight: 2910,
        frameCount: 1,
        timePerFrame: 30,
        scale: 0.02,
        flip: false,
      }
    }
  }

  /** The Player Plane SpriteSheet */
  sprite.plane = {
    default: {
      image: AM.getAsset('./img/plane-small.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 1,
        timePerFrame: 0,
        scale: 1.0,
        flip: false
      }
    },
    right: {
      image: AM.getAsset('./img/plane-small.png'),
      dimension: {
        originX: 60,
        originY: 0,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 1,
        timePerFrame: 0,
        scale: 1.0,
        flip: false
      }
    },
    left: {
      image: AM.getAsset('./img/plane-small.png'),
      dimension: {
        originX: 120,
        originY: 0,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 1,
        timePerFrame: 0,
        scale: 1.0,
        flip: false
      }
    },
    rollRight: {
      image: AM.getAsset('./img/plane-small.png'),
      dimension: {
        originX: 0,
        originY: 66,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 8,
        timePerFrame: 0.07,
        scale: 1.0,
        flip: false
      }
    },
    rollLeft: {
      image: AM.getAsset('./img/plane-small.png'),
      dimension: {
        originX: 0,
        originY: 132,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 8,
        timePerFrame: 0.07,
        scale: 1.0,
        flip: false
      }
    }
  } //end plane
  
  sprite.purplePlane = {
    default: {
      image: AM.getAsset('./img/purple-plane-small.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 1,
        timePerFrame: 0,
        scale: 1.0,
        flip: false
      }
    },
    right: {
      image: AM.getAsset('./img/purple-plane-small.png'),
      dimension: {
        originX: 60,
        originY: 0,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 1,
        timePerFrame: 0,
        scale: 1.0,
        flip: false
      }
    },
    left: {
      image: AM.getAsset('./img/purple-plane-small.png'),
      dimension: {
        originX: 120,
        originY: 0,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 1,
        timePerFrame: 0,
        scale: 1.0,
        flip: false
      }
    },
    rollRight: {
      image: AM.getAsset('./img/purple-plane-small.png'),
      dimension: {
        originX: 0,
        originY: 66,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 8,
        timePerFrame: 0.07,
        scale: 1.0,
        flip: false
      }
    },
    rollLeft: {
      image: AM.getAsset('./img/purple-plane-small.png'),
      dimension: {
        originX: 0,
        originY: 132,
        frameWidth: 60,
        frameHeight: 66,
        frameCount: 8,
        timePerFrame: 0.07,
        scale: 1.0,
        flip: false
      }
    }
  } //end purple plane

}
