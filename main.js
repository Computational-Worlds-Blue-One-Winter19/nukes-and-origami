/**
 * Main configuration for various game assets.
 * An enemy vessel extends Ship and declares a manifest with its attributes.
 * Attributes include path, weapon assembly, dimension and spritesheet details. 
 */

/** MANIFESTS FOR ENEMY SHIPS **/
class Crane extends Ship {
  constructor(game) {
    super(game, {
      path: [ [0,0,0] ],
      radius: 50,
      sprite: new Sprite(AM.getAsset('./img/crane-sheet.png'), 0, 0, 440, 330, 4, 0.1, 0.3, false),
      snapLine: 100,
      snapLineSpeed: 100,
      snapLineWait: 2,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
      weapon: {
        payload: Bullet,
        turretLoadTime: .1,
        turretCooldownTime: .4,
        turretCount: 10,
        rapidReload: true
      }
    });
  }
}

/**
 * A Bullet is only concerned about its own trajectory. Other Entity objects
 * will check for their own collision. If a Bullet leaves the screen, then
 * it will report back to its owner and then set removeFromWorld to true.
 * 
 * A Bullet is provided with an origin point and an initial angle and
 * distance to a target. It may then update its coordinates in any manner.
 * 
 * Consider puting shared functionality in the Projectile class. No
 * need to override draw(), but you can set the rotate flag to
 * true if the sprite has a clear orientation that should be rotated in
 * the direction of the heading. 
 */
class Bullet extends Projectile {
  constructor(game, manifest) {
    super(game, {
      owner: manifest.owner,
      origin: manifest.origin,
      angle: manifest.angle,
      distance: manifest.distance,
      sprite: new Sprite(AM.getAsset('./img/bullet.png'), 0, 0, 640, 320, 1, 0, 0.04, false),
      speed: manifest.speed || 50,
      accel: manifest.accel || 1.2,
      radius: 8,
      rotate: true
    });
    
    //this.isSpawned = true;
  }

  // a Projectile should override update() to give it unique behavior.
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
      super.update();
    }
  }
}

/**
 * Custom Animation Class.
 */
class Sprite {
  constructor(source, originX, originY, frameWidth, frameHeight, numberOfFrames,
    timePerFrame, scale, flip) {
    this.sheet = source; // Source spritesheet
    this.oriX = originX; // Top left X point of where to start on the spritesheet
    this.oriY = originY; // Top left Y point of where to start on the spritesheet
    this.width = frameWidth; // Pixel width of each frame
    this.height = frameHeight; // Pixel height of each frame
    this.len = numberOfFrames; // # of frames in this sprite (to let user pick
    // certain frames from a sheet containing multiple animations)
    this.time = timePerFrame; // time each frame should be displayed. If time = 0, don't loop
    this.scale = scale; // Size scale
    this.flip = flip; // BOOLEAN. Flip image over Y axis?
    this.totalTime = timePerFrame * numberOfFrames; // Not set by user
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
    
    var locX = x - (this.width/2) * this.scale;
    var locY = y - (this.height/2) * this.scale;
    
    ctx.drawImage(this.sheet,
        this.oriX + (this.width * this.currentFrame),
        this.oriY, // NOTE: does not work for spritesheets where one animation goes to next line!
        this.width,
        this.height,
        locX,
        locY,
        this.width * this.scale,
        this.height * this.scale);
    //}
    if (this.time !== 0) {
      this.currentFrame += 1;
    }
  }

  isDone() {
    return this.elapsedTime >= this.totalTime;
  }
}

/** 
 * NukesAndOrigami extends GameEngine and adds additional functions
 * to manage state, add assets, etc.
 */
class NukesAndOrigami extends GameEngine {
  constructor() {
    super();
    this.lives = 5;
    this.hits = 0;
  }

  // notification of ship destruction.
  onEnemyDestruction() {
    this.spawnEnemy();
    this.spawnEnemy();
  }

  // notification of player destruction.
  onPlayerHit() {
    
  }

  // eventually this should be scripted.
  spawnEnemy() {
    this.addEntity(new Crane(this));
  }

  // establishes a new player Plane
  spawnPlayer() {
    this.player = new Plane(this, AM.getAsset('./img/plane.png'));
    this.addEntity(this.player);
  }
}

/** Load assets and initialize the game. */
const AM = new AssetManager();

AM.queueDownload('./img/crane-sheet.png');
AM.queueDownload('./img/plane.png');
AM.queueDownload('./img/spacebg.png');
AM.queueDownload('./img/paper-wallpaper.png');
AM.queueDownload('./img/lined-paper.png');
AM.queueDownload('./img/bullet.png');
AM.queueDownload('./img/slippy_roll.png');
AM.queueDownload('./img/slippy_end.png');
AM.queueDownload('./img/slippy_greatjob.png');
AM.queueDownload('./img/slippy_inbound.png');
AM.queueDownload('./img/slippy_mission_done.png');
AM.queueDownload('./img/nuke_single.png');

AM.downloadAll(() => {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');
  const game = new NukesAndOrigami();

  game.showOutlines = true;
  game.init(ctx);
  game.spawnPlayer();
  game.start();
  game.spawnEnemy();
  console.log('All Done!');
});




// we should get back to the following code for narration and background...

  // const slippyArr = [AM.getAsset('./img/slippy_inbound.png'),
  //   AM.getAsset('./img/slippy_roll.png'),
  //   AM.getAsset('./img/slippy_greatjob.png'),
  //   AM.getAsset('./img/slippy_mission_done.png'),
  //   AM.getAsset('./img/slippy_end.png')];
  //gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/spacebg.png'), 0, 0));
  //gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/spacebg.png'), 0, -screenWidth));
  // gameEngine.addEntity(new Slippy(gameEngine, slippyArr));
  // gameEngine.addEntity(new Nuke(gameEngine, AM.getAsset('./img/nuke_single.png')));
  // gameEngine.addEntity(new Bullet(gameEngine, AM.getAsset('./img/bullet.png')));

  // We should get back to this stuff for narration and background

  // class Background extends Entity {
  //   constructor(game, spritesheet, xCoordinate, yCoordinate) {
  //     super(game, xCoordinate, yCoordinate);
  //     this.x = xCoordinate;
  //     this.y = yCoordinate;
  //     this.spritesheet = spritesheet;
  //     this.game = game;
  //     this.ctx = game.ctx;
  //   }
  
  //   draw() {
  //     this.ctx.drawImage(this.spritesheet,
  //       this.x, this.y);
  //   }
  
  //   update() {
  //     this.y += 5;
  //     if (this.y === screenWidth) {
  //       this.y = -screenWidth;
  //     }
  //   }
  // }
  
  // class Slippy extends Entity {
  //   constructor(game, spritesheet) {
  //     super(game, 200, 700);
  //     this.x = 200;
  //     this.y = 700;
  
  //     this.start = spritesheet[0];
  //     this.roll = spritesheet[1];
  //     this.greatJob = spritesheet[2];
  //     this.missionDone = spritesheet[3];
  //     this.end = spritesheet[4];
  //     // this.spritesheet = this.start;
  //     this.game = game;
  //     this.ctx = game.ctx;
  //     this.byeslippy = this.ctx;
  //   }
  
  //   draw() {
  //     if (this.game.timer.gameTime >= 1 && this.game.timer.gameTime <= 3) {
  //       this.ctx.drawImage(this.start, this.x, this.y, 1000, 350);
  //     } else if (this.game.timer.gameTime >= 6.5 && this.game.timer.gameTime <= 8) {
  //       this.ctx.drawImage(this.roll, this.x, this.y, 1000, 350);
  //     } else if (this.game.timer.gameTime > 10 && this.game.timer.gameTime <= 12) {
  //       this.ctx.drawImage(this.greatJob, this.x, this.y, 1000, 350);
  //     } else if (this.game.timer.gameTime > 14 && this.game.timer.gameTime < 16) {
  //       this.ctx.drawImage(this.missionDone, this.x, this.y, 1000, 350);
  //     } else if (this.game.timer.gameTime > 16.2 && this.game.timer.gameTime <= 18.5) {
  //       this.ctx.drawImage(this.end, this.x, this.y, 1000, 350);
  //     }
  //   }
  
  //   // update() {
  //   // console.log(this.game.timer.gameTime);
  //   // if(this.game.timer.gameTime >= 10) {
  //   // console.log("call");
  //   // this.draw();
  //   // }
  //   // }
  // }
  
  
  // class Nuke extends Entity {
  //   constructor(game, spritesheet, x, y) {
  //     super(game, x, y);
  //     this.sprite = new Sprite(spritesheet, 0, 0, 320, 232, 25, 0.02, 1, true);
  //     this.game = game;
  //     this.ctx = game.ctx;
  //     this.done = false;
  //     this.radius = 25;
  //   }
  
  //   draw() {
  //     this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  //   }
  
  //   update() {
  //     if (this.sprite.currentFrame === this.sprite.len) {
  //       this.done = true;
  //       this.removeFromWorl
  //   }
  //   }
   
  // }