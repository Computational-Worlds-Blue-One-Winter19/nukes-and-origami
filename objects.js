function loadTemplates() {
  /**
   * A custom projectile overrides the update method. This is called after the projectile has spawned.
   * Access current.x, current.y, current.velocity, current.acceleration, this.game.clockTick
   * to update x,y.
   */
  projectile.homing = {
    radius: 3,
    isHoming: true,

    draw(ctx, x, y) {
      ctx.beginPath();
      ctx.arc(x, y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },

    update() {
      const previous = {
        x: this.current.x,
        y: this.current.y,
      };

      if (this.config.isHoming) {
        const target = this.owner.weapon[0].ring.getPlayerLocation(previous);
        if (target.radius < 250) {
          this.config.isHoming = false;
        }

        this.current.angle = target.angle;
      }

      const deltaRadius = this.current.velocity.radial * this.game.clockTick;
      const newPoint = getXandY(previous, { angle: this.current.angle, radius: deltaRadius });
      this.current.x = newPoint.x;
      this.current.y = newPoint.y;
    },
  };

  projectile.sine = {
    radius: 3,
    
    draw(ctx, x, y) {
      ctx.beginPath();
      ctx.arc(x, y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },

    update() {
      const previous = {
        x: this.current.x,
        y: this.current.y,
      };

      const deltaAngle = this.game.timer.getWave(180, 1) * this.game.clockTick;
      this.current.angle = this.config.baseAngle + deltaAngle;
      const deltaRadius = this.current.velocity.radial * this.game.clockTick;
      const newPoint = getXandY(previous, { angle: this.current.angle, radius: deltaRadius });
      this.current.x = newPoint.x;
      this.current.y = newPoint.y;
    },
  };

  /** *** PROJECTILES: SHAPES AND SPRITES **** */
  projectile.paperBall = {
    radius: 15,
    rotate: false,
    image: AM.getAsset('./img/paper_ball.png'),
    scale: 0.1,
  };

  projectile.rainbowBall = {
    radius: 15,
    rotate: false,
    image: AM.getAsset('./img/rainbow_ball.png'),
    scale: 0.1,
  };

  projectile.glassBall = {
    radius: 10,
    rotate: false,
    image: AM.getAsset('./img/glass_ball.png'),
    scale: 1.0,
  }

  projectile.miniCrane = {
    radius: 15,
    rotate: true,
    sprite: sprite.miniCrane,
  };

  projectile.testLaser = {
    radius: 5,
    rotate: true,
    sprite: sprite.testLaser,
  }

  projectile.circleBullet = {
    radius: 6,
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },
  };

  projectile.microBullet = {
    radius: 3,
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },
  };


  /** *** RING: FIRING PATTERNS **** */
  ring.linearTest = {
    payload: {
      type: projectile.microBullet,
      speed: 100,
    },
    firing: {
      radius: 5,
      count: 1,
      angle: 90,
      loadTime: 0,
      cooldownTime: 0.005,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.angularTest = {
    payload: {
      type: projectile.microBullet,
      speed: 25,
      acceleration: {
        radial: 100,
        angular: 0,
      },
    },
    firing: {
      radius: 5,
      count: 1,
      angle: 90,
      loadTime: 0.01,
      cooldownTime: 1,
      rapidReload: false,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.spiralAlpha1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
    },
    rotation: {
      angle: 720,
      frequency: 4,
    },
    firing: {
      count: 3,
      loadTime: 0.01,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      pulse: {
        duration: 0.4,
        delay: 3.0,
      }
    },
  };
  
  ring.spiralAlphaReverse = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
    },
    rotation: {
      angle: -720,
      frequency: 4,
    },
    firing: {
      count: 3,
      loadTime: 0.01,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      pulse: {
        duration: 0.4,
        delay: 2.0,
      }
    },
  };

  ring.spiralAlpha2 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
    },
    rotation: {
      angle: 45,
      frequency: 4,
    },
    firing: {
      angle: 90,
      count: 2,
      spread: 90,
      loadTime: 0.05,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: 0.5,
      },
    },
  };

  ring.spiralAlpha3 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
    },
    rotation: {
      angle: 180,
      frequency: 1,
    },
    firing: {
      count: 1,
      loadTime: 0.05,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
    },
  };

  ring.spiralAlpha4 = {
    payload: {
      type: projectile.miniCrane,
      speed: 300,
      acceleration: 1,
    },
    rotation: {
      angle: 180,
      frequency: 20,
    },
    firing: {
      angle: 90,
      count: 10,
      loadTime: 0.05,
      cooldownTime: 0.45,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
    },
  };

  ring.fixedSpeed = {
    payload: {
      type: projectile.microBullet,
      speed: 350,
      acceleration: 1,
    },
    rotation: {
      speed: 0.15,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 4,
      loadTime: 0.005,
      cooldownTime: 0.05,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      pulse: {
        duration: 3,
        delay: 0.0,
      },
    },
  };

  ring.fixedSpeedReverse = {
    payload: {
      type: projectile.microBullet,
      speed: 350,
      acceleration: 1,
    },
    rotation: {
      speed: -0.1,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 4,
      loadTime: 0.005,
      cooldownTime: 0.05,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      pulse: {
        duration: 3,
        delay: 0.0,
      },
    },
  };

  ring.spreadBeta1 = {
    payload: {
      type: projectile.paperBall,
      speed: 250,
      acceleration: 1,
    },
    firing: {
      angle: 90,
      count: 1,
      loadTime: 0.005,
      cooldownTime: 0.1,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: false,
      pulse: {
        duration: 4,
        delay: 0.5,
      },
    },
  };

  ring.spreadBeta2 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 0,
    },
    firing: {
      spread: 15,
      radius: 15,
      angle: 90,
      count: 5,
      loadTime: 0.005,
      cooldownTime: 0.09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1,
      },
    },
  };

  ring.spreadBeta3 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1,
    },
    firing: {
      spread: 180,
      radius: 15,
      angle: 90,
      count: 2,
      loadTime: 0.005,
      cooldownTime: 0.09,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: 0.5,
      },
    },
  };

  ring.spreadBeta4 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1,
    },
    firing: {
      spread: 100,
      radius: 15,
      angle: 90,
      count: 5,
      loadTime: 0.005,
      cooldownTime: 0.09,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: 0.5,
      },
    },
  };

  ring.gap1 = {
    payload: {
      type: projectile.miniCrane,
      speed: 250,
      acceleration: 1,
    },
    firing: {
      spread: 340,
      radius: 100,
      angle: 270,
      count: 70,
      loadTime: 0.005,
      cooldownTime: 0.09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: 2,
      },
    },
  };

  ring.singleTargetPlayer = {
    payload: {
      type: projectile.circleBullet,
      speed: 100,
      acceleration: 1,
    },
    firing: {
      angle: 90,
      count: 1,
      loadTime: 0.001,
      cooldownTime: 2,
      rapidReload: true,
      targetPlayer: true,
      pulse: {
        duration: 0.5,
        delay: 0.5,
      },
    },
  };

  ring.doubleStraightDownPulse = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1,
    },
    firing: {
      spread: 100,
      radius: 15,
      angle: 90,
      count: 5,
      loadTime: 0.005,
      cooldownTime: 0.09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1,
      },
    },
  };

  ring.jaredAlpha1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1,
    },
    rotation: {
      angle: 45,
      frequency: 4,
    },
    firing: {
      angle: 90,
      count: 2,
      spread: 90,
      loadTime: 0.005,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: 0.5,
      },
    },
  };

  ring.jaredTest1 = {
    payload: {
      type: projectile.homing,
      velocity: {
        radial: 400,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      },
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 80,
      angle: 90,
      spread: 20,
      count: 4,
      loadTime: 0.05,
      cooldownTime: 0.02,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 1,
        delay: 3,
      },
    },
  };

  ring.jaredTest2 = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 450,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      },
    },
    rotation: {
      angle: 10,
      frequency: 2.0,
      //speed: .1,
    },
    firing: {
      radius: 1,
      angle: 90,
      spread: 2,
      count: 4,
      loadTime: 0.005,
      cooldownTime: 0.05,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 4.5,
        delay: 1.5,
      },
    },
  };

  ring.jaredBeta1 = {
    payload: {
      type: projectile.microBullet,
      speed: 250,
      acceleration: 1,
    },
    rotation: {
      speed: 1,
    },
    firing: {
      radius: 80,
      angle: 90,
      count: 1,
      loadTime: 0.005,
      cooldownTime: 0.09,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 3,
        delay: 0.5,
      },
    },
  };

  ring.trackingTest1 = {
    payload: {
      type: projectile.homing,
      velocity: {
        radial: 500,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      spread: 0,
      count: 1,
      loadTime: 0.005,
      cooldownTime: 0.001,
      rapidReload: true,
      targetLeadShot: false,
      viewTurret: true,
      pulse: {
        duration: 0.4,
        delay: 0.25,
      },
    }
  };

  ring.jaredStinger = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 800,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      spread: 0,
      count: 1,
      loadTime: 0.005,
      cooldownTime: 0.001,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: false,
      pulse: {
        duration: 0.4,
        delay: 0.2,
      },
    }
  };

  ring.jaredWavy1 = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 350,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }
    },
    rotation: {
      angle: 10,
      frequency: 1,
      //speed: .1,
    },
    firing: {
      radius: 1,
      angle: 90,
      spread: 2,
      count: 4,
      loadTime: 0.005,
      cooldownTime: 0.005,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      pulse: {
        duration: 2.0,
        delay: 3.0,
      },
    }
  };


  ring.slowPulseSpiral = {
    payload: {
      type: projectile.microBullet,
      speed: 100,
      acceleration: 1,
    },
    rotation: {
      angle: 720,
      frequency: 15,
    },
    firing: {
      angle: 0,
      count: 1,
      loadTime: 0.05,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      // pulse: {
      //   duration: 2,
      //   delay: 1
      // }
    },
  };

  ring.slowPulseSpiral2 = {
    payload: {
      type: projectile.miniCrane,
      speed: 100,
      acceleration: 1,
    },
    rotation: {
      angle: 720,
      frequency: 15,
    },
    firing: {
      angle: 0,
      count: 1,
      loadTime: 0.05,
      cooldownTime: 0.03,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      // pulse: {
      //   duration: 2,
      //   delay: 1
      // }
    },
  };

  /** 
   *  Uni Bullet Hell patterns
   *  https://www.youtube.com/watch?v=xbQ9e0zYuj4
   */
  ring.uniLinear = {
    payload: {
      type: projectile.microBullet,
      speed: 180,
      acceleration: 0,
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 1,
      loadTime: 0,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniLinearLockOn = {
    payload: {
      type: projectile.microBullet,
      speed: 180,
      acceleration: 0,
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 1,
      loadTime: 0,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      targetLeadShot: true,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniLinearAccel = {
    payload: {
      type: projectile.microBullet,
      speed: 180,
      acceleration: 200,
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 1,
      loadTime: 0,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniLinearDecel = {
    payload: {
      type: projectile.microBullet,
      speed: 500,
      acceleration: -200,
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 1,
      loadTime: 0,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniLinearAccelAiming = {
    payload: {
      type: projectile.microBullet,
      speed: 180,
      acceleration: 200,
    },
    rotation: {
      angle: 0,
      frequency: 0,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 1,
      loadTime: 0,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniLinearSpiralRight = {
    payload: {
      type: projectile.microBullet,
      speed: 80,
      acceleration: 0,
    },
    rotation: {
      speed: .4,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 3,
      loadTime: 0,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 4,
        delay: 1
      }
    },
  };

  ring.uniLinearSpiralLeft = {
    payload: {
      type: projectile.microBullet,
      speed: 80,
      acceleration: 0,
    },
    rotation: {
      speed: -.4,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 3,
      loadTime: 0,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 4,
        delay: 1
      }
    },
  };

  ring.uniLinearSpiralRightTurn = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 80,
        angular: 20,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }

    },
    rotation: {
      speed: .4,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 3,
      loadTime: 0,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 4,
        delay: 1
      }
    },
  };

  ring.uniLinearSpiralRightTurnAccel = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 80,
        angular: 20,
      },
      acceleration: {
        radial: 200,
        angular: 0,
      }

    },
    rotation: {
      speed: .4,
    },
    firing: {
      radius: 1,
      angle: 90,
      count: 3,
      loadTime: 0,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 4,
        delay: 1
      }
    },
  };

  ring.uniFiveWay = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 400,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }

    },
    rotation: {
      speed: 0,
    },
    firing: {
      radius: 5,
      angle: 90,
      spread: 20,
      count: 5,
      loadTime: 0,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniTwentyWayTurn = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 400,
        angular: 50,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }

    },
    rotation: {
      speed: 0,
    },
    firing: {
      radius: 5,
      angle: 0,
      count: 20,
      loadTime: 0.001,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniSpiralFourWay = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 400,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }

    },
    rotation: {
      speed: .2,
    },
    firing: {
      radius: 5,
      angle: 0,
      count: 4,
      spread: 40,
      loadTime: 0.001,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  ring.uniSpiralFourWay180 = {
    payload: {
      type: projectile.microBullet,
      velocity: {
        radial: 400,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      }

    },
    rotation: {
      speed: .2,
    },
    firing: {
      radius: 5,
      angle: 180,
      count: 4,
      spread: 40,
      loadTime: 0.001,
      cooldownTime: 0.01,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 2,
        delay: 1
      }
    },
  };

  /** *** ENEMY SHIPS **** */
  ship.demoCrane = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new Shield(),
      radius: 50,
      sprite: sprite.crane,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    path: [[180, 100, 5], [0, 100, 5], [180, 100, 5], [0, 100, 5], [90, 100, 60]],
    weapon: ring.spiralAlpha4,
  };

  ship.idleCrane = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new InvertedControls(),
      radius: 50,
      sprite: sprite.crane,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.angularTest,
  };


  // Default versions of enemies for the scene manager to use as a starting
  // point.
  //
  // Mostly useful for radius and sprites.
  ship.bat = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new InvertedControls(100),
      radius: 50,
      sprite: sprite.bat,
      origin: {
        // x: 400, // omit x to get random position
        // y: -45,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.crane = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane,
      snapLine: 100,
      snapLineSpeed: 200,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.easyBat = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new InvertedControls(),
      radius: 50,
      sprite: sprite.bat,
      snapLine: 100,
      snapLineSpeed: 200,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
      pulse: {
        duration: 0.5,
        delay: 2,
      },
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.openingBat = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new InvertedControls(),
      radius: 50,
      sprite: sprite.bat,
      snapLine: 100,
      snapLineSpeed: 200,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
      pulse: {
        duration: 0.5,
        delay: 2,
      },
    },
    weapon: ring.spreadBeta2,
  };

  ship.mediumDoubleTurretBat = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new ExtraLife(),
      radius: 30,
      sprite: sprite.bat,
      snapLine: 100,
      snapLineSpeed: 200,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.doubleStraightDownPulse,
  };

  ship.easyIdleSpiralCrane = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new ExtraLife(),
      radius: 50,
      sprite: sprite.crane,
      snapLine: 150,
      snapLineSpeed: 300,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.slowPulseSpiral,
  };

  ship.dodgeOwl = {
    config: {
      health: 3,
      hitValue: 5,
      powerUp: new ExtraLife(),
      radius: 70,
      sprite: sprite.owl,
      snapLine: 150,
      snapLineSpeed: 300,
      snapLineWait: 0.5,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.jaredAlpha1,
  };

  ship.denseDove = {
    config: {
      health: 15,
      hitValue: 5,
      powerUp: new ExtraLife(),
      radius: 70,
      sprite: sprite.dove,
      snapLine: 200,
      snapLineSpeed: 300,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.gap1,
  };

  ship.testDove = {
    config: {
      health: 20,
      hitValue: 5,
      radius: 70,
      sprite: sprite.dove,
      snapLine: 200,
      snapLineSpeed: 400,
      snapLineWait: 1,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: [
      {
        ring: ring.linearTest,
        //offset: {x:-30,y:23},
      },

      // {
      //   ring: ring.uniSpiralFourWay180,
      //   //offset: {x:30,y:23},
      // },
    ],
  };

  ship.testCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.dove,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.trackingTest1,
  };

  /** *** PATHS **** */
  // Slowly strafe right off screen
  path.strafeRight = [
    [0, 50, 20],
  ];

  // Slowly strafe left off screen
  path.strafeLeft = [
    [180, 50, 20],
  ];

  // Advance down, then left, then southeast
  path.cornerRight = [
    [90, 50, 2],
    [180, 50, 2],
    [45, 50, 30],
  ];

  // Advance down, then right, then southwest
  path.cornerLeft = [
    [90, 50, 2],
    [0, 50, 2],
    [135, 50, 30],
  ];

  /** *** SCENES **** */
  scene.easyPaper = {
    waves: [
      // wave 1
      {
        isWaveDiverse: false,
        ships: [ship.bat],
        numOfEnemies: 2,
        paths: [
          path.cornerLeft,
          path.cornerRight,
        ],
        initialXPoints: [
          400, 600,
        ],
      // shipsConfig: {
      //
      // }
      },
      // {
      //   isWaveDiverse: true,
      //   ships: ship.bat,
      //   initialXPoints: [
      //     400, 500, 600
      //   ],
      // }
    ],
  };

  /** *** ALL PLAYER THINGS **** */
  projectile.player1 = {
    radius: 8,
    draw(ctx) {
      ctx.strokeStyle = 'orange';
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },
  };

  /** A simple ring for the player only shoots up */
  ring.player = {
    payload: {
      type: projectile.paperBall,
      speed: 500,
    },
    firing: {
      angle: 270,
      radius: 35,
      count: 1,
      loadTime: 0.01,
      cooldownTime: 0.25, // changed from 0.25 for testing
      rapidReload: true,
      viewTurret: false,
    },
  };

  ship.player = {
    config: {
      radius: 15,
      sprite: sprite.purplePlane,
      speed: 300,
      origin: {
        x: 1024 / 2, // omit x to get random position
        y: 700,
      },
    },
    weapon: ring.player,
  };
} // end of objects file
