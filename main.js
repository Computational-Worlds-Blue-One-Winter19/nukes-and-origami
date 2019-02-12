const AM = new AssetManager();

/** These hold the object templates defined in objects.js */
const ring = {};
const sprite = {};
const ship = {};
const projectile = {};
const path = {};
const scene = {};

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
AM.queueDownload('./img/shield-icon.png');
AM.queueDownload('./img/shield.png');
AM.queueDownload('./img/rapid-bullet.png');
AM.queueDownload('./img/paper_ball.png');
AM.queueDownload('./img/clouds.png');
AM.queueDownload('./img/7_shoot_sheet.png');
AM.queueDownload('./img/glass_ball.png');
AM.queueDownload('./img/laser_red.png');
AM.queueDownload('./img/cut_laser.png');

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

  initializeSceneManager() {
    this.sceneManager = new SceneManager(this);
  }

  // Override
  update() {
    // Let super update every entity
    super.update();
    // Let our scenemanager do what it needs to with highest precedence
    if (this.sceneManager) {
      this.sceneManager.update();
    }
  }

  increaseLivesCount() {
    this.lives += 1;
  }

  // notification of ship destruction.
  onEnemyDestruction(enemy) {
    const {
      current,
      hitValue,
      powerUp,
    } = enemy;
    this.increaseScoreBy(hitValue);

    if (powerUp && powerUp.shouldDrop()) {
      this.addEntity(new Projectile(this, {
        origin: {
          x: current.x,
          y: current.y,
        },
        ...powerUp.manifest,
      }));
    }

    if (next) {

    }
  }

  // notification of player destruction.
  onPlayerHit(player) {
    if (player.invincTime === 0 && !player.rolling) {
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

    const ezBat1 = new Ship(this, ship.bat);
    const ezBat2 = new Ship(this, ship.bat);

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
    // override onEnemyDestruction
    this.onEnemyDestruction = function () {
      this.addEntity(new Ship(this, ship.testDove));  
    }
    
    // spawn a single enemy to the center
    this.addEntity(new Ship(this, ship.testDove));
    // this.addEntity(new Ship(this, ship.testCrane));
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
    const {
      canvas
    } = this.ctx;
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

class SceneManager {
  // The scene manager takes a GameEngine to hold references to what it will
  // need to manipulate.
  constructor(game) {
    this.game = game;
    this.entities = game.entities;
    this.player = game.player;

    this.leftSpawnLimit = 100;
    this.rightSpawnLimit = 1024 - 100;

    this.waveTimer = 0;
    this.currentScene = null;
    this.wave = null;
    this.waves = null;

    this.scenes = [scene.easyPaper, scene.mediumPaper, scene.hardPaper];
  }


  // In the future, handle the changing out of assets here like changing
  // the background image/assets
  //
  // For right now just load the waves.
  loadScene(scene) {
    this.currentScene = scene;
    this.waves = scene.waves;
  }

  // In the future, handle any wave specific activity here. This could be doing
  // something special for the boss or a special enemy, for example.
  loadWave(wave) {
    this.wave = wave;

    // Is this wave made up of unique ships?
    if (this.wave.isWaveDiverse) {
      // not implemented
    } else {
      let spacing, locationCounter;
      // More than one enemy?
      if (wave.numOfEnemies > 1) {
        // Space evenly
        spacing = ((this.rightSpawnLimit - this.leftSpawnLimit) / (wave.numOfEnemies - 1));
        locationCounter = this.leftSpawnLimit;
      } else {
        // Put the single enemy in the middle
        locationCounter = this.leftSpawnLimit + (this.rightSpawnLimit - this.leftSpawnLimit) / 2;
      }

      // Create the ships.
      for (let i = 0; i < wave.numOfEnemies; i++) {
        let ship = new Ship(this.game, Object.assign({}, wave.ships[0]));
        ship.initializePath(wave.paths[i]);

        // Is ship location specified?
        if (wave.initialXPoints) {
          ship.current.x = wave.initialXPoints[i];
        } else {
          ship.current.x = locationCounter;
          locationCounter += spacing;
        }

        // ship.initializeWeapon(Object.assign({}, wave.weapons[0]))

        this.game.addEntity(ship);
      }




    }
  }

  // This update can be cleaned up and also made much better with promises or
  // some sort of blocking call.
  //
  // for example one update is wasted on loading a new scene, then another update
  // is wasted on loading the new wave from that new scene, then on the 3rd update
  // something actually starts happening.
  update() {
    this.waveTimer += this.game.clockTick;
    // No scene? load the next one
    if (!this.currentScene) {
      // Hang here if we have no more scenes
      if (!this.scenes.length == 0) {
        this.loadScene(this.scenes.shift());
      }
    } else {
      // No wave? load the next one and initialize them
      if (!this.wave) {
        this.loadWave(this.waves.shift());
      } else {

      }

    }

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
  game.testScene();

  // run prototype level
  // game.spawnEnemies();

  //initIntroMessage(game);

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

class ShieldEntity extends Entity {
  constructor(game, point) {
    super(game, point);
    console.log('Inside constructor');
    this.offset = 50;
    this.current.y = point.y;
    this.current.x = point.x;
    this.game = game;
    this.spritesheet = new Sprite(sprite.shield.default);
    this.ctx = game.ctx;
    this.config = {
      radius: 50,
    };
  }

  draw() {
    const {
      x,
      y,
    } = this.current;

    this.ctx.drawImage(this.spritesheet.sheet, x - this.offset, y - this.offset);

    super.draw();
  }

  update() {
    this.current.y = this.game.player.current.y;
    this.current.x = this.game.player.current.x;
  }

  /**
   * Removes a shield by removing the shield icon in the players inventory and
   * removing a shield entities from a players entities array
   *
   * If the player has run of out of shield the players hasShield value will be updted
   * to reflect the new state
   */
  removeShield() {
    const {
      shield
    } = this.game.player;

    const shieldHit = shield.entities.pop();
    shieldHit.removeFromWorld = true;
    removePowerUp('shield');
    if (!shield.entities.length) {
      shield.hasShield = false;
    }
  }
}
