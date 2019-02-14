/**
 * Custom Animation Class.
 */
class Sprite {
  constructor(config) {
    this.sheet = config.image; // Source spritesheet
    this.oriX = config.dimension.originX; // Top left X point of where to start on the spritesheet
    this.oriY = config.dimension.originY; // Top left Y point of where to start on the spritesheet
    this.width = config.dimension.frameWidth; // Pixel width of each frame
    this.height = config.dimension.frameHeight; // Pixel height of each frame
    this.len = config.dimension.frameCount; // # of frames in this sprite (to let user pick
    // certain frames from a sheet containing multiple animations)
    this.time = config.dimension.timePerFrame; // time each frame should be displayed. If time = 0, don't loop
    this.scale = config.dimension.scale; // Size scale
    this.flip = config.dimension.flip; // BOOLEAN. Flip image over Y axis?
    this.totalTime = config.dimension.timePerFrame * config.dimension.frameCount; // Not set by user
    this.elapsedTime = 0; // Not set by user
    this.currentFrame = 0;
  }

  drawFrame(tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.time !== 0) {
      if (this.elapsedTime >= this.totalTime) { // The isDone() function does exactly this. Use either.
        // All frames used. Start over to loop.
        this.elapsedTime = 0;
      }
      this.currentFrame = (Math.floor(this.elapsedTime / this.time)) % this.len;
      // console.log(this.currentFrame);
    }

    const locX = x - (this.width / 2) * this.scale;
    const locY = y - (this.height / 2) * this.scale;

    ctx.drawImage(this.sheet,
      this.oriX + (this.width * this.currentFrame),
      this.oriY, // NOTE: does not work for spritesheets where one animation goes to next line!
      this.width,
      this.height,
      locX,
      locY,
      this.width * this.scale,
      this.height * this.scale);
    // }
    if (this.time !== 0) {
      this.currentFrame += 1;
    }
  }

  isDone() {
    return this.elapsedTime >= this.totalTime;
  }
}

/**
 * The basic functionality of an EnemyShip. On update() the bridge checks in with
 * major systems to update its own state.
 *
 *   1. Collision Detection
 *   2. Weapons
 *   3. Helm
 *
 * A subclass does not need to override the parent methods, but can state a
 * manifest to configure the following:
 *
 * Path defines unique path behavior. A Path contains a 2D array where each
 * subarray is structured as [heading, speed, duration]
 *
 *     heading:  fixed to our view of the canvas
 *               (0 right, 90 down, 180 left, 270 up)
 *     speed:    the radialspeed in pixels per second
 *     duration: the number of seconds to maintain this course
 *
 * Path Notes:
 *     to stop briefly set course to any angle and speed to 0
 *     when the last course entry ends then the Ship will remain idle
 *     the last coordinate may direct the ship heading 90 to exit the screen
 *     any incursion on the sides is ignored
 *
 * Weapons manifest defines payload and behavior.
 *     payload: the object reference for a Bullet subclass
 *     turretLoadTime: the amount of time to wait on each bay
 *     turretCooldownTime: the time to wait for the next firing sequence.
 *     turretCount: specifies a number of turrets to be distributed evenly.
 *     rapidReload: if true then the next round appears instantly.
 *     turretLocation: an array of coordinates, as above, to place turrets
 *                     [angle1, angel2, angle3]
 *
 * Rotation (optional) specifies turret rotation behavior.
 *     rotationSpeed: the angular speed
 *     rotationDistance: the angular distance
 *     rotationWait: time to wait before next rotation
 *     rotationAlternate: true to reverse direction on each stop
 *
 * PowerUp (optional) will increase size of weapons array at specified interval.
 *     powerStepMult: on each step increase turretCount by this factor
 *     powerStepTime: the amount of time to elapse before each step
 *
 * Parameters:
 *     hitValue: value that the user's score will increase by when the ship is destoryed.
 *     radius: size of this Ship for collisions (default 40)
 *     originX: specify the initial x coordinate. (default random)
 *     originY: specify the initial y coordinate. (default 3 * radius)
 *     health: number of bullets needed to defeat ship
 *
 *     sprite: the Sprite to represent this object
 *     snapLine: the horizontal line that a ship must reach prior to becoming active
 *     snapLineSpeed: the initial speed to travel (default 50)
 *     snapLineWait: time to wait on snapLine before initiating path and player interaction
 *     weaponsOnEntrance: if true then weapons will be activated prior to stepLine
 *     weaponsAdvantage: specifies the amount of time before snapLineWait that weapons activate.
 *     powerUps: A powerup that the ship can drop when destroyed
 *
 * Overriding: consider adding functionality to the Enemy class.
 */

/** The Ship Class */
class Ship extends Entity {
  constructor(game, manifest) {
    super(game, Ship.getInitPoint(game, manifest));
    this.sprite = new Sprite(manifest.config.sprite.default);

    // store class constants in config
    this.config = Object.assign({}, manifest.config);
    this.config.radius = this.config.radius || 50;
    this.config.hitValue = this.config.hitValue || 1;
    this.snapLine = this.config.snapLine || 100;
    this.snapLineSpeed = this.config.snapLineSpeed || 300;
    this.hitValue = this.config.hitValue;
    this.powerUp = this.config.powerUp;

    // additional fields
    this.idleTrans = false;
    this.idleCount = 0;
    this.lastFired = 0;
    this.health = manifest.config.health;

    // initialize any included weapon and path
    if (manifest.path) {
      this.initializePath(manifest.path);
    }

    if (manifest.weapon) {
      this.initializeWeapon(manifest.weapon);
    }
  }

  update() {
    if (this.snapLine) {
      // we are enroute to the snapLine
      this.updateSnapPath();
    } else {
      // check all systems
      this.updateHelm();
      this.updateCollisionDetection();
      this.updateWeapons();
    }
    super.update();
  }

  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
    this.drawWeapon();   
    super.draw();
  }

  drawWeapon() {
    for (let i = 0; i < this.weapon.length; i++) {
      this.weapon[i].ring.draw();
    }
  }

  /**
   * Collisions: detection checks bounds along canvas, collision with
   * player and collision with player bullets.
   * */
  updateCollisionDetection() {
    // Check upper y bounds if Crane has left the bottom, left or right of the screen
    const pastTheLeftOfTheScreen = this.current.x < 0 - this.config.radius;
    const pastTheRightOfTheScreen = this.current.x > this.game.surfaceWidth + this.config.radius;
    const pastTheBottomOfTheScreen = this.current.y > this.game.surfaceHeight + this.config.radius;
    if (pastTheBottomOfTheScreen || pastTheLeftOfTheScreen || pastTheRightOfTheScreen) {
      this.disarm();
      this.removeFromWorld = true;
      return;
    }

    // Check for collision with player
    if (this.isCollided(this.game.player)) {
      this.game.onPlayerHit(this.game.player);
    }

    // Check for hit from player bullets
    for (const e of this.game.entities) {
      if (e instanceof Projectile && e.playerShot && this.isCollided(e) && !e.hitTarget) {
        e.hitTarget = true;
        this.health--;

        if (this.health === 0) {
          this.disarm();
          this.removeFromWorld = true;
          this.game.onEnemyDestruction(this);
        }
      }
    }
  }

  /**
   * Weapons: manage turret initialization, rotation, firing and cooldown.
   */
  updateWeapons() {
    // assume that this.current has been updated to Ship's x,y postion
    for (let i = 0; i < this.weapon.length; i++) {
      let weapon = this.weapon[i];

      weapon.ring.current.x = this.current.x + weapon.offset.x;
      weapon.ring.current.y = this.current.y + weapon.offset.y;

      weapon.ring.update();
    }
  }

  /** Helm: manage path sequence. */
  updateHelm() {
    if (this.path) {
      // Update position
      this.path.elapsedTime += this.game.clockTick;

      if (this.path.elapsedTime > this.path.targetTime) {
        // Advance to next step
        this.path.currentStep += 1;

        if (this.path.currentStep === this.path.length) {
          // the path is completed then remove it from this instance
          this.path = null;
        } else {
          // update heading and speed
          const newCourse = this.path[this.path.currentStep];

          // To not error when we get to the end of the path.
          if (newCourse) {
            this.current.angle = toRadians(newCourse[0]);
            this.current.speed = newCourse[1];
            this.path.targetTime = newCourse[2];
            this.path.elapsedTime = 0;
          }
        }
      } else if (this.current.speed) {
        // advance along path
        const radialDistance = this.current.speed * this.game.clockTick;
        this.current.x += radialDistance * Math.cos(this.current.angle);
        this.current.y += radialDistance * Math.sin(this.current.angle);
      } else {
        // path currently has the Ship stopped
        this.idle();
      }
    } else {
      // no path then the Ship is stopped
      this.idle();
    }
  }

  /**
   * SnapPath: manage the transition to the starting point.
   */
  updateSnapPath() {
    this.current.y += this.snapLineSpeed * this.game.clockTick;

    // check for arrival at snapLine
    if (this.current.y >= this.snapLine) {
      this.snapLine = null;
    }
  }

  initializePath(path) {
    this.path = Object.assign({}, path);
    this.path.elapsedTime = 0;
    this.path.targetTime = 0;
    this.path.currentStep = -1;
  }

  initializeWeapon(weaponManifest) {
    this.weapon = new Array();
    
    if (weaponManifest instanceof Array) {
      // process the multi-ring format
      for (let i = 0; i < weaponManifest.length; i++) {
        var r = new Ring(this, weaponManifest[i].ring);
        var offset = weaponManifest[i].offset || { x: 0, y: 0 };

        this.weapon.push({
          ring: r,
          offset: offset,
        });
      }
    } else {
      // process the single-ring format  
      var r = new Ring(this, weaponManifest);
      
      this.weapon.push({
        ring: r,
        offset: { x: 0, y: 0 },
      });
    }
  }

  /** Helpers for repeated work. */
  // Idle hover effect
  idle() {
    if (this.idleTrans) {
      this.idleCount += 1;
      // TODO: you can make this simpler
      if (this.idleCount % 30 === 0) {
        this.current.y += 1;
      }
      if (this.idleCount === 300) {
        this.idleTrans = !this.idleTrans;
        this.idleCount = 0;
      }
    } else {
      this.idleCount += 1;
      if (this.idleCount % 30 === 0) {
        this.current.y -= 1;
      }
      if (this.idleCount === 300) {
        this.idleTrans = !this.idleTrans;
        this.idleCount = 0;
      }
    }
  }

  disarm() {
    // for (const projectile of this.weapon.bay) {
    //   projectile.removeFromWorld = true;
    // }
    // bullets are not added to world until after launch, so just remove bays.
    this.weapon.bay = [];
  }

  //
  static getInitPoint(game, manifest) {
    let x, y;
    // Is origin specified?
    if (manifest.config.origin) {
      // Use one or both parameters specified
      x = manifest.config.origin.x || 512;
      y = manifest.config.origin.y || -manifest.config.sprite.default.dimension.frameHeight / 2;
    } else {
      // Start it above screen in the middle
      x = 512;
      y = -manifest.config.sprite.default.dimension.frameHeight / 2;
    }

    return {
      x,
      y,
    };
  }
}

/**
 * The Player is an entity. Some of the configuration is similar
 * to a ship, but it does not support paths and has actions for
 * user events. It also has a Weapon. The player also accepts
 * power-ups.
 */
/** MANIFEST FOR THE PLAYER PLANE */
class Plane extends Ship {
  constructor(game, manifest) {
    super(game, manifest);
    this.config = manifest.config;
    this.isPlayer = true;
    this.damage = 1;
    // load sprites
    this.idle = new Sprite(manifest.config.sprite.default);
    this.left = new Sprite(manifest.config.sprite.left);
    this.right = new Sprite(manifest.config.sprite.right);
    this.rollLeft = new Sprite(manifest.config.sprite.rollLeft);
    this.rollRight = new Sprite(manifest.config.sprite.rollRight);

    // load weapon
    // handled in Ship constructor

    // initial parameters
    this.sprite = this.idle;
    this.game = game;
    this.ctx = game.ctx;
    this.speed = this.config.speed || 400;
    this.rollDirection = '';
    this.rollDistance = 250;
    this.rollTimer = 0;
    this.rolling = false;
    this.timeSinceLastRoll = 0;
    this.rollCooldown = 5; // seconds
    this.canRoll = true;
    // specific to shooting
    this.timeSinceLastSpacePress = 0;
    this.fireRate = 0.25;
    this.invincTime = 0;
    this.invincDuration = 2;
    this.invincCtr = 0;
    this.blinking = false;
    this.idleCount = 0;
    // specific to powerups
    this.shield = {
      hasShield: false,
      entities: [],
    };

    this.controls = {
      hasInvertedControls: false,
      startTime: 0,
      duration: 10,
    };
  }
  
  /** @override
   *  The Ship calls this method first on every update cycle.
   */
  updateHelm() {
    // It might be better to use a changeX and changeY variable
    // This way we apply a sprite depending on how the position has changed
    if (this.invincTime !== 0 && this.invincTime < this.invincDuration) {
      this.invincTime += this.game.clockTick;
    } else if (this.invincTime > this.invincDuration) {
      this.invincTime = 0;
    }

    if (this.controls.hasInvertedControls) {
      // Increase the startTime
      this.controls.startTime += this.game.clockTick;

      if (this.controls.startTime > this.controls.duration) {
        this.controls.hasInvertedControls = false;
        this.controls.startTime = 0;
        showTimedMessage('normal-message');
      }
    }

    if (!this.canRoll) {
      this.timeSinceLastRoll += this.game.clockTick;
      if (this.timeSinceLastRoll > this.rollCooldown) {
        this.timeSinceLastRoll = 0;
        this.canRoll = true;
      }
    }
        
    // This makes me worry about an overflow, or slowing our game down.
    // But it works great for what we need.
    // this.timeSinceLastSpacePress += this.game.clockTick;
    if (!this.rolling && !this.isOutsideScreen()) {
      const leftKeyCheck = this.game.keysDown.ArrowLeft && !this.game.keysDown.ArrowRight;
      const rightKeyCheck = this.game.keysDown.ArrowRight && !this.game.keysDown.ArrowLeft;

      const hitCeilCheck = this.current.y - ((this.sprite.height * this.sprite.scale) / 2) > 0;
      const hitFloorCheck = this.current.y + ((this.sprite.height * this.sprite.scale) / 2) < this.game.surfaceHeight;
      const upKeyCheck = this.game.keysDown.ArrowUp && hitCeilCheck;
      const upInvertedKeyCheck = this.game.keysDown.ArrowDown && hitCeilCheck;
      const downKeyCheck = this.game.keysDown.ArrowDown && hitFloorCheck;
      const downInvertedKeyCheck = this.game.keysDown.ArrowUp && hitFloorCheck;

      if ((this.controls.hasInvertedControls && rightKeyCheck)
      || (!this.controls.hasInvertedControls && leftKeyCheck)) {
        if (this.game.keysDown.KeyC && this.canRoll) {
          this.rollDirection = 'left';
          this.rolling = true;
          this.performManeuver();
          this.canRoll = false;
        } else if (this.current.x - ((this.sprite.width * this.sprite.scale) / 2) > 0) {
          this.current.x -= this.speed * this.game.clockTick;
          this.sprite = this.left;
        } else { // This will just apply the left sprite when hugging the wall and not going anywhere
          this.sprite = this.left;
        }
      }


      if ((this.controls.hasInvertedControls && leftKeyCheck)
      || (!this.controls.hasInvertedControls && rightKeyCheck)) {
        if (this.game.keysDown.KeyC && this.canRoll) {
          this.rollDirection = 'right';
          this.rolling = true;
          this.performManeuver();
          this.canRoll = false;
        } else if (this.current.x + ((this.sprite.width * this.sprite.scale) / 2) < this.game.surfaceWidth) {
          this.current.x += this.speed * this.game.clockTick;
          this.sprite = this.right;
        } else {
          this.sprite = this.right;
        }
      }
      if (this.game.keysDown.ArrowLeft && this.game.keysDown.ArrowRight) {
        this.sprite = this.idle;
      }
      if ((this.controls.hasInvertedControls && upInvertedKeyCheck)
      || (!this.controls.hasInvertedControls && upKeyCheck)) {
        this.current.y -= this.speed * this.game.clockTick;
      }
      if ((this.controls.hasInvertedControls && downInvertedKeyCheck)
      || (!this.controls.hasInvertedControls && downKeyCheck)) {
        this.current.y += this.speed * this.game.clockTick;
      }
    } else {
      this.performManeuver();
    }

    if (!this.game.keysDown.ArrowLeft &&
      !this.game.keysDown.ArrowRight &&
      !this.game.keysDown.ArrowUp &&
      !this.game.keysDown.ArrowDown &&
      !this.performingManeuver) {
      this.sprite = this.idle;
      if (this.idleTrans) {
        this.idleCount += 1;
        // every 10 frames
        if (this.idleCount % 5 === 0) {
          this.current.y += 1;
        }
        // go other way every 60 frames
        if (this.idleCount === 30) {
          this.idleTrans = !this.idleTrans;
          this.idleCount = 0;
        }
      } else {
        this.idleCount += 1;
        if (this.idleCount % 5 === 0) {
          this.current.y -= 1;
        }
        if (this.idleCount === 30) {
          this.idleTrans = !this.idleTrans;
          this.idleCount = 0;
        }
      }
    }
  }

  /**
   * This method is called while controls are taken from the user and
   * this.rolling is true. This handles the maneuver and then returns
   * control to the user by setting this.rolling to false.
   */
  performManeuver() {
    if (this.rollTimer > this.rollDistance) {
      this.rollTimer = 0;
      this.rolling = false;
      this.sprite = this.idle;
    }
    if (this.rollDirection === 'left') {
      // Rolling should be faster than just moving, so mult speed by a constant
      // greater than 1
      if (this.current.x - ((this.sprite.width * this.sprite.scale) / 2) > 0) {
        this.current.x -= this.speed * this.game.clockTick * 1.5;
      }
      this.sprite = this.rollLeft;
    }
    if (this.rollDirection === 'right') {
      if (this.current.x + ((this.sprite.width * this.sprite.scale) / 2) < this.game.surfaceWidth) {
        this.current.x += this.speed * this.game.clockTick * 1.5;
      }
      this.sprite = this.rollRight;
    }
    this.rollTimer += this.speed * this.game.clockTick * 1.5;
  }

  draw() {
    if (this.invincTime > 0) {
      this.invincCtr += this.game.clockTick;
      if (this.invincCtr > 0.08) {
        this.blinking = !this.blinking;
        this.invincCtr = 0;
      }
    } else {
      this.blinking = false;
    }
    if (!this.blinking) {
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
    }

    this.drawWeapon();
  }

  /**
   * Collisions: Detects collision with any objects that have a radius.
   * */
  updateCollisionDetection() {
    for (let i = 0; i < this.game.entities.length; i += 1) {
      const entity = this.game.entities[i];

      if (entity instanceof Projectile && !entity.playerShot && this.isCollided(entity)) {
        // handle powerUp grab by player
        if (entity.payload.powerUp && !entity.isPlayer) {
          // TODO: store powerUps for user activation and update the HUD inventory

          entity.payload.powerUp(this); // for now just run the enclosed powerUp
          // entity.removeFromWorld = true;
        } else if (this.shield.hasShield) {
          this.shield.entities[0].removeShield();
        } else { // hit by enemy bullet
          this.game.onPlayerHit(this);
        }
        entity.removeFromWorld = true;
      }
    } // end for loop
  }

  returnToInitPoint(coordinate) {
    const {
      x,
      y,
    } = coordinate;
    this.current.x = x;
    this.current.y = y;
  }

  static getInitPoint(game) {
    const x = game.ctx.canvas.width / 2;
    const y = game.ctx.canvas.height - 100;
    return {
      x,
      y,
    };
  }
}


/**
 * This weapon spawns a circle of bullets around the enemy and then fires them all at once at the player
 */
class Ring {
  constructor(owner, manifest) {
    this.owner = owner;
    this.payload = manifest.payload;
    this.rotation = manifest.rotation;
    this.bay = [];

    // first validate some input to set configuration
    // support for constant and sine rotation
    if (this.rotation && this.rotation.speed) {
      this.fixedRotation = this.rotation.speed;
    } else if (this.rotation && this.rotation.angle) {
      this.sineAmplitude = toRadians(this.rotation.angle);
      this.sineFrequency = this.rotation.frequency || 1;
    }

    // check for pattern
    const pattern = manifest.firing.pattern;
    const count = pattern ? pattern.sequence[0].length : manifest.firing.count || 1;
    
    // compute spacing and adjust base angle
    let baseAngle = toRadians(manifest.firing.angle) || 0;
    let spacing = 0;
    let spread = 0;

    if (manifest.firing.spread && count > 1) {
      spread = toRadians(manifest.firing.spread);
      spacing = spread / (count - 1);
    } else if (count > 1) {
      spacing = 2 * Math.PI / count;
    }

    baseAngle -= spread / 2;

    // set activeTime and waitTime for pulse delay
    let activeTime = Infinity;
    let waitTime = 0;

    if (manifest.firing.pulse) {
      activeTime = manifest.firing.pulse.duration;
      waitTime = manifest.firing.pulse.delay;
    }

    // convert acceleration and velocity to radians
    if (!this.payload.acceleration) {
      this.payload.acceleration = { 
        radial: 0, 
        angular: 0,
      };
    } else if (!(this.payload.acceleration instanceof Object)) {
      this.payload.acceleration = {
        radial: this.payload.acceleration,
        angular: 0,
      };
    } else {
      this.payload.acceleration.angular = toRadians(this.payload.acceleration.angular);
    }

    if (!this.payload.velocity) {
      this.payload.velocity = { 
        radial: this.payload.speed,
        angular: 0,
      };
    } else {
      this.payload.velocity.angular = toRadians(this.payload.velocity.angular);
    }

    // store configuration for this instance
    this.config = {
      activeTime,
      baseAngle,
      count,
      pattern,
      spread,
      spacing,
      waitTime,
      radius: manifest.firing.radius || this.owner.config.radius,
      viewTurret: manifest.firing.viewTurret,
      rapidReload: manifest.firing.rapidReload,
      cooldownTime: manifest.firing.cooldownTime || 0,
      loadTime: manifest.firing.loadTime || 0,
      targetPlayer: manifest.firing.targetPlayer || false,
      targetLeadShot: manifest.firing.targetLeadShot || false,
    };

    // store instance variables
    this.current = {
      x: this.owner.current.x,
      y: this.owner.current.y,
      angle: baseAngle,
      isLeadShot: this.config.targetLeadShot,
    };

    // set firing conditionals
    this.status = {
      elapsedTime: 0,
      elapsedActiveTime: 0,
      isLoading: true,
      isReady: false,
      isCooling: false,
      isWaiting: false,
    };

    if (pattern) {
      this.status.round = -1,
      this.status.lastRound = pattern.sequence.length;
      this.config.waitTime = pattern.delay;
    }
  }

  update() {
    const game = this.owner.game;
    //this.status.elapsedTime += game.clockTick;
    this.status.elapsedTime += game.clockTick;

    // update active time counter; used for the pulse delay
    this.status.elapsedActiveTime += game.clockTick;
    //console.log("update=" + ++this.status.count + " interval=" + game.clockTick + " elapsed=" + this.status.elapsedTime);
    

    // ring center position is updated by the Ship before calling Ring.update()

    // adjust angle for bay[0] if this ring is rotating
    if (this.fixedRotation) {
      const doublePI = 2 * Math.PI;
      const delta = doublePI * this.fixedRotation * game.clockTick;
      this.current.angle += delta;
    } else if (this.sineAmplitude) {
      const delta = game.timer.getWave(this.sineAmplitude, this.sineFrequency);
      this.current.angle = this.config.baseAngle + delta;
    } else if (this.current.isLeadShot || this.config.targetPlayer) {
      // moved target logic to here. this will aim the 
      const target = this.getPlayerLocation(this.current);
      this.current.angle = target.angle - this.config.spread / 2;
      this.current.isLeadShot = false;
    }
    // update each turret using the spacing offset from bay[0]
    for (let i = 0; i < this.bay.length; i++) {
      const projectile = this.bay[i];
      projectile.current.angle = this.current.angle + i * this.config.spacing;
      
      // TEST: only update x,y if turret is visible THIS WON'T WORK UNLESS WE CHECK AGAIN AT fireAll() :(
      const currentPosition = getXandY(this.current, {
        radius: this.config.radius, 
        angle: projectile.current.angle,
      });
      projectile.current.x = currentPosition.x;
      projectile.current.y = currentPosition.y;
      
    }

    // now that all projectiles have been updated we can evaluate the next
    // action based on elapsed time of the current state.
    if (this.status.isLoading && this.status.elapsedTime > this.config.loadTime) {
      // Loading state
      // if loaded then advance state else push a projectile to the next empty bay
      if (this.bay.length === this.config.count) {
        this.status.isLoading = false;
        this.status.isReady = true;
        this.status.elapsedTime = 0;
      } else {
        this.bay.push(this.loadNext());
        this.status.elapsedTime = 0;
      }
    } else if (this.status.isReady) {
      // Ready state
      // a player only fires on command, all others fire on ready
      if (!this.owner.isPlayer || game.keysDown.Space) {
        if (this.config.pattern && ++this.status.round < this.status.lastRound) {
          this.fireLine(this.status.round);
        } else if (this.config.pattern) {
          // end pattern proceed to wait
          this.status.round = -1;
          this.isReady = false;
          this.status.isWaiting = true;
          this.status.elapsedTime = 0;
        } else {
          this.fireAll();
          // update state
          this.status.isReady = false;
          this.status.isCooling = true;
          this.status.elapsedTime = 0;
        }
      }
    } else if (this.status.isCooling && this.status.elapsedTime > this.config.cooldownTime) {
      // Cooldown state
      this.status.isCooling = false;
      this.status.elapsedTime = 0;

      if (this.status.elapsedActiveTime > this.config.activeTime) {
        this.status.isWaiting = true;
      } else {
        this.status.isLoading = !this.config.rapidReload;
        this.status.isReady = this.config.rapidReload;
        this.current.isLeadShot = this.config.targetLeadShot;
      }    
    } else if (this.status.isWaiting && this.status.elapsedTime > this.config.waitTime) {
      // Waiting state
      this.status.isWaiting = false;
      this.status.isLoading = !this.config.rapidReload;
      this.status.isReady = this.config.rapidReload;
      this.status.elapsedActiveTime = 0;
      this.status.elapsedTime = 0;

      // if tracking then set flag to track next shot
      this.current.isLeadShot = this.config.targetLeadShot;
    }
  }

  draw() {
    if (this.config.viewTurret) {
      const ctx = this.owner.game.ctx;
      for (const projectile of this.bay) {
        projectile.draw(ctx);
      }
    }
  }

  fireAll() {
    // the projectiles have been updated so just add to game and replace again
    // this previously fired all and then looped back to reload. was that better?
    // console.log("fire");
    
    for (let i = 0; i < this.bay.length; i++) {
      const projectile = this.bay[i];
      this.owner.game.addEntity(projectile);

      if (this.config.rapidReload) {
        this.bay[i] = this.loadNext(projectile);
      }
    }

    // if we did not reload then clear-out the bay
    if (!this.config.rapidReload) {
      this.bay = [];
    }
  }

  fireLine(line) {
    let row = this.config.pattern.sequence[line];

    for (let i = 0; i < this.bay.length; i++) {
      const projectile = this.bay[i];
      
      if (row[i] === '1') {
        this.owner.game.addEntity(projectile);
      
        if (this.config.rapidReload) {
          this.bay[i] = this.loadNext(projectile);
        }
      
      }
    }

    // if we did not reload then clear-out the bay
    if (!this.config.rapidReload) {
      this.bay = [];
    }
  }


  /** this returns a new Projectile configured for launch. */
  loadNext(previous) {
    let origin;

    if (previous) {
      // we can duplicate the state of the projectile that was just launched
      origin = Object.assign({}, previous.current);
      origin.velocity = Object.assign({}, previous.current.velocity);
      origin.acceleration = Object.assign({}, previous.current.acceleration);
    } else {
      // compute new coordinates assuming we will push to the next ordered bay
      const angle = this.current.angle + this.bay.length * this.config.spacing;
      const velocity = this.payload.velocity || {
        radial: this.payload.speed,
        angular: 0,
      };
      const acceleration = this.payload.acceleration;

      const point = getXandY(this.current, { 
        radius: this.config.radius, 
        angle,
      });
      origin = {
        angle,
        velocity: {
          radial: velocity.radial,
          angular: velocity.angular,
        },
        acceleration: {
          radial: acceleration.radial,
          angular: acceleration.angular,
        },
        x: point.x,
        y: point.y,
      };
    }

    const manifest = {
      owner: this.owner,
      origin,
      payload: this.payload,
    };

    // return a configured projectile
    return new Projectile(this.owner.game, manifest);
  }

  /** returns the polar coordinates of the player with respect to the given point */
  getPlayerLocation(point) {
    const player = this.owner.game.player;
    const deltaX = player.current.x - point.x;
    const deltaY = player.current.y - point.y;
    const angle = Math.atan2(deltaY, deltaX);
    const radius = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    return {
      radius,
      angle,
    };
  }

  /** we can put other helpers here to help with guidance for homing missles. */
}


/**
 * The projectile class manages its own path given a velocity and acceleration.
 * This can transport a payload, and be represented by an image or sprite.
 */
class Projectile extends Entity {
  constructor(game, manifest) {
    super(game, { 
      x: manifest.origin.x,
      y: manifest.origin.y,
    });

    this.owner = manifest.owner;
    this.current = Object.assign({}, manifest.origin);
    this.payload = manifest.payload.type;
    this.hitTarget = false;

    this.config = {
      radius: this.payload.radius,
      isHoming: this.payload.isHoming,
      baseAngle: this.current.angle || manifest.angle || 0,
    };

    // support for origin format
    if (!this.current.angle) {
      this.current.angle = manifest.angle;
      this.current.velocity = { 
        radial: manifest.payload.speed, 
        angular: 0,
      };
      this.current.acceleration = { 
        radial: 0, 
        angular: 0,
      };
      this.payload.powerUp = manifest.payload.powerUp;
    } else {
      this.current.velocity = Object.assign({}, this.current.velocity);
      this.current.acceleration = Object.assign({}, this.current.acceleration);
    }


    // check for sprite or image and set desired function
    if (this.payload.image) {
      this.image = this.payload.image;
      this.scale = this.payload.scale;
      this.drawImage = this.drawStillImage;
    } else if (this.payload.sprite) {
      this.sprite = new Sprite(this.payload.sprite.default);
      this.drawImage = this.drawSpriteFrame;
      this.config.rotate = this.payload.rotate || false;
    } else {
      this.drawImage = this.payload.draw;
    }

    this.customUpdate = this.payload.update;
    this.playerShot = (this.owner === game.player);
  }

  update() {
    if (this.isOutsideScreen(this)) {
      this.removeFromWorld = true;
      return;
    }

    const previous = {
      x: this.current.x,
      y: this.current.y,
    };

    let deltaRadius = 0;

    if (this.customUpdate) {
      this.customUpdate(this);
    } else {
      const elapsedTime = this.game.clockTick;

      this.current.velocity.radial += this.current.acceleration.radial * elapsedTime;
      deltaRadius = this.current.velocity.radial * elapsedTime;

      this.current.velocity.angular += this.current.acceleration.angular * elapsedTime;
      this.current.angle += this.current.velocity.angular * elapsedTime;

      const point = getXandY(previous, { angle: this.current.angle, radius: deltaRadius });
      this.current.x = point.x;
      this.current.y = point.y;
    }
  }

  // default draw is used for sprite animations where draw() is not overriden
  draw(ctx) {
    if (!this.hitTarget) {
      ctx.save();

      // Using object deconstructing to access the fields withing the current object
      const {
        x,
        y,
        angle,
      } = this.current;

      if (this.config.rotate) {
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.translate(-x, -y);
      }
      this.drawImage(ctx, x, y);
      ctx.restore();
      super.draw();
    }
  }

  drawSpriteFrame(ctx, x, y) {
    this.sprite.drawFrame(this.game.clockTick, ctx, x, y);
  }

  drawStillImage(ctx, x, y) {
    const width = this.image.width * this.scale;
    const height = this.image.height * this.scale;

    const locX = x - width / 2;
    const locY = y - height / 2;
    ctx.drawImage(this.image, locX, locY, width, height);
  }
}


/**
 *  Returns {x,y} position of polar coordinates given the
 *  origin:{x, y} and current:{radius, angle} */
function getXandY(origin, current) {
  const x = origin.x + current.radius * Math.cos(current.angle);
  const y = origin.y + current.radius * Math.sin(current.angle);
  return { 
    x, 
    y,
  };
}

/** Convert from degrees to radians */
function toRadians(angle) {
  return angle * Math.PI / 180;
}

/** Convert from radians to degrees */
function toDegrees(rad) {
  return rad * 180 / Math.PI;
}
