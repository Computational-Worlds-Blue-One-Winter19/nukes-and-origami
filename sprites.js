function loadSpriteSheets() {
  
  /** The Crane spritesheet configuration */
  sprite.crane = {
    default: {
      image: AM.getAsset('./img/crane-sheet.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 440,
        frameHeight: 330,
        frameCount: 4,
        timePerFrame: 0.1,
        scale: 0.3,
        flip: false
      }
    }
  }

  /** The Player Plane SpriteSheet */
  sprite.plane = {
    default: {
      image: AM.getAsset('./img/plane.png'),
      dimension: {
        originX: 0,
        originY: 0,
        frameWidth: 300,
        frameHeight: 330,
        frameCount: 1,
        timePerFrame: 0,
        scale: 0.2,
        flip: false
      }
    },
    right: {
      image: AM.getAsset('./img/plane.png'),
      dimension: {
        originX: 300,
        originY: 0,
        frameWidth: 300,
        frameHeight: 330,
        frameCount: 1,
        timePerFrame: 0,
        scale: 0.2,
        flip: false
      }
    },
    left: {
      image: AM.getAsset('./img/plane.png'),
      dimension: {
        originX: 600,
        originY: 0,
        frameWidth: 300,
        frameHeight: 330,
        frameCount: 1,
        timePerFrame: 0,
        scale: 0.2,
        flip: false
      }
    },
    rollRight: {
      image: AM.getAsset('./img/plane.png'),
      dimension: {
        originX: 0,
        originY: 330,
        frameWidth: 300,
        frameHeight: 330,
        frameCount: 8,
        timePerFrame: 0.07,
        scale: 0.2,
        flip: false
      }
    },
    rollLeft: {
      image: AM.getAsset('./img/plane.png'),
      dimension: {
        originX: 0,
        originY: 660,
        frameWidth: 300,
        frameHeight: 330,
        frameCount: 8,
        timePerFrame: 0.07,
        scale: 0.2,
        flip: false
      }
    }
  } //end plane
  
}