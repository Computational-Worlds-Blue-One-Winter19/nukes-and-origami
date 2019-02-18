const AM = new AssetManager();

/** These hold the object templates defined in objects.js */
const ring = {};
const sprite = {};
const ship = {};
const pattern = {};
const projectile = {};
const path = {};
const scene = {};
const background = {};

/** These are the image assets declared by filename */
AM.queueDownload('./img/bat-sheet-HIT.png');
AM.queueDownload('./img/crane-sheet-HIT.png');
AM.queueDownload('./img/mini-crane-sheet.png');
AM.queueDownload('./img/plane-small.png');
AM.queueDownload('./img/purple-plane-small.png');
AM.queueDownload('./img/notebook.png');
AM.queueDownload('./img/bullet.png');
AM.queueDownload('./img/nuke_single.png');
AM.queueDownload('./img/owl-sheet-HIT.png');
AM.queueDownload('./img/dove-sheet-HIT.png');
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
AM.queueDownload('./img/swallow-sheet-HIT.png');
AM.queueDownload('./img/heart.png');
AM.queueDownload('./img/reverse.png');
AM.queueDownload('./img/fire-rate.png');
AM.queueDownload('./img/space1024x3072.png');
AM.queueDownload('./img/light_blue_plane.png');
AM.queueDownload('./img/verticalscrollingbeach.png');
AM.queueDownload('./img/seamless_pattern.png');
AM.queueDownload('./img/missile.png');
AM.queueDownload('./img/gunup.png');
AM.queueDownload('./img/chaingun.png');
AM.queueDownload('./img/explosion-sheet.png');

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

    this.defaultBackgroundSpeed = 2;
    this.warpBackgroundSpeed = 20;
    this.backgroundSpeed = this.defaultBackgroundSpeed;

    // Initilize the game board
    initializeScoreBoardLives(this.lives);
    this.sceneManager = new SceneManager(this);
  }

  initializeSceneManager() {
    // load completed levels
    this.sceneManager.scenes.push(scene.easyPaper);
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
    } = enemy;
    this.increaseScoreBy(hitValue);

    // Generate a powerUp
    const powerUp = getRandomPowerUp(this.player.weapon);
    if (powerUp && powerUp.shouldDrop()) {
      this.addEntity(new Projectile(this, {
        origin: {
          x: current.x,
          y: current.y,
        },
        ...powerUp.manifest,
      }));
    }
  }

  /** returns the polar coordinates of the player with respect to the given point */
  getPlayerLocation(point) {
    const deltaX = this.player.current.x - point.x;
    const deltaY = this.player.current.y - point.y;
    const angle = Math.atan2(deltaY, deltaX);
    const radius = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    return {
      radius,
      angle,
    };
  }

  // get a list of enemies within the specified range or the coordinates
  // no range returns all
  getEnemiesInRange(point, range) {
    const maxRangeSquared = Math.pow(range, 2) || Infinity;
    const result = new Array();

    for (const e of this.entities) {
      if (e instanceof Ship && !e.isPlayer) {
        const distance = Math.pow(point.x - e.current.x, 2) + Math.pow(point.y - e.current.y, 2);

        if (distance < maxRangeSquared) {
          result.push({
            ship: e,
            distance: Math.sqrt(distance),
          });
        }
      }
    }

    // return list in sorted order
    return result.sort((a, b) => {
      if (a.distance < b.distance) {
        return -1;
      } if (a.distance > b.distance) {
        return 1;
      }
      return 0;
    });
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

  /**
   * Increases the current player's score by the given value
   * @param {Int} value
   */
  increaseScoreBy(value) {
    this.score += value;
    updateScoreBoard(this.score);
  }

  // establishes a new Plane for standard gameplay
  spawnPlayer() {
    this.player = new Plane(this, ship.player);
    this.addEntity(this.player);
  }


  addBackground() {
    // Using object deconstructing to access the canvas property
    const {
      canvas,
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


  /** Test scene: place something quick and dirty. I have switched to my own test scene
   *  using the SceneManager, but this still works if you want.
   */
  testScene() {
    // initialize test environment
    if (this.player) {
      this.player.removeFromWorld = true;
    }
    let count = 0;
    spawn(this);

    // override onEnemyDestruction() to respawn scene
    // this.onEnemyDestruction = function () {
    //   count--;
    //   if (count === 0) {
    //     spawn(this);
    //   }
    // };

    // introduce test player
    // this.player = new Plane(this, ship.jaredTestPlane);
    this.spawnPlayer();
    this.addEntity(this.player);

    // introduce test enemies
    function spawn(that) {
      count = 3;

      ship.testDove.config.origin = { x: 200, y: -50 };
      that.addEntity(new Ship(that, ship.testDove));
      ship.testDove.config.origin = { x: 500, y: -50 };
      that.addEntity(new Ship(that, ship.testDove));
      ship.testDove.config.origin = { x: 800, y: -50 };
      ship.testDove.config.snapLine = 380;
      that.addEntity(new Ship(that, ship.testDove));
    }
  } // end test scene
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

  // add background
  // game.addBackground();

  // spawn standard ship.player
  game.spawnPlayer();

  // run standard gameplay
  // initIntroMessage(game);

  // view simple test scene; defined above
  game.testScene();

  // view single scene with SceneManager
  // game.sceneManager.scenes.push(scene.jaredTestScene);

  // run prototype level
  // game.spawnEnemies();

  console.log('All Done!');
  canvas.focus();
});


class SceneManager {
  // The scene manager takes a GameEngine to hold references to what it will
  // need to manipulate.
  constructor(game) {
    this.game = game;
    this.entities = game.entities;
    this.player = game.player;

    this.leftSpawnLimit = 100;
    this.rightSpawnLimit = 1024 - 100;
    this.timeBetweenWaves = 1;

    this.waveTimer = 0;
    this.waitTime = 0;
    this.currentScene = null;
    this.wave = null;
    this.waves = null;
    this.entitiesInWave = [];
    this.accelerationAmount = 6;
    this.decelerationAmount = 6;

    // Flags for cutscenes/automatic things
    this.atDefaultSpeed = true;
    this.acceleratingToWarpSpeed = false;
    this.atWarpSpeed = false;
    this.deceleratingFromWarpSpeed = false;
    this.displayingMessage = false;
    this.waitUntilAtDefaultSpeed = false;

    this.scenes = new Array();
  }

  // In the future, handle the changing out of assets here like changing
  // the background image/assets
  //
  // For right now just load the waves.
  loadScene(scene) {
    this.currentScene = scene;
    this.waves = scene.waves;

    // Load new background
    if (scene.background) {
      for (const bg of scene.background.layers) {
        this.game.entities.unshift(new Background(this.game, bg.layer, bg.verticalPixels, bg.parallaxMult, bg.offset));
      }
    }

    // replace current player if a new one is provided
    if (scene.player) {
      if (this.game.player) {
        this.game.player.removeFromWorld = true;
      }

      this.game.player = new Plane(this.game, scene.player);
      this.game.addEntity(this.game.player);
    }
  }

  // In the future, handle any wave specific activity here. This could be doing
  // something special for the boss or a special enemy, for example.
  loadWave(wave) {
    this.wave = wave;
    if (wave.warpSpeed) {
      this.acceleratingToWarpSpeed = true;
      this.atDefaultSpeed = false;
      this.waitUntilAtDefaultSpeed = true;
    }

    if (wave.message) {
      this.message = wave.message;
    }

    let spacing; let
      locationCounter;
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
      // Make shallow copies to not modify the objects.js defaults
      const manifestCopy = Object.assign({}, wave.ships[i]);
      // If path was overridden, put that in the manifestCopy
      manifestCopy.path = wave.paths ? wave.paths[i] : 0;
      if (wave.shipManifestOverride) {
        // do a recursive merge
        if (wave.shipManifestOverride[i].config) {
          Object.assign(manifestCopy.config, wave.shipManifestOverride[i].config);
        }
        if (wave.shipManifestOverride[i].weapon) {
          if (wave.shipManifestOverride[i].weapon.firing) {
            if (!manifestCopy.weapon.firing) {
              manifestCopy.weapon.firing = {};
            }
            Object.assign(manifestCopy.weapon.firing, wave.shipManifestOverride[i].weapon.firing);
          }
          if (wave.shipManifestOverride[i].weapon.rotation) {
            if (!manifestCopy.weapon.rotation) {
              manifestCopy.weapon.rotation = {};
            }
            Object.assign(manifestCopy.weapon.rotation, wave.shipManifestOverride[i].weapon.rotation);
          }
          if (wave.shipManifestOverride[i].weapon.payload) {
            if (!manifestCopy.weapon.payload) {
              manifestCopy.weapon.payload = {};
            }
            Object.assign(manifestCopy.weapon.payload, wave.shipManifestOverride[i].weapon.payload);
          }
        }
      }

      // The ship constructor **should** copy data; try without Object.assign() here
      // let ship = new Ship(this.game, Object.assign({}, manifestCopy));
      const ship = new Ship(this.game, manifestCopy);

      // Was the location overriden?
      if (wave.initialXPoints) {
        ship.current.x = wave.initialXPoints[i];
      } else {
        ship.current.x = locationCounter;
        locationCounter += spacing;
      }

      this.game.addEntity(ship);
      if (wave.waitUntilEnemiesGone) {
        this.entitiesInWave.push(ship);
      }
    }
  }

  // Called when anything other than a projectile is removed from the gameengine.
  // Used for keeping track of if waves
  shipRemoved(entity) {
    for (let i = 0; i < this.entitiesInWave.length; i += 1) {
      if (entity === this.entitiesInWave[i]) {
        this.entitiesInWave.splice(i, 1);
        i -= 1;
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
    // Theres at most one thing we could be waiting for time-wise, so just use
    // one wavetimer for multiple purposes.
    this.waveTimer += this.game.clockTick;
    // No scene? load the next one
    if (!this.currentScene) {
      // Hang here if we have no more scenes
      if (!(this.scenes.length === 0)) {
        this.loadScene(this.scenes.shift());
      }
    } else {
      // No wave? load the next one and initialize them
      if (!this.wave) {
        // Wait some time to give player time between waves.
        if (this.waveTimer > this.timeBetweenWaves) {
          // Is this scene out of waves?
          if (this.waves.length == 0) {
            this.currentScene = 0;
          } else {
            this.loadWave(this.waves.shift());
            this.waveTimer = 0;
          }
        }
      } else {
        // We are inside a wave

        // Are we waiting for enemies to be killed/go off screen before we
        // continue?
        if (this.wave.waitUntilEnemiesGone) {
          if (this.entitiesInWave.length == 0) {
            this.wave = false;
            this.waveTimer = 0;
          }
        }

        // Is there a message to display to the player?
        if (this.message) {
          this.showingmessage = true;
          showMessage(this.message.text[0], this.message.text[1]);
          this.waveTimer = 0;
          this.waitTime = this.message.duration;
          this.message = 0;
        }

        // Waiting for a period of time (for right now only for messages)
        if (this.waitTime) {
          if (this.waveTimer > this.waitTime) {
            this.waitTime = 0;
            hideMessage('message-overlay');
            // For now, decelerate from warp speed here
            this.deceleratingFromWarpSpeed = true;
            this.atWarpSpeed = false;
          }
        }

        // Are we waiting for a warp speed animation to complete?
        if (this.waitUntilAtDefaultSpeed) {
          if (this.atDefaultSpeed) {
            this.waitUntilAtDefaultSpeed = false;
            // next wave
            this.wave = false;
          }
        }
      }
    }
    // Handle accelerating to/from warpspeed
    if (this.acceleratingToWarpSpeed) {
      this.game.backgroundSpeed += this.accelerationAmount * this.game.clockTick;
      if (this.game.backgroundSpeed >= this.game.warpBackgroundSpeed) {
        this.game.backgroundSpeed = this.game.warpBackgroundSpeed;
        this.acceleratingToWarpSpeed = false;
        this.atWarpSpeed = true;
      }
    }

    if (this.deceleratingFromWarpSpeed) {
      this.game.backgroundSpeed -= this.decelerationAmount * this.game.clockTick;
      if (this.game.backgroundSpeed <= this.game.defaultBackgroundSpeed) {
        this.game.backgroundSpeed = this.game.defaultBackgroundSpeed;
        this.deceleratingFromWarpSpeed = false;
        this.atWarpSpeed = false;
        this.atDefaultSpeed = true;
      }
    }
  }
}

class Background extends Entity {
  constructor(game, spritesheet, verticalPixels, parallaxMult, initOffset) {
    super(game, { x: 0, y: initOffset });
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.parallaxMult = parallaxMult || 1;
    this.verticalPixels = verticalPixels;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet,
      this.current.x, this.current.y);
  }

  update() {
    this.current.y += this.parallaxMult * this.game.backgroundSpeed;
    if (this.current.y >= this.game.surfaceHeight) {
      // Adjust for overshoot
      this.current.y = -this.verticalPixels * 2 + this.game.surfaceHeight + (this.current.y - this.game.surfaceHeight);
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
    this.speedMultiplier = 0;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet, this.current.x, this.current.y);
  }

  update() {
    // Multiply by 1.25 for parallax effect
    this.current.y += 1.25 * this.game.backgroundSpeed;
    if (this.current.y >= this.canvasHeight) {
      // adjust for overshoot
      this.current.y = -3840 + (this.current.y - this.canvasHeight);
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
      shield,
    } = this.game.player;

    const shieldHit = shield.entities.pop();
    shieldHit.removeFromWorld = true;
    removeItem('shield', 'powerUp');
    if (!shield.entities.length) {
      shield.hasShield = false;
    }
  }
}
