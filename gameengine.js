// This game shell was happily copied from Googler Seth Ladd's "Bad others" game and his Google
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


// class Timer {
//   constructor() {
//     this.gameTime = 0;
//     this.maxStep = 0.05;
//     this.wallLastTimestamp = 0;
//   }

//   tick() {
//     const wallCurrent = Date.now();
//     const wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
//     this.wallLastTimestamp = wallCurrent;

//     const gameDelta = Math.min(wallDelta, this.maxStep);
//     this.gameTime += gameDelta;
//     return gameDelta;
//   }
// }

function Timer() {
  this.gameTime = 0;
  this.maxStep = 0.05;
  this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
  const wallCurrent = Date.now();
  const wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
  this.wallLastTimestamp = wallCurrent;

  const gameDelta = Math.min(wallDelta, this.maxStep);
  this.gameTime += gameDelta;
  return gameDelta;
}

Timer.prototype.getWave = function (amp, T) {
  let angle = 2 * Math.PI / T * this.gameTime;
  return amp * Math.sin(angle);
}

class GameEngine {
  constructor() {
    this.entities = [];
    this.showOutlines = false;
    this.isPaused = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keysDown = [];
    this.stats = new Stats();
  }

  init(ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();

    this.timer = new Timer();
    document.body.appendChild(this.stats.domElement);
  }

  start() {
    // console.log('starting game');
    const that = this;
    (function gameLoop() {
      that.loop();
      window.requestAnimFrame(gameLoop, that.ctx.canvas);
    }());
  }

  startInput() {
    console.log('Starting input');
    const that = this;
    console.log(`test: ${this.arrowUpPressed}`);
    this.ctx.canvas.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP') {
        that.pause();
      } if (e.code === 'KeyD') {
        // toggle outlines for debugging
        that.showOutlines = !that.showOutlines;
      } else {
        that.keysDown[e.code] = true;
        e.preventDefault();
      }
    }, false);

    this.ctx.canvas.addEventListener('keyup', (e) => {
      that.keysDown[e.code] = false;
    }, false);

    console.log('Input started');
  }

  addEntity(entity) {
    //console.log('added entity');
    this.entities.push(entity);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (let i = 0; i < this.entities.length; i += 1) {
      this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
  }

  update() {
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
  }

  loop() {
    if (!this.isPaused) {
      this.clockTick = this.timer.tick();
      this.update();
      this.draw();
      this.stats.update(); // remove for production
      this.space = null;
      this.arrowUpPressed = null;
      this.arrowDownPressed = null;
      this.arrowLeftPressed = null;
      this.arrowRightPressed = null;

      this.arrowLeftReleased = null;
      this.arrowRightReleased = null;
      this.arrowUpReleased = null;
      this.arrowDownReleased = null;
    }
  }

  pause() {
    if (this.isPaused) {
      hideMessage("pause-message");
      // remove any stored mouse events and unpause the game.
      this.click = null;
      this.mouse = null;
      this.isPaused = false;
    } else {
      // set pause flag
      this.isPaused = true;
      showMessage("pause-message");
    }
  }

  /**
   * Stops the game by using the pause flag and shows the game-over-message
   */
  gameOver() {
    // The Pause Flag handles the same function in stopping the game so we'll repurpose it here
    this.isPaused = true;
    showMessage("game-over-message");
  }
}

class Entity {
  constructor(game, point) {
    this.game = game;
    this.ctx = game.ctx;
    this.current = point;
    this.removeFromWorld = false;
  }

  update() {
  }

  draw() {
    if (this.game.showOutlines && this.config.radius) {
      this.game.ctx.beginPath();
      this.game.ctx.strokeStyle = 'red';
      this.game.ctx.arc(this.current.x, this.current.y, this.config.radius, 0, Math.PI * 2, false);
      this.game.ctx.stroke();
      this.game.ctx.closePath();
    }
  }

  isCollided(other) {
    if (this.config.radius && other instanceof Entity && other.config.radius) {
      const distance_squared = Math.pow(this.current.x - other.current.x, 2) + Math.pow(this.current.y - other.current.y, 2);
      const radii_squared = Math.pow(this.config.radius + other.config.radius, 2);
      return distance_squared < radii_squared;
    }
  }

  isOutsideScreen() {
    // if (this.radius) {
    //   return (this.x < this.radius || this.x > this.game.surfaceWidth - this.radius ||
    //     this.y > this.game.surfaceHeight - this.radius || this.y < this.radius);
    // }
    if (this.config.radius) {
      return (this.current.x < 0 - this.config.radius || this.current.x > this.game.surfaceWidth + this.config.radius
         || this.current.y < 0 - this.config.radius || this.current.y > this.game.surfaceHeight + this.config.radius);
    }
  }

  static rotateAndCache(image, angle) {
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
  }
}
