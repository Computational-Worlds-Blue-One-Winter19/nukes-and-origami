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
    super(game, Ship.getInitPoint(game, manifest)); // super must be called first
    this.init(manifest); // then load the manifest
  }

  init(manifest) {
    // set required parameters
    this.sprite = manifest.sprite;
    
    // set optional parameters
    this.radius = manifest.radius || 50;
    this.snapLine = manifest.snapLine || 200;
    this.speed = manifest.snapLineSpeed || 50;
    this.snapLineWait = manifest.snapLineWait || 2;
    this.weaponsOnEntrance = manifest.weaponsOnEntrance || false;
    this.weaponsAdvantage = manifest.weaponsAdvantage || this.snapLineWait/2;
        
    if (manifest.path) {
      this.initializePath(manifest.path);
    }

    if (manifest.weapon) {
      this.initializeWeapon(manifest.weapon);
    }

    // additional fields
    this.idleTrans = false;
    this.idleCount = 0;
    this.lastFired = 0;
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
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    super.draw();
  }
  
  /** 
   * Collisions: detection checks bounds along canvas, collision with
   * player and collision with player bullets.
   * */
  updateCollisionDetection() {
    // Check upper y bounds if Crane has left the bottom of the screen
    if (this.y > this.game.surfaceHeight + this.radius) {
      this.disarm();  
      this.removeFromWorld = true;
      return;
    }
      
    // Check for collision with player    
    if (this.isCollided(this.game.player)) {
      this.game.onPlayerHit(this);
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
        this.path.currentStep++;
        
        if (this.path.currentStep === this.path.length) {
          // the path is completed then remove it from this instance
          this.path = null;
        } else {
          // update heading and speed
          let newCourse = this.path[this.path.currentStep];
  
          this.angle = newCourse[0] * Math.PI / 180;
          this.speed = newCourse[1];
          this.path.targetTime = newCourse[2];
          this.path.elapsedTime = 0;
        }
      } else if (this.speed) {
        // advance along path
        let radialDistance = this.speed * this.game.clockTick;
        this.x += radialDistance * Math.cos(this.angle);
        this.y += radialDistance * Math.sin(this.angle);
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
    this.y += this.speed * this.game.clockTick;
  
    // check for arrival at snapLine
    if (this.y >= this.snapLine) {
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
    this.weapon = new Weapon(this, manifest);
  }

  /**Helpers for repeated work. */
  // Idle hover effect
  idle() {
    if (this.idleTrans) {
      this.idleCount += 1;
      // TODO: you can make this simpler
      if (this.idleCount % 30 === 0) {
        this.y += 1;
      }
      if (this.idleCount === 300) {
        this.idleTrans = !this.idleTrans;
        this.idleCount = 0;
      }
    } else {
      this.idleCount += 1;
      if (this.idleCount % 30 === 0) {
        this.y -= 1;
      }
      if (this.idleCount === 300) {
        this.idleTrans = !this.idleTrans;
        this.idleCount = 0;
      }
    }
  }

  disarm() {
    for (let projectile of this.weapon.bay) {
      projectile.removeFromWorld = true;
    }
    this.bay = [];
  }

  static getInitPoint(game, manifest) {
    let width = manifest.radius || 50;
    let range = game.surfaceWidth - 2 * width;
    let x = manifest.originX || Math.floor(Math.random() * range) + width;
    let y = manifest.originY || -manifest.sprite.height;

    return {x: x, y: y};
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
  constructor(game, spritesheet) {
    super(game, Plane.getInitPoint(game));
    
    // set animation sprite sheets
    this.idle = new Sprite(spritesheet, 0, 0, 300, 330, 1, 0, 0.2, false);
    this.right = new Sprite(spritesheet, 300, 0, 300, 330, 1, 0, 0.2, false);
    this.left = new Sprite(spritesheet, 600, 0, 300, 330, 1, 0, 0.2, false);
    this.rollRight = new Sprite(spritesheet, 0, 330, 300, 330, 8, 0.15, 0.2, false);
    this.rollLeft = new Sprite(spritesheet, 0, 660, 300, 330, 8, 0.15, 0.2, false);
    this.sprite = this.idle;
    
    // initial parameters
    this.game = game;
    this.ctx = game.ctx;
    this.radius = 30;
    this.speed = 600;

    this.idleCount = 0;
  }

  update() {
    // It might be better to use a changeX and changeY variable
    // This way we apply a sprite depending on how the position has changed
    //console.log("called");
    if (this.isOutsideScreen()) {
      // correct all bounds
      this.x = Math.max(this.x, this.radius);
      this.x = Math.min(this.x, this.game.surfaceWidth - this.radius);
      this.y = Math.max(this.y, this.radius);
      this.y = Math.min(this.y, this.game.surfaceHeight - this.radius);
    }
    
    if(this.game.keysDown['ArrowLeft'])  {
      this.x -= this.speed * this.game.clockTick;
      this.sprite = this.left;
    }
    if(this.game.keysDown['ArrowRight']) {
      this.x += this.speed * this.game.clockTick;
      this.sprite = this.right;
    }
    if(this.game.keysDown['ArrowUp'])  {
      this.y -= this.speed * this.game.clockTick;
    }
    if(this.game.keysDown['ArrowDown'])  {
      this.y += this.speed * this.game.clockTick;
    } 
    if(this.game.keysDown['Space']) {
      let angle = -Math.PI / 2;

      // for now, a projectile for the player must have instantFire = true
      let newBullet = new Bullet(this.game, {
        owner: this,
        origin: {
          x: this.x,
          y: this.y - this.radius
        },
        angle: angle
      });
      newBullet.isSpawned = true;
      this.game.addEntity(newBullet);
      //this.game.keysDown['Space'] = false;
    }
    
    if(!this.game.keysDown['ArrowLeft'] && !this.game.keysDown['ArrowRight'] && !this.game.keysDown['ArrowUp'] && !this.game.keysDown['ArrowDown']) {
      this.sprite = this.idle;
      if (this.idleTrans) {
        this.idleCount += 1;
        // every 10 frames
        if (this.idleCount % 5 === 0) {
          this.y += 1;
        }
        // go other way every 60 frames
        if (this.idleCount === 30) {
          this.idleTrans = !this.idleTrans;
          this.idleCount = 0;
        }
      } else {
        this.idleCount += 1;
        if (this.idleCount % 5 === 0) {
          this.y -= 1;
        }
        if (this.idleCount === 30) {
          this.idleTrans = !this.idleTrans;
          this.idleCount = 0;
        }
      }
    }
  }

  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    super.draw();
  }

  static getInitPoint(game) {
    let x = game.ctx.canvas.width/2;
    let y = game.ctx.canvas.height - 100;
    return {x: x, y: y};
  }
}

/** A simple parent class for projectiles. */
class Projectile extends Entity {
  constructor(game, manifest) {
    super(game, manifest.origin);
    this.owner = manifest.owner;
    this.originX = manifest.origin.x;
    this.originY = manifest.origin.y;
    this.angle = manifest.angle;
    this.speed = manifest.speed;
    this.accel = manifest.accel;
    this.rotate = manifest.rotate;
    this.sprite = manifest.sprite;
    this.playerShot = (this.owner === game.player);
    this.radius = manifest.radius || 8;
    this.rapidReload = manifest.rapidReload;
    this.targeting = manifest.targeting;
  }

  update() {
    if (this.isOutsideScreen()) {
      this.removeFromWorld = true;
    } else if (this.isSpawned) {
      this.speed *= this.accel;
      this.speedX = this.speed * Math.cos(this.angle);
      this.speedY = this.speed * Math.sin(this.angle);
      
      this.x += this.speedX * this.game.clockTick;
      this.y += this.speedY * this.game.clockTick;
    } else {
      // adjust position relative to turret
      let point = this.owner.weapon.getTurretPosition(this.angle);
      this.x = point.x;
      this.y = point.y;  
    }
  }

  draw() {
    this.ctx.save();
    
    if (this.rotate) {
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate(this.angle);
      this.ctx.translate(-this.x, -this.y);
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    
    this.ctx.restore();
    super.draw();
  }
}

/**
 * A generic Weapon. The weapon has a payload and a cooldown period.
 * The position of the turret is sent to each enemy,
 * along with 
 */
class Weapon {
  constructor(owner, manifest) {
    this.owner = owner;
    this.payload = manifest.payload;
    this.loadTime = manifest.turretLoadTime;
    this.cooldownTime = manifest.turretCooldownTime;
    this.fullCount = manifest.turretCount;
    this.rapidReload = manifest.rapidReload;

    this.spacing = 2 * Math.PI / this.fullCount;
    this.bay = [];
    this.isLoaded = false;
    this.elapsedLoadTime = 0;
    this.elapsedFireTime = 0;
  }

  update() {
    let elapsedTime = this.owner.game.clockTick;

    if (this.isLoaded) {
      // manage firing sequence
      this.elapsedFireTime += elapsedTime;

      if (this.elapsedFireTime > this.cooldownTime) {
        this.fireAll();
        this.elapsedFireTime = 0;
        this.reload();
      }

    } else {
      // manage load sequence
      this.elapsedLoadTime += elapsedTime;

      if (this.elapsedLoadTime > this.loadTime) {
        this.elapsedLoadTime = 0;
        this.loadNext();
      }

      if (this.bay.length === this.fullCount) {
        this.isLoaded = true;
        this.elapsedLoadTime = 0;
      }
    }
  }

  fireAll() {
    for (let projectile of this.bay) {
      if (projectile.targeting) {
        //update heading before launch
        let target = this.getPlayerHeading(projectile.originX, projectile.originY);
        projectile.angle = target.angle;
        projectile.distance = target.distance;
      }

      projectile.isSpawned = true;
    }
  }

  reload() {
    this.bay = [];

    if (this.rapidReload) {
      for (let i = 0; i < this.fullCount; i++) {
        this.loadNext();
      }
     } else {
      this.isLoaded = false;
    }
    
  }

  loadNext() {
    let angle = this.bay.length * this.spacing;
    let origin = this.getTurretPosition(angle);

    let manifest = {
      owner: this.owner,
      origin: origin,
      angle: angle,
      speed: 30,
      accel: 1.05
    }

    let newProjectile = new this.payload(this.owner.game, manifest);
    this.bay.push(newProjectile);
    this.owner.game.addEntity(newProjectile);
  }

  getTurretPosition(angle) {
    let x = this.owner.radius * Math.cos(angle) + this.owner.x;
    let y = this.owner.radius * Math.sin(angle) + this.owner.y;
    return {x: x, y: y};
  }

  // returns the coordinates of the player with respect to the given point
  getPlayerHeading(originX, originY) {
    let player = this.owner.game.player;
    
    let deltaX = player.x - originX;
    let deltaY = player.y - originY;
    let angle = Math.atan2(deltaY, deltaX);
          
    return {
      angle: angle,
      distance: (deltaX * deltaX + deltaY * deltaY)
    };
  }

}

