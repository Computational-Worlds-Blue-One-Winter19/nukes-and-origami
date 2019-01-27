
const ASSET_MANAGER = new AssetManager();

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames,
  loop, reverse) {
  this.spriteSheet = spriteSheet;
  this.startX = startX;
  this.startY = startY;
  this.frameWidth = frameWidth;
  this.frameDuration = frameDuration;
  this.frameHeight = frameHeight;
  this.frames = frames;
  this.totalTime = frameDuration * frames;
  this.elapsedTime = 0;
  this.loop = loop;
  this.reverse = reverse;
}

Animation.prototype.drawFrame = function drawFrame(tick, ctx, x, y, scaleBy) {
  const localScaleBy = scaleBy || 1;
  this.elapsedTime += tick;
  if (this.loop) {
    if (this.isDone()) {
      this.elapsedTime = 0;
    }
  } else if (this.isDone()) {
    return;
  }
  let index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
  let vindex = 0;
  if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
    index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
    vindex += 1;
  }
  while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
    index -= Math.floor(this.spriteSheet.width / this.frameWidth);
    vindex += 1;
  }

  const locX = x;
  const locY = y;
  const offset = vindex === 0 ? this.startX : 0;
  ctx.drawImage(this.spriteSheet,
    index * this.frameWidth + offset, vindex * this.frameHeight + this.startY, // source from sheet
    this.frameWidth, this.frameHeight,
    locX, locY,
    this.frameWidth * localScaleBy,
    this.frameHeight * localScaleBy);
};

Animation.prototype.currentFrame = function currentFrame() {
  return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function isDone() {
  return (this.elapsedTime >= this.totalTime);
};

function Background(game) {
  Entity.call(this, game, 0, 400);
  this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function update() {
};

Background.prototype.draw = function draw(ctx) {
  ctx.fillStyle = 'SaddleBrown';
  ctx.fillRect(0, 500, 800, 300);
  Entity.prototype.draw.call(this);
};

function Unicorn(game) {
  this.animation = new Animation(ASSET_MANAGER.getAsset('./img/RobotUnicorn.png'), 0, 0, 206, 110, 0.02, 30, true, true);
  this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset('./img/RobotUnicorn.png'), 618, 334, 174, 138, 0.02, 40, false, true);
  this.jumping = false;
  this.radius = 100;
  this.ground = 400;
  Entity.call(this, game, 0, 400);
}

Unicorn.prototype = new Entity();
Unicorn.prototype.constructor = Unicorn;

// (source, originX, originY, frameWidth, frameHeight, numberOfFrames, timePerFrame, scale, flip)
// Crane will enter from above and move to snapLine defined by x,y
class Crane extends Entity {

  constructor(game, spritesheet, x, y) {
    super(game, x, -100);
    this.sprite = new Sprite(spritesheet, 0, 0, 440, 330, 4, 0.1, 0.3, false);
    this.originalScale = 0.7;
    // 0.7 scaled x = 550
    this.speed = 50;
    this.game = game;
    this.ctx = game.ctx;
    this.isIdle = false;
    this.idleTrans = false;
    this.idleCount = 0;
    this.alive = true; // y = 550
    this.radius = 40;
    this.snapLine = y;
    this.lastFired = 0;

    // course
    let path = [];
    path.push([90,40,5]);
    path.push([180,40,4]);
    path.push([0,0,6]);
    path.push([90,60,60]);
    path.elapsedTime = 0;
    path.targetTime = 0;
    path.currentStep = -1;

    this.path = path;
  }

  draw() {
    if (this.alive) { this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y); }
    // this.ctx.save();
    // this.ctx.translate(this.x, this.y);
    // this.ctx.rotate(this.angle - Math.PI/2);
    // this.ctx.translate(-this.x, -this.y);
    // this.sprite.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    // this.ctx.restore();
    super.draw();
  }

  update() {
    // Check upper y bounds if Crane has left the bottom of the screen
    if (this.y > this.game.surfaceHeight + this.radius) {
      this.removeFromWorld = true;
      return;
    }
    
    // Check for collision with player    
    if (this.isCollided(this.game.player)) {
      this.game.player.removeFromWorld = true;
      removeLife();
      this.game.spawnPlayer();
    }
    let jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
    const totalHeight = 200;

    // Check for hit from player bullets
    for (let e of this.game.entities) {
      if (e instanceof Bullet && e.planeshot && this.isCollided(e)) {
        this.removeFromWorld = true;
        e.removeFromWorld = true;
        this.game.spawnCrane();
        updateScoreBy(5);        
      }
    }
    
    // Update position
    if (this.snapLine) {      
      // Proceed downward if not at the snapLine
      this.y += this.speed * this.game.clockTick;

      // check for arrival at snapLine
      if (this.y >= this.snapLine) {
        this.snapLine = null;
      }
    } else if (this.path) {
      this.path.elapsedTime += this.game.clockTick;
    
      if (this.path.elapsedTime > this.path.targetTime) {
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
      } else {
        // advance along path
        let radialDistance = this.speed * this.game.clockTick;
        this.x += radialDistance * Math.cos(this.angle);
        this.y += radialDistance * Math.sin(this.angle);
      }
    } else {
      // lastly if no path stay put
      this.isIdle = true;
    }

    // Fire bullet on fixed interval
    this.lastFired += this.game.clockTick;
    if (this.lastFired > 2) {
      // determine position of player
      let deltaX = this.game.player.x - this.x;
      let deltaY = this.game.player.y - this.y;
      let angle = Math.atan2(deltaY, deltaX);
          
      // determine position of bullet along radius
      let bulletX = this.radius * Math.cos(angle) + this.x;
      let bulletY = this.radius * Math.sin(angle) + this.y;

      let bullet = new Bullet(this.game, AM.getAsset('./img/bullet.png'), bulletX, bulletY, angle);
      bullet.craneshot = true;
      bullet.spawned = true;
      this.game.addEntity(bullet);
      
      this.lastFired = 0;
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
  } // end Update method
  
}

    // var height = jumpDistance * 2 * totalHeight;
    const height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
    this.y = this.ground - height;
  }
  Entity.prototype.update.call(this);
};

Unicorn.prototype.draw = function draw(ctx) {
  if (this.jumping) {
    this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
  } else {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
  }
  Entity.prototype.draw.call(this);
};

// the "main" code begins here

ASSET_MANAGER.queueDownload('./img/RobotUnicorn.png');

ASSET_MANAGER.downloadAll(() => {
  console.log('starting up da sheild');
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  const game = new NukesAndOrigami();
  game.showOutlines = true;
  game.init(ctx);
  game.spawnPlayer();
  game.start();

  game.spawnCrane();
  initializeLives();
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

  gameEngine.init(ctx);
  gameEngine.start();
});
