function loadTemplates() {
  /**
   * Standard projectile values are:
   *   radius: the hitbox for this Projectile
   *   hitValue: the amount of destruction (default=1)
   *   rotate: if true then image/sprite will be adjusted to the current angle
   *
   *   image: use an image directly from the Asset Manager
   *   scale: used to scale down an image only (sprites do this on their own)
   *     --OR--
   *   sprite: use to show a sprite instead of an image
   *     --OR--
   *   if no image or sprite is given then a solid circle is drawn
   *
   * A custom projectile can use the following methods to produce unique behavior.
   *   init() is called one time immediately prior to launch
   *   update() to customize the trajectory/behavior\
   *   onHit(ship) is called when struck by an opposing Ship
   *
   *   {local} values stored here are accessible in this.local and can be used
   *           to manage state for custom trajectory/behavior.
   *
   * pre-conditions:
   *   1. the projectile has a valid this.current.{ x, y, angle }
   *   2. init() has been called
   *   3. this.local is private to this instance
   * post-conditions:
   *   1. this.current.{r, angle} reflect the new polar position of the projectile.
   */

  /** This tracks the player. So only load it on an Enemy! */
  projectile.homing = {
    radius: 3,

    local: {
      isHoming: true,
      limit: 250, // minimum distance to stop tracking
    },

    update() {
      // update angle if projectile is beyond the limit
      if (this.local.isHoming) {
        const target = this.game.getPlayerLocation(this.current);
        if (target.radius < this.local.limit) {
          this.local.isHoming = false;
        }

        this.current.angle = target.angle;
      }

      // update r
      this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
      this.current.r = this.current.velocity.radial * this.current.elapsedTime;
    },
  };

  /** This tracks an enemy. */
  projectile.homingOnEnemy = {
    radius: 3,
    hitValue: 3,
    rotate: true,
    // image: AM.getAsset('./img/bullet.png'),
    // scale: .04,
    sprite: sprite.laser.bigOrange,

    local: {
      range: 400, // maximum
    },

    update() {
      const hitList = this.game.getEnemiesInRange(this.current, this.local.range);

      // sorted list; closest enemy at index 0
      if (hitList.length > 0) {
        const {
          x,
          y,
        } = hitList[0].ship.current;

        // set target angle
        const deltaX = x - this.current.x;
        const deltaY = y - this.current.y;
        this.current.angle = Math.atan2(deltaY, deltaX);
      }

      // update r
      this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
      this.current.r = this.current.velocity.radial * this.current.elapsedTime;
    },
  };

  /** Prototype for sine wave */
  projectile.sine = {
    radius: 3,
    image: AM.getAsset('./img/glass_ball.png'),
    scale: 1.0,

    local: {
      time: 0,
      amp: 3 * 2 * Math.PI,
    },

    update() {
      this.local.time += this.current.elapsedTime;
      this.current.r = this.current.velocity.radial * this.current.elapsedTime;

      const deltaAngle = Math.cos(this.local.amp * this.local.time);
      this.current.angle = this.config.baseAngle + deltaAngle;
    },
  };

  /** This tracks an enemy. */
  projectile.modifiedChainGun = {
    radius: 3,
    hitValue: 3,
    rotate: true,
    // image: AM.getAsset('./img/bullet.png'),
    // scale: .04,
    sprite: sprite.laser.bigOrange,

    local: {
      range: 200, // maximum
    },

    update() {
      const hitList = this.game.getEnemiesInRange(this.current, this.local.range);

      // sorted list; closest enemy at index 0
      if (hitList.length > 0) {
        console.log('Have enemies in the hit list');
        const {
          x,
          y,
        } = hitList[0].ship.current;

        // set target angle
        const deltaX = x - this.current.x;
        const deltaY = y - this.current.y;
        this.current.angle = Math.atan2(deltaY, deltaX);
      }

      // update r
      this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
      this.current.r = this.current.velocity.radial * this.current.elapsedTime;
    },

    onHit() {
      // this.local.count += 1;
      // this.current.velocity.radial *= 1.4;
      // stay alive
    },
  };

  /** This tracks an enemy. */
  projectile.nuke = {
    radius: 3,
    hitValue: 3,
    rotate: true,
    image: AM.getAsset('./img/rainbow_ball.png'),
    scale: 0.1,
    //sprite: sprite.laser.bigOrange,

    local: {
      range: 800, // maximum
    },

    init()  {
      this.current.angle = toRadians(270);
      this.local.target = this.current.y/2;
    },

    update() {
      if(this.local.target < this.current.y)  {
        this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
        this.current.r = this.current.velocity.radial * this.current.elapsedTime;
      } else if (this.config.radius < this.local.range) {
        this.config.radius += 5;
        this.scale += 0.035;
      } else {
        this.removeFromWorld = true;
      }

      // update r
      
    },

    onHit() {
      // this.local.count += 1;
      // this.current.velocity.radial *= 1.4;
      // stay alive
    },
  };


  /** This tracks an enemy. */
  projectile.chainGun = {
    radius: 3,
    hitValue: 3,
    rotate: true,
    // image: AM.getAsset('./img/bullet.png'),
    // scale: .04,
    sprite: sprite.laser.bigOrange,

    local: {
      count: 0,
      range: 400, // maximum
    },

    onHit() {
      this.local.count += 1;
      this.current.velocity.radial *= 1.4;
      // stay alive
    },

    update() {
      // only track after the first hit
      if (this.local.count > 0) {
        const hitList = this.game.getEnemiesInRange(this.current, this.local.range);

        // sorted list; closest enemy at index 0
        if (hitList.length > 0) {
          const {
            x,
            y,
          } = hitList[0].ship.current;

          // set target angle
          const deltaX = x - this.current.x;
          const deltaY = y - this.current.y;
          this.current.angle = Math.atan2(deltaY, deltaX);
        }
      }

      // update r
      this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
      this.current.r = this.current.velocity.radial * this.current.elapsedTime;
    },
  };

  /** *** PROJECTILES: SHAPES AND SPRITES **** */
  projectile.circleBullet = {
    radius: 6,
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.microBullet = {
    radius: 3,

    // use init() for any pre-processing immediately prior to launch.
    // for player bullets we can easily say "only travel up"
    init() {
      this.current.angle = toRadians(270);
    },
  };

  projectile.multiGun = {
    radius: 3,

    // use init() for any pre-processing immediately prior to launch.
    // for player bullets we can easily say "only travel up"
    init() {
      this.current.angle = toRadians(270);
    },
    image: AM.getAsset('./img/rapid-bullet-horizontal.png'),
    scale: 0.1,
  };

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
  };

  projectile.yellowLaser = {
    radius: 10,
    rotate: false,
    sprite: sprite.laser.yellow,
  };

  projectile.orangeLaser = {
    radius: 10,
    rotate: false,
    sprite: sprite.laser.orange,
  };

  projectile.bigGreenLaser = {
    radius: 10,
    rotate: false,
    sprite: sprite.laser.bigGreen,
  };

  projectile.miniCrane = {
    radius: 15,
    rotate: true,
    sprite: sprite.miniCrane.default,
  };

  projectile.testLaser = {
    radius: 5,
    rotate: true,
    sprite: sprite.testLaser.default,
  };


  /** *** PATTERNS ***
   *  Trying to spice-up bullet patterns? Make a pattern to load into a ring.
   *  Instead of the usual fireAll() behavior, a pattern tells the Ring to
   *  only fire specific turrets on each round. Use spread and cooldownTime to
   *  control the width and line-spacing. Other settings for ring remain intact.
   *  overrides:count,pulse,rapidReload //don't use rotation//
   */
  pattern.simple = {
    sequence: [
      [1, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
    ],
    delay: 2, // seconds between rounds
  };

  pattern.j = {
    sequence: [
      [1, 1, 1, 1],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    delay: 2,
  };

  /** *** RING: FIRING PATTERNS **** */
  ring.patternTest = {
    payload: {
      type: projectile.glassBall,
      speed: 350,
    },
    firing: {
      pattern: pattern.simple,
      radius: 20,
      angle: 90,
      spread: 35,
      loadTime: 0.2,
      cooldownTime: 0.05,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.linearTest = {
    payload: {
      type: projectile.homing,
      speed: 100,
    },
    firing: {
      radius: 5,
      count: 1,
      angle: 90,
      loadTime: 0,
      cooldownTime: 0.25,
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
      },
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
      },
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

  ring.fourFixedSpeedCircle = {
    payload: {
      type: projectile.circleBullet,
      speed: 100,
      acceleration: 1,
    },
    rotation: {
      speed: 0.05,
    },
    firing: {
      radius: 80,
      angle: 90,
      count: 4,
      loadTime: 0.005,
      cooldownTime: 0.5,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
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
      speed: 100,
      acceleration: 1,
    },
    firing: {
      spread: 330,
      radius: 100,
      angle: 270,
      count: 50,
      loadTime: 0.1,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.singleDown = {
    payload: {
      type: projectile.circleBullet,
      speed: 100,
      acceleration: 1,
    },
    firing: {
      angle: 90,
      count: 1,
      loadTime: 0.05,
      cooldownTime: 0.5,
      rapidReload: true,
      targetPlayer: true,
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

  ring.jaredTest3 = {
    payload: {
      type: projectile.sine,
      velocity: {
        radial: 300,
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
      cooldownTime: 0.1,
      rapidReload: true,
      targetPlayer: false,
      targetLeadShot: false,
      viewTurret: true,
      pulse: {
        duration: 1,
        delay: 3,
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
      type: projectile.testLaser,
      velocity: {
        radial: 500,
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
      radius: 1,
      angle: 90,
      spread: 0,
      count: 1,
      loadTime: 0.005,
      cooldownTime: 0.001,
      rapidReload: true,
      targetPlayer: false,
      targetLeadShot: true,
      viewTurret: false,
      pulse: {
        duration: 0.1,
        delay: 1,
      },
    },
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
        delay: 1,
      },
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
        delay: 1,
      },
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
        delay: 1,
      },
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
        delay: 1,
      },
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
        delay: 1,
      },
    },
  };

  ring.uniLinearSpiralRight = {
    payload: {
      type: projectile.microBullet,
      speed: 80,
      acceleration: 0,
    },
    rotation: {
      speed: 0.4,
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
        delay: 1,
      },
    },
  };

  ring.uniLinearSpiralLeft = {
    payload: {
      type: projectile.microBullet,
      speed: 80,
      acceleration: 0,
    },
    rotation: {
      speed: -0.4,
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
        delay: 1,
      },
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
      },

    },
    rotation: {
      speed: 0.4,
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
        delay: 1,
      },
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
      },

    },
    rotation: {
      speed: 0.4,
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
        delay: 1,
      },
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
      },

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
        delay: 1,
      },
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
      },

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
        delay: 1,
      },
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
      },

    },
    rotation: {
      speed: 0.2,
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
        delay: 1,
      },
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
      },

    },
    rotation: {
      speed: 0.2,
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
        delay: 1,
      },
    },
  };

  /** *** ENEMY SHIPS **** */
  ship.demoCrane = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane.default,
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
    path: [
      [180, 100, 5],
      [0, 100, 5],
      [180, 100, 5],
      [0, 100, 5],
      [90, 100, 60],
    ],
    weapon: ring.spiralAlpha4,
  };

  ship.idleCrane = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane.default,
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


  // Default trimmed down versions of enemies for the scene manager to use as
  // a starting point.
  //
  // Mostly useful for radius and sprites.
  ship.bat = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.bat.default,
    },
    weapon: ring.singleDown,
  };

  ship.crane = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane.default,
    },
    weapon: ring.fourFixedSpeedCircle,
  };

  ship.owl = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.owl.default,
    },
    weapon: ring.jaredAlpha1,
  };

  ship.dove = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.dove.default,
    },
    weapon: ring.trackingTest1,
  };

  ship.swallow = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.swallow.default,
    },
    weapon: ring.gap1,
  };

  ship.dodgeOwl = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 70,
      sprite: sprite.owl.default,
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
    weapon: ring.singleTargetPlayer,
  };

  ship.easyBat = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.bat.default,
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
    weapon: ring.singleDown,
  };

  ship.openingBat = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.bat.default,
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
      radius: 30,
      sprite: sprite.bat.default,
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
      radius: 50,
      sprite: sprite.crane.default,
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
      radius: 70,
      sprite: sprite.owl.default,
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
      radius: 70,
      sprite: sprite.dove.default,
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
      health: 1,
      hitValue: 5,
      radius: 60,
      sprite: sprite.dove.default,
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
    // weapon: [
    //   {
    //     ring: ring.jaredTest3,
    //     //offset: {x:-30,y:23},
    //   },

    //   // {
    //   //   ring: ring.uniSpiralFourWay180,
    //   //   //offset: {x:30,y:23},
    //   // },
    // ],
  };

  /** *** BACKGROUNDS *** */
  background.paper = {
    layers: [
      {
        layer: AM.getAsset('./img/clouds.png'),
        offset: -2304,
        verticalPixels: 2304,
        parallaxMult: 1.25,
      },
      {
        layer: AM.getAsset('./img/clouds.png'),
        offset: -4608,
        verticalPixels: 2304,
        parallaxMult: 1.25,
      },
      {
        layer: AM.getAsset('./img/notebook.png'),
        offset: 0,
        verticalPixels: 768,
      },
      {
        layer: AM.getAsset('./img/notebook.png'),
        offset: -768,
        verticalPixels: 768,
      },
    ],
  };

  background.beach = {
    layers: [
      {
        layer: AM.getAsset('./img/verticalscrollingbeach.png'),
        offset: -1766 + 768,
        verticalPixels: 1766,
      },
      {
        layer: AM.getAsset('./img/verticalscrollingbeach.png'),
        offset: -1766 * 2 + 768,
        verticalPixels: 1766,
      },
    ],
  };

  background.pattern = {
    layers: [
      {
        layer: AM.getAsset('./img/seamless_pattern.png'),
        offset: -1023 + 768,
        verticalPixels: 1023,
      },
      {
        layer: AM.getAsset('./img/seamless_pattern.png'),
        offset: -1023 * 2 + 768,
        verticalPixels: 1023,
      },
    ],
  };

  ship.testCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.dove.default,
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
  // I wonder what this does
  path.doNothing = [];

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

  // Advanced straight to bottom
  path.straightDown = [
    [90, 250, 30],
  ];

  path.backAndForth = [
    [0, 25, 5],
    [180, 25, 5],
  ];

  /** *** SCENES **** */
  scene.easyPaper = {
    background: background.pattern,
    waves: [
      // wave 1
      {
        numOfEnemies: 2,
        ships: new Array(2).fill(ship.bat),
        paths: [
          path.strafeRight,
          path.strafeLeft,
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.crane),
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: [ship.bat, ship.dove, ship.bat],
        paths: [
          // first bat cornerleft
          path.cornerLeft,
          // dove do nothing
          path.doNothing,
          // second bat cornerright
          path.cornerRight,
        ],
        shipManifestOverride: [
          // change first bat to tracking test
          {
            weapon: ring.trackingTest1,
          },
          // don't do anything to dove
          {},
          // change second bat to tracking test
          {
            weapon: ring.trackingTest1,
          },
        ],
        initialXPoints: [ // omit to evenly space enemies.
          400, 500, 600,
        ],
        waitUntilEnemiesGone: true,
      },
      {
        warpSpeed: true,
        message: {
          type: 'warning',
          text: ['Waves complete!', 'Get Ready...'],
          duration: 6,
        },
      },
      // BOSS SWALLOW!!
      {
        numOfEnemies: 1,
        ships: [ship.swallow],
        paths: [
          path.doNothing,
        ],
        shipManifestOverride: [{
          config: {
            sprite: sprite.swallow.boss,
            health: 100,
            snapLineSpeed: 50,
            hitValue: 2000,
            snapLine: 250,
            radius: 200,
          },
          weapon: {
            rotation: {
              angle: 20,
              frequency: 6,
            },
            firing: {
              count: 100,
              radius: 250,
              loadTime: 0.005,
            },
          },
        }],
        waitUntilEnemiesGone: true,
      },
    ],
  };


  /** *** ALL PLAYER THINGS **** */
  projectile.player1 = {
    radius: 8,

    init() {
      this.current.angle = toRadians(270);
    },

  };

  // Default player ring
  ring.player = {
    payload: {
      type: projectile.nuke,
      speed: 500,
      rotate: true,
    },
    firing: {
      angle: 270,
      radius: 30,
      spread: 0,
      count: 1,
      loadTime: 0.01,
      cooldownTime: 0.25,
      rapidReload: true,
      viewTurret: false,
    },
  };

  ring.multiGun = {
    payload: {
      type: projectile.multiGun,
      speed: 500,
      rotate: true,
    },
    firing: {
      angle: 270,
      radius: 30,
      spread: 0,
      count: 1,
      loadTime: 0.01,
      cooldownTime: 0.25,
      rapidReload: true,
      viewTurret: false,
    },
  };

  ring.enemyHoming = {
    payload: {
      type: projectile.homingOnEnemy,
      speed: 500,
      rotate: true,
    },
    firing: {
      angle: 270,
      radius: 0,
      count: 1,
      loadTime: 0,
      cooldownTime: 5,
      rapidReload: false,
      viewTurret: true,
    },
  };

  ring.chainGun = {
    payload: {
      type: projectile.modifiedChainGun,
      speed: 500,
      rotate: true,
    },
    firing: {
      angle: 270,
      radius: 0,
      count: 1,
      loadTime: 0,
      cooldownTime: 5,
      rapidReload: false,
      viewTurret: true,
    },
  };

  ship.player = {
    config: {
      radius: 15,
      sprite: sprite.plane.purple,
      speed: 300,
      origin: {
        x: 1024 / 2, // omit x to get random position
        y: 700,
      },
    },
    weapon: [{
      ring: ring.player,
    },
      // {
      //   ring: ring.enemyHoming,
      //   offset: { x: -12, y: 44}
      // }
    ],
  };
  /** End of PLAYER configuration */


  /** Jared Test Scene --IN PROGRESS-- */
  ring.jaredOldTest2 = {
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
      // speed: .1,
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
      },
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
    },
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
      },
    },
    rotation: {
      angle: 10,
      frequency: 1,
      // speed: .1,
    },
    firing: {
      radius: 0,
      angle: 90,
      spread: 2,
      count: 4,
      loadTime: 0,
      cooldownTime: 0.05,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      pulse: {
        duration: 2.0,
        delay: 3.0,
      },
    },
  };

  ship.jaredTestDove = {
    config: {
      health: 1,
      hitValue: 5,
      radius: 60,
      sprite: sprite.dove.default,
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
    // weapon: [
    //   {
    //     ring: ring.jaredTest3,
    //     //offset: {x:-30,y:23},
    //   },

    //   // {
    //   //   ring: ring.uniSpiralFourWay180,
    //   //   //offset: {x:30,y:23},
    //   // },
    // ],
  };

  ship.jaredTestCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.dove.default,
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

  ship.jaredTestDove2 = {
    config: {
      health: 3,
      hitValue: 3,
      radius: 70,
      sprite: sprite.dove.default,
      snapLine: 40,
      snapLineSpeed: 250,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    path: [
      [90, 175, 30],
    ],
    weapon: [{
      ring: ring.gammaOne,
      offset: {
        x: -30,
        y: 20,
      },
    },
    {
      ring: ring.gammaOne,
      offset: {
        x: 30,
        y: 20,
      },
    },
    ],
  };

  ship.jaredTestCrane2 = {
    config: {
      health: 12,
      hitValue: 3,
      radius: 70,
      sprite: sprite.crane.default,
      snapLine: 200,
      snapLineSpeed: 250,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: [{
      ring: ring.gammaTwo,
    }],
  };

  ship.jaredTestPlane = {
    config: {
      radius: 15,
      sprite: sprite.plane.lightBlue,
      speed: 300,
      origin: {
        x: 1024 / 2, // omit x to get random position
        y: 700,
      },
    },
    weapon: [
      // {
      //   ring: ring.player,
      // },
      {
        ring: ring.enemyHoming,
        offset: {
          x: -12,
          y: 30,
        },
      },
    ],
  };

  // ship.testDove.config.origin = {x: 200, y: -50};
  // this.addEntity(new Ship(this, ship.testDove));
  // ship.testDove.config.origin = {x: 500, y: -50};
  // this.addEntity(new Ship(this, ship.testDove));
  // ship.testDove.config.origin = {x: 800, y: -50};
  // ship.testDove.config.snapLine = 380
  // this.addEntity(new Ship(this, ship.testDove));

  scene.jaredTestScene = {
    player: ship.jaredTestPlane,

    waves: [{
      numOfEnemies: 3,
      ships: new Array(3).fill(ship.jaredTestDove),
      paths: new Array(10).fill(path.straightDown),
      initialXPoints: [ // omit to evenly space enemies.
        600, 400, 700, 250, 400, 850, 450, 380, 770, 650,
      ],
      shipManifestOverride: [{
        config: {
          waitOffScreen: 0,
        },
      },
      {
        config: {
          waitOffScreen: 2,
        },
      },
      {
        config: {
          waitOffScreen: 3,
        },
      },
      {
        config: {
          waitOffScreen: 5,
        },
      },
      {
        config: {
          waitOffScreen: 8,
        },
      },
      {
        config: {
          waitOffScreen: 9,
        },
      },
      {
        config: {
          waitOffScreen: 11,
        },
      },
      {
        config: {
          waitOffScreen: 15,
        },
      },
      {
        config: {
          waitOffScreen: 18,
        },
      },
      {
        config: {
          waitOffScreen: 19,
        },
      },
      ],
      waitUntilEnemiesGone: true,
    },
    {
      warpSpeed: true,
      message: {
        type: 'warning',
        text: ['Jared Test Scene', '--CUT--'],
        duration: 6,
      },
    },
    ],
  };

  /** JaredLevel: Templates for a Level --IN PLACE ASSETS-- */
  ring.gammaOne = {
    payload: {
      type: projectile.glassBall,
      speed: 500,
    },
    firing: {
      radius: 5,
      count: 1,
      angle: 90,
      loadTime: 0,
      cooldownTime: 0.15,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      pulse: {
        duration: 0.5,
        delay: 1.5,
      },
    },
  };

  ring.gammaTwo = {
    payload: {
      type: projectile.glassBall,
      speed: 500,
    },
    firing: {
      radius: 5,
      count: 6,
      angle: 90,
      spread: 80,
      loadTime: 0,
      cooldownTime: 0.005,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 1.0,
        delay: 2.5,
      },
    },
  };

  ship.gammaDove = {
    config: {
      health: 3,
      hitValue: 3,
      radius: 70,
      sprite: sprite.dove.default,
      snapLine: 40,
      snapLineSpeed: 250,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    path: [
      [90, 175, 30],
    ],
    weapon: [{
      ring: ring.gammaOne,
      offset: {
        x: -30,
        y: 20,
      },
    },
    {
      ring: ring.gammaOne,
      offset: {
        x: 30,
        y: 20,
      },
    },
    ],
  };

  ship.gammaCrane = {
    config: {
      health: 12,
      hitValue: 3,
      radius: 70,
      sprite: sprite.crane.default,
      snapLine: 200,
      snapLineSpeed: 250,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: [{
      ring: ring.gammaTwo,
    }],
  };

  scene.gamma = {
    waves: [{
      numOfEnemies: 10,
      ships: new Array(10).fill(ship.jaredTestDove),
      paths: new Array(10).fill(path.straightDown),
      initialXPoints: [ // omit to evenly space enemies.
        600, 400, 700, 250, 400, 850, 450, 380, 770, 650,
      ],
      shipManifestOverride: [{
        config: {
          waitOffScreen: 0,
        },
      },
      {
        config: {
          waitOffScreen: 2,
        },
      },
      {
        config: {
          waitOffScreen: 3,
        },
      },
      {
        config: {
          waitOffScreen: 5,
        },
      },
      {
        config: {
          waitOffScreen: 8,
        },
      },
      {
        config: {
          waitOffScreen: 9,
        },
      },
      {
        config: {
          waitOffScreen: 11,
        },
      },
      {
        config: {
          waitOffScreen: 15,
        },
      },
      {
        config: {
          waitOffScreen: 18,
        },
      },
      {
        config: {
          waitOffScreen: 19,
        },
      },
      ],
      waitUntilEnemiesGone: true,
    },
    {
      numOfEnemies: 6,
      ships: new Array(10).fill(ship.jaredTestCrane),
      paths: new Array(10).fill(path.backAndForth),
      initialXPoints: [ // omit to evenly space enemies.
        100, 300, 600, 120, 700, 550,
      ],
      shipManifestOverride: [{
        config: {
          waitOffScreen: 5,
        },
      },
      {
        config: {
          waitOffScreen: 9,
        },
      },
      {
        config: {
          waitOffScreen: 11,
        },
      },
      {
        config: {
          waitOffScreen: 13,
        },
      },
      {
        config: {
          waitOffScreen: 17,
        },
      },
      {
        config: {
          waitOffScreen: 20,
        },
      },
      ],
      waitUntilEnemiesGone: true,
    },
    {
      warpSpeed: true,
      message: {
        type: 'warning',
        text: ['First Wave Complete', '--CUT--'],
        duration: 6,
      },
    },
      // BOSS SWALLOW!!
      // {
      //   numOfEnemies: 1,
      //   ships: [ship.swallow],
      //   paths: [
      //     path.doNothing
      //   ],
      //   shipManifestOverride: [
      //     {
      //       config: {
      //         sprite: sprite.swallow.boss,
      //         health: 100,
      //         snapLineSpeed: 50,
      //         hitValue: 2000,
      //         snapLine: 250,
      //         radius: 200,
      //       },
      //       weapon: {
      //         rotation: {
      //           angle: 20,
      //           frequency: 6
      //         },
      //         firing: {
      //           count: 100,
      //           radius: 250,
      //           loadTime: 0.005,
      //         }
      //       }
      //     },
      //   ],
      //   waitUntilEnemiesGone: true,
      // },
    ],
  };
  /** end of jared level */
} // end of objects.js
