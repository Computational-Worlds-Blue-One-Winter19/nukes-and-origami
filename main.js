const AM = new AssetManager();

/** These hold the object templates defined in objects.js */
const ring = {};
const sprite = {};
const ship = {};
const projectile = {};

/** These are the image assets declared by filename */
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
  onEnemyDestruction(enemy) {
    this.increaseScoreBy(enemy.config.hitValue);
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
    //path: [[180, 100, 5], [0, 100, 5], [180, 100, 5], [0, 100, 5], [90, 100, 60]];
    
    //let crane2 = new Ship(this, ship.demoCrane);
    //crane1.initializePath([[180, 100, 5], [0, 100, 5]]);
    //crane2.initializePath([[90,25,60]]);
    
    let crane1 = new Ship(this, ship.idleCrane);
    this.addEntity(crane1);
    //this.addEntity(crane2);
  }

  // establishes a new player Plane
  spawnPlayer() {
    this.player = new Plane(this, ship.player);
    this.addEntity(this.player);
  }

  /**
   * Increases the current player's score by the given value
   * @param {Int} value 
   */
  increaseScoreBy(value) {
    this.score += value;
    updateScoreBoard(this.score);
  }
}

/** Call AssetManager to download assets and launch the game. */
AM.downloadAll(() => {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');
  
  loadTemplates();
  const game = new NukesAndOrigami();
  game.showOutlines = false;
  game.init(ctx);
  game.spawnPlayer();
  game.start();
  game.spawnEnemy();
  console.log('All Done!');
});

/** Global helpers (could go elsewhere) */
function toRadians(angle) {
  return angle * Math.PI / 180;
}

// we should get back to the following code for narration and background...

// const slippyArr = [AM.getAsset('./img/slippy_inbound.png'),
//   AM.getAsset('./img/slippy_roll.png'),
//   AM.getAsset('./img/slippy_greatjob.png'),
//   AM.getAsset('./img/slippy_mission_done.png'),
//   AM.getAsset('./img/slippy_end.png')];
// gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/spacebg.png'), 0, 0));
// gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/spacebg.png'), 0, -screenWidth));
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

// /** Circle bullet from Nathan. Jared can't get this to work. I was hoping to
//  * see one using De Castelijau's algorithm.
// */
// class SmartCircle extends Projectile {
//   constructor(game, manifest) {
//     super(game, {
//       owner: manifest.owner,
//       origin: manifest.origin,
//       angle: manifest.angle,
//       distance: manifest.distance,
//       speed: 50,
//       accel: 1,
//       radius: 300,
//     });
//   }

//   draw() {
//     this.game.ctx.strokeRect(390, 390, 20, 20);
//     this.game.ctx.beginPath();
//     this.game.ctx.arc(this.x, this.y, 10, 0 * Math.PI, 2 * Math.PI);
//     this.game.ctx.stroke();
//     this.game.ctx.fill();
//   }

//   update() {
//     this.x = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.x + Math.pow(this.t, 2) * this.game.player.x;
//     this.bulletY = Math.pow((1 - this.t), 2) * 390 + 2 * (1 - this.t) * this.t * this.y + Math.pow(this.t, 2) * this.game.player.y;
//     this.t += 0.01;
//     if (this.t >= 1) {
//       this.t = 0;
//     }
//     this.x = this.radius * Math.cos(this.toRadians(this.angle)) + 10;
//     this.y = this.radius * Math.sin(this.toRadians(this.angle)) - 10;
//     this.angle += 10;
//   }

//   toRadians(angle) {
//     return angle * (Math.PI / 180);
//   }
// }