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
 *
 *     sprite: the Sprite to represent this object
 *     snapLine: the horizontal line that a ship must reach prior to becoming active
 *     snapLineSpeed: the initial speed to travel (default 50)
 *     snapLineWait: time to wait on snapLine before initiating path and player interaction
 *     weaponsOnEntrance: if true then weapons will be activated prior to stepLine
 *     weaponsAdvantage: specifies the amount of time before snapLineWait that weapons activate.
 *
 * Overriding: consider adding functionality to the Enemy class.
 */

/** The Ship Class */
class Ship extends Entity {
  constructor(game, manifest) {
    super(game, Ship.getInitPoint(game, manifest));
    this.sprite = new Sprite(manifest.config.sprite.default);

    // set parameters
    this.config = manifest.config;
    this.snapLine = this.config.snapLine;

    // additional fields
    this.idleTrans = false;
    this.idleCount = 0;
    this.lastFired = 0;

    if (manifest.path) {
      this.initializePath(manifest.path);
    }

    if (manifest.weapon) {
      this.initializeWeapon(manifest.weapon);
    }
  }

  update() {
    if (this.config.waitOffScreen > 0) {
      this.config.waitOffScreen -= this.game.clockTick;
    } else if (this.snapLine) {
      // we are enroute to the snapLine
      this.updateSnapPath();
    } else {
      // check all systems
      //this.updateCollisionDetection();
      this.updateWeapons();
      this.updateHelm();
    }
    super.update();
  }

  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
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
    for (let e of this.game.entities) {
      if (e instanceof Projectile && e.playerShot && this.isCollided(e)) {
        e.removeFromWorld = true;
        this.disarm();
        this.removeFromWorld = true;
        this.game.onEnemyDestruction(this);
      }
    }
  }

  /**
   * Weapons: manage turret initialization, rotation, firing and cooldown.
   */
  updateWeapons() {
    this.weapon.update();
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
          let newCourse = this.path[this.path.currentStep];

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
    this.current.y += this.config.snapLineSpeed * this.game.clockTick;

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
    // do stuff here to configure a new weapon system.
    this.weapon = new Ring(this, weaponManifest);
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

  static getInitPoint(game, manifest) {
    let width = manifest.config.radius || 50;
    let range = game.surfaceWidth - 2 * width;
    let x = manifest.config.origin.x || Math.floor(Math.random() * range) + width;
    let y = manifest.config.origin.y || -manifest.config.sprite.default.height;

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
/** MANIFEST FOR THE PLAYER PLANE (Not a Ship) */
class Plane extends Entity {
  constructor(game, manifest) {
    super(game, Plane.getInitPoint(game));
    this.config = manifest.config;
    this.isPlayer = true;

    // load sprites
    this.idle = new Sprite(manifest.config.sprite.default);
    this.left = new Sprite(manifest.config.sprite.left);
    this.right = new Sprite(manifest.config.sprite.right);
    this.rollLeft = new Sprite(manifest.config.sprite.rollLeft);
    this.rollRight = new Sprite(manifest.config.sprite.rollRight);

    // load weapon
    if (manifest.weapon) {
      this.weapon = new Ring(this, manifest.weapon);
    }

    // initial parameters
    this.sprite = this.idle;
    this.game = game;
    this.ctx = game.ctx;
    this.speed = this.config.speed || 400;
    this.rollDirection = '';
    this.rollDistance = 200;
    this.rollTimer = 0;
    this.rolling = false;
    // specific to shooting
    this.timeSinceLastSpacePress = 0;
    this.fireRate = 0.25;
    this.invincTime = 0;
    this.invincDuration = 2;
    this.invincCtr = 0;
    this.blinking = false;
    this.idleCount = 0;
  }

  update() {
    // It might be better to use a changeX and changeY variable
    // This way we apply a sprite depending on how the position has changed
    // console.log("called");
    if (this.isOutsideScreen()) {
      // correct all bounds
      this.current.x = Math.max(this.current.x, this.config.radius);
      this.current.x = Math.min(this.current.x, this.game.surfaceWidth - this.config.radius);
      this.current.y = Math.max(this.current.y, this.config.radius);
      this.current.y = Math.min(this.current.y, this.game.surfaceHeight - this.config.radius);
    }

    if (this.invincTime != 0 && this.invincTime < this.invincDuration) {
      this.invincTime += this.game.clockTick;
    } else if (this.invincTime > this.invincDuration) {
      this.invincTime = 0;
    }

    if (this.weapon) {
      this.weapon.update();
    }

    // Check if the plane has been hit by an enemy projectile
    //this.updateCollisionDetection();

    // This makes me worry about an overflow, or slowing our game down.
    // But it works great for what we need.
    // this.timeSinceLastSpacePress += this.game.clockTick;
    if (!this.rolling) {
      if (this.game.keysDown.ArrowLeft && !this.game.keysDown.ArrowRight) {
        if (this.game.keysDown.KeyC) {
          this.rollDirection = 'left';
          this.rolling = true;
          this.performManeuver();
        } else {
          this.current.x -= this.speed * this.game.clockTick;
          this.sprite = this.left;
        }
      }
      if (this.game.keysDown.ArrowRight && !this.game.keysDown.ArrowLeft) {
        if (this.game.keysDown.KeyC) {
          this.rollDirection = 'right';
          this.rolling = true;
          this.performManeuver();
        } else {
          this.current.x += this.speed * this.game.clockTick;
          this.sprite = this.right;
        }
      }
      if (this.game.keysDown.ArrowLeft && this.game.keysDown.ArrowRight) {
        this.sprite = this.idle;
      }
      if (this.game.keysDown.ArrowUp) {
        this.current.y -= this.speed * this.game.clockTick;
      }
      if (this.game.keysDown.ArrowDown) {
        this.current.y += this.speed * this.game.clockTick;
      }
    } else {
      this.performManeuver();
    }

    if (this.game.keysDown.Space) {
      // if (this.timeSinceLastSpacePress > this.fireRate) {
      //   this.timeSinceLastSpacePress = 0;
      //   // for now, a projectile for the player must have instantFire = true
      //   const newBullet = new Bullet(this.game, {
      //     owner: this,
      //     origin: {
      //       x: this.current.x,
      //       y: this.current.y - this.config.radius,
      //     },
      //     angle: -Math.PI / 2,
      //   });
      //   newBullet.isSpawned = true;
      //   this.game.addEntity(newBullet);
      //   // this.game.keysDown['Space'] = false;
      // }

      // call ring to handle firing
      this.weapon;
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
      this.current.x -= this.speed * this.game.clockTick * 1.5;
      this.sprite = this.rollLeft;
    }
    if (this.rollDirection === 'right') {
      this.current.x += this.speed * this.game.clockTick * 1.5;
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
    super.draw();
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
          entity.payload.powerUp(); // for now just run the enclosed powerUp

          entity.removeFromWorld = true;
        } else {
          // hit by enemy bullet
          this.game.onPlayerHit(this);
          entity.removeFromWorld = true;
        }
      }
    }// end for loop
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
    let x = game.ctx.canvas.width / 2;
    const y = game.ctx.canvas.height - 100;
    return {
      x,
      y,
    };
  }
}


/** New Projectile */
/** 
 * A simple parent class for projectiles. 
 * */
class Projectile extends Entity {
  constructor(game, manifest) {
    super(game, getXandY(manifest.origin, manifest.current));
    
    manifest = Object.assign({}, manifest);
    
    this.owner = manifest.owner;
    this.current = Object.assign({}, manifest.current);
    this.current.velocity = Object.assign({}, manifest.current.velocity);
    this.current.acceleration = Object.assign({}, manifest.current.acceleration);

    // convert angles to radians
    this.current.velocity.angular = toRadians(this.current.velocity.angular);
    this.current.acceleration.angular = toRadians(this.current.acceleration.angular);
    
    this.type = manifest.type;

    // check for sprite or image and set desired function
    if (this.type.image) {
      this.image = this.type.image;
      this.scale = this.type.scale;
      this.drawImage = this.drawStillImage;
    } else if (this.type.sprite) {
      this.sprite = new Sprite(this.type.sprite.default);
      this.drawImage = this.drawSpriteFrame;
      this.rotate = this.type.rotate;
    } else {
      this.drawImage = this.type.draw;
    }
    
    this.config = {
      radius: manifest.type.radius
    }

    this.draw = manifest.type.draw;
    this.customUpdate = manifest.type.update;
    this.playerShot = (this.owner === game.player);    
  }

  update() {
    if (this.isOutsideScreen(this)) {
      this.removeFromWorld = true;
      return;
    }
    
    let previous = {
      x: this.current.x,
      y: this.current.y,
    }

    if (this.customUpdate) {
      this.customUpdate(this);
    } else {
      let elapsedTime = this.game.clockTick;
      this.current.velocity.radial += this.current.acceleration.radial * elapsedTime;
      this.current.radius = this.current.velocity.radial * elapsedTime;
      //this.current.velocity.angular += this.acceleration.angular * elapsedTime;
      this.current.angle += this.current.velocity.angular * elapsedTime;      
    }

    let point = getXandY(previous, this.current);
    this.current.x = point.x;
    this.current.y = point.y;
  }
  
  // default draw is used for sprite animations where draw() is not overriden
  draw() {
    ctx.save();

      // Using object deconstructing to access the fields withing the current object
      const {
        x,
        y,
      } = this.current;

      if (this.rotate) {
        ctx.translate(x, y);
        ctx.rotate(this.angle);
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

}


/**
 * This weapon spawns a circle of bullets around the enemy and then fires them all at once at the player
 */
class Ring {
  constructor(owner, manifest) {
    this.owner = owner;
    this.payload = manifest.payload;
    this.rotation = manifest.rotation;
    this.firing = manifest.firing;
    this.radius = manifest.firing.radius || this.owner.config.radius;
    this.bay = [];

    // support for constant and sine rotation
    if (this.rotation && this.rotation.speed) {
      this.fixedRotation = this.rotation.speed;
    } else if (this.rotation && this.rotation.angle) {
      this.sineAmplitude = toRadians(this.rotation.angle);
      this.sineFrequency = this.rotation.frequency || 1;
    }

    // compute spacing and adjust base angle
    this.initialAngle = toRadians(manifest.firing.angle) || 0;
    this.firing.count = manifest.firing.count || 1;
    this.spacing = 0;   
    let spread = 0;
    
    if (manifest.firing.spread && this.firing.count > 1) {
      spread = toRadians(manifest.firing.spread);
      this.spacing = spread / (this.firing.count - 1);
    } else if (this.firing.count > 1) {
      this.spacing = 2 * Math.PI / this.firing.count;
    } 
    
    this.initialAngle -= spread/2;
    this.currentAngle = this.initialAngle;
        
    // set firing parameters
    this.loadTime = this.firing.loadTime;
    this.coolTime = this.firing.cooldownTime;
        
    if (this.firing.pulse) {
      this.activeTime = this.firing.pulse.duration;
      this.waitTime = this.firing.pulse.delay;      
    } else {
      this.activeTime = Infinity;
      this.waitTime = 0;
    }

    // set firing conditionals
    this.elapsedTime = 0;
    this.elapsedActiveTime = 0;
    this.isLoading = true;
    this.isReady = false;
    this.isCooling = false;
    this.isWaiting = false;

    // convert old speed/accel to new format
  //   if (this.payload.acceleration && !this.payload.acceleration.radial) {
  //     const radial = this.payload.acceleration;
  //     this.payload.acceleration = { radial: radial, angular: 0 }
  //   }

  //   if (this.payload.speed && !this.payload.speed.radial) {
  //     const radial = this.payload.speed;
  //     this.payload.velocity = { radial: radial, angular: 0 }
  //   }
  }

  update() {
    this.elapsedTime += this.owner.game.clockTick;
    
    // update active time counter
    if (!this.isWaiting) {
      this.elapsedActiveTime += this.elapsedTime;
    }

    // compute current angle
    if (this.fixedRotation) {
      let doublePI = 2 * Math.PI;
      let delta = doublePI * this.fixedRotation * this.owner.game.clockTick;
      this.currentAngle = (this.currentAngle + delta) % doublePI;
    } else if (this.sineAmplitude) {
      let delta = this.owner.game.timer.getWave(this.sineAmplitude, this.sineFrequency);
      this.currentAngle = this.initialAngle + delta;
    } 

    // update each turret
    for (let i = 0; i < this.bay.length; i++) {
      this.bay[i].current.angle = this.currentAngle + i * this.spacing;

      let currentPosition = getXandY(this.owner.current, this.bay[i].current);
      this.bay[i].current.x = currentPosition.x;
      this.bay[i].current.y = currentPosition.y;
    }

    // if we 

    // take some action based on weapon state
    if (this.isLoading && this.elapsedTime > this.loadTime) {

      // check if loaded
      if (this.bay.length === this.firing.count) {
        this.isLoading = false;
        this.isReady = true;
        this.elapsedTime = 0;
      } else {
        this.loadNext();
      }
    } else if (this.isReady) {
      // a player only fires on command
      if (this.owner.isPlayer && !this.owner.game.keysDown.Space) {
        return;
      }
      this.fireAll();
    } else if (this.isCooling && this.elapsedTime > this.coolTime) {
      this.isCooling = false;
      this.isLoading = true;
      this.elapsedTime = 0;
    } else if (this.isWaiting && this.elapsedTime > this.waitTime) {
      this.isWaiting = false;
      this.isLoading = true;
      this.elapsedActiveTime = 0;
      this.elapsedTime = 0;
    }
  }
  
  draw() {
    if (this.firing.viewTurret) {
      const ctx = this.owner.game.ctx;
      
      for (let projectile of this.bay) {
        projectile.draw(ctx);
      }

    }
  }

  fireAll() {
    let shipLocation = {
      x: this.owner.current.x,
      y: this.owner.current.y,
    }
    
    let playerLocation = null;

    if (this.firing.targetPlayer) {
      // get player coordinates relative to this Ship
      playerLocation = this.getPlayerLocation(shipLocation);
    }
    
    for (let projectile of this.bay) {
      // projectile.current.x = shipLocation.x;
      // projectile.current.y = shipLocation.y;
      // projectile.target = playerLocation;
      this.owner.game.addEntity(projectile);
    }

    // if rapid reload then force them in
    if (this.firing.rapidReload) {
      this.reload();
    }

    // set next state to cooldown or waiting
    this.isReady = false;
    this.elapsedTime = 0;

    if (this.elapsedActiveTime > this.activeTime) {
      this.isWaiting = true;
    } else {
      this.isCooling = true;
    }
  }

  reload() {
    this.bay = [];

    if (this.firing.rapidReload) {
      for (let i = 0; i < this.firing.count; i++) {
        this.loadNext();
      }
    } 
  }

  loadNext() {
    let angle = this.currentAngle + this.bay.length * this.spacing;
    let velocity = this.payload.velocity || {radial: this.payload.speed, angular: 0 };
    let acceleration = this.payload.acceleration;

    // add missing acceleration or convert from old format
    if (!acceleration) {
      acceleration = {radial: 0, angular: 0};
    } else if (!(acceleration instanceof Object)) {
      acceleration = {radial: acceleration, angular: 0};
    }

    const manifest = {
      owner: this.owner,
      origin: this.owner.current,
      current: {
        radius: this.radius,
        angle: angle,
        velocity: velocity,
        acceleration: acceleration,
      },
      type: this.payload.type
    };
    console.dir(manifest);

    const newProjectile = new Projectile(this.owner.game, manifest);
    this.bay.push(newProjectile);
  }

  // returns the polar coordinates of the player with respect to the given point
  getPlayerLocation(point) {
    const player = this.owner.game.player;
    const deltaX = player.current.x - point.x;
    const deltaY = player.current.y - point.y;
    const angle = Math.atan2(deltaY, deltaX);

    return {
      radius: deltaX * deltaX + deltaY * deltaY,
      angle: angle
    };
  }

}

/** Get x and y coordinates given origin:{x, y} and current:{r, theta} */
function getXandY(origin, current) {
  let x = origin.x + current.radius * Math.cos(current.angle);
  let y = origin.y + current.radius * Math.sin(current.angle);
  return {x:x, y:y}
}

function toRadians(angle) {
  return angle * Math.PI / 180;
}

function toDegrees(rad) {
  return rad * 180 / Math.PI; 
}
