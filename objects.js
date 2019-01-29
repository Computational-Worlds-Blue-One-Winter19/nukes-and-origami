/**
   * Main configuration for various game assets.
   * An enemy vessel extends Ship and declares a manifest with its attributes.
   * Attributes include path, weapon assembly, dimension, spritesheet details and hit value. 
   */
function loadTemplates() {
  
  
  
  /** Circle bullet from Nathan. */
  projectile.circleBullet = {
    radius: 10,
    draw: function (ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  /** A ring is attached to the ship's weapon and fires a payload */
  ring.spiralAlpha1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
      targeting: false
    },
    rotation: {
      angle: 720,
      frequency: 4
    },
    firing: {
      count: 3,
      loadTime: 0.01,
      cooldownTime: .1,
      rapidReload: true,
      targetPlayer: false
    }
  }

ring.spiralAlpha2 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
      targeting: false
    },
    rotation: {
      angle: 720,
      frequency: 4
    },
    firing: {
      count: 1,
      loadTime: 0.05,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: false
    }
  }

  ring.spiralAlpha3 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
      targeting: false
    },
    rotation: {
      angle: 180,
      frequency: 1
    },
    firing: {
      count: 1,
      loadTime: 0.05,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: false
    }
  }

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

  /** The Enemy Crane ship manifest */
  ship.demoCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0
    },
    path: [[180, 100, 5], [0, 100, 5], [180, 100, 5], [0, 100, 5], [90, 100, 60]],
    weapon: ring.spiralAlpha3
  };

  // Player sprite and ship are defined here, but not compatible with other ships.
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
  }
  
  // The default properties for the player ship are defined here.
  ship.player = {
    config: {
      radius: 40,
      sprite: sprite.plane,
      speed: 50
    }
  }

} // end of objects file