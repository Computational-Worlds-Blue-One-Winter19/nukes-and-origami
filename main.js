const AM = new AssetManager();

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
    if (this.flip) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(this.sheet,
        this.oriX + (this.width * this.currentFrame),
        this.oriY, // NOTE: does not work for spritesheets where one animation goes to next line!
        this.width,
        this.height,
        x * -1, // Flip
        y,
        this.width * this.scale,
        this.height * this.scale);
      ctx.restore();
    } else {
    // console.log("draw");
    // console.log("cutting out X:" + (this.oriX + (this.width * this.currentFrame)) + ", Y: " + this.oriY);
      ctx.drawImage(this.sheet,
        this.oriX + (this.width * this.currentFrame),
        this.oriY, // NOTE: does not work for spritesheets where one animation goes to next line!
        this.width,
        this.height,
        x,
        y,
        this.width * this.scale,
        this.height * this.scale);
    }
    if (this.time !== 0) {
      this.currentFrame += 1;
    }
  }

  isDone() {
    return this.elapsedTime >= this.totalTime;
  }
}

class Background extends Entity {
  constructor(game, spritesheet) {
    super(game, 0, 0);
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet,
      this.x, this.y);
  }

  // update() {
  // };
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
  constructor(game, spritesheet) {
    super(game, 850, -25);
    this.sprite = new Sprite(spritesheet, 0, 0, 320, 232, 25, 0.02, 1, true);
    this.game = game;
    this.ctx = game.ctx;
    this.done = false;
    // Entity.call(game, 850, -25);
  }

  // Nuke.prototype = new Entity();
  // Nuke.prototype.constructor = Nuke;

  draw() {
    if (this.game.timer.gameTime >= 12.3 && !this.done) {
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
      if (this.sprite.currentFrame === this.sprite.len) {
        this.done = true;
      }
    }
  }

  // update() {

  // }
}


// (source, originX, originY, frameWidth, frameHeight, numberOfFrames, timePerFrame, scale, flip)
class Crane extends Entity {
  constructor(game, spritesheet) {
    super(game, 550, -110);
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
    // this.Entity = new Entity();
    // this.Entity.apply(this, game, 550, -110);
    // Entity.call(this, game, 550, -110);
    // x += ((x * oldscale - newscale) / 2)
    // y += ((y * oldscale - newscale) / 2)
  }


  draw() {
    if (this.alive) { this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y); }
  }

  update() {
    if (this.y <= 0) {
      this.y += this.speed * this.game.clockTick;
    } else {
      this.isIdle = true;
    }
    if (this.game.timer.gameTime > 12.4) {
      this.alive = false;
    }
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

// Crane.prototype = new Entity();
// Crane.prototype.constructor = Crane;


class Plane extends Entity {
  constructor(game, spritesheet) {
    super(game, 650, 1500);
    this.idle = new Sprite(spritesheet, 0, 0, 300, 330, 1, 0, 0.4, false);
    this.right = new Sprite(spritesheet, 300, 0, 300, 330, 1, 0, 0.4, false);
    this.left = new Sprite(spritesheet, 600, 0, 300, 330, 1, 0, 0.4, false);
    this.rollRight = new Sprite(spritesheet, 0, 330, 300, 330, 8, 0.15, 0.4, false);
    this.rollLeft = new Sprite(spritesheet, 0, 660, 300, 330, 8, 0.15, 0.4, false);
    this.sprite = this.idle;
    this.speed = 500;
    this.turn = false;
    this.game = game;
    this.ctx = game.ctx;
    this.isIdle = false;
    this.idleTrans = false;
    this.idleCount = 0;
    // Entity.call(this, game, 650, 1500);
  }

  // Plane.prototype = new Entity();
  // Plane.prototype.constructor = Plane;

  update() {
    if (this.y >= 600) {
      this.y -= this.speed * this.game.clockTick;
      this.isIdle = true;
    }
    if (this.game.timer.gameTime > 7 && this.game.timer.gameTime < 8) {
      this.isIdle = false;
      this.sprite = this.rollLeft;
      if (this.sprite.currentFrame > 0) {
        this.x -= 350 * this.game.clockTick;
      }
    }
    if (this.game.timer.gameTime > 8 && this.sprite.isDone) {
      this.isIdle = true;
      this.sprite = this.idle;
    }
    if (this.game.timer.gameTime > 9 && this.x <= 650) {
      this.isIdle = false;
      this.sprite = this.right;
      this.x += this.speed * this.game.clockTick;
    }
    if (this.game.timer.gameTime > 18 && this.game.timer.gameTime < 20) {
      this.sprite = this.right;
      this.isIdle = false;
      this.x += this.speed * this.game.clockTick;
      // console.log(this.x);
      this.y -= this.speed * this.game.clockTick;
    }
    if (this.game.timer.gameTime > 20) {
      this.x = 650;
      this.y = 1500;
      this.game.timer.gameTime = 0;
    }
    // Idle hover effect
    if (this.isIdle) {
      if (this.idleTrans) {
        this.idleCount += 1;
        // every 10 frames
        if (this.idleCount % 10 === 0) {
          this.y += 1;
        }
        // go other way every 50 frames
        if (this.idleCount === 50) {
          this.idleTrans = !this.idleTrans;
          this.idleCount = 0;
        }
      } else {
        this.idleCount += 1;
        if (this.idleCount % 10 === 0) {
          this.y -= 1;
        }
        if (this.idleCount === 50) {
          this.idleTrans = !this.idleTrans;
          this.idleCount = 0;
        }
      }
    }
  }

  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  }
}

// (source, originX, originY, frameWidth, frameHeight, numberOfFrames, timePerFrame, scale, flip)
class Bullet extends Entity {
  constructor(game, spritesheet) {
    super(game, -50, -50);
    this.sprite = new Sprite(spritesheet, 0, 0, 640, 320, 1, 0, 0.04, false);
    this.game = game;
    this.speed = 500;
    this.angleLeftX1 = 690;
    this.angleLeftX2 = 690;
    this.angleRightX1 = 690;
    this.angleRightX2 = 690;
    this.ctx = game.ctx;
    this.spawned = false;
    this.repeated = false;
    this.craneshot = false;
    this.planeshot = false;
    // Entity.call(this, game, -50, -50); // start off screen
    // 685, 580 = right in front of plane.
  }

  update() {
    if (this.game.timer.gameTime > 7 && this.game.timer.gameTime < 7.1) {
      this.x = 690;
      this.y = 200;
      this.spawned = true;
      this.craneshot = true;
    }
    if ((this.spawned && this.craneshot) || (this.repeated && this.craneshot)) {
      // this.y -= this.speed * this.game.clockTick; Bullet from plane
      this.y += this.speed * this.game.clockTick;
      this.angleLeftX1 -= this.speed * this.game.clockTick;
      this.angleLeftX2 -= this.speed / 2 * this.game.clockTick;
      this.angleRightX1 += this.speed * this.game.clockTick;
      this.angleRightX2 += this.speed / 2 * this.game.clockTick;
    }
    if (this.y > 700 && !this.repeated && this.craneshot) {
      this.repeated = true;
      this.x = 690;
      this.y = 200;
      this.angleLeftX1 = 690;
      this.angleLeftX2 = 690;
      this.angleRightX1 = 690;
      this.angleRightX2 = 690;
    }
    // if(this.repeated  && this.craneshot)   {
    // this.y += this.speed * this.game.clockTick;
    // }
    if (this.repeated && this.y > 700 && this.craneshot) {
      // hide bullet
      this.x = -500;
      this.y = -500;
      this.repeated = false;
      this.craneshot = false;
    }
    if (this.game.timer.gameTime > 11.5 && this.game.timer.gameTime < 11.6) {
      this.planeshot = true;
      this.x = 690;
      this.y = 585;
    }
    if (this.planeshot) {
      this.y -= this.speed * this.game.clockTick;
    }
    if (this.planeshot && this.y <= 200) {
      this.planeshot = false;
      console.log(this.game.timer.gameTime);
      this.x = -500;
      this.y = -500;
    }
  }


  draw() {
    this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    if (this.craneshot) {
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleLeftX1, this.y);
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleLeftX2, this.y);
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleRightX1, this.y);
      this.sprite.drawFrame(this.game.clockTick, this.ctx, this.angleRightX2, this.y);
    }
  }
}

// Bullet.prototype = new Entity();
// Bullet.prototype.constructor = Bullet;

AM.queueDownload('./img/crane-sheet.png');
AM.queueDownload('./img/plane.png');
AM.queueDownload('./img/spacebg.png');
AM.queueDownload('./img/paper.png');
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

  const gameEngine = new GameEngine();
  gameEngine.init(ctx);
  gameEngine.start();

  const slippyArr = [AM.getAsset('./img/slippy_inbound.png'),
    AM.getAsset('./img/slippy_roll.png'),
    AM.getAsset('./img/slippy_greatjob.png'),
    AM.getAsset('./img/slippy_mission_done.png'),
    AM.getAsset('./img/slippy_end.png')];

  gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/spacebg.png')));
  // gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/paper.png')));
  gameEngine.addEntity(new Crane(gameEngine, AM.getAsset('./img/crane-sheet.png')));
  gameEngine.addEntity(new Plane(gameEngine, AM.getAsset('./img/plane.png')));
  gameEngine.addEntity(new Slippy(gameEngine, slippyArr));
  gameEngine.addEntity(new Nuke(gameEngine, AM.getAsset('./img/nuke_single.png')));
  gameEngine.addEntity(new Bullet(gameEngine, AM.getAsset('./img/bullet.png')));

  console.log('All Done!');
});
