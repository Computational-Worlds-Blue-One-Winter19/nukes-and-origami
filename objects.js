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
    hitValue: 10,
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
  projectile.pulse = {
    radius: 3,
    scale: 1.0,
    colorFill: 'red',

    local: {
      baseRadius: 15,
      time: 0,
      amp: .5 * Math.PI, // this is really the frequency
    },

    update() {
      this.local.time += this.current.elapsedTime;
      this.current.r = this.current.velocity.radial * this.current.elapsedTime;

      this.config.radius = this.local.baseRadius * Math.abs(Math.sin(this.local.amp * this.local.time));
    },
  };

/** Prototype for sine wave */
projectile.pulseFixedAngle = {
  radius: 3,
  scale: 1.0,
  colorFill: 'red',

  init() {
    this.current.angle = toRadians(90);
  },

  local: {
    baseRadius: 10,
    time: 0,
    amp: .5 * Math.PI, // this is really the frequency
  },

  update() {
    this.local.time += this.current.elapsedTime;
    this.current.r = this.current.velocity.radial * this.current.elapsedTime;

    this.config.radius = this.local.baseRadius * Math.abs(Math.sin(this.local.amp * this.local.time));
  },
};

/** Prototype for sine wave */
projectile.bulletFadeIn = {
  radius: 1,
  scale: 1.0,
  colorFill: 'red',

  init() {
    //this.current.angle = toRadians(90);
  },

  local: {
    baseRadius: 6,
    maxRadius: 5,
    time: 0,
    amp: 2.5 * Math.PI, // this is really the frequency
  },

  update() {
    this.local.time += this.current.elapsedTime;
    this.current.velocity.radial += this.current.acceleration.radial * this.current.elapsedTime;
    this.current.r = this.current.velocity.radial * this.current.elapsedTime;

    if (this.config.radius < this.local.maxRadius) {
      this.local.deltaRadius = Math.abs(Math.sin(this.local.amp * this.local.time));
      this.config.radius = this.local.baseRadius * this.local.deltaRadius;
    }
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
    hitValue: 1,
    rotate: true,
    count: 0,
    // image: AM.getAsset('./img/bullet.png'),
    // scale: .04,
    sprite: sprite.laser.bigOrange,

    local: {
      range: 600, // maximum
    },

    update() {
      if (this.payload.count < 50) {
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

    onHit() {
      this.payload.count++;
    },
  };

  projectile.nuke = {
    radius: 3,
    hitValue: 1,
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
    count: 0,

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


  pattern.leftBolt = {
    sequence: [
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    ],
    delay: 1.5,
  };

  pattern.rightBolt = {
    sequence: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    delay: 1.5,
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

  ring.boltL = {
    payload: {
      type: projectile.glassBall,
      speed: 300,
    },
    firing: {
      pattern: pattern.leftBolt,
      radius: 20,
      angle: 80,
      spread: 20,
      loadTime: 0.2,
      cooldownTime: 0.05,
      targetPlayer: false,
      viewTurret: true,
    },
  };

  ring.boltR = {
    payload: {
      type: projectile.glassBall,
      speed: 300,
    },
    firing: {
      pattern: pattern.rightBolt,
      radius: 20,
      angle: 100,
      spread: 20,
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

  ring.spreadBeta1Circle = {
    payload: {
      type: projectile.circleBullet,
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
      count: 60,
      loadTime: 0.01,
      cooldownTime: 0.3,
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
      count: 60,
      loadTime: 0.01,
      cooldownTime: 0.3,
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
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    delay: 2,
  };

  pattern.thanks = {
    sequence: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    delay: 2,
  };

  pattern.for = {
    sequence: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    ],
    delay: 2,
  };

  pattern.playing = {
    sequence: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    ],
    delay: 2,
  };

  pattern.oPattern = {
    sequence: [
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    ],
    delay: 2,
  };



  ring.wordPatternRing = {
    payload: {
      type: projectile.microBullet,
      speed: 300,
    },
    firing: {
      pattern: pattern.for,
      width: 200,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.015,
      targetPlayer: false,
      viewTurret: false,
    },
  };

  ring.oRing = {
    payload: {
      type: projectile.microBullet,
      speed: 300,
    },
    firing: {
      pattern: pattern.oPattern,
      width: 100,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.01,
      targetPlayer: true,
      viewTurret: false,
    },
  }

  ring.thanksRing = {
    payload: {
      type: projectile.microBullet,
      speed: 300,
    },
    firing: {
      pattern: pattern.thanks,
      width: 400,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.015,
      targetPlayer: false,
      viewTurret: false,
    },
  };

  ring.forRing = {
    payload: {
      type: projectile.microBullet,
      speed: 300,
    },
    firing: {
      pattern: pattern.for,
      width: 200,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.015,
      targetPlayer: false,
      viewTurret: false,
    },
  };

  ring.playingRing = {
    payload: {
      type: projectile.microBullet,
      speed: 300,
    },
    firing: {
      pattern: pattern.playing,
      width: 400,
      radius: 50,
      angle: 90,
      spread: 22,
      loadTime: 0,
      cooldownTime: 0.015,
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
    weapon: ring.wordPatternRing,
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
      sprite: sprite.beta.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.crab = {
    config: {
      health: 3,
      hitValue: 5,
      radius: 70,
      sprite: sprite.crab.default,
    },
    weapon: ring.singleTargetPlayer,
  };


  ship.dolphinRight = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.dolphinRight.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.dolphinLeft = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.dolphinLeft.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.eel = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 15,
      sprite: sprite.eel.default,
      slave: [
        {
          config: {
            health: 6, // ONE more health than the actual entity.
            // Why? So the slaves don't actually die, which would
            // spawn a power up and another death animation
            hitValue: 0,
            radius: 15,
            yDifference: -90,
            xDifference: 0,
          },
          weapon: {},
        },
        {
          config: {
            health: 6,
            hitValue: 0,
            radius: 15,
            yDifference: -60,
            xDifference: 0,
          },
          weapon: {},
        },
        {
          config: {
            health: 6,
            hitValue: 0,
            radius: 15,
            yDifference: -30,
            xDifference: 0,
          },
          weapon: {},
        },
        {
          config: {
            health: 6,
            hitValue: 0,
            radius: 15,
            yDifference: 30,
            xDifference: 0,
          },
          weapon: {},
        },
        {
          config: {
            health: 6,
            hitValue: 0,
            radius: 15,
            yDifference: 60,
            xDifference: 0,
          },
          weapon: {},
        },
        {
          config: {
            health: 6,
            hitValue: 0,
            radius: 15,
            yDifference: 90,
            xDifference: 0,
          },
          weapon: {},
        },
      ],
    },
    weapon: {},
    // weapon: {}
  };

  ship.fish = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.fish.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.frog = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.frog.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.manta = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 110,
      sprite: sprite.manta.default,
      yOffset: -100,
      slave: [
        {
          config: {
            health: 40,
            hitValue: 50,
            radius: 60, 
            xDifference: -200,
            yDifference: 100,
          },
          weapon: ring.singleTargetPlayer,
          powerup: 'rapidFire',
        },
        {
          config: {
            health: 40,
            hitValue: 50,
            radius: 60, 
            xDifference: 200,
            yDifference: 100,
          },
          weapon: ring.singleTargetPlayer,
          powerup: 'multiGun',
        }
      ]
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.octopusBoss = {
    config: {
      health: 350,
      hitValue: 100,
      radius: 250,
      sprite: sprite.octopus.default,
      yOffset: 140,
      slave: [
        { // TOP LEFT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: -300, // Difference in X value from master
            yDifference: -150, // Difference in Y value from master
          },
          weapon: ring.boltL,
          powerup: 'nuke',
        },
        { // TOP RIGHT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: 280,
            yDifference: -140,
          },
          weapon: ring.boltR,
          powerup: 'chainGun',
        },
        { // 2ND FROM TOP, RIGHT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: 290,
            yDifference: -30,
          },
          weapon: ring.boltR,
          powerup: 'homing',
        },
        { // 2ND FROM TOP, LEFT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: -290,
            yDifference: -25,
          },
          weapon: ring.boltL,
          powerup: 'homing',
        },
        { // 3RD FROM TOP, RIGHT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: 325,
            yDifference: 90,
          },
          weapon: ring.boltR,
          powerup: 'multiGun',
        },
        { // 3RD FROM TOP, LEFT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: -275,
            yDifference: 130,
          },
          weapon: ring.boltL,
        },
        { // BOTTOM RIGHT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: 140,
            yDifference: 250,
          },
          weapon: ring.jaredTest3,
          powerup: 'shield',
        },
        { // BOTTOM LEFT
          config: {
            health: 20,
            hitValue: 50,
            radius: 30,
            xDifference: -80,
            yDifference: 230,
          },
          weapon: ring.jaredTest3,
          powerup: 'heart',
        },
      ],
    },
    weapon: ring.patternTest,
  };

  ship.seahorse = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.seahorse.default,
    },
    weapon: ring.singleTargetPlayer,
  };

  ship.turtle = {
    config: {
      health: 5,
      hitValue: 5,
      radius: 70,
      sprite: sprite.turtle.default,
    },
    weapon: ring.singleTargetPlayer,
  };

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

  background.water = {
    layers: [
      {
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
        layer: AM.getAsset('./img/water-overlay.png'),
        offset: -1536,
        verticalPixels: 1536,
        parallaxMult: 1,
      },
      {
        layer: AM.getAsset('./img/water-overlay.png'),
        offset: -3072,
        verticalPixels: 1536,
        parallaxMult: 1,
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
  };

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
  };

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

  path.sawtoothRight = [
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

  path.sawtoothLeft = [
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
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
    [155, 200, 0.25],
    [205, 200, 0.25],
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
          text: ['You suck...', 'Try again!'],
        },
        {
          id: 'wait',
          duration: 3,
        },
        {
          id: 'hideMessage',
        },
      ],
    }],
  };

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

  scene.multiGunDemo = {
    waves: [
      {
        numOfEnemies: 7,
        ships: [ship.hummer, ship.owl, ship.hummer, ship.owl, ship.pigeon, ship.bird, ship.pigeon],
        paths: [path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight, path.strafeLeft, path.strafeLeft, path.strafeLeft],
        initialYPoints: [100, 200, 300, 400, 150, 250, 350],
        shipManifestOverride: [
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              dropItems: [new MultiGun(100)],
            },
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              dropItems: [new MultiGun(100)],
            },
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              dropItems: [new MultiGun(100)],
            },
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              dropItems: [new MultiGun(100)],
            },
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 924,
              dropItems: [new RapidFire(100)],
            },
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 924,
              dropItems: [new RapidFire(100)],
            },
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 924,
              dropItems: [new MultiGun(100)],
            },
          },
        ],
        waitUntilEnemiesGone: true,
      },
    ],
  };

  scene.invertedDemo = {
    waves: [
      {
        numOfEnemies: 3,
        ships: [ship.crane, ship.bird, ship.crane],
        paths: [path.doNothing, path.doNothing, path.doNothing],
        shipManifestOverride: [
          {
            config: {
              health: 1,
              dropItems: [new ChainGun(100)],
            },
            weapon: ring.fourFixedSpeedCircle,
          },
          {
            config: {
              dropItems: [new Nuke(100)],
            },
            weapon: ring.slowLaserTargetPlayer,
          },
          {
            config: {
              health: 300,
              dropItems: [new Nuke(100)],
            },
            weapon: ring.fourFixedSpeedCircle,
          },
        ],
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
            dropItems: [new Nuke(100)],
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

  scene.waterIntro = {
    waves: [{
      choreography: [{
        id: 'showMessage',
        text: ['Everyone loves water levels', '...right?'],
      },
      {
        id: 'wait',
        duration: 3,
      },
      {
        id: 'showMessage',
        text: ['Well you\'re in for a treat.', 'This level is much harder than the other :)'],
      },
      {
        id: 'wait',
        duration: 3,
      },
      {
        id: 'hideMessage',
      },
      ],
    }],
  };

  scene.waterOne = {
    player: ship.jaredTestPlane,
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water one',
            sceneName: 'waterOne',
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
            text: ['GET READY', 'WATER 1 START'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'loadBackground',
            bg: background.water,
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
        numOfEnemies: 8,
        ships: [ship.turtle, ship.dolphinRight, ship.dolphinRight, ship.dolphinRight, ship.dolphinLeft, ship.dolphinLeft, ship.dolphinLeft, ship.turtle],
        paths: [path.strafeRight, path.sawtoothRight, path.sawtoothRight, path.sawtoothRight, path.sawtoothLeft, path.sawtoothLeft, path.sawtoothLeft, path.strafeLeft],
        initialXPoints: [125, -200, -200, -200, 1300, 1300, 1300, 900],
        initialYPoints: [-10, 450, 550, 650, 500, 600, 700, -10],
        waitUntilEnemiesGone: true,
        shipManifestOverride: [
          {
            weapon: ring.fourFixedSpeedCircle,
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              waitOffScreen: 3,
              snapLineSpeed: 400,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              waitOffScreen: 3,
              snapLineSpeed: 200,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              initialDirection: 'east',
              snapLine: 100,
              waitOffScreen: 3,
              snapLineSpeed: 400,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 924,
              waitOffScreen: 3,
              snapLineSpeed: 200,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 924,
              waitOffScreen: 3,
              snapLineSpeed: 400,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              initialDirection: 'west',
              snapLine: 924,
              waitOffScreen: 3,
              snapLineSpeed: 200,
            },
            weapon: ring.spreadBeta2,
          },
          {
            weapon: ring.fourFixedSpeedCircle,
          },
        ],
      },
    ],
  };

  scene.waterTwo = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water Two',
            sceneName: 'waterTwo',
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
            text: ['GET READY', 'WATER TWO START'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'loadBackground',
            bg: background.water,
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
        numOfEnemies: 14,
        // ships: new Array(10).fill(ship.beta),
        ships: [ship.beta, ship.beta, ship.beta, ship.beta, ship.beta, ship.beta, ship.beta, ship.beta, ship.beta, ship.beta,
          ship.seahorse, ship.seahorse, ship.seahorse, ship.seahorse],
        // paths: new Array(10).fill(path.straightDown),
        paths: [path.straightDown, path.straightDown, path.straightDown, path.straightDown, path.straightDown, path.straightDown, path.straightDown, path.straightDown, path.straightDown, path.straightDown,
          path.strafeLeft, path.strafeLeft, path.strafeRight, path.strafeRight],
        initialXPoints: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1124, 1124, -100, -100],
        initialYPoints: [-307, -116, -387, -233, -400, -600, -450, -187, -93, -250, 200, 500, 100, 400],
        waitUntilEnemiesGone: true,
        shipManifestOverride: [
          {
            config: {
              snapLineSpeed: 400,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 100,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 300,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 600,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 200,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 250,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 477,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 400,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 251,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 794,
            },
            weapon: ring.trackingTest1,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: 5,
              snapLine: 924,
            },
            weapon: ring.jaredTest3,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta2,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: 5,
              snapLine: 100,
            },
            weapon: ring.jaredTest3,
          },

        ],
      },
    ],
  };

  scene.waterThree = {
    waves: [
      {
        choreography: [

          {
            id: 'checkpoint',
            prettyName: 'Water Three',
            sceneName: 'waterThree',
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
            text: ['GET READY', 'WATER 3 START'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'loadBackground',
            bg: background.water,
          },
          {
            id: 'decelerateFromWarpSpeed',
          },
          {
            id: 'hideMessage',
          },

          {
            id: 'showMessage',
            text: ['I hope you have a good powerup and', 'I hope you know how to use it.'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'hideMessage',
          },
          {
            id: 'spawnEnemies',
          },
        ],
        numOfEnemies: 20,
        ships: new Array(20).fill(ship.crab),
        paths: [path.straightDown, path.straightDown, path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight,
          path.straightDown, path.straightDown, path.strafeLeft, path.strafeLeft, path.strafeLeft, path.strafeLeft, path.strafeLeft, path.strafeLeft, path.strafeLeft, path.strafeLeft],
        // initialYPoints: new Array(20).fill(Math.floor(Math.random() * (600 - 100)) + 100),
        initialXPoints: [Math.floor(Math.random() * (1000 - 100)) + 100, Math.floor(Math.random() * (1000 - 100)) + 100, -100, -100, -100, -100, -100, -100, -100, -100,
          Math.floor(Math.random() * (1000 - 100)) + 100, Math.floor(Math.random() * (1000 - 100)) + 100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100],
        initialYPoints: [-50, -50, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100,
          Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100,
          -50, -50, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100,
          Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100, Math.floor(Math.random() * (600 - 100)) + 100],
        waitUntilEnemiesGone: true,
        shipManifestOverride: [
          {
            config: {
              snapLineSpeed: 200,
              // initialDirection: 'east',
              waitOffScreen: 6.2,
              // snapLine: 100
            },
            weapon: ring.jaredTest3,
          },
          {
            config: {
              snapLineSpeed: 200,
              // initialDirection: 'east',
              waitOffScreen: 6.7,
              // snapLine: 100
            },
            weapon: ring.jaredTest3,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: Math.random() * 3,
              snapLine: 100,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              // initialDirection: 'west',
              waitOffScreen: 7,
              // snapLine: 924
            },
            weapon: ring.jaredTest3,
          },
          {
            config: {
              snapLineSpeed: 200,
              // initialDirection: 'west',
              waitOffScreen: 7.5,
              // snapLine: 924
            },
            weapon: ring.jaredTest3,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: Math.random() * 3,
              snapLine: 924,
            },
            weapon: ring.spreadBeta1Circle,
          },
        ],
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
      type: projectile.bulletFadeIn,
      velocity: {
        radial: 500,
        angular: 0,
      },
      acceleration: {
        radial: 800,
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
      width: 75,
      count: 4,
      loadTime: 0,
      cooldownTime: 0.05,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
      pulse: {
        duration: 0.5,
        delay: 1.5,
      },
    },
  };

  ring.pulseRingTest = {
    payload: {
      type: projectile.bulletFadeIn,
      velocity: {
        radial: 200,
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
      radius: 50,
      angle: 90,
      count: 10,
      loadTime: 0,
      cooldownTime: 0.2,
      rapidReload: true,
      targetPlayer: false,
      viewTurret: false,
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

  ship.crabBoss = {
    config: {
      health: 100,
      hitValue: 300,
      radius: 150,
      sprite: sprite.crab.boss,
      dropItems: [new MultiGun(100)],
      slave: [{
        config: {
          health: 15,
          hitValue: 50,
          radius: 30,
          xDifference: -180, // Difference in X value from master
          yDifference: 110, // Difference in Y value from master
          // dropItems: [new Nuke(100)]
        },
        weapon: ring.gammaFour,
        powerup: 'nuke',
      },
      {
        config: {
          health: 15,
          hitValue: 50,
          radius: 30,
          xDifference: 180,
          yDifference: 110,
          // dropItems: [new RapidFire(100)]
        },
        weapon: ring.gammaFour,
        powerup: 'rapidFire',
      },
      ],
    },
    weapon: ring.gammaFive,
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

  scene.thanksForPlayingScene = {
    waves: [
      {
        choreography: [
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
            text: ['And now a message from the devs...', '(please wait to kill these enemies!)'],
          },
          {
            id: 'wait',
            duration: 5,
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
        numOfEnemies: 3,
        ships: [
          // ship.goose,
          ship.swallow,
          ship.swallow,
          ship.swallow,
        ],
        initialXPoints: [
          200, 500, 700,
        ],
        paths: [
          // path.sawtoothLeftStop,
          path.doNothing,
          path.doNothing,
          path.doNothing,
        ],
        shipManifestOverride: [{
          config: {
            initialDirection: 'south',
            snapLine: 100,
          },
          weapon: ring.thanksRing,
        },
        {
          config: {
            initialDirection: 'south',
            snapLine: 100,
            waitOffScreen: 2,
          },
          weapon: ring.forRing,
        },
        {
          config: {
            initialDirection: 'south',
            snapLine: 100,
            waitOffScreen: 1,
          },
          weapon: ring.playingRing,
        },
        // {
        //   config: {
        //     initialDirection: 'east',
        //     snapLine: 200,
        //   },
        //   weapon: ring.wordPatternRing,
        // },
        // ],
        // waitUntilEnemiesGone: true,
        // initialYPoints: [
        //   100, 100, 300, 300,
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
          id: 'loadBackground',
          bg: background.beach,
        },
        {
          id: 'decelerateFromWarpSpeed',
        },
        {
          id: 'showMessage',
          type: 'gameOver',
          text: ['YOU WIN!', 'THANKS FOR PLAYING, YOUR SCORE HAS BEEN SAVED ON THE LEADERBOARD'],
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

  scene.levelOne = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Level One',
            sceneName: 'levelOne',
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
          },
          // weapon: ring.lineTest,
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
            dropItems: [new Nuke(100)],
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
            sceneName: 'levelTwo',
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
            id: 'spawnEnemies',
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
          },
        ],
        numOfEnemies: 1,
        ships: [ship.owl],
        paths: [
          path.doNothing,
        ],
        shipManifestOverride: [{
          config: {
            health: 100,
            snapLineSpeed: 50,
            hitValue: 2000,
            snapLine: 300,
            dropItems: [new MultiGun(100)],
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
            sceneName: 'levelThree',
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
    ],
  };


  /** end of jared level */

  scene.waterFour = { // Crab mini boss
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water Four',
            sceneName: 'waterFour',
          },
          {
            id: 'loadBackground',
            bg: background.water,
          },
          {
            id: 'showMessage',
            text: ['THE KING CRAB COMETH.', 'HE IS NOT PLEASED.'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'hideMessage',
          },
        ],
      },
      {
        choreography: [
          {
            id: 'spawnEnemies',
          },
          {
            id: 'wait',
            duration: 10,
          },
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.spiralAlpha2,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.spreadBeta1,
          },
          {
            id: 'wait',
            duration: 5, // hard, so it lasts less time
          },
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.spreadBeta4,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.spreadBeta2,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.spreadBeta2,
          },
          {
            id: 'wait',
            duration: 7,
          },
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.gammaFive,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.gammaFour,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.gammaFour,
          },
          {
            id: 'resetChoreography',
            index: 1,
          },
        ],
        numOfEnemies: 1,
        ships: [ship.crabBoss],
        paths: [path.doNothing],
        waitUntilEnemiesGone: true,
      },
    ],
  };

  scene.waterFive = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water Five',
            sceneName: 'waterFive',
          },
          {
            id: 'loadBackground',
            bg: background.water,
          },
          {
            id: 'spawnEnemies',
          },
        ],
        numOfEnemies: 15,
        ships: [ship.seahorse, ship.seahorse, ship.seahorse, ship.seahorse,
          ship.dolphinRight, ship.dolphinRight, ship.dolphinRight, ship.dolphinRight,
          ship.frog, ship.frog, ship.frog, ship.frog, ship.frog, ship.frog, ship.frog],
        paths: [path.strafeLeft, path.strafeLeft, path.strafeLeft, path.strafeLeft,
          path.strafeRight, path.strafeRight, path.strafeRight, path.strafeRight,
          path.straightDown, path.straightDown, path.doNothing, path.doNothing, path.doNothing, path.straightDown, path.straightDown],
        initialYPoints: [100, 300, 500, 700, 50, 250, 450, 650,
          -80, -80, -80, -80, -80, -80, -80],
        initialXPoints: [1100, 1100, 1100, 1100, -100, -100, -100, -100,
          146 - 46, 292 - 46, 438 - 46, 584 - 46, 730 - 46, 876 - 46, 1022 - 46],
        // please dont ask about the "-46", im just really lazy. Thanks - Nathan
        waitUntilEnemiesGone: true,
        shipManifestOverride: [
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: 5,
              snapLine: 924,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: 4,
              snapLine: 924,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: 3,
              snapLine: 924,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'west',
              waitOffScreen: 2,
              snapLine: 924,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: 5,
              snapLine: 100,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: 6,
              snapLine: 100,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: 7,
              snapLine: 100,
            },
          },
          {
            config: {
              snapLineSpeed: 200,
              initialDirection: 'east',
              waitOffScreen: 8,
              snapLine: 100,
            },
          },
          {
            config: {
              waitOffScreen: 1,
            },
            weapon: ring.spreadBeta3,
          },
          {
            config: {
              waitOffScreen: 1.5,
            },
            weapon: ring.spreadBeta3,
          },
          {
            config: {
              waitOffScreen: 2,
              dropItems: [new ExtraLife(100)],
            },
            weapon: ring.linearTest,
          },
          {
            config: {
              health: 10,
              waitOffScreen: 2.5,
              snapLine: 150,
              dropItems: [new Nuke(100)],
            },
            weapon: ring.spiralAlpha4,
          },
          {
            config: {//
              waitOffScreen: 2,
              dropItems: [new ExtraLife(100)],
            },
            weapon: ring.linearTest,
          },
          {
            config: {
              waitOffScreen: 1.5,
            },
            weapon: ring.spreadBeta3,
          },
          {
            config: {
              waitOffScreen: 1,
            },
            weapon: ring.spreadBeta3,
          },
        ],
      },
    ],
  };

  scene.waterFinalBoss = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water Boss',
            sceneName: 'waterFinalBoss',
          },
          {
            id: 'showMessage',
            type: 'warning',
            text: ['WARNING', 'A MASS OF TENTACLES APPROACHES'],
          },
          {
            id: 'wait',
            duration: 1,
          },
          {
            id: 'hideMessage',
          },
        ],
      },
      {
        choreography: [
          {
            id: 'spawnEnemies',
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
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 2,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 3,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 4,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 5,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 6,
            ring: ring.spreadBeta1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 7,
            ring: ring.spreadBeta1,
          },
          {
            id: 'wait',
            duration: 1.5,
          },
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.spiralAlpha2,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 2,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 3,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 4,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 5,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 6,
            ring: ring.uniFiveWay,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 7,
            ring: ring.uniFiveWay,
          },
          {
            id: 'wait',
            duration: 5,
          },
          // Reset back to default rings, then loop with resetChoreography
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.patternTest,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.boltL,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.boltR,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 2,
            ring: ring.boltR,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 3,
            ring: ring.boltL,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 4,
            ring: ring.boltR,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 5,
            ring: ring.boltL,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 6,
            ring: ring.jaredTest3,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 7,
            ring: ring.jaredTest3,
          },
          {
            id: 'wait',
            duration: 10,
          },
          {
            id: 'resetChoreography',
            index: 1,
          },
        ],
        /*  SLAVES =
        TOP LEFT, TOP RIGHT, 2ND TOP RIGHT, 2ND TOP LEFT, 3RD TOP RIGHT, 3RD TOP LEFT, BOTTOM RIGHT, BOTTOM LEFT  */
        numOfEnemies: 1,
        ships: [ship.octopusBoss],
        paths: path.doNothing,
        waitUntilEnemiesGone: true,
        shipManifestOverride: [
          {
            config: {
              snapLine: 50,
            },
          },
        ],
      },
    ],
  };

  scene.waterSix = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water Six',
            sceneName: 'waterSix',
          },
          {
            id: 'loadBackground',
            bg: background.water,
          },
          {
            id: 'spawnEnemies',
          },
        ],
        numOfEnemies: 377,
        ships: [...Array(372).fill(ship.eel), ...Array(5).fill(ship.turtle)],
        paths: [...Array(372).fill(path.straightDown), path.doNothing, ...Array(4).fill(path.straightDown)],
        initialXPoints: [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, // batch 1 = 20
          1020, 980, 940, 900, 860, 820, 780, 740, 700, 660, 620, 580, 540, 500, 460, 420, 380, 340, 300, 260, // batch 2 = 20
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 740, 780, 820, 860, 900, 940, 980, 1020, // batch 3 = 21
          0, 40, 80, 120, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, // batch 4 = 24
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 880, 920, 960, 1000, // batch 5 = 24
          60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580, 620, 660, 700, 740, 780, 820, 860, 900, 940, 980, 1020, // batch 6 = 25
          0, 40, 80, 120, 160, 240, 280, 320, 360, 400, 480, 520, 560, 640, 680, 720, 760, 800, 880, 920, 960, 1000, // batch 7 = 22
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880, // batch 8 = 23
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880, // batch 9 = 23
          200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, // batch 10 = 21
          0, 40, 80, 120, 160, 200, 240, 280, 320, // batch 11 = 9
          200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, // batch 12 = 14
          320, 720, // ending tunnel start = 2
          0, 40, 80, 120, 160, 200, 240, 260, 300, 340, // 10
          700, 740, 780, 820, 860, 900, 940, 980, 1020, // 9
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, // 10
          680, 720, 760, 800, 840, 880, 920, 960, 1000, // 9

          20, 60, 100, 140, 180, 220, 260, 300, 340, 380, // 10
          660, 700, 740, 780, 820, 860, 900, 940, 980, 1020, // 10
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, // 11
          640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, // 10
          20, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420, // 11
          620, 660, 700, 740, 780, 820, 860, 900, 940, 980, 1020, // 11
          0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, // 12
          600, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, // 11

          500, // end of tunnel turtle

          200, 440, 600, 840], // ending turtles
        waitUntilEnemiesGone: true,
        // shipManifestOverride: new Array(40).push(new Array(20).fill({}), new Array(20).fill({config: {waitOffScreen: 4, snapLine: 100}})),
        shipManifestOverride: [
          ...Array(20).fill({}),
          ...Array(20).fill({
            config: {
              waitOffScreen: 2,
              snapLine: 20,
            },
          }),
          ...Array(21).fill({
            config: {
              waitOffScreen: 3.5,
              snapLine: 20,
            },
          }),
          ...Array(24).fill({
            config: {
              waitOffScreen: 5,
              snapLine: 20,
            },
          }),
          ...Array(24).fill({
            config: {
              waitOffScreen: 6.5,
              snapLine: 20,
            },
          }),
          ...Array(25).fill({
            config: {
              waitOffScreen: 9.5,
              snapLine: 20,
            },
          }),
          ...Array(22).fill({
            config: {
              waitOffScreen: 12.5,
              snapLine: 20,
            },
          }),
          ...Array.from({ length: 23 }, (v, i) => (
            {
              config: {
                waitOffScreen: 14.5 + (i * 0.1),
                snapLine: 20,
              },
            }
          )),
          ...Array.from({ length: 23 }, (v, i) => (
            {
              config: {
                waitOffScreen: 19.1 - (i * 0.1),
                snapLine: 20,
              },
            }
          )),
          ...Array.from({ length: 21 }, (v, i) => (
            {
              config: {
                waitOffScreen: 20.5 - (i * 0.1),
                snapLine: 20,
              },
            }
          )),
          ...Array.from({ length: 9 }, (v, i) => (
            {
              config: {
                waitOffScreen: 21.5 + (i * 0.1),
                snapLine: 20,
              },
            }
          )),
          ...Array.from({ length: 14 }, (v, i) => (
            {
              config: {
                waitOffScreen: 20.5 + (i * 0.1),
                snapLine: 20,
              },
            }
          )),
          ...Array(2).fill({
            config: {
              waitOffScreen: 22.6,
              snapLine: 20,
            },
          }),
          ...Array(10).fill({
            config: {
              waitOffScreen: 23.2,
              snapLine: 20,
            },
          }),
          ...Array(9).fill({
            config: {
              waitOffScreen: 23.2,
              snapLine: 20,
            },
          }),
          ...Array(10).fill({
            config: {
              waitOffScreen: 23.8,
              snapLine: 20,
            },
          }),
          ...Array(9).fill({
            config: {
              waitOffScreen: 23.8,
              snapLine: 20,
            },
          }),
          ...Array(10).fill({
            config: {
              waitOffScreen: 24.4,
              snapLine: 20,
            },
          }),
          ...Array(10).fill({
            config: {
              waitOffScreen: 24.4,
              snapLine: 20,
            },
          }),
          ...Array(11).fill({
            config: {
              waitOffScreen: 25,
              snapLine: 20,
            },
          }),
          ...Array(10).fill({
            config: {
              waitOffScreen: 25,
              snapLine: 20,
            },
          }),
          ...Array(11).fill({
            config: {
              waitOffScreen: 25.6,
              snapLine: 20,
            },
          }),
          ...Array(11).fill({
            config: {
              waitOffScreen: 25.6,
              snapLine: 20,
            },
          }),
          ...Array(12).fill({
            config: {
              waitOffScreen: 26.2,
              snapLine: 20,
            },
          }),
          ...Array(11).fill({
            config: {
              waitOffScreen: 26.2,
              snapLine: 20,
            },
          }),
          // turtles:
          {
            config: {
              health: 25,
              waitOffScreen: 26.5,
            },
            weapon: ring.uniSpiralFourWay,
          },
          ...Array(4).fill({
            config: {
              waitOffScreen: 13,
              snapLine: 20,
              dropItems: [new MultiGun(100)],
            },
          }),
        ],
      },
    ],
  };

  scene.waterManta = {
    waves: [
      {
        choreography: [
          {
            id: 'checkpoint',
            prettyName: 'Water Manta',
            sceneName: 'waterManta',
          },
          {
            id: 'loadBackground',
            bg: background.water,
          },
          {
            id: 'showMessage',
            text: ['MANTA', 'INCOMING'],
          },
          {
            id: 'wait',
            duration: 3,
          },
          {
            id: 'hideMessage',
          },
        ],
      },
      {
        choreography: [
          {
            id: 'spawnEnemies'
          },
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.oRing,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.jaredTest1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.jaredTest1,
          },
          {
            id: 'wait',
            duration : 7,
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
            ring: ring.trackingTest1,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.trackingTest1,
          },
          {
            id: 'wait',
            duration: 7,
          },
          {
            id: 'swapRing',
            enemyIndex: 0,
            ring: ring.patternTest,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 0,
            ring: ring.oRing,
          },
          {
            id: 'swapSlaveRing',
            enemyIndex: 0,
            slaveIndex: 1,
            ring: ring.oRing,
          },
          {
            id: 'wait',
            duration: 7
          },
          {
            id: 'resetChoreography',
            index: 1,
          },
        ],
        numOfEnemies: 1,
        ships: [ship.manta],
        paths: [path.doNothing],
        shipManifestOverride: [
          {
            config: {
              snapLine: 200,
              health: 200,
              dropItems: [new ChainGun(100)],
            },
          }
        ],
        waitUntilEnemiesGone: true,
      }
    ]
  }
} // end of objects.js
