// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google
// IO talk in 2011

window.requestAnimFrame = (function requestAnimFrame() {
  return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function animFrame(/* function */ callback) {
              window.setTimeout(callback, 1000 / 60);
            };
}());


function Timer() {
  this.gameTime = 0;
  this.maxStep = 0.05;
  this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function tick() {
  const wallCurrent = Date.now();
  const wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
  this.wallLastTimestamp = wallCurrent;

  const gameDelta = Math.min(wallDelta, this.maxStep);
  this.gameTime += gameDelta;
  return gameDelta;
};

function GameEngine() {
  this.entities = [];
  this.showOutlines = false;
  this.ctx = null;
  this.click = null;
  this.mouse = null;
  this.wheel = null;
  this.surfaceWidth = null;
  this.surfaceHeight = null;
}

GameEngine.prototype.init = function init(ctx) {
  this.ctx = ctx;
  this.surfaceWidth = this.ctx.canvas.width;
  this.surfaceHeight = this.ctx.canvas.height;
  this.startInput();
  this.timer = new Timer();
  console.log('game initialized');
};

GameEngine.prototype.start = function start() {
  // console.log('starting game');
  const that = this;
  (function gameLoop() {
    that.loop();
    window.requestAnimFrame(gameLoop, that.ctx.canvas);
  }());
};

GameEngine.prototype.startInput = function startInput() {
  console.log('Starting input');
  const that = this;

  this.ctx.canvas.addEventListener('keydown', (e) => {
    if (String.fromCharCode(e.which) === ' ') that.space = true;
    //        console.log(e);
    e.preventDefault();
  }, false);

  console.log('Input started');
};

GameEngine.prototype.addEntity = function addEntity(entity) {
  console.log('added entity');
  this.entities.push(entity);
};

GameEngine.prototype.draw = function draw() {
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  this.ctx.save();
  for (let i = 0; i < this.entities.length; i += 1) {
    this.entities[i].draw(this.ctx);
  }
  this.ctx.restore();
};

GameEngine.prototype.update = function update() {
  const entitiesCount = this.entities.length;

  for (let i = 0; i < entitiesCount; i += 1) {
    const entity = this.entities[i];

    if (!entity.removeFromWorld) {
      entity.update();
    }
  }

  for (let i = this.entities.length - 1; i >= 0; i -= 1) {
    if (this.entities[i].removeFromWorld) {
      this.entities.splice(i, 1);
    }
  }
};

GameEngine.prototype.loop = function loop() {
  this.clockTick = this.timer.tick();
  this.update();
  this.draw();
  this.space = null;
};

function Entity(game, x, y) {
  this.game = game;
  this.x = x;
  this.y = y;
  this.removeFromWorld = false;
}

Entity.prototype.update = function update() {
};

Entity.prototype.draw = function draw(ctx) {
  if (this.game.showOutlines && this.radius) {
    this.game.ctx.beginPath();
    this.game.ctx.strokeStyle = 'green';
    this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.game.ctx.stroke();
    this.game.ctx.closePath();
  }
};

Entity.prototype.rotateAndCache = function rotateAndCache(image, angle) {
  const offscreenCanvas = document.createElement('canvas');
  const size = Math.max(image.width, image.height);
  offscreenCanvas.width = size;
  offscreenCanvas.height = size;
  const offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCtx.save();
  offscreenCtx.translate(size / 2, size / 2);
  offscreenCtx.rotate(angle);
  offscreenCtx.translate(0, 0);
  offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
  offscreenCtx.restore();
  // offscreenCtx.strokeStyle = "red";
  // offscreenCtx.strokeRect(0,0,size,size);
  return offscreenCanvas;
};
