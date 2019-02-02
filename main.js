const AM = new AssetManager();

/** These hold the object templates defined in objects.js */
const ring = {};
const sprite = {};
const ship = {};
const projectile = {};

/** These are the image assets declared by filename */
AM.queueDownload('./img/bat-sheet.png');
AM.queueDownload('./img/crane-sheet.png');
AM.queueDownload('./img/plane.png');
AM.queueDownload('./img/purple_plane.png');
AM.queueDownload('./img/notebook.png');
AM.queueDownload('./img/bullet.png');
AM.queueDownload('./img/nuke_single.png');
AM.queueDownload('./img/owl.png');
AM.queueDownload('./img/dove.png');
AM.queueDownload('./img/rainbow_ball.png');
AM.queueDownload('./img/paper_ball.png');
AM.queueDownload('./img/clouds.png');

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
    initializeScoreBoardLives(this.lives);
  }

  // notification of ship destruction.
  onEnemyDestruction(enemy) {
    this.increaseScoreBy(enemy.config.hitValue);
    let that = this;
    console.log('spawning entity');
    this.addEntity(new Projectile(this, {
      owner: null,
      origin: {
        x: enemy.current.x,
        y: enemy.current.y,
      },
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.rainbowBall,
        },
        speed: 60,
      },
    }));
  }

  // notification of player destruction.
  onPlayerHit(player) {
    // player.invincTime += this.clockTick;
    if (player.invincTime == 0) {
      this.lives -= 1;
      removeLifeFromBoard()
      player.invincTime += this.clockTick;
    }
    if (this.lives === 0) { // game over
      //this.gameOver()
    }
  }

  spawnEnemies() {
    // Slowly strafe right off screen
    let strafeRight = [
      [0, 50, 20]
    ];

    // Slowly strafe left off screen
    let strafeLeft = [
      [180, 50, 20]
    ];

    // Advance down, then left, then southeast
    let cornerRight = [
      [90, 50, 2],
      [180, 50, 2],
      [45, 50, 30]
    ];

    // Advance down, then right, then southwest
    let cornerLeft = [
      [90, 50, 2],
      [0, 50, 2],
      [135, 50, 30]
    ];

    // WAVE 1

    let ezBat1 = new Ship(this, ship.easyBat);
    let ezBat2 = new Ship(this, ship.easyBat);

    // Object.assign assigns a copy of the array. (otherwise we get strange
    // concurrent modification issues)
    ezBat1.initializePath(Object.assign({}, strafeRight));
    ezBat1.current.x = 200;

    ezBat2.initializePath(Object.assign({}, strafeLeft));
    ezBat2.current.x = 800;

    this.addEntity(ezBat1);
    this.addEntity(ezBat2);

    // WAVE 2

    let openingBat1 = new Ship(this, ship.openingBat);
    let openingbat2 = new Ship(this, ship.openingBat);

    // Object.assign assigns a copy of the array.
    openingBat1.initializePath(Object.assign({}, strafeRight));
    openingBat1.current.x = 200;

    openingbat2.initializePath(Object.assign({}, strafeLeft));
    openingbat2.current.x = 800;

    this.addEntity(openingBat1);
    this.addEntity(openingbat2);

    // WAVE 3

    let spiralCrane1 = new Ship(this, Object.assign({}, ship.easyIdleSpiralCrane));
    let spiralCrane2 = new Ship(this, Object.assign({}, ship.easyIdleSpiralCrane));

    spiralCrane1.current.x = 200;

    spiralCrane2.current.x = 800;

    this.addEntity(spiralCrane1);
    this.addEntity(spiralCrane2);

    // WAVE 4

    let dodgeOwl1 = new Ship(this, Object.assign({}, ship.dodgeOwl));
    let dodgeOwl2 = new Ship(this, Object.assign({}, ship.dodgeOwl));
    let dodgeOwl3 = new Ship(this, Object.assign({}, ship.dodgeOwl));

    dodgeOwl1.current.x = 500;

    dodgeOwl2.current.x = 400;

    dodgeOwl3.current.x = 600;

    this.addEntity(dodgeOwl1);
    this.addEntity(dodgeOwl2);
    this.addEntity(dodgeOwl3);

    // WAVE 5

    let denseDove1 = new Ship(this, Object.assign({}, ship.denseDove));

    denseDove1.current.x = 500;

    this.addEntity(denseDove1);

    // WAVE 6

    let doubleBat1 = new Ship(this, Object.assign({}, ship.mediumDoubleTurretBat));
    let doubleBat2 = new Ship(this, Object.assign({}, ship.mediumDoubleTurretBat));

    doubleBat1.initializePath(Object.assign({}, cornerRight));
    doubleBat1.current.x = 400;

    doubleBat2.initializePath(Object.assign({}, cornerLeft));
    doubleBat2.current.x = 600;

    this.addEntity(doubleBat1);
    this.addEntity(doubleBat2);

    // This commented out section is a good example of how to
    // use Projectile to spawn random items on screen.
    //
    // this.addEntity(new Projectile(this, {
    //   owner: this,
    //   origin: {
    //     x: 400,
    //     y: 400
    //   },
    //   angle: 90,
    //   payload: {
    //     type: {
    //       sprite: sprite.rainbowBall,
    //     },
    //   },
    // }));
  }

  testScene() {
    // spawn a single enemy to the center
    this.addEntity(new Ship(this, ship.idleCrane));


    //path: [[180, 100, 5], [0, 100, 5], [180, 100, 5], [0, 100, 5], [90, 100, 60]];

    //let crane2 = new Ship(this, ship.demoCrane);
    //crane1.initializePath([[180, 100, 5], [0, 100, 5]]);
    //crane2.initializePath([[90,25,60]]);

    //let crane1 = new Ship(this, ship.idleCrane);

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

  addBackground() {
    var canvas = this.ctx.canvas;
    var point1 = {
      x: 0,
      y: 0
    };
    var point2 = {
      x: 0,
      y: -canvas.height
    };
    var cloudPoint1 = {
      x: 0,
      y: -2304
    }
    var cloudPoint2 = {
      x: 0,
      y: -2304 * 2
    }
    this.addEntity(new Background(this, AM.getAsset('./img/notebook.png'), canvas.height, point1));
    this.addEntity(new Background(this, AM.getAsset('./img/notebook.png'), canvas.height, point2));
    this.addEntity(new Clouds(this, AM.getAsset('./img/clouds.png'), canvas.height, cloudPoint1));
    this.addEntity(new Clouds(this, AM.getAsset('./img/clouds.png'), canvas.height, cloudPoint2));
  }
}

/** Call AssetManager to download assets and launch the game. */
AM.downloadAll(() => {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  loadSpriteSheets();
  loadTemplates();

  const game = new NukesAndOrigami();
  game.init(ctx);
  game.start();

  // add background and player
  game.addBackground();
  game.spawnPlayer();

  // view test stage
  //game.testScene();

  // run prototype level
  game.spawnEnemies();

  console.log('All Done!');
  canvas.focus();
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

class Background extends Entity {
  constructor(game, spritesheet, canvasHeight, point) {
    super(game, point);
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.canvasHeight = canvasHeight;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet,
      this.current.x, this.current.y);
  }

  update() {
    this.current.y += 1;
    if (this.current.y >= this.canvasHeight) {
      this.current.y = -this.canvasHeight;
    }
  }
}

class Clouds extends Entity{
  constructor(game, spritesheet, canvasHeight, point) {
    super(game, point);
    this.startY = point.y;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.canvasHeight = canvasHeight;
  }

  draw()  {
    this.ctx.drawImage(this.spritesheet, this.current.x, this.current.y);
  }

  update()  {
    this.current.y += 2;
    if(this.current.y >= this.canvasHeight) {
      this.current.y = -3840;
    }
  }
}
