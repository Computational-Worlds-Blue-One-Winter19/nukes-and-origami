
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

Unicorn.prototype.update = function update() {
  if (this.game.space) this.jumping = true;
  if (this.jumping) {
    if (this.jumpAnimation.isDone()) {
      this.jumpAnimation.elapsedTime = 0;
      this.jumping = false;
    }
    let jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
    const totalHeight = 200;

    if (jumpDistance > 0.5) { jumpDistance = 1 - jumpDistance; }

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

  const gameEngine = new GameEngine();
  const bg = new Background(gameEngine);
  const unicorn = new Unicorn(gameEngine);

  gameEngine.addEntity(bg);
  gameEngine.addEntity(unicorn);

  gameEngine.init(ctx);
  gameEngine.start();
});
