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
    if (this.snapLine) {
      // we are enroute to the snapLine
      this.updateSnapPath();
    } else {
      // check all systems
      this.updateCollisionDetection();
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
    // Check upper y bounds if Crane has left the bottom of the screen
    if (this.current.y > this.game.surfaceHeight + this.config.radius) {
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
        this.path.currentStep++;

        if (this.path.currentStep === this.path.length) {
          // the path is completed then remove it from this instance
          this.path = null;
        } else {
          // update heading and speed
          const newCourse = this.path[this.path.currentStep];

          this.current.angle = newCourse[0] * Math.PI / 180;
          this.current.speed = newCourse[1];
          this.path.targetTime = newCourse[2];
          this.path.elapsedTime = 0;
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
    this.path = path;
    this.path.elapsedTime = 0;
    this.path.targetTime = 0;
    this.path.currentStep = -1;
  }

  initializeWeapon(manifest) {
    // do stuff here to configure a new weapon system.
    this.weapon = new Ring(this, manifest);
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
    const width = manifest.config.radius || 50;
    const range = game.surfaceWidth - 2 * width;
    const x = manifest.config.origin.x || Math.floor(Math.random() * range) + width;
    const y = manifest.config.origin.y || -manifest.config.sprite.default.height;

    return { x, y };
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
    // specific to rolling
    // double tap time in seconds
    this.doubleTapTime = 0.1;
    this.timeSinceLastLPress = 0;
    this.timeSinceLastRPress = 0;
    this.performingManeuver = false;
    this.rollDirection = '';
    this.rollDistance = 200;
    this.rollTimer = 0;
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

    if(this.invincTime != 0 && this.invincTime < this.invincDuration)  {
      this.invincTime += this.game.clockTick;
    } else if (this.invincTime > this.invincDuration) {
      this.invincTime = 0;
    }

    if (this.weapon) {
      this.weapon.update();
    }
    

    // Check if the plane has been hit by an enemy projectile
    this.updateCollisionDetection();

    // This makes me worry about an overflow, or slowing our game down.
    // But it works great for what we need.
    this.timeSinceLastSpacePress += this.game.clockTick;
    this.timeSinceLastLPress += this.game.clockTick;
    this.timeSinceLastRPress += this.game.clockTick;

    if (!this.performingManeuver) {
      if (this.game.keysDown.ArrowLeft && !this.game.keysDown.ArrowRight) {
        if (this.timeSinceLastLPress < this.doubleTapTime
          && this.sprite !== this.left) {
          this.performingManeuver = true;
          this.rollDirection = 'left';
          this.sprite = this.rollLeft;
        }
        this.timeSinceLastLPress = 0;
        this.current.x -= this.speed * this.game.clockTick;
        this.sprite = this.left;
      }
      if (this.game.keysDown.ArrowRight && !this.game.keysDown.ArrowLeft) {
        if (this.timeSinceLastRPress < this.doubleTapTime
          && this.sprite !== this.right) {
          this.performingManeuver = true;
          this.rollDirection = 'right';
          this.sprite = this.rollRight;
        }
        this.timeSinceLastRPress = 0;
        this.current.x += this.speed * this.game.clockTick;
        this.sprite = this.right;
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
      // We're rolling, call roll
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
      this.weapon
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
   * this.performingManeuver is true. This handles the maneuver and then returns
   * control to the user by setting this.performingManeuver to false.
   */
  performManeuver() {
    if (this.rollTimer > this.rollDistance) {
      this.rollTimer = 0;
      this.performingManeuver = false;
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
    }
    this.rollTimer += this.speed * this.game.clockTick * 1.5;
    this.sprite = this.rollRight;
  }

  draw() {
    if(this.invincTime > 0) {
      this.invincCtr += this.game.clockTick;
      if(this.invincCtr > 0.08) {
        
        this.blinking = !this.blinking;
        this.invincCtr = 0;
      }
    } else {
      this.blinking = false;
    }
    if(!this.blinking)  {
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
    }

    this.weapon.draw();
    super.draw();
  }

  /**
   * Collisions: Detects collision with
   * player and collision with enemy bullets.
   * */
  updateCollisionDetection() {
    // Check for hit from crane bullets
    for (let i = 0; i < this.game.entities.length; i += 1) {
      const entity = this.game.entities[i];
      if (entity instanceof Projectile && !entity.playerShot && this.isCollided(entity)) {
        this.game.onPlayerHit(this);
        entity.removeFromWorld = true;
      }
    }
  }

  returnToInitPoint(coordinate) {
    const { x, y } = coordinate;
    this.current.x = x;
    this.current.y = y;
  }

  static getInitPoint(game) {
    const x = game.ctx.canvas.width / 2;
    const y = game.ctx.canvas.height - 100;
    return { x, y };
  }
}

/** 
 * A simple parent class for projectiles. 
 * */
class Projectile extends Entity {
  constructor(game, manifest) {
    super(game, manifest.origin);
    this.owner = manifest.owner;
    this.origin = manifest.origin;
    this.current = manifest.origin;
    this.angle = manifest.angle;
    this.initialAngle = manifest.angle;
    this.payload = manifest.payload;
    this.rotation = manifest.rotation;

    // convert rotation angle to radians
    //this.rotation.angle = toRadians

    this.config = {
      radius: manifest.payload.type.radius
    }

    // set fields
    this.speed = manifest.payload.speed;
    this.acceleration = manifest.payload.acceleration;
    this.draw = manifest.payload.type.draw;
    this.playerShot = (this.owner === game.player);    
  }

  update() {
    if (this.isOutsideScreen()) {
      this.removeFromWorld = true;
    } else if (this.isSpawned) {
      this.speed *= this.acceleration;
      this.speedX = this.speed * Math.cos(this.angle);
      this.speedY = this.speed * Math.sin(this.angle);

      this.current.x += this.speedX * this.game.clockTick;
      this.current.y += this.speedY * this.game.clockTick;
    } else {
      // adjust position relative to turret
      if (!this.playerShot) {
        let delta = this.game.timer.getWave(toRadians(this.rotation.angle), this.rotation.frequency);
        this.angle = this.initialAngle + delta;
        //this.angle += toRadians(55);
        //console.log('delta:' + delta);
      } 
      let point = this.owner.weapon.getTurretPosition(this.angle);
      this.current.x = point.x;
      this.current.y = point.y;
    }
  }
  
  // default draw is used for sprite animations where draw() is not overriden
  draw() {
    this.ctx.save();

    if (this.rotate) {
      this.ctx.translate(this.current.x, this.current.y);
      this.ctx.rotate(this.angle);
      this.ctx.translate(-this.current.x, -this.current.y);
    }
    
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.current.x, this.current.y);
    this.ctx.restore();
    super.draw();
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
  
    // Functionality specific to CircleTargetWeapon
    this.baseAngle = toRadians(manifest.firing.angle) || 0;
    this.spacing = 2 * Math.PI / this.firing.count;
    this.bay = [];
    this.isLoaded = false;
    this.elapsedLoadTime = 0;
    this.elapsedFireTime = 0;
  }

  update() {
    const elapsedTime = this.owner.game.clockTick;

    if (this.owner.isPlayer && this.isLoaded) {
      this.elapsedFireTime += elapsedTime;

      // check for space bar
      if (this.owner.game.keysDown.Space && this.elapsedFireTime > this.firing.cooldownTime) {
        this.fireAll();
        this.elapsedFireTime = 0;
        this.reload();
      }
      
    } else if (this.isLoaded) {
      // manage firing sequence
      this.elapsedFireTime += elapsedTime;

      if (this.elapsedFireTime > this.firing.cooldownTime) {
        this.fireAll();
        this.elapsedFireTime = 0;
        this.reload();
      }
    } else {
      // manage load sequence
      this.elapsedLoadTime += elapsedTime;

      if (this.elapsedLoadTime > this.firing.loadTime) {
        this.elapsedLoadTime = 0;
        this.loadNext();
      }

      if (this.bay.length === this.firing.count) {
        this.isLoaded = true;
        this.elapsedLoadTime = 0;
      }
    }

    // update all bullets if in view
    if (this.firing.viewTurret) {
      for (let projectile of this.bay) {
        projectile.update();
      }

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
    for (let projectile of this.bay) {
      projectile.update();
      
      if (projectile.targeting) {
        // update heading before launch
        const target = this.getPlayerHeading(projectile.originX, projectile.originY);
        projectile.angle = target.angle;
        projectile.distance = target.distance;
      } 

      projectile.isSpawned = true;
      this.owner.game.addEntity(projectile);
    }
  }

  reload() {
    this.bay = [];

    if (this.firing.rapidReload) {
      for (let i = 0; i < this.firing.count; i++) {
        this.loadNext();
      }
    } else {
      this.isLoaded = false;
    }
  }

  loadNext() {
    // Add Math.PI/2 to make sure one bullet is always on the nose
    // const angle = this.bay.length * this.spacing + Math.PI / 2;
    // This is a good idea, but I commented out to debug something else! -Jared
    const angle = this.baseAngle + this.bay.length * this.spacing;
    const origin = this.getTurretPosition(angle);

    const manifest = {
      owner: this.owner,
      origin,
      angle,
      payload: this.payload,
      rotation: this.rotation
    };

    const newProjectile = new Projectile(this.owner.game, manifest);
    this.bay.push(newProjectile);
    //this.owner.game.addEntity(newProjectile);
  }

  getTurretPosition(angle) {
    const x = this.owner.config.radius * Math.cos(angle) + this.owner.current.x;
    const y = this.owner.config.radius * Math.sin(angle) + this.owner.current.y;
    return { x, y };
  }

  // returns the coordinates of the player with respect to the given point
  getPlayerHeading(originX, originY) {
    const player = this.owner.game.player;

    const deltaX = player.current.x - originX;
    const deltaY = player.current.y - originY;
    const angle = Math.atan2(deltaY, deltaX);

    return {
      angle,
      distance: (deltaX * deltaX + deltaY * deltaY),
    };
  }



// /**
//  * A generic Weapon. The weapon has a payload and a cooldown period.
//  * The position of the turret is sent to each enemy,
//  * along with
//  */
// class Weapon {
//   constructor(owner, manifest) {
//     this.owner = owner;
//     this.payload = manifest.payload;
//     this.loadTime = manifest.loadTime;
//     this.cooldownTime = manifest.cooldownTime;
//     this.fullCount = manifest.turretCount || 1;
//     this.rapidReload = manifest.rapidReload;
//     //this.targeting = manifest.targeting;
//     //this.bulletSpeed = manifest.bulletSpeed;
//     //this.bulletAcceleration = manifest.bulletAcceleration;
//     this.bay = [];
//     this.isLoaded = false;
//     this.elapsedLoadTime = 0;
//     this.elapsedFireTime = 0;
//   }

//   update() {
//     const elapsedTime = this.owner.game.clockTick;

//     if (this.isLoaded) {
//       // manage firing sequence
//       this.elapsedFireTime += elapsedTime;

//       if (this.elapsedFireTime > this.cooldownTime) {
//         this.fireAll();
//         this.elapsedFireTime = 0;
//         this.reload();
//       }
//     } else {
//       // manage load sequence
//       this.elapsedLoadTime += elapsedTime;

//       if (this.elapsedLoadTime > this.loadTime) {
//         this.elapsedLoadTime = 0;
//         this.loadNext();
//       }

//       if (this.bay.length === this.fullCount) {
//         this.isLoaded = true;
//         this.elapsedLoadTime = 0;
//       }
//     }
//   }

//   fireAll() {
//     for (let projectile of this.bay) {
//       if (this.targetPlayer) {
//         // update heading before launch
//         const target = this.getPlayerHeading(projectile.originX, projectile.originY);
//         projectile.angle = target.angle;
//         projectile.distance = target.distance;
//       } else {
//         // Fire straight down
//         projectile.angle = Math.PI / 2;
//         // Some large number to ensure the bullet goes off screen.
//         projectile.distance = 1000;
//       }

//       projectile.isSpawned = true;
//     }
//   }

//   reload() {
//     this.bay = [];

//     if (this.rapidReload) {
//       for (let i = 0; i < this.fullCount; i++) {
//         this.loadNext();
//       }
//     } else {
//       this.isLoaded = false;
//     }
//   }

//   loadNext() {
//     const angle = this.getPlayerHeading(this.owner.current.x, this.owner.current.y).angle;
//     const origin = this.getTurretPosition(angle);

//     const manifest = {
//       owner: this.owner,
//       origin,
//       angle,
//       payload: this.payload,
//       rotation: this.rotation
//     };

//     const newProjectile = new Projectile(this.owner.game, manifest);
//     this.bay.push(newProjectile);
//     this.owner.game.addEntity(newProjectile);
//   }

//   getTurretPosition(angle) {
//     const x = this.owner.config.radius * Math.cos(angle) + this.owner.current.x;
//     const y = this.owner.config.radius * Math.sin(angle) + this.owner.current.y;
//     return { x, y };
//   }

//   // returns the coordinates of the player with respect to the given point
//   getPlayerHeading(originX, originY) {
//     const player = this.owner.game.player;

//     const deltaX = player.current.x - originX;
//     const deltaY = player.current.y - originY;
//     const angle = Math.atan2(deltaY, deltaX);

//     return {
//       angle,
//       distance: (deltaX * deltaX + deltaY * deltaY),
//     };
//   }
// }



}
