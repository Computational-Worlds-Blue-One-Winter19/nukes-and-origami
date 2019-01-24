const AM = new AssetManager();

const screenWidth = 1035;
const screenHeight = 1410;

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
    // if (this.flip) {
    //   ctx.save();
    //   ctx.scale(-1, 1);
    //   ctx.drawImage(this.sheet,
    //     this.oriX + (this.width * this.currentFrame),
    //     this.oriY, // NOTE: does not work for spritesheets where one animation goes to next line!
    //     this.width,
    //     this.height,
    //     x * -1, // Flip
    //     y,
    //     this.width * this.scale,
    //     this.height * this.scale);
    //   ctx.restore();
    // } else {
    // console.log("draw");
    // console.log("cutting out X:" + (this.oriX + (this.width * this.currentFrame)) + ", Y: " + this.oriY);
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

class Background extends Entity {
  constructor(game, spritesheet, xCoordinate, yCoordinate) {
    super(game, xCoordinate, yCoordinate);
    this.x = xCoordinate;
    this.y = yCoordinate;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet,
      this.x, this.y);
  }

  update() {
    this.y += 5;
    if (this.y === screenWidth) {
      this.y = -screenWidth;
    }
  }
}


class Slippy extends Entity {
  constructor(game, spritesheet) {
    super(game, 200, 700);
    this.x = 200;
    this.y = 700;

    this.start = spritesheet[0];
    this.roll = spritesheet[1];
    this.greatJob = spritesheet[2];
    this.missionDone = spritesheet[3];
    this.end = spritesheet[4];
    // this.spritesheet = this.start;
    this.game = game;
    this.ctx = game.ctx;
    this.byeslippy = this.ctx;
  }

  draw() {
    if (this.game.timer.gameTime >= 1 && this.game.timer.gameTime <= 3) {
      this.ctx.drawImage(this.start, this.x, this.y, 1000, 350);
    } else if (this.game.timer.gameTime >= 6.5 && this.game.timer.gameTime <= 8) {
      this.ctx.drawImage(this.roll, this.x, this.y, 1000, 350);
    } else if (this.game.timer.gameTime > 10 && this.game.timer.gameTime <= 12) {
      this.ctx.drawImage(this.greatJob, this.x, this.y, 1000, 350);
    } else if (this.game.timer.gameTime > 14 && this.game.timer.gameTime < 16) {
      this.ctx.drawImage(this.missionDone, this.x, this.y, 1000, 350);
    } else if (this.game.timer.gameTime > 16.2 && this.game.timer.gameTime <= 18.5) {
      this.ctx.drawImage(this.end, this.x, this.y, 1000, 350);
    }
  }

  // update() {
  // console.log(this.game.timer.gameTime);
  // if(this.game.timer.gameTime >= 10) {
  // console.log("call");
  // this.draw();
  // }
  // }
}


class Nuke extends Entity {
  constructor(game, spritesheet, x, y) {
    super(game, x, y);
    this.sprite = new Sprite(spritesheet, 0, 0, 320, 232, 25, 0.02, 1, true);
    this.game = game;
    this.ctx = game.ctx;
    this.done = false;
    this.radius = 25;
  }

  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  }

  update() {
    if (this.sprite.currentFrame === this.sprite.len) {
      this.done = true;
      this.removeFromWorl
  }
  }
 
}


// (source, originX, originY, frameWidth, frameHeight, numberOfFrames, timePerFrame, scale, flip)
// Crane will enter from above and move to snapLine defined by x,y
class Crane extends Entity {

  constructor(game, spritesheet, x, y) {
    super(game, x, -100);
    this.sprite = new Sprite(spritesheet, 0, 0, 440, 330, 4, 0.1, 0.7, false);
    this.originalScale = 0.7;
    // 0.7 scaled x = 550
    this.speed = 50;
    this.game = game;
    this.ctx = game.ctx;
    this.isIdle = false;
    this.idleTrans = false;
    this.idleCount = 0;
    this.alive = true; // y = 550
    this.radius = 90;
    this.snapLine = y;

    this.lastFired = 0;
  }


  draw() {
    if (this.alive) { this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y); }
    super.draw();
  }

  update() {
    if (this.isCollided(this.game.player)) {
      this.game.player.removeFromWorld = true;
      this.game.spawnPlayer();
    }

    // Check bullets
    for (let e of this.game.entities) {
      if (e instanceof Bullet && e.planeshot && this.isCollided(e)) {
        this.removeFromWorld = true;
        e.removeFromWorld = true;
        this.game.spawnCrane();
      }
    }
    
    if (this.y < this.snapLine) {
      this.y += this.speed * this.game.clockTick;
    } else {
      this.isIdle = true;
    }

    this.lastFired += this.game.clockTick;
    if (this.lastFired > 2) {
      // determine position of player
      let deltaX = this.game.player.x - this.x;
      let deltaY = this.game.player.y - this.y;
      let angle = Math.atan2(deltaY, deltaX);
          
      //position bullet
      let bulletX = this.radius * Math.cos(angle) + this.x;
      let bulletY = this.radius * Math.sin(angle) + this.y;

      //console.log('angle:' + angle + ' x,y:' + bulletX + ',' + bulletY);
      let bullet = new Bullet(this.game, AM.getAsset('./img/bullet.png'), bulletX, bulletY, angle);
      bullet.craneshot = true;
      bullet.spawned = true;
      this.game.addEntity(bullet);
      
      this.lastFired = 0;
    }


    //if (this.game.timer.gameTime > 12.4) {
    //  this.alive = false;
    //}
    // Idle hover effect
    if (this.isIdle) {
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
    // console.log(`update crane: ${this.x}`);
  }
}

class Plane extends Entity {
  constructor(game, spritesheet) {
    super(game, game.ctx.canvas.width/2, game.ctx.canvas.height * .75);
    
    // set animation sprite sheets
    this.idle = new Sprite(spritesheet, 0, 0, 300, 330, 1, 0, 0.4, false);
    this.right = new Sprite(spritesheet, 300, 0, 300, 330, 1, 0, 0.4, false);
    this.left = new Sprite(spritesheet, 600, 0, 300, 330, 1, 0, 0.4, false);
    this.rollRight = new Sprite(spritesheet, 0, 330, 300, 330, 8, 0.15, 0.4, false);
    this.rollLeft = new Sprite(spritesheet, 0, 660, 300, 330, 8, 0.15, 0.4, false);
    this.sprite = this.idle;
    
    // initial parameters
    this.game = game;
    this.ctx = game.ctx;
    this.radius = 40;
    this.speed = 600;

    this.moving = false;
    this.turn = false;
    this.isIdle = false;
    this.idleTrans = false;
    this.idleCount = 0;
    this.moveLeft = 0;
    this.moveRight = 0;
    this.moveUp = 0;
    this.moveDown = 0;   
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
      let bullet = new Bullet(this.game, AM.getAsset('./img/bullet.png'), this.x, this.y - this.radius, angle);
      bullet.planeshot = true;
      bullet.spawned = true;
      this.game.addEntity(bullet);

      this.game.keysDown['Space'] = false;
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
}

// (source, originX, originY, frameWidth, frameHeight, numberOfFrames, timePerFrame, scale, flip)
class Bullet extends Entity {
  constructor(game, spritesheet, x, y, angle) {
    super(game, x, y);
    this.sprite = new Sprite(spritesheet, 0, 0, 640, 320, 1, 0, 0.04, false);
    this.game = game;
    this.ctx = game.ctx;
    this.speed = 500;
    this.radius = 20;
        
    this.angle = angle || Math.PI / 2;
    this.speedX = this.speed * Math.cos(this.angle);
    this.speedY = this.speed * Math.sin(this.angle);

    this.spawned = false;
    this.repeated = false;
    this.craneshot = false;
    this.planeshot = false;
  }

  update() {
    if (this.isOutsideScreen()) {
      this.removeFromWorld = true;
      return;
    }
        
    this.x += this.speedX * this.game.clockTick;
    this.y += this.speedY * this.game.clockTick;
  }

  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    // if (this.craneshot) {
    //   this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleLeftX1, this.y);
    //   this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleLeftX2, this.y);
    //   this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleRightX1, this.y);
    //   this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleRightX2, this.y);
    // }
  }
}


/** NukesAndOrigami extends GameEngine and adds additional functions
 *  to manage state, add assets, etc.
 */
class NukesAndOrigami extends GameEngine {
  constructor() {
    super();
    this.lives = 5;
    this.hits = 0;
  }

  spawnCrane() {
    let range = this.surfaceWidth - 2 * 90;
    let x = Math.floor(Math.random() * range) + 90;
    this.addEntity(new Crane(this, AM.getAsset('./img/crane-sheet.png'), x, 180));
  }

  spawnPlayer() {
    let x = this.surfaceWidth / 2;
    let y = this.surfaceHeight - 50 * 2;
    this.player = new Plane(this, AM.getAsset('./img/plane.png', x, y));
    this.addEntity(this.player);
  }
}

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

  game.spawnCrane();

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

  console.log('All Done!');
});