function loadTemplates() {

  /**
   * A custom projectile overrides the update method. This is called after the projectile has spawned.
   * Access origin.x, origin.y, current.x, current.y, that.initialAngle, that.angle, that.speed,
   * that.acceleration, that.game.clockTick
   */
  projectile.testBullet = {
    radius: 3,

    draw: function (ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },

    update: function() {
      // this will override standard behavior
      let deltaX = this.current.x - this.origin.x;
      let deltaY = this.current.y - this.origin.y;
      let r = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

      this.angle += toRadians(1);
      r = 10 * Math.cos(6 * this.angle);

      this.current.x = this.origin.x + r * Math.cos(this.angle);
      this.current.y = this.origin.y + r * Math.sin(this.angle);
    }
  }

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
  ring.linearTest = {
    payload: {
      type: projectile.testBullet,
      speed: 500,
      acceleration: 1
    },
    firing: {
      radius: 5,
      count: 1,
      angle: 90,
      loadTime: 0.01,
      cooldownTime: .1,
      rapidReload: true,
      targetPlayer: false
    }
  }

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
      angle: 45,
      frequency: 4
    },
    firing: {
      angle: 90,
      count: 2,
      spread: 90,
      loadTime: 0.05,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: .5
      }
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

  ring.fixedSpeed = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1
    },
    rotation: {
      speed: .25
    },
    firing: {
      radius: 80,
      angle: 90,
      count: 1,
      loadTime: 0.005,
      cooldownTime: .1,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: .5
      }
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
      targetPlayer: true,
      pulse: {
        duration: 0.5,
        delay: 0.5
      },
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

  ring.jaredAlpha1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1
    },
    rotation: {
      angle: 45,
      frequency: 4
    },
    firing: {
      angle: 90,
      count: 2,
      spread: 90,
      loadTime: 0.005,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: .5
      }
    }
  }

  ring.jaredAlpha2 = {
    payload: {
      type: projectile.microBullet,
      speed: 500,
      acceleration: 1
    },
    rotation: {
      speed: .25
    },
    firing: {
      radius: 80,
      angle: 90,
      count: 4,
      loadTime: 0.005,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      pulse: {
        duration: .75,
        delay: .5
      }
    }
  }

  ring.jaredBeta1 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1
    },
    rotation: {
      speed: 1
    },
    firing: {
      radius: 80,
      angle: 90,
      count: 1,
      loadTime: 0.005,
      cooldownTime: .09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: .5
      }
    }
  }

  ring.slowPulseSpiral = {
      payload: {
        type: projectile.microBullet,
        speed: 100,
        acceleration: 1
      },
      rotation: {
        angle: 720,
        frequency: 15
      },
      firing: {
        angle: 0,
        count: 1,
        loadTime: 0.05,
        cooldownTime: .01,
        rapidReload: true,
        targetPlayer: false,
        viewTurret: false,
        // pulse: {
        //   duration: 2,
        //   delay: 1
        // }
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
    weapon: ring.jaredBeta1
  };

  ship.idleBat = {
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
      pulse: {
        duration: 0.5,
        delay: 2
      },

      waitOffScreen: 4
    },
    weapon: ring.singleTargetPlayer
  };

  ship.openingBat = {
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
      pulse: {
        duration: 0.5,
        delay: 2
      },

      waitOffScreen: 20
    },
    weapon: ring.spreadBeta2
  };

  ship.mediumDoubleTurretBat = {
    config: {
      hitValue: 5,
      radius: 30,
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

      waitOffScreen: 70,
    },
    weapon: ring.doubleStraightDownPulse
  };

  ship.easyIdleSpiralCrane = {
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
      weaponsAdvantage: 0,

      waitOffScreen: 50,
    },
    weapon: ring.slowPulseSpiral
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
      radius: 15,
      sprite: sprite.plane,
      speed: 300
    },
    weapon: ring.player
  }

} // end of objects file
