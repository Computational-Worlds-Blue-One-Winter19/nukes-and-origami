/* eslint-disable no-console */

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
      limit: 100, // minimum distance to stop tracking
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

  projectile.homingCrane = {
    radius: 3,
    sprite: sprite.miniCrane.default,
    rotate: true,

    local: {
      isHoming: true,
      limit: 50, // minimum distance to stop tracking
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
    scale: 1.0,
    colorFill: 'red',

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
    hitValue: 30,
    rotate: true,
    // image: AM.getAsset('./img/bullet.png'),
    // scale: .04,
    sprite: sprite.laser.bigOrange,

    local: {
      range: 600, // maximum
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

    onHit() {
      // this.local.count += 1;
      // this.current.velocity.radial *= 1.4;
      // stay alive
    },
  };

  projectile.nuke = {
    radius: 3,
    hitValue: 3,
    rotate: true,
    image: AM.getAsset('./img/rainbow_ball.png'),
    scale: 0.1,
    drawNuke: false,
    // sprite: sprite.laser.bigOrange,

    local: {
      range: 1200, // maximum
    },

    init() {
      this.current.angle = toRadians(270);
      this.local.target = this.current.y / 2;
    },

    update() {
      if (this.local.target < this.current.y) {
        this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
        this.current.r = this.current.velocity.radial * this.current.elapsedTime;
      } else if (this.config.radius < this.local.range || this.coll) {
        this.drawNuke = true;
        this.config.radius += 30;
        // this.scale += 0.035;
      } else {
        this.removeFromWorld = true;
      }

      for (const e of this.game.entities) {
        if (e instanceof Projectile && this.isCollided(e) && !e.playerShot && !e.payload.powerUp) {
          e.removeFromWorld = true;
        }
      }
    },

    draw() {
      if (!this.drawNuke) {
        this.drawImage(this.ctx, this.current.x, this.current.y);
      } else {
        this.ctx.fillStyle = '#ffe900';
        this.ctx.beginPath();
        this.ctx.arc(this.current.x, this.current.y, this.config.radius + 100, 0 * Math.PI, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.fillStyle = '#ea3209';
        this.ctx.beginPath();
        this.ctx.arc(this.current.x, this.current.y, this.config.radius + 50, 0 * Math.PI, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.fillStyle = '#d6a400';
        this.ctx.beginPath();
        this.ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
      }
    },

    onHit() {},
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
      range: 600, // maximum
    },

    onHit() {
      this.local.count += 1;
      this.current.velocity.radial *= 1.1;
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

  projectile.redCircleBullet = {
    radius: 6,
    colorFill: 'red',
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.whiteCircleBullet = {
    radius: 6,
    colorFill: 'white',
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.greenCircleBullet = {
    radius: 6,
    colorFill: 'green',
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.blueCircleBullet = {
    radius: 6,
    colorFill: 'blue',
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.yellowCircleBullet = {
    radius: 6,
    colorFill: 'yellow',
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.purple = {
    radius: 6,
    colorFill: 'purple',
    // a circle is now drawn by default if you don't include an image or sprite
  };

  projectile.microBullet = {
    radius: 3,
    // use init() for any pre-processing immediately prior to launch.
    // for player bullets we can easily say "only travel up"
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

  ring.patternTestCircleBullet = {
    payload: {
      type: projectile.circleBullet,
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

  ring.spiralAlpha4Circle = {
    payload: {
      type: projectile.circleBullet,
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
      type: projectile.glassBall,
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
      type: projectile.whiteCircleBullet,
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
      spread: 300,
      radius: 230,
      angle: 270,
      count: 100,
      loadTime: 0.005,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
    },

    rotation: {
      angle: 40,
      frequency: 10,
    },
  };

  ring.laserGapDown = {
    payload: {
      type: projectile.testLaser,
      speed: 100,
      acceleration: 1,
    },
    firing: {
      spread: 330,
      radius: 100,
      angle: 270,
      count: 100,
      loadTime: 0.01,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.laserGapLeft = {
    payload: {
      type: projectile.testLaser,
      speed: 100,
      acceleration: 1,
    },
    firing: {
      spread: 330,
      radius: 100,
      angle: 180,
      count: 100,
      loadTime: 0.01,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.laserGapRight = {
    payload: {
      type: projectile.testLaser,
      speed: 100,
      acceleration: 1,
    },
    firing: {
      spread: 330,
      radius: 100,
      angle: 0,
      count: 100,
      loadTime: 0.01,
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
      cooldownTime: 2,
      rapidReload: true,
      targetPlayer: false,
    },
  };

  ring.doubleStraightDownPulse = {
    payload: {
      type: projectile.circleBullet,
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

  ring.singleTargetPlayer = {
    payload: {
      type: projectile.circleBullet,
      speed: 100,
    },
    firing: {
      radius: 40,
      count: 1,
      angle: 90,
      loadTime: 0,
      cooldownTime: 5,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: false,
    },
  };

  ring.slowLaserTargetPlayer = {
    payload: {
      type: projectile.testLaser,
      velocity: {
        radial: 200,
        angular: 0,
      },
      acceleration: {
        radial: 0,
        angular: 0,
      },
    },
    firing: {
      radius: 40,
      count: 1,
      angle: 90,
      loadTime: 0,
      cooldownTime: 3,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: false,
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

  ring.trackingTest1CircleBullet = {
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
      cooldownTime: 0.1,
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

  ring.homingCrane = {
    payload: {
      type: projectile.homingCrane,
      speed: 100,
      acceleration: 1,
    },
    firing: {
      angle: 0,
      count: 1,
      loadTime: 0.05,
      cooldownTime: 0.5,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true,
      // pulse: {
      //   duration: 2,
      //   delay: 1
      // }
    },
  };

  pattern.die = {
    sequence: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1],
      [1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    delay: 2,
  };

  ring.dieTestRing = {
    payload: {
      type: projectile.microBullet,
      speed: 350,
    },
    firing: {
      pattern: pattern.die,
      width: 200,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.05,
      targetPlayer: false,
      viewTurret: false,
    },
  };

  ship.patternTestDove = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.dove.default,
    },
    weapon: ring.dieTestRing,
  }

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
      type: projectile.circleBullet,
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

  ship.testEagleBoss = {
    config: {
      health: 10,
      hitValue: 1000,
      radius: 100,
      sprite: sprite.eagleBoss.default,
      snapLine: 150,
      snapLineSpeed: 100,
      snapLineWait: 0,
      origin: {
        x: 500,
        y: -50,
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.spiralAlpha4,
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
    weapon: ring.singleTargetPlayer,
  };

  ship.bird = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.bird.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.crane = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.owl = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.owl.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.dove = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.dove.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.swallow = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.swallow.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.goose = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.goose.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.hummer = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.hummer.default,
    },
    weapon: ring.singleTargetPlayer,
  };


  ship.pigeon = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.eagle = {
    config: {
      health: 150,
      hitValue: 5,
      radius: 150,
      sprite: sprite.eagleBoss.default,
      slave: [{
        config: {
          health: 30,
          hitValue: 50,
          radius: 150,
          xDifference: -350, // Difference in X value from master
          yDifference: -20, // Difference in Y value from master
        },
        weapon: ring.patternTestCircleBullet,
        powerup: 'nuke',
      },
      {
        config: {
          health: 30,
          hitValue: 50,
          radius: 150,
          xDifference: 350,
          yDifference: -20,
        },
        weapon: ring.patternTestCircleBullet,
        powerup: 'rapidFire',
      },
      ],
    },
    weapon: ring.spiralAlpha4Circle,
  };

  ship.beta = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.crab = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.dolphin = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.eel = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.fish = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.frog = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.manta = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.seahorse = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  ship.turtle = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.pigeon.default,
    },
    weapon: ring.singleTargetPlayer,
  }

  // ship.eagleSlave = {
  //   config: {
  //     health: 100,
  //     hitValue: 50,
  //     radius: 50,
  //     slave: true
  //   },
  //   weapon: ring.spreadBeta2
  // }

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
      health: 10,
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
    layers: [{
      layer: AM.getAsset('./img/notebook.png'),
      offset: -768,
      verticalPixels: 768,
    },
    {
      layer: AM.getAsset('./img/notebook.png'),
      offset: -768 * 2,
      verticalPixels: 768,
    },
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
    ],
  };

  background.beach = {
    layers: [{
      layer: AM.getAsset('./img/verticalscrollingbeach.png'),
      offset: -1766,
      verticalPixels: 1766,
    },
    {
      layer: AM.getAsset('./img/verticalscrollingbeach.png'),
      offset: -1766 * 2,
      verticalPixels: 1766,
    },
    ],
  };

  background.desert = {
    layers: [{
      layer: AM.getAsset('./img/verticalscrollingdesert.png'),
      offset: -1766,
      verticalPixels: 1766,
    },
    {
      layer: AM.getAsset('./img/verticalscrollingdesert.png'),
      offset: -1766 * 2,
      verticalPixels: 1766,
    },
    ],
  };

  background.trees = {
    layers: [{
      layer: AM.getAsset('./img/verticalscrollingtrees.png'),
      offset: -1766,
      verticalPixels: 1766,
    },
    {
      layer: AM.getAsset('./img/verticalscrollingtrees.png'),
      offset: -1766 * 2,
      verticalPixels: 1766,
    },
    ],
  };

  background.cemetary = {
    layers: [{
        layer: AM.getAsset('./img/verticalscrollingcemetary.png'),
        offset: -1766,
        verticalPixels: 1766,
      },
      {
        layer: AM.getAsset('./img/verticalscrollingcemetary.png'),
        offset: -1766 * 2,
        verticalPixels: 1766,
      },
    ],
  };

  background.vegas = {
    layers: [{
        layer: AM.getAsset('./img/verticalscrollingvegascity.png'),
        offset: -1766,
        verticalPixels: 1766,
      },
      {
        layer: AM.getAsset('./img/verticalscrollingvegascity.png'),
        offset: -1766 * 2,
        verticalPixels: 1766,
      },
    ],
  }

  background.fallCity = {
    layers: [{
        layer: AM.getAsset('./img/verticalscrollingfallcity.png'),
        offset: -1507,
        verticalPixels: 1507,
      },
      {
        layer: AM.getAsset('./img/verticalscrollingfallcity.png'),
        offset: -1507 * 2,
        verticalPixels: 1507,
      },
    ],
  }

  background.pattern = {
    layers: [{
      layer: AM.getAsset('./img/seamless_pattern.png'),
      offset: -1023 + 768,
      verticalPixels: 1023,
    },
    {
      layer: AM.getAsset('./img/seamless_pattern.png'),
      offset: -1023 * 2,
      verticalPixels: 1023,
    },
    ],
  };

  background.white = {
    layers: [{
      layer: AM.getAsset('./img/white_background.jpg'),
      offset: -768,
      verticalPixels: 768,
    },
    {
      layer: AM.getAsset('./img/white_background.jpg'),
      offset: -768 * 2,
      verticalPixels: 768,
    },
    ],
  };

  ship.doubleRingTest = {
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
      ring: ring.singleTargetPlayer,
      offset: {
        x: -30,
        y: 20,
      },
    },
    {
      ring: ring.singleTargetPlayer,
      offset: {
        x: 30,
        y: 20,
      },
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

  ship.gooseHoming = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 50,
      sprite: sprite.goose.default,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: ring.homingCrane,
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

  // sawtooth pattern back and forth starting right
  path.sawtoothRightStop = [
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    // almost centered
  ];

  // sawtooth pattern back and forth starting left
  path.sawtoothLeftStop = [
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    // almost centerd
  ];

  path.rightUTurn = [
    [0, 200, 4],
    [90, 150, 0.5],
    [180, 150, 10],
  ];

  path.leftUTurn = [
    [180, 200, 4],
    [270, 150, 0.5],
    [0, 150, 10],
  ];

  path.leftSawToothUTurn = [
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],


    [90, 200, 0.25],

    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
  ];

  path.rightSawToothUTurn = [
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],
    [25, 200, 0.25],
    [335, 200, 0.25],

    [90, 200, 0.25],

    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
  ];

  path.northEast = [
    [45, 100, 50],
  ];

  path.northWest = [
    [45, 100, 50],
  ];

  path.downSlow = [
    [90, 30, 100],
  ];

  /** *** SCENES **** */
  scene.waveBank = {
    waves: [{
      numOfEnemies: 6,
      ships: new Array(6).fill(ship.gooseHoming),
      paths: new Array(6).fill(path.downSlow),
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
    // four hummingbirds fly left then come down
    {
      numOfEnemies: 4,
      ships: new Array(4).fill(ship.hummer),
      paths: new Array(4).fill(path.downSlow),
      shipManifestOverride: [{
        config: {
          initialDirection: 'west',
          snapLine: 100,
        },
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 374,
          waitOffScreen: 1,
        },
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 648,
          waitOffScreen: 2,
        },
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 922,
          waitOffScreen: 3,
        },
      },
      ],
      waitUntilEnemiesGone: true,
      initialYPoints: [
        50, 50, 50, 50,
      ],
    },

    // geese zig zag in and stop, others just enter from left and right, all shooting
    // lasers at player
    {
      numOfEnemies: 4,
      ships: [
        ship.goose,
        ship.goose,
        ship.bat,
        ship.bat,
      ],
      paths: [
        path.sawtoothLeftStop,
        path.sawtoothRightStop,
        path.doNothing,
        path.doNothing,
      ],
      shipManifestOverride: [{
        config: {
          initialDirection: 'west',
          snapLine: 924,
        },
        weapon: ring.slowLaserTargetPlayer,
      },
      {
        config: {
          initialDirection: 'east',
          snapLine: 100,
        },
        weapon: ring.slowLaserTargetPlayer,
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 824,
        },
        weapon: ring.slowLaserTargetPlayer,
      },
      {
        config: {
          initialDirection: 'east',
          snapLine: 200,
        },
        weapon: ring.slowLaserTargetPlayer,
      },
      ],
      waitUntilEnemiesGone: true,
      initialYPoints: [
        100, 100, 300, 300,
      ],
    },
    ],
  };

  scene.restartFromCheckpoint = {
    waves: [{
      choreography: [
        {
          id: 'loadBackground',
          bg: background.cemetary,
        },
        {
          id: 'wait',
          duration: 3,
        },
        {
          id: 'showMessage',
          text: ['You suck...', 'Try again!']
        },
        {
          id: 'wait',
          duration: 3,
        },
        {
          id: 'hideMessage'
        },
      ]
    }]
  }

  scene.oneWaveTest = {
    waves: [{
      choreography: [{
        id: 'accelerateToWarpspeed',
      },
      {
        id: 'loadBackground',
        bg: background.white,
      },
      {
        id: 'wait',
        duration: 0.25,
      },
      {
        id: 'showMessage',
        text: ['LEVEL 1', 'START'],
      },
      {
        id: 'wait',
        duration: 3,
      },
      {
        id: 'loadBackground',
        bg: background.desert,
      },
      {
        id: 'decelerateFromWarpSpeed',
      },
      {
        id: 'hideMessage',
      },
      ],
    },
    {
      numOfEnemies: 7,
      ships: new Array(7).fill(ship.bat),
      paths: [
        path.strafeRight,
        path.strafeLeft,
        path.strafeRight,
        path.strafeLeft,
        path.strafeRight,
        path.strafeLeft,
        path.strafeRight,
      ],
      shipManifestOverride: [{
        config: {
          initialDirection: 'east',
          snapLine: 100,
        },
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 924,
        },
      },
      {
        config: {
          initialDirection: 'east',
          snapLine: 100,
        },
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 924,
        },
      },
      {
        config: {
          initialDirection: 'east',
          snapLine: 100,
        },
      },
      {
        config: {
          initialDirection: 'west',
          snapLine: 924,
        },
      },
      {
        config: {
          initialDirection: 'east',
          snapLine: 100,
        },
      },
      ],
      waitUntilEnemiesGone: true,
    },
    ],
  };

  // scene.bossTest = {
  //   waves: [{
  //       choreography: [{
  //           id: 'accelerateToWarpspeed',
  //         },
  //         {
  //           id: 'wait',
  //           duration: 0.25,
  //         },
  //         {
  //           id: 'showMessage',
  //           type: 'warning',
  //           text: ['WARNING', 'A BOSS APPROACHES'],
  //         },
  //         {
  //           id: 'wait',
  //           duration: 3,
  //         },
  //         {
  //           id: 'decelerateFromWarpSpeed',
  //         },
  //         {
  //           id: 'hideMessage',
  //         },
  //       ],
  //     },
  //     {
  //       choreography: [{
  //           id: 'spawnEnemies'
  //         },
  //         {
  //           id: 'wait',
  //           duration: 15,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.slowLaserTargetPlayer,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.laserGapRight,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.slowLaserTargetPlayer,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.laserGapLeft,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.slowLaserTargetPlayer,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.laserGapRight,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.slowLaserTargetPlayer,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.laserGapLeft,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.slowLaserTargetPlayer,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.laserGapRight,
  //         },
  //         {
  //           id: 'wait',
  //           duration: 7,
  //         },
  //         {
  //           id: 'swapRing',
  //           enemyIndex: 0,
  //           ring: ring.slowLaserTargetPlayer,
  //         },
  //       ],
  //       numOfEnemies: 1,
  //       ships: [ship.eagle],
  //       paths: [
  //         path.doNothing,
  //       ],
  //       shipManifestOverride: [{
  //         config: {
  //           health: 500,
  //           snapLineSpeed: 50,
  //           hitValue: 2000,
  //           snapLine: 250,
  //           radius: 200,
  //         },
  //       }],
  //       waitUntilEnemiesGone: true,
  //     },
  //   ],
  // }

  scene.bossTest = {
    waves: [{
      choreography: [{
        id: 'accelerateToWarpspeed',
      },
      {
        id: 'wait',
        duration: 0.25,
      },
      {
        id: 'showMessage',
        type: 'warning',
        text: ['WARNING', 'A BOSS APPROACHES'],
      },
      {
        id: 'loadBackground',
        bg: background.paper,
      },
      {
        id: 'wait',
        duration: 3,
      },
      {
        id: 'decelerateFromWarpSpeed',
      },
      {
        id: 'hideMessage',
      },
      ],
    },
    {
      choreography: [{
        id: 'spawnEnemies',
      },
      {
        id: 'wait',
        duration: 15,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.uniFiveWay,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.uniLinearAccelAiming,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.uniLinearAccelAiming,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.doubleStraightDownPulse,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.trackingTest1CircleBullet,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.trackingTest1CircleBullet,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.spiralAlpha4Circle,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.patternTestCircleBullet,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.patternTestCircleBullet,
      },
      {
        id: 'wait',
        duration: 15,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.uniFiveWay,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.uniLinearAccelAiming,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.uniLinearAccelAiming,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.doubleStraightDownPulse,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.trackingTest1CircleBullet,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.trackingTest1CircleBullet,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.spiralAlpha4Circle,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.patternTestCircleBullet,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.patternTestCircleBullet,
      },
      {
        id: 'wait',
        duration: 15,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.uniFiveWay,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.uniLinearAccelAiming,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.uniLinearAccelAiming,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.doubleStraightDownPulse,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.trackingTest1CircleBullet,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.trackingTest1CircleBullet,
      },
      {
        id: 'wait',
        duration: 10,
      },
      {
        id: 'swapRing',
        enemyIndex: 0,
        ring: ring.spiralAlpha4Circle,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 0,
        ring: ring.patternTestCircleBullet,
      },
      {
        id: 'swapSlaveRing',
        enemyIndex: 0,
        slaveIndex: 1,
        ring: ring.patternTestCircleBullet,
      },
      ],
      numOfEnemies: 1,
      ships: [ship.eagle],
      paths: [
        path.doNothing,
      ],
      shipManifestOverride: [{
        config: {
          health: 230,
          snapLineSpeed: 50,
          hitValue: 2000,
          snapLine: 250,
          radius: 200,
        },
      }],
      waitUntilEnemiesGone: true,
    },
    ],
  };

  scene.firstScene = {
    waves: [
      // {
      //   choreography: [{
      //       id: 'accelerateToWarpspeed',
      //     },
      //     {
      //       id: 'loadBackground',
      //       bg: background.white,
      //     },
      //     {
      //       id: 'wait',
      //       duration: 0.25,
      //     },
      //     {
      //       id: 'showMessage',
      //       text: ['FIRST LEVEL', 'START'],
      //     },
      //     {
      //       id: 'wait',
      //       duration: 3,
      //     },
      //     {
      //       id: 'loadBackground',
      //       bg: background.paper,
      //     },
      //     {
      //       id: 'decelerateFromWarpSpeed',
      //     },
      //     {
      //       id: 'hideMessage',
      //     },
      //   ],
      // },
      {
        numOfEnemies: 2,
        ships: new Array(2).fill(ship.bat),
        paths: [
          path.strafeRight,
          path.strafeLeft,
        ],
        shipManifestOverride: [{
          weapon: {
            payload: {
              type: projectile.redCircleBullet,
            },
          },
        },
        {
          weapon: {
            payload: {
              type: projectile.redCircleBullet,
            },
          },
        },
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 2,
        ships: new Array(2).fill(ship.easyIdleSpiralCrane),
        paths: [
          path.doNothing,
          path.doNothing,
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.dodgeOwl),
        paths: new Array(3).fill(path.doNothing),
        initialXPoints: [
          400, 500, 600,
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 1,
        ships: [ship.denseDove],
        paths: [path.doNothing],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 1,
        ships: [ship.denseDove],
        paths: [path.doNothing],
        waitUntilEnemiesGone: true,
      },
      {
        choreography: [{
          id: 'spawnEnemies',
        }],
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
              angle: 40,
              frequency: 10,
            },
            firing: {
              count: 100,
              radius: 230,
              loadTime: 0.005,
            },
          },
        }],
        waitUntilEnemiesGone: true,
      },
    ],
  };

  scene.easyPaper = {
    waves: [
      // {
      //   choreography: [{
      //       id: 'accelerateToWarpspeed',
      //     },
      //     {
      //       id: 'loadBackground',
      //       bg: background.white,
      //     },
      //     {
      //       id: 'wait',
      //       duration: 0.25,
      //     },
      //     {
      //       id: 'showMessage',
      //       text: ['WELL DONE', 'LEVEL 2 START'],
      //     },
      //     {
      //       id: 'wait',
      //       duration: 3,
      //     },
      //     {
      //       id: 'loadBackground',
      //       bg: background.paper,
      //     },
      //     {
      //       id: 'decelerateFromWarpSpeed',
      //     },
      //     {
      //       id: 'hideMessage',
      //     },
      //   ],
      // },
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
        choreography: [{
          id: 'showMessage',
          type: 'warning',
          text: ['Waves complete!', 'Get Ready...'],
        },
        {
          id: 'accelerateToWarpspeed',
        },
        {
          id: 'wait',
          duration: 3,
        },
        {
          id: 'decelerateFromWarpSpeed',
        },
        {
          id: 'hideMessage',
        },
        ],
      },
      // BOSS SWALLOW!!
      {
        choreography: [{
          id: 'spawnEnemies',
        }],
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
              angle: 40,
              frequency: 10,
            },
            firing: {
              count: 100,
              radius: 230,
              loadTime: 0.005,
            },
          },
        }],
        waitUntilEnemiesGone: true,
      },
    ],
  };

  scene.endingScene = {
    waves: [{
      choreography: [{
        id: 'showMessage',
        text: ['Still here,', 'huh?'],
      },
      {
        id: 'wait',
        duration: 5,
      },
      {
        id: 'showMessage',
        text: ['You could do better.', 'Try again for a higher score! :)'],
      },
      {
        id: 'wait',
        duration: 5,
      },

      ],
    }],
  };

  scene.Nathan = {
    waves: [{
      numOfEnemies: 1,
      ships: [ship.eagle],
      paths: [
        path.doNothing,
      ],
      shipManifestOverride: [{
        config: {
          health: 500,
          snapLineSpeed: 50,
          hitValue: 2000,
          snapLine: 250,
          radius: 200,
        },
      }],
      waitUntilEnemiesGone: true,
    }],

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
      type: projectile.paperBall,
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

  ring.nuke = {
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

  ship.player = {
    config: {
      radius: 15,
      sprite: sprite.plane.purple,
      speed: 360,
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

  /**                                                                                       **
   * ************************** JARED TEST SCENE --IN PROGRESS-- *************************** *
   **                                                                                       * */
  ring.lineTest = {
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
      // angle: 10,
      // frequency: 1,
      // speed: .1,
    },
    firing: {
      // pattern: pattern.simple,
      radius: 32,
      angle: 90,
      width: 100,
      count: 6,
      loadTime: 0,
      cooldownTime: 0.02,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: true,
      pulse: {
        duration: 0.5,
        delay: 1.5,
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
    weapon: ring.lineTest,
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

  ring.jaredPlayerRing = {
    payload: {
      type: projectile.paperBall,
      speed: 500,
      rotate: true,
    },
    firing: {
      angle: 270,
      radius: 30,
      count: 1,
      loadTime: 0.01,
      cooldownTime: 0.25,
      rapidReload: true,
      viewTurret: false,
    },
  };

  ship.jaredTestPlane = {
    config: {
      radius: 15,
      sprite: sprite.plane.lightBlue,
      speed: 450,
      origin: {
        x: 900, // omit x to get random position
        y: 700,
      },
    },
    weapon: [{
      ring: ring.jaredPlayerRing,
    }],
  };

  scene.jaredTestScene = {
    player: ship.jaredTestPlane,
    waves: [{
      numOfEnemies: 1,
      ships: new Array(1).fill(ship.jaredTestDove),
      initialXPoints: [ // omit to evenly space enemies.
        1024 / 2,
      ],
      waitUntilEnemiesGone: true,
    },
    {
      choreography: [{
        id: 'showMessage',
        text: ['Jared Test Scene', '--CUT--'],
        duration: 6,
      }],
    }, // cut
    ],
  };

  /** GammaLevel: Assets for Jared's Minimum Deliverable --IN PLACE ASSETS-- */
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

  ring.gammaThree = {
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

  pattern.gammaPattern = {
    sequence: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    ],
    delay: 1.5, // seconds between rounds
  };

  ring.gammaFour = {
    payload: {
      type: projectile.glassBall,
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
        delay: 2.0,
      },
    },
  };

  ring.gammaFive = {
    payload: {
      type: projectile.microBullet,
      speed: 350,
    },
    firing: {
      pattern: pattern.gammaPattern,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.05,
      targetPlayer: false,
      viewTurret: false,
    },
  };

  ship.gammaCrane = {
    config: {
      health: 5,
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

  ship.gammaDove = {
    config: {
      health: 2,
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

  ship.gammaDoveTwo = {
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
    weapon: ring.gammaFour,
  };

  ship.gammaGoose = {
    config: {
      health: 6,
      hitValue: 5,
      radius: 60,
      sprite: sprite.goose.default,
      snapLine: 200,
      snapLineSpeed: 550,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
    },
    weapon: [{
      ring: ring.gammaFive,
      offset: {
        x: -5,
        y: -60,
      },
    }],
  };

  scene.gamma = {
    // player: ship.jaredTestPlane,
    waves: [
      {
        numOfEnemies: 10,
        ships: new Array(10).fill(ship.gammaDove),
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
        ships: new Array(6).fill(ship.gammaCrane),
        paths: new Array(6).fill(path.backAndForth),
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
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.gammaDoveTwo),
        paths: new Array(3).fill(path.straightDown),
        initialXPoints: [ // omit to evenly space enemies.
          600, 400, 700,
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
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.gammaDoveTwo),
        paths: new Array(3).fill(path.straightDown),
        initialXPoints: [ // omit to evenly space enemies.
          600, 400, 700,
        ],
        shipManifestOverride: [{
          config: {
            waitOffScreen: 0,
          },
          weapon: ring.gammaThree,
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
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.gammaDoveTwo),
        paths: new Array(3).fill(path.straightDown),
        initialXPoints: [ // omit to evenly space enemies.
          600, 400, 700,
        ],
        shipManifestOverride: [{
          config: {
            waitOffScreen: 0,
          },
          weapon: ring.gammaThree,
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
        ],
        waitUntilEnemiesGone: true,
      },
      // {
      //   numOfEnemies: 3,
      //   ships: new Array(3).fill(ship.gammaGoose),
      //   initialXPoints: [ // omit to evenly space enemies.
      //     1024 / 6, 1024 / 2, 1024 * 5 / 6
      //   ],
      //   waitUntilEnemiesGone: true,
      // },
      {
        choreography: [{
          id: 'showMessage',
          text: ['Jared Test Scene', '--CUT--'],
          duration: 6,
        }],
      }, // cut
    ],
  };
  /** end of jared level */

  scene.mikeTestScene = {
    waves: [
      {
        numOfEnemies: 2,
        ships: [
          // ship.goose,
          // ship.swallow,
          ship.crane,
          ship.bat,
        ],
        paths: [
          // path.sawtoothLeftStop,
          // path.sawtoothRightStop,
          path.doNothing,
          path.doNothing,
        ],
        shipManifestOverride: [{
            config: {
              initialDirection: 'west',
              snapLine: 924,
            },
            weapon: ring.dieTestRing
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
            },
            weapon: ring.dieTestRing
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 824,
            },
            weapon: ring.dieTestRing
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 200,
            },
            weapon: ring.dieTestRing
          },
        ],
        waitUntilEnemiesGone: true,
        initialYPoints: [
          100, 100, 300, 300,
        ]
      },
    ]
  }

  scene.levelOne = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Level One',
            sceneName: 'levelOne'
          },
          {
            id: 'accelerateToWarpspeed',
          },
          {
            id: 'loadBackground',
            bg: background.white,
          },
          {
            id: 'wait',
            duration: 0.25,
          },
          {
            id: 'showMessage',
            text: ['GET READY', 'LEVEL 1 START'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'loadBackground',
            bg: background.trees,
          },
          {
            id: 'decelerateFromWarpSpeed',
          },
          {
            id: 'hideMessage',
          },
        ],
      },
      // four hummingbirds fly left then come down
      {
        numOfEnemies: 4,
        ships: [
          ship.hummer,
          ship.owl,
          ship.pigeon,
          ship.bird,
        ],
        paths: new Array(4).fill(path.downSlow),
        shipManifestOverride: [{
          config: {
            initialDirection: 'west',
            snapLine: 100,
            dropItems: [new MultiGun(100)],
          },
          weapon: {
            payload: {
              type: projectile.whiteCircleBullet,
            },
          },
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 374,
            waitOffScreen: 1,
            dropItems: [new MultiGun(100)],
          },
          weapon: {
            payload: {
              type: projectile.whiteCircleBullet,
            },
          },
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 648,
            waitOffScreen: 2,
            dropItems: [new RapidFire(100)],
          },
          weapon: {
            payload: {
              type: projectile.whiteCircleBullet,
            },
          },
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 922,
            waitOffScreen: 3,
            dropItems: [new MultiGun(100)],
          },
          weapon: {
            payload: {
              type: projectile.whiteCircleBullet,
            },
          },
        },
        ],
        waitUntilEnemiesGone: true,
        initialYPoints: [
          50, 50, 50, 50,
        ],
      },
      // geese zig zag in and stop, others just enter from left and right, all shooting
      // lasers at player
      {
        numOfEnemies: 4,
        ships: [
          ship.goose,
          ship.swallow,
          ship.crane,
          ship.bat,
        ],
        paths: [
          path.sawtoothLeftStop,
          path.sawtoothRightStop,
          path.doNothing,
          path.doNothing,
        ],
        shipManifestOverride: [{
          config: {
            initialDirection: 'west',
            snapLine: 924,
            dropItems: [new RapidFire(100)],
          },
          weapon: ring.slowLaserTargetPlayer,
        },
        {
          config: {
            initialDirection: 'east',
            snapLine: 100,
            dropItems: [new RapidFire(100)],
          },
          weapon: ring.slowLaserTargetPlayer,
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 824,
            dropItems: [new RapidFire(100)],
          },
          weapon: ring.slowLaserTargetPlayer,
        },
        {
          config: {
            initialDirection: 'east',
            snapLine: 200,
          },
          weapon: ring.slowLaserTargetPlayer,
        },
        ],
        waitUntilEnemiesGone: true,
        initialYPoints: [
          100, 100, 300, 300,
        ],
      },
      {
        numOfEnemies: 10,
        waitUntilEnemiesGone: true,
        ships: new Array(10).fill(ship.gammaDove),
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
      },
      {
        choreography: [{
          id: 'accelerateToWarpspeed',
        },
        {
          id: 'wait',
          duration: 0.25,
        },
        {
          id: 'showMessage',
          text: ['MINI BOSS 1', 'APPROACHING'],
        },
        {
          id: 'wait',
          duration: 3,
        },
        {
          id: 'decelerateFromWarpSpeed',
        },
        {
          id: 'hideMessage',
        },
        ],
      },
      // BOSS SWALLOW!!
      {
        choreography: [{
          id: 'spawnEnemies',
        }],
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
          weapon: ring.gap1,
        }],
        waitUntilEnemiesGone: true,
      },


    ],
  };

  scene.levelTwo = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Level Two',
            sceneName: 'levelTwo'
          },
          {
            id: 'accelerateToWarpspeed',
          },
          {
            id: 'loadBackground',
            bg: background.white,
          },
          {
            id: 'wait',
            duration: 0.25,
          },
          {
            id: 'showMessage',
            text: ['WELL DONE', 'LEVEL 2 START'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'loadBackground',
            bg: background.desert,
          },
          {
            id: 'decelerateFromWarpSpeed',
          },
          {
            id: 'hideMessage',
          },
        ],
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.bird),
        waitUntilEnemiesGone: true,
        shipManifestOverride: [
          {
            weapon: ring.fourFixedSpeedCircle,
          },
          {
            weapon: ring.fourFixedSpeedCircle,
          },
          {
            weapon: ring.fourFixedSpeedCircle,
          },
        ],
      },
      {
        numOfEnemies: 4,
        ships: new Array(4).fill(ship.pigeon),
        paths: new Array(4).fill(path.downSlow),
        shipManifestOverride: [{
          config: {
            initialDirection: 'west',
            snapLine: 100,
          },
          weapon: ring.gammaFour,
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 374,
            waitOffScreen: 1,
          },
          weapon: ring.gammaFour,
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 648,
            waitOffScreen: 2,
          },
          weapon: ring.gammaFour,
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 922,
            waitOffScreen: 3,
          },
          weapon: ring.gammaFour,
        },
        ],
        waitUntilEnemiesGone: true,
        initialYPoints: [
          50, 50, 50, 50,
        ],
      },
      {
        numOfEnemies: 7,
        ships: new Array(7).fill(ship.bat),
        paths: [
          path.strafeRight,
          path.strafeLeft,
          path.strafeRight,
          path.strafeLeft,
          path.strafeRight,
          path.strafeLeft,
          path.strafeRight,
        ],
        shipManifestOverride: [{
          config: {
            initialDirection: 'east',
            snapLine: 100,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 924,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        {
          config: {
            initialDirection: 'east',
            snapLine: 100,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 924,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        {
          config: {
            initialDirection: 'east',
            snapLine: 100,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        {
          config: {
            initialDirection: 'west',
            snapLine: 924,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        {
          config: {
            initialDirection: 'east',
            snapLine: 100,
          },
          weapon: {
            payload: {
              type: projectile.sine,
            },
          },
        },
        ],
        waitUntilEnemiesGone: true,
      },
      {
        choreography: [{
          id: 'accelerateToWarpspeed',
          },
          {
            id: 'wait',
            duration: 0.25,
          },
          {
            id: 'showMessage',
            text: ['MINI BOSS 2', 'APPROACHING'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'decelerateFromWarpSpeed',
          },
          {
            id: 'hideMessage',
          }],
        },
        {
          choreography: [
            {
              id: 'spawnEnemies'
            },
            {
              id: 'wait',
              duration: 15,
            },
            {
              id: 'swapRing',
              enemyIndex: 0,
              ring: ring.slowLaserTargetPlayer,
            },
            {
              id: 'wait',
              duration: 7,
            },
            {
              id: 'swapRing',
              enemyIndex: 0,
              ring: ring.laserGapRight,
            },
            {
              id: 'wait',
              duration: 7,
            },
            {
              id: 'swapRing',
              enemyIndex: 0,
              ring: ring.slowLaserTargetPlayer,
            },
            {
              id: 'wait',
              duration: 7,
            },
            {
              id: 'swapRing',
              enemyIndex: 0,
              ring: ring.laserGapLeft,
            },
            {
              id: 'wait',
              duration: 7,
            },
            {
              id: 'resetChoreography',
              index: 2,
            }
          ],
          numOfEnemies: 1,
          ships: [ship.owl],
          paths: [
            path.doNothing,
          ],
          shipManifestOverride: [{
            config: {
              health: 150,
              snapLineSpeed: 50,
              hitValue: 2000,
              snapLine: 300,
            },
          }],
          waitUntilEnemiesGone: true,
      },
    ],
  };

  scene.levelThree = {
    waves: [
      {
        choreography: [
        {
          id: 'checkpoint',
          prettyName: 'Level Three',
          sceneName: 'levelThree'
        },
        {
          id: 'accelerateToWarpspeed',
        },
        {
          id: 'loadBackground',
          bg: background.white,
        },
        {
          id: 'wait',
          duration: 0.25,
        },
        {
          id: 'showMessage',
          text: ['FINAL LEVEL', 'GOOD LUCK'],
        },
        {
          id: 'wait',
          duration: 3,
        },
        {
          id: 'loadBackground',
          bg: background.paper,
        },
        {
          id: 'decelerateFromWarpSpeed',
        },
        {
          id: 'hideMessage',
        },
        ],
      },
      {
        numOfEnemies: 6,
        ships: new Array(6).fill(ship.gammaCrane),
        paths: new Array(6).fill(path.backAndForth),
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
        numOfEnemies: 6,
        ships: new Array(6).fill(ship.gooseHoming),
        paths: new Array(6).fill(path.downSlow),
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
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.gammaDoveTwo),
        paths: new Array(3).fill(path.straightDown),
        initialXPoints: [ // omit to evenly space enemies.
          600, 400, 700,
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
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.gammaDoveTwo),
        paths: new Array(3).fill(path.straightDown),
        initialXPoints: [ // omit to evenly space enemies.
          600, 400, 700,
        ],
        shipManifestOverride: [{
          config: {
            waitOffScreen: 0,
          },
          weapon: ring.gammaThree,
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
        ],
        waitUntilEnemiesGone: true,
      },
      {
        numOfEnemies: 3,
        ships: new Array(3).fill(ship.gammaDoveTwo),
        paths: new Array(3).fill(path.straightDown),
        initialXPoints: [ // omit to evenly space enemies.
          600, 400, 700,
        ],
        shipManifestOverride: [{
          config: {
            waitOffScreen: 0,
          },
          weapon: ring.gammaThree,
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
        ],
        waitUntilEnemiesGone: true,
      },
      {
        choreography: [{
          id: 'accelerateToWarpspeed',
        },
        {
          id: 'wait',
          duration: 0.25,
        },
        {
          id: 'showMessage',
          type: 'warning',
          text: ['WARNING', 'FINAL BOSS'],
        },
        {
          id: 'wait',
          duration: 1.5,
        },
        {
          id: 'showMessage',
          type: 'warning',
          text: ['WARNING', 'WARNING'],
        },
        {
          id: 'decelerateFromWarpSpeed',
        }],
      },
      {
        choreography: [{
          id: 'spawnEnemies',
        },
        {
          id: 'wait',
          duration: 7,
        },
        {
          id: 'hideMessage',
        },
        {
          id: 'wait',
          duration: 7,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.uniFiveWay,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.uniLinearAccelAiming,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.uniLinearAccelAiming,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.doubleStraightDownPulse,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.trackingTest1CircleBullet,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.trackingTest1CircleBullet,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.spiralAlpha4Circle,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.patternTestCircleBullet,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.patternTestCircleBullet,
        },
        {
          id: 'wait',
          duration: 15,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.uniFiveWay,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.uniLinearAccelAiming,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.uniLinearAccelAiming,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.doubleStraightDownPulse,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.trackingTest1CircleBullet,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.trackingTest1CircleBullet,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.spiralAlpha4Circle,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.patternTestCircleBullet,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.patternTestCircleBullet,
        },
        {
          id: 'wait',
          duration: 15,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.uniFiveWay,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.uniLinearAccelAiming,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.uniLinearAccelAiming,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.doubleStraightDownPulse,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.trackingTest1CircleBullet,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.trackingTest1CircleBullet,
        },
        {
          id: 'wait',
          duration: 10,
        },
        {
          id: 'swapRing',
          enemyIndex: 0,
          ring: ring.spiralAlpha4Circle,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 0,
          ring: ring.patternTestCircleBullet,
        },
        {
          id: 'swapSlaveRing',
          enemyIndex: 0,
          slaveIndex: 1,
          ring: ring.patternTestCircleBullet,
        },
        ],
        numOfEnemies: 1,
        ships: [ship.eagle],
        paths: [
          path.doNothing,
        ],
        shipManifestOverride: [{
          config: {
            health: 230,
            snapLineSpeed: 50,
            hitValue: 2000,
            snapLine: 250,
            radius: 200,
          },
        }],
        waitUntilEnemiesGone: true,
      },
      {
        choreography: [{
          id: 'accelerateToWarpspeed',
        },
        {
          id: 'wait',
          duration: 0.25,
        },
        {
          id: 'loadBackground',
          bg: background.beach,
        },
        {
          id: 'decelerateFromWarpSpeed',
        },
        {
          id: 'showMessage',
          type: 'gameOver',
          text: ['YOU WIN!', 'THANKS FOR PLAYING, YOU\'RE SCORE HAS BEEN SAVED ON THE LEADERBOARD'],
        },
        {
          id: 'wait',
          duration: 7,
        },
        {
          id: 'showMessage',
          text: ['STICK AROUND FOR', 'BONUS LEVELS'],
        },
        {
          id: 'wait',
          duration: 7,
        },
        {
          id: 'hideMessage',
        },
        ],
      },
    ],
  };


  /** end of jared level */
} // end of objects.js
