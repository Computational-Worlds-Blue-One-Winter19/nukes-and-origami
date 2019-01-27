/**
 * Main configuration for various game assets.
 * An enemy vessel extends Ship and declares a manifest with its attributes.
 * Attributes include path, weapon assembly, dimension, spritesheet details and hit value. 
 */

/** MANIFESTS FOR ENEMY SHIPS **/
class Crane extends Ship {
  constructor(game) {
    super(game, {
      hitValue: 5,
      path: [ [0,0,4], [180,20,5], [0,0,6], [90,35,10], [90,85,60] ],  // heading,speed,duration
      radius: 50,
      sprite: new Sprite(AM.getAsset('./img/crane-sheet.png'), 0, 0, 440, 330, 4, 0.1, 0.3, false),
      snapLine: 100,
      snapLineSpeed: 100,
      originY: -50,
      snapLineWait: 2,
      weaponsOnEntrance: false,
      weaponsAdvantage: 0,
      weapon: {
        payload: CircleBullet,
        turretLoadTime: .05,
        turretCooldownTime: .5,
        turretCount: 25,
        rapidReload: true,
        targeting: true
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
 * You can set the rotate flag to true if the sprite has a clear orientation.
 * You can also override draw() to make unique patterns. If targeting = true
 * then the bullet will get an updated angle to the player before firing,
 * otherwise the angle is from the turret position.
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
      rotate: true,
      targeting: true // will set target angle at launch
    });
    //this.isSpawned = true;
  }
}


/** Circle bullet from Nathan. */
class CircleBullet extends Projectile   {
  constructor(game, manifest) {
    super(game, {
      owner: manifest.owner,
      origin: manifest.origin,
      angle: manifest.angle,
      distance: manifest.distance,
      targeting: true,
      speed: 500,
      accel: 1.01,
      radius: 10      
    });  
  }
  
  draw()  {
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.x, this.y, this.radius, 0*Math.PI, 2*Math.PI);
    this.game.ctx.stroke();
    this.game.ctx.fill();  
  }
}

/** Circle bullet from Nathan. Jared can't get this to work. I was hoping to
 * see one using De Castelijau's algorithm. 
*/
class SmartCircle extends Projectile   {
  constructor(game, manifest) {
    super(game, {
      owner: manifest.owner,
      origin: manifest.origin,
      angle: manifest.angle,
      distance: manifest.distance,
      speed: 50,
      accel: 1,
      radius: 300
    });  
  }
  
  draw() {
    this.game.ctx.strokeRect(390, 390, 20, 20);
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.x, this.y, 10, 0*Math.PI, 2*Math.PI);
    this.game.ctx.stroke();
    this.game.ctx.fill();
  };

  update() {
    this.x = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.x + Math.pow(this.t, 2) * this.game.player.x;
    this.bulletY = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.y + Math.pow(this.t, 2) * this.game.player.y;
    this.t += 0.01;
    if(this.t >= 1) {
        this.t = 0;
    }
    this.x = this.radius * Math.cos(this.toRadians(this.angle)) + 10;
    this.y = this.radius * Math.sin(this.toRadians(this.angle)) - 10;
    this.angle += 10;
  }
  
  toRadians(angle) {
    return angle * (Math.PI / 180);
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
    this.score = 0;

    // Initilize the game board
    initializeScoreBoardLives(this.lives)
  }

  // notification of ship destruction.
  onEnemyDestruction() {
    this.spawnEnemy();
    this.spawnEnemy();
  }

  // notification of player destruction.
  onPlayerHit(player) {
    this.lives -= 1;
    removeLifeFromBoard()
    console.log("Player hit called");
    if (this.lives === 0) { // game over 
      this.gameOver()
    } else {
      player.returnToInitPoint(Plane.getInitPoint(this))
    }
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

  // Increases the current player's score by the given value
  increaseScoreBy(value) {
    this.score += value;
    updateScoreBoard(this.score);
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

  //game.showOutlines = true;
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