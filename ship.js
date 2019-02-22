/**
 * Custom Animation Class.
 */
class Sprite {
  constructor(config) {
    this.sheet = config.image; // Source spritesheet
    this.oriX = config.dimension.originX; // Top left X point of where to start on the spritesheet
    this.oriY = config.dimension.originY; // Top left Y point of where to start on the spritesheet
    this.initialY = this.oriY;
    this.width = config.dimension.frameWidth; // Pixel width of each frame
    this.height = config.dimension.frameHeight; // Pixel height of each frame
    this.len = config.dimension.frameCount; // # of frames in this sprite (to let user pick
    // certain frames from a sheet containing multiple animations)
    this.time = config.dimension.timePerFrame; // time each frame should be displayed.
    this.loop = config.dimension.loop;
    this.scale = config.dimension.scale; // Size scale
    this.flip = config.dimension.flip; // BOOLEAN. Flip image over Y axis?
    this.totalTime = config.dimension.timePerFrame * config.dimension.frameCount; // Not set by user
    this.elapsedTime = 0; // Not set by user
    this.currentFrame = 0;
    this.hitDuration = 0.08;
    this.remainingHitDuration = 0;
    this.remainingHitInterval = 0;
}

  drawFrame(tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.time !== 0) {
      if (this.elapsedTime >= this.totalTime && this.loop) { // The isDone() function does exactly this. Use either.
        // All frames used. Start over to loop.
        this.elapsedTime = 0;
      }

      if (this.loop) {
        this.currentFrame = (Math.floor(this.elapsedTime / this.time)) % this.len;
      } else {
        this.currentFrame = Math.floor(this.elapsedTime / this.time);
      }

      // handle hit flickering
      if (this.remainingHitDuration > 0) {
        this.remainingHitInterval -= tick;
        this.remainingHitDuration -= tick;
        if (this.remainingHitInterval < 0 && this.oriY === 0) {
          //this.remainingHitInterval = this.hit.interval;
          this.remainingHitInterval = this.hitDuration;
          this.oriY = this.height;
        } else if (this.remainingHitInterval < 0) {
          //this.remainingHitInterval = this.hit.interval;
          this.remainingHitInterval = this.hitDuration;
          this.oriY = 0;
        }
      } else {
        // done with this hit so reset oriY
        this.oriY = this.initialY;
      }
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
  }

  isDone() {
    return this.elapsedTime >= this.totalTime;
  }

  onHit() {
    this.remainingHitDuration = this.hitDuration;
    this.remainingHitInterval = this.hitDuration;
    this.oriY = this.height;
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
    this.defaultSprite = new Sprite(manifest.config.sprite.default);
    this.hitSprite = new Sprite(manifest.config.sprite.hit);
    //this.deathAnimation = new Sprite(sprite.explosion.default);
    // store class constants in config
    this.config = Object.assign({}, manifest.config);
    this.config.radius = this.config.radius || 50;
    this.config.hitValue = this.config.hitValue || 1;
    this.snapLine = this.config.snapLine || 100;
    this.initialDirection = this.config.initialDirection || 'south';
    this.snapLineSpeed = this.config.snapLineSpeed || 300;
    this.hitValue = this.config.hitValue;

    // additional fields
    this.idleTrans = false;
    this.idleCount = 0;
    this.lastFired = 0;
    this.timeSinceHit = 0;
    this.health = manifest.config.health;

    // initialize any included weapon and path
    if (manifest.path) {
      this.initializePath(manifest.path);
    }

    this.initializeWeapon(manifest.weapon);
  }

  update() {
    if (this.config.waitOffScreen > 0) {
      this.config.waitOffScreen -= this.game.clockTick;
    } else if (this.snapLine) {
      // we are enroute to the snapLine
      this.updateSnapPath();
    } else {
      // check all systems
      this.updateHelm();
      this.updateCollisionDetection();
      this.weapon.update();
    }
    // sprite change when hit:
    if (this.timeSinceHit != 0) {
      this.timeSinceHit += this.game.clockTick;
    }
    if (this.timeSinceHit >= 0.1) {
      // this.defaultSprite.currentFrame = this.sprite.currentFrame - 1;
      this.sprite = this.defaultSprite;
      this.timeSinceHit = 0;
    }
    if (this.health <= 0) {
      this.disarm();
      this.game.onEnemyDestruction(this);
      this.game.addEntity(new Death(this.game, this.current.x, this.current.y));
      this.removeFromWorld = true;

    }
    super.update();
  }

  draw() {
    //if (this.health > 0) { // alive
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
    // }
    // if (this.health <= 0) { // dead, draw my explosion
    //   this.deathAnimation.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
    // }
    this.weapon.draw();
    super.draw();
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
      if (e instanceof Projectile && e.playerShot && this.isCollided(e)) {
        e.onHit(this); // notify projectile
        this.health -= e.config.hitValue;
        //manifest.config.sprite.hit
        //this.sprite.currentFrame
        //this.hitSprite.currentFrame = this.sprite.currentFrame + 1;
        //this.sprite = this.hitSprite;
        //this.timeSinceHit += this.game.clockTick;
        this.sprite.onHit();
      }
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
    switch (this.initialDirection) {
      case 'north':
        this.current.y -= this.snapLineSpeed * this.game.clockTick;
        // check for arrival at snapLine
        if (this.current.y <= this.snapLine) {
          this.snapLine = null;
        }
        break;
      case 'south':
        this.current.y += this.snapLineSpeed * this.game.clockTick;
        if (this.current.y >= this.snapLine) {
          this.snapLine = null;
        }
        break;
      case 'west':
        this.current.x -= this.snapLineSpeed * this.game.clockTick;
        if (this.current.x <= this.snapLine) {
          this.snapLine = null;
        }
        break;
      case 'east':
        this.current.x += this.snapLineSpeed * this.game.clockTick;
        if (this.current.x >= this.snapLine) {
          this.snapLine = null;
        }
        break;
    }
  }

  initializePath(path) {
    this.path = Object.assign({}, path);
    this.path.elapsedTime = 0;
    this.path.targetTime = 0;
    this.path.currentStep = -1;
  }

  initializeWeapon(weaponManifest) {
    this.weapon = new Weapon(this, weaponManifest);
  }

  disarm() {
    this.weapon = new Weapon(this);
  }

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

  static getInitPoint(game, manifest) {
    let x;
    let y;

    // Handle cases for all directions to snap line
    // Start it in the middle off the screen it will be coming from.
    switch (manifest.config.initialDirection) {
      case 'north':
        x = 512;
        y = game.surfaceHeight + manifest.config.sprite.default.dimension.frameHeight / 2;
        break;
      case 'south':
        x = 512;
        y = -manifest.config.sprite.default.dimension.frameHeight / 2;
        break;
      case 'west':
        x = game.surfaceWidth + manifest.config.sprite.default.dimension.frameWidth / 2;
        y = 768 / 2;
        break;
      case 'east':
        x = -manifest.config.sprite.default.dimension.frameWidth / 2;
        y = 768 / 2;
        break;
      default:
        // top middle
        x = 512;
        y = -manifest.config.sprite.default.dimension.frameHeight / 2;
        break;
    }

    // Is origin specified?
    if (manifest.config.origin) {
      x = manifest.config.origin.x || x;
      y = manifest.config.origin.y || y;
    }

    return {
      x,
      y,
    };
  }
} // end of Ship class

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
        hideControlMessage();
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

    if (!this.game.keysDown.ArrowLeft
      && !this.game.keysDown.ArrowRight
      && !this.game.keysDown.ArrowUp
      && !this.game.keysDown.ArrowDown
      && !this.performingManeuver) {
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

    this.weapon.draw();
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

          // Call the weapon.onHit method to remove turrets if needed
          if (!this.weapon.hasRegularGun) {
            this.weapon.onHit();
          }
        }
        entity.onHit(this); // notify projectile
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
} // end of Plane class


/**
 * The weapon class holds and controls a collection of rings.
 */
class Weapon {
  constructor(owner, manifest) {
    this.owner = owner;
    this.slot = new Array();

    this.saveGun = null;

    // Used to keep track of any weapons that the player may have picked up, for now
    // the first one is activated
    this.inventory = [];
    this.timer = null;
    this.lastTimeAPressed = 0;
    this.originalManifest = null;

    this.hasNuke = false;

    // This is to prevent duplicate homing missile weapons from being added to the inventory
    // We can decide how to handle this later
    this.hasRegularGun = true;

    // construct and mount the rings
    if (manifest instanceof Array) {
      this.primaryRingManifest = manifest[0].ring;
      // Save a reference of the original manifest
      this.originalManifest = this.primaryRingManifest;

      // process the multi-ring format
      for (let i = 0; i < manifest.length; i++) {
        var r = new Ring(owner, manifest[i].ring);
        const offset = manifest[i].offset || { x: 0, y: 0 };

        this.slot.push({
          ring: r,
          offset,
        });
      }
    } else if (manifest) {
      this.primaryRingManifest = manifest;

      // process the single-ring format
      var r = new Ring(owner, manifest);

      this.slot.push({
        ring: r,
        offset: { x: 0, y: 0 },
      });
    }

    // ring[0] is the primary ring for the player
    // ring[1] is mounted to the left
  }

  /**
   * Weapons: manage turret initialization, rotation, firing and cooldown.
   */
  update() {
    // assume that this.current has been updated to Ship's x,y postion
    const {
      x,
      y,
    } = this.owner.current;

    for (let i = 0; i < this.slot.length; i++) {
      const weapon = this.slot[i];

      weapon.ring.current.x = x + weapon.offset.x;
      weapon.ring.current.y = y + weapon.offset.y;

      weapon.ring.update();
    }

    // Check if the player is activating a weapon from their inventory
    if (this.owner.game.keysDown.KeyA) {

      if (this.lastTimeAPressed === 0) { // record the time the key was pressed
        this.lastTimeAPressed = this.owner.game.timer.gameTime;

        // Activate the weapon
        // Get the first item in the inventory
        const weaponActivation = this.inventory.shift();
        if (weaponActivation) {
          weaponActivation();
        }
      } else if (this.owner.game.timer.gameTime - this.lastTimeAPressed >= 1) {
        // Activate the weapon
        // Get the first item in the inventory
        const weaponActivation = this.inventory.shift();
        if (weaponActivation) {
          weaponActivation();
        }
      }

    }

    // evaluate firing decision
    if (this.owner.isPlayer && this.owner.game.keysDown.Space) {
      // you could separate these mappings here or just fire all
      // or check if one is ready to play sound.
      // let ready = this.slot[0].ring.isReady;

      for (let i = 0; i < this.slot.length; i++) {
        const ready = this.slot[i].ring.status.isReady
        if (ready) {
          this.slot[i].ring.fire()
          if(this.hasNuke)  {

            this.slot[0] = Object.assign({}, this.saveGun);
            this.hasNuke = false;
            this.saveGun = null;
          }
        }
      }
    } else if (!this.owner.isPlayer) {
      // an enemy always fires when ready
      for (let i = 0; i < this.slot.length; i++) {
        this.slot[i].ring.fire();
      }
    }
  }

  loadHomingMissile(type, callback) {
    // we can load this and keep count of how many times it has been fired
    console.log("Loading the missile type");
    const maxUse = 1;

    if (this.slot.length !== 1) {
      // Remove the current missile loaded
      this.slot.pop();
      stopTimer(this.timer);
    }

    // if (this.slot.length === 1) {
    // mount the homing missle
    const r = new Ring(this.owner, type);
    const offset = { x: -12, y: 44 };

    this.slot.push({
      ring: r,
      offset,
    });


    callback();
  }

  loadNuke(callback)  {
    this.saveGun = Object.assign({}, this.slot[0]);
    this.slot[0].ring = new Ring(this.owner, ring.nuke);
    this.hasNuke = true;
    callback();
  }

  // loadChainGun(type, callback) {
  //   // we can load this and keep count of how many times it has been fired
  //   const maxUse = 1;

  //   if (this.slot.length !== 1) {
  //     // Remove the current missile loaded
  //     this.slot.pop();
  //     stopTimer(this.timer);
  //   }

  //   // if (this.slot.length === 1) {
  //   // mount the chain gun
  //   const r = new Ring(this.owner, type);
  //   const offset = { x: -12, y: 44 };

  //   this.slot.push({
  //     ring: r,
  //     offset,
  //   });

  //   callback();
  // }

  /**
   * Removes the homing missile from the given weapon
   * @param {Weapon} weapon The weapon whose homing missile will be removed
   */
  removeHomingMissile(weapon) {
    weapon.slot.pop();
  }

  decreaseCoolDown() {
    // already works inside the powerUp. decrement primary ring cooldown
    // until it reaches a minimum value

  }

  addTurret() {
    if (this.hasRegularGun) {
      // Reset the firing count, this is needed because the object is mutuable and won't be reset from
      // the last time the player had the mutli gun object
      ring.multiGun.firing.count = 1;
      ring.multiGun.firing.spread = 0;


      // We need to switch it out to the multiGun
      // ring.multiGun
      this.primaryRingManifest = Object.assign({}, ring.multiGun);
      // Update bool to indicate gun was switched out
      this.hasRegularGun = false;
    }
    const maxCount = 5;
    const primary = this.slot[0];
    const manifest = this.primaryRingManifest;

    if (manifest.firing.count < maxCount) {
      manifest.firing.count += 1;
      manifest.firing.spread += 50.5;

      primary.ring = new Ring(this.owner, manifest);
    }

    // the damage value is in the Ship, so we may want to move that to the projectile
    // or is it already there? i'm not sure there is some inconsistency...

    // add an additional turret to the primary weapon.
    // this will require constructing a new Ring with the new count
    // and we can also scale down the damage value
  }

  removeTurret() {
    const primary = this.slot[0];

    // Decrease the turret count
    this.primaryRingManifest.firing.count -= 1;

    // If the firing count is equal to one we need to switch back to the regular gun
    if (this.primaryRingManifest.firing.count === 1) {
      this.primaryRingManifest = this.originalManifest;
      this.hasRegularGun = true;
    }


    // Update the players ring
    primary.ring = new Ring(this.owner, this.primaryRingManifest);

  }

  onHit() {
    // remove a turret. we could hold on to the previous ones and then swap
    // out and call update again. or just build a new one?
    // for now this can use the ship's hit box. maybe in the future use the ring's?

    this.removeTurret();
  }

  draw() {
    for (let i = 0; i < this.slot.length; i++) {
      this.slot[i].ring.draw();
    }
  }
}


/**
 * The ring holds a collection of bullets and updates/maintains their position prior to launch.
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
      this.status.roundLength = pattern.sequence.length;
      this.status.round = this.status.roundLength;
      this.config.waitTime = pattern.delay;
      this.config.rapidReload = true;
    }
  }

  update() {
    const game = this.owner.game;
    this.status.elapsedTime += game.clockTick;

    // update active time counter; used for the pulse delay
    this.status.elapsedActiveTime += game.clockTick;

    // ring center position is updated by the Ship before calling this method.
    // we only need to adjust the angle for bay[0] if this ring is rotating.
    if (this.fixedRotation) {
      const doublePI = 2 * Math.PI;
      const delta = doublePI * this.fixedRotation * game.clockTick;
      this.current.angle += delta;
    } else if (this.sineAmplitude) {
      const delta = game.timer.getWave(this.sineAmplitude, this.sineFrequency);
      this.current.angle = this.config.baseAngle + delta;
    } else if (this.current.isLeadShot || this.config.targetPlayer) {
      // moved target logic to here. this will aim the
      const target = game.getPlayerLocation(this.current);
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
    } else if (this.status.isCooling && this.status.elapsedTime > this.config.cooldownTime) {
      // Cooldown state
      this.status.isCooling = false;
      this.status.elapsedTime = 0;

      if (this.status.elapsedActiveTime > this.config.activeTime) {
        this.status.isWaiting = true;
      } else {
        this.status.isLoading = !this.config.rapidReload;
        this.status.isReady = this.config.rapidReload;
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

  // this method is used by the weapon controller to fire the ring.
  // pre-condition: ring.isReady = true
  // post-condition: one round is fired, and the ring is in cooldown state
  fire() {
    if (!this.status.isReady) {
      return;
    }

    if (this.owner.isPlayer) {
      var sound = new Howl({
        src: ['audio/laserShot.mp3'],
        volume: 0.2,
      });

      sound.play();
    }

    if (this.config.pattern && --this.status.round > -1) {
      this.fireLine(this.status.round);
      this.status.isReady = false;
      this.status.isCooling = true;
      this.status.elapsedTime = 0;
    } else if (this.config.pattern) {
      // end pattern proceed to wait
      this.status.round = this.status.roundLength;
      this.status.isReady = false;
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

    for (let i = 0; i < this.bay.length; i++) {
      const projectile = this.bay[i];
      projectile.init();
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
    const row = this.config.pattern.sequence[line];
    const last = this.bay.length - 1;

    for (let i = 0; i < this.bay.length; i++) {
      const projectile = this.bay[i];

      if (row[last - i] === 1) {
        projectile.init();
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
} // end of Ring class

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

    this.config = {
      radius: this.payload.radius,
      baseAngle: this.current.angle || manifest.angle || 0,
      hitValue: this.payload.hitValue || 1,
    };

    this.local = Object.assign({}, this.payload.local);

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

    // override default methods
    if (this.payload.init) {
      this.init = this.payload.init;
    }

    if (this.payload.onHit) {
      this.onHit = this.payload.onHit;
    }

    if (this.payload.draw) {
      this.draw = this.payload.draw;
    }

    // check for sprite or image and set desired function
    if (this.payload.image) {
      this.image = this.payload.image;
      this.scale = this.payload.scale || 1;
      this.drawImage = this.drawStillImage;
    } else if (this.payload.sprite) {
      this.sprite = new Sprite(this.payload.sprite.default);
      this.drawImage = this.drawSpriteFrame;
    } else {
      this.drawImage = this.drawCircle;
      this.colorFill = manifest.payload.type.colorFill;
    }

    this.config.rotate = this.payload.rotate || false;
    this.customUpdate = this.payload.update;
    this.playerShot = (this.owner === game.player);
  }

  /** Computes new position in polar coordinates using current velocity and acceleration.
   *  A projectile that overrides update() agrees to use current.x and current.y for origin,
   *  and store new polar coordinates in current.r and current.angle.
   */
  update() {
    if (this.isOutsideScreen(this)) {
      this.removeFromWorld = true;
      return;
    }

    const previous = {
      x: this.current.x,
      y: this.current.y,
    };

    this.current.elapsedTime = this.game.clockTick;

    if (this.customUpdate) {
      this.customUpdate(this);
    } else {
      const elapsedTime = this.current.elapsedTime;

      this.current.velocity.radial += this.current.acceleration.radial * elapsedTime;
      this.current.r = this.current.velocity.radial * elapsedTime;

      this.current.velocity.angular += this.current.acceleration.angular * elapsedTime;
      this.current.angle += this.current.velocity.angular * elapsedTime;
    }

    // update x,y coordinates for game engine.
    const point = getXandY(previous, { angle: this.current.angle, radius: this.current.r });
    this.current.x = point.x;
    this.current.y = point.y;
    this.current.r = 0;
  }

  // default behavior: set removeFromWorld flag
  onHit() {
    this.removeFromWorld = true;
  }

  init() {
    // not used by default; may be used for custom projectiles to init before launch.
  }

  // used by projectiles for image/sprite support. custom shapes can override draw().
  draw(ctx) {
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

  drawCircle(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = this.colorFill;
    // console.log(this.colorFill);
    ctx.fill();
  }
}

class Death  {
  constructor(game, x, y) {
    this.game = game;
    this.ctx = game.ctx;
    this.x = x;
    this.y = y;
    this.sprite = new Sprite(sprite.explosion.default);
  }

  draw()  {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  }

  update() {
    if(this.sprite.isDone())  {
      this.removeFromWorld = true;
    }
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
