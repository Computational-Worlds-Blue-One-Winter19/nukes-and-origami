const AM = new AssetManager();

/** These hold the object templates defined in objects.js */
const ring = {};
const sprite = {};
const ship = {};
const projectile = {};

/** These are the image assets declared by filename */
AM.queueDownload('./img/bat-sheet.png');
AM.queueDownload('./img/crane-sheet.png');
AM.queueDownload('./img/mini-crane-sheet.png');
AM.queueDownload('./img/plane-small.png');
AM.queueDownload('./img/purple-plane-small.png');
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
          image: AM.getAsset('./img/rainbow_ball.png'),
          scale: 0.8,
          rotate: false,
          radius: 120,
        },
        speed: 60,
        powerUp() {
          this.lives += 1;
          addLife();
        },
      },
    }));
  }

  // notification of player destruction.
  onPlayerHit(player) {
    // player.invincTime += this.clockTick;
    if (player.invincTime == 0) {
      this.lives -= 1;
      removeLifeFromBoard();
      player.invincTime += this.clockTick;
    }
    if (this.lives === 0) { // game over
      // this.gameOver()
    }
  }

  spawnEnemies() {
    // Slowly strafe right off screen
    const strafeRight = [
      [0, 50, 20],
    ];

    // Slowly strafe left off screen
    const strafeLeft = [
      [180, 50, 20],
    ];

    // Advance down, then left, then southeast
    const cornerRight = [
      [90, 50, 2],
      [180, 50, 2],
      [45, 50, 30],
    ];

    // Advance down, then right, then southwest
    const cornerLeft = [
      [90, 50, 2],
      [0, 50, 2],
      [135, 50, 30],
    ];

    // WAVE 1

    const ezBat1 = new Ship(this, ship.easyBat);
    const ezBat2 = new Ship(this, ship.easyBat);

    // Object.assign assigns a copy of the array. (otherwise we get strange
    // concurrent modification issues)
    ezBat1.initializePath(strafeRight);
    ezBat1.current.x = 200;

    ezBat2.initializePath(strafeLeft);
    ezBat2.current.x = 800;

    this.addEntity(ezBat1);
    this.addEntity(ezBat2);

    // WAVE 2

    const openingBat1 = new Ship(this, ship.openingBat);
    const openingbat2 = new Ship(this, ship.openingBat);

    // Object.assign assigns a copy of the array.
    openingBat1.initializePath(strafeRight);
    openingBat1.current.x = 200;

    openingbat2.initializePath(strafeLeft);
    openingbat2.current.x = 800;

    this.addEntity(openingBat1);
    this.addEntity(openingbat2);

    // WAVE 3

    const spiralCrane1 = new Ship(this, ship.easyIdleSpiralCrane);
    const spiralCrane2 = new Ship(this, ship.easyIdleSpiralCrane);

    spiralCrane1.current.x = 200;

    spiralCrane2.current.x = 800;

    this.addEntity(spiralCrane1);
    this.addEntity(spiralCrane2);

    // WAVE 4

    const dodgeOwl1 = new Ship(this, ship.dodgeOwl);
    const dodgeOwl2 = new Ship(this, ship.dodgeOwl);
    const dodgeOwl3 = new Ship(this, ship.dodgeOwl);

    dodgeOwl1.current.x = 500;

    dodgeOwl2.current.x = 400;

    dodgeOwl3.current.x = 600;

    this.addEntity(dodgeOwl1);
    this.addEntity(dodgeOwl2);
    this.addEntity(dodgeOwl3);

    // WAVE 5

    const denseDove1 = new Ship(this, ship.denseDove);

    denseDove1.current.x = 500;

    this.addEntity(denseDove1);

    // WAVE 6

    const doubleBat1 = new Ship(this, ship.mediumDoubleTurretBat);
    const doubleBat2 = new Ship(this, ship.mediumDoubleTurretBat);

    doubleBat1.initializePath(cornerRight);
    doubleBat1.current.x = 400;

    doubleBat2.initializePath(cornerLeft);
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
    this.addEntity(new Ship(this, ship.testDove));
    //this.addEntity(new Ship(this, ship.testCrane));
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
    // Using object deconstructing to access the canvas property
    const { canvas } = this.ctx;
    const point1 = {
      x: 0,
      y: 0,
    };
    const point2 = {
      x: 0,
      y: -canvas.height,
    };
    const cloudPoint1 = {
      x: 0,
      y: -2304,
    };
    const cloudPoint2 = {
      x: 0,
      y: -2304 * 2,
    };
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
  //game.addBackground();
  game.spawnPlayer();

  // view test stage
  //game.testScene();

  // run prototype level
  game.spawnEnemies();

  console.log('All Done!');
  canvas.focus();
});

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

class Clouds extends Entity {
  constructor(game, spritesheet, canvasHeight, point) {
    super(game, point);
    this.startY = point.y;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.canvasHeight = canvasHeight;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet, this.current.x, this.current.y);
  }

  update() {
    this.current.y += 2;
    if (this.current.y >= this.canvasHeight) {
      this.current.y = -3840;
    }
  }
}
