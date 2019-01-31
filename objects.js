function loadTemplates() {

  /***** PROJECTILES: SHAPES AND SPRITES *****/
  projectile.circleBullet = {
    radius: 6,
    draw: function (ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  projectile.microBullet = {
    radius: 3,
    draw: function (ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  /***** RING: FIRING PATTERNS *****/
  ring.spiralAlpha1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1
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
      acceleration: 1
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
      acceleration: 1
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

  ring.spiralAlpha4 = {
    payload: {
      type: projectile.circleBullet,
      speed: 300,
      acceleration: 1
    },
    rotation: {
      angle: 180,
      frequency: 20
    },
    firing: {
      angle: 90,
      count: 10,
      loadTime: 0.05,
      cooldownTime: .45,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true
    }
  }

  ring.spreadBeta1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 250,
      acceleration: 1
    },
    firing: {
      angle: 90,
      count: 1,
      loadTime: 0.005,
      cooldownTime: .1,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: false,
      pulse: {
        duration: 4,
        delay: .5
      }
    }
  }
  
  ring.spreadBeta2 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1
    },
    firing: {
      spread: 15,
      radius: 15,
      angle: 90,
      count: 5,
      loadTime: 0.005,
      cooldownTime: .09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    }
  }

  ring.spreadBeta3 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1
    },
    firing: {
      spread: 180,
      radius: 15,
      angle: 90,
      count: 2,
      loadTime: 0.005,
      cooldownTime: .09,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: .5
      }
    }
  }

  ring.spreadBeta4 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1
    },
    firing: {
      spread: 100,
      radius: 15,
      angle: 90,
      count: 5,
      loadTime: 0.005,
      cooldownTime: .09,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: .5
      }
    }
  }
  
  ring.singleTargetPlayer = {
    payload: {
      type: projectile.circleBullet,
      speed: 100,
      acceleration: 1
    },
    firing: {
      angle: 90,
      count: 1,
      loadTime: 0.05,
      cooldownTime: 2,
      rapidReload: true,
      targetPlayer: true
    }
  }
  
  ring.doubleStraightDownPulse = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1
    },
    firing: {
      spread: 100,
      radius: 15,
      angle: 90,
      count: 5,
      loadTime: 0.005,
      cooldownTime: .09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    }
  }

  /***** ENEMY SHIPS *****/
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
    weapon: ring.spiralAlpha4
  };

  ship.idleCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.bat,
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
    weapon: ring.spreadBeta3
  };
  
  ship.easyCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane,
      snapLine: 100,
      snapLineSpeed: 200,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
      
    },
    weapon: ring.singleTargetPlayer
  };
  
  ship.easyDoubleTurretCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.bat,
      snapLine: 100,
      snapLineSpeed: 200,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
      
    },
    weapon: ring.singleTargetPlayer
  };
  

  /***** ALL PLAYER THINGS *****/
  projectile.player1 = {
    radius: 8,
    draw: function (ctx) {
      ctx.strokeStyle = 'orange';
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  /** A simple ring for the player only shoots up */
  ring.player = {
    payload: {
      type: projectile.player1,
      speed: 600,
      acceleration: 1
    },
    firing: {
      angle: 270,
      count: 1,
      loadTime: 0.01,
      cooldownTime: .25,
      rapidReload: true,
      viewTurret: false
    }
  }

  ship.player = {
    config: {
      radius: 40,
      sprite: sprite.plane,
      speed: 300
    },
    weapon: ring.player
  }

} // end of objects file
