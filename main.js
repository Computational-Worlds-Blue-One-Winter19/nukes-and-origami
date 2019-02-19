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
AM.queueDownload('./img/verticalscrollingcemetary.png');
AM.queueDownload('./img/verticalscrollingtrees.png');
AM.queueDownload('./img/verticalscrollingdesert.png');
AM.queueDownload('./img/seamless_pattern.png');
AM.queueDownload('./img/explosion-sheet.png');
AM.queueDownload('./img/white_background.jpg');

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
    this.warpBackgroundSpeed = 70;
    this.accelerationAmount = 40;
    this.decelerationAmount = 25;
    this.backgroundSpeed = this.defaultBackgroundSpeed;

    // Initilize the game board
    initializeScoreBoardLives(this.lives);
    this.sceneManager = new SceneManager(this);
  }

  initializeSceneManager() {
    // load completed levels
    // this.sceneManager.scenes.push(scene.oneWaveTest);
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
      }
      if (a.distance > b.distance) {
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


  // addBackground() {
  //   // Using object deconstructing to access the canvas property
  //   const {
  //     canvas,
  //   } = this.ctx;
  //   const point1 = {
  //     x: 0,
  //     y: 0,
  //   };
  //   const point2 = {
  //     x: 0,
  //     y: -canvas.height,
  //   };
  //   const cloudPoint1 = {
  //     x: 0,
  //     y: -2304,
  //   };
  //   const cloudPoint2 = {
  //     x: 0,
  //     y: -2304 * 2,
  //   };
  //   this.addEntity(new Background(this, AM.getAsset('./img/notebook.png'), canvas.height, point1));
  //   this.addEntity(new Background(this, AM.getAsset('./img/notebook.png'), canvas.height, point2));
  //   this.addEntity(new Clouds(this, AM.getAsset('./img/clouds.png'), canvas.height, cloudPoint1));
  //   this.addEntity(new Clouds(this, AM.getAsset('./img/clouds.png'), canvas.height, cloudPoint2));
  // }


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
    this.onEnemyDestruction = function() {
      count--;
      if (count === 0) {
        spawn(this);
      }
    };

    // introduce test player
    this.player = new Plane(this, ship.jaredTestPlane);
    this.addEntity(this.player);

    // introduce test enemies
    function spawn(that) {
      count = 3;

      ship.testDove.config.origin = {
        x: 200,
        y: -50
      };
      that.addEntity(new Ship(that, ship.testDove));
      ship.testDove.config.origin = {
        x: 500,
        y: -50
      };
      that.addEntity(new Ship(that, ship.testDove));
      ship.testDove.config.origin = {
        x: 800,
        y: -50
      };
      ship.testDove.config.snapLine = 380;
      that.addEntity(new Ship(that, ship.testDove));
    }
  } // end test scene
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
    this.upperSpawnLimit = 100;
    this.lowerSpawnLimit = 768 - 350;
    this.timeBetweenWaves = 1;

    this.waveTimer = 0;
    this.waitTime = 0;
    this.currentScene = null;
    this.wave = null;
    this.waves = null;
    this.entitiesInWave = [];

    // Used for keeping track of animation sequences (e.g. going to warp speed)
    this.cutsceneStack = [];

    this.atDefaultSpeed = true;
    this.acceleratingToWarpSpeed = false;
    this.atWarpSpeed = false;
    this.deceleratingFromWarpSpeed = false;
    this.displayingMessage = false;
    this.waitUntilAtDefaultSpeed = false;

    this.scenes = new Array();
    // console.log('constructed')
  }

  // Do a cool animation into the new background.
  loadBackground(background, init) {
    let that = this;
    // insert backgrounds on top of previously placed ones
    let i = 0;
    while (this.game.entities[i] instanceof Background) {
      this.game.entities[i].removeOnNextScroll = true;
      i++;
    }
    background.layers.slice().reverse().forEach(function(bg) {
      if (init) {
        that.game.entities.splice(i, 0, new Background(that.game, bg.layer, bg.verticalPixels, bg.parallaxMult, bg.offset + 768));
      } else {
        that.game.entities.splice(i, 0, new Background(that.game, bg.layer, bg.verticalPixels, bg.parallaxMult, bg.offset));
      }
    });
  }

  // In the future, handle the changing out of assets here like changing
  // the background image/assets
  //
  // For right now just load the waves.
  loadScene(scene) {
    this.currentScene = scene;
    this.waves = scene.waves;

    // replace current player if a new one is provided
    if (scene.player) {
      if (this.game.player) {
        this.game.player.removeFromWorld = true;
      }

      this.game.player = new Plane(this.game, scene.player);
      this.game.addEntity(this.game.player);
    }
  }

  // Loads all enemies as specified in the wave.
  loadEnemies(wave) {
    let horizontalSpacing;
    let verticalSpacing;
    let horizontalLocationCounter;
    let verticalLocationCounter;
    // More than one enemy?
    if (wave.numOfEnemies > 1) {
      // Space evenly
      horizontalSpacing = ((this.rightSpawnLimit - this.leftSpawnLimit) / (wave.numOfEnemies - 1));
      horizontalLocationCounter = this.leftSpawnLimit;
      verticalSpacing = ((this.lowerSpawnLimit - this.upperSpawnLimit) / (wave.numOfEnemies - 1));
      verticalLocationCounter = this.upperSpawnLimit;
    } else {
      // Put the single enemy in the middle
      horizontalLocationCounter = this.leftSpawnLimit + (this.rightSpawnLimit - this.leftSpawnLimit) / 2;
      verticalLocationCounter = this.upperSpawnLimit + (this.lowerSpawnLimit - this.upperSpawnLimit) / 2;
    }

    // Create the ships.
    for (let i = 0; i < wave.numOfEnemies; i++) {
      // Make shallow copies to not modify the objects.js defaults
      // If path was overridden, put that in the manifestCopy
      let manifestCopy = JSON.parse(JSON.stringify(wave.ships[i]));
      manifestCopy.path = wave.paths ? JSON.parse(JSON.stringify(wave.paths[i])) : 0;
      Object.assign(manifestCopy.config.sprite, wave.ships[i].config.sprite);
      console.log(manifestCopy.config.sprite)

      if (wave.shipManifestOverride) {
        // do a recursive merge
        if (wave.shipManifestOverride[i].config) {
          Object.assign(manifestCopy.config, wave.shipManifestOverride[i].config);
          if (wave.shipManifestOverride[i].config.sprite) {
            Object.assign(manifestCopy.config.sprite, wave.shipManifestOverride[i].config.sprite);
          } else {
            Object.assign(manifestCopy.config.sprite, wave.ships[i].config.sprite);
          }
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
      } else if (ship.initialDirection === 'north'
        || ship.initialDirection === 'south') {
          ship.current.x = horizontalLocationCounter;
          horizontalLocationCounter += horizontalSpacing;
      }


      if (wave.initialYPoints) {
        ship.current.y = wave.initialYPoints[i];
      } else if (ship.initialDirection === 'west'
        || ship.initialDirection === 'east') {
          ship.current.y = verticalLocationCounter;
          verticalLocationCounter += verticalSpacing;
      }


      this.game.addEntity(ship);
      if (wave.waitUntilEnemiesGone) {
        this.entitiesInWave.push(ship);
      }
    }
  }

  // In the future, handle any wave specific activity here. This could be doing
  // something special for the boss or a special enemy, for example.
  loadWave(wave) {
    this.wave = wave;
    // Set up cutscene stack for this wave.
    if (wave.choreography) {
      this.choreography = wave.choreography;
    } else {
      // No choreography specified? default is to just load enemies.
      this.loadEnemies(wave);
      // console.log('loading enemies normally')
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
        // A wave is currently happening.

        // Is this wave choreographed? Handle that.
        if (this.choreography) {
          this.choreographyUpdate();
        } else {
          // A wave is happening that is not choreographed, handle it normally
          this.handleEnemyWaveCompletion();
        }
      }
    }
  }

  handleEnemyWaveCompletion() {
    // Are we waiting for enemies to be killed/go off screen before we
    // continue?
    if (this.wave.waitUntilEnemiesGone) {
      if (this.entitiesInWave.length == 0) {
        this.wave = false;
        this.waveTimer = 0;
        // Also advance choreography if we have it.
        if (this.choreography) {
          this.choreography.shift();
        }
      }
    }
  }

  // A choreographed wave calls this method to update.
  choreographyUpdate() {
    // Is choreography over?
    if (this.choreography.length == 0) {
      this.wave = false;
      this.waveTimer = 0;
      this.choreography = 0;
      return;
    }

    let currentChor = this.choreography[0];

    // Handle all possible choreography cases here. This will get long.
    switch (currentChor.id) {

      case 'accelerateToWarpspeed':
        this.game.backgroundSpeed += this.game.accelerationAmount * this.game.clockTick;
        if (this.game.backgroundSpeed >= this.game.warpBackgroundSpeed) {
          this.game.backgroundSpeed = this.game.warpBackgroundSpeed;
          this.choreography.shift();
        }
        break;

      case 'decelerateFromWarpSpeed':
        this.game.backgroundSpeed -= this.game.decelerationAmount * this.game.clockTick;
        if (this.game.backgroundSpeed <= this.game.defaultBackgroundSpeed) {
          this.game.backgroundSpeed = this.game.defaultBackgroundSpeed;
          this.choreography.shift();
        }
        break;

      case 'showMessage':
        // Initialize the message, then count down from duration if specified
        if (currentChor.init) {
          if (this.waveTimer > currentChor.duration) {
            hideMessage('message-overlay');
            this.choreography.shift();
          }
        } else {
          showMessage(currentChor.text[0], currentChor.text[1]);
          // If duration isn't specified, just move on
          if (!currentChor.duration) {
            this.choreography.shift();
          } else {
            // Else start countdown
            this.waveTimer = 0;
            currentChor.init = true;
          }
        }
        break;

      case 'wait':
        if (currentChor.init) {
          if (this.waveTimer >= currentChor.duration) {
            this.choreography.shift();
          }
        } else {
          this.waveTimer = 0;
          currentChor.init = true;
        }
        break;

      case 'hideMessage':
        hideMessage('message-overlay');
        this.choreography.shift();
        break;

      case 'spawnEnemies':
        // only spawn enemies once
        if (!currentChor.init) {
          this.loadEnemies(this.wave);
          currentChor.init = true;
        }
        break;

      case 'loadBackground':
        this.loadBackground(currentChor.bg);
        this.choreography.shift();
        break;
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
  // game.addBackground();
  game.spawnPlayer();

  // view test stage
  // game.testScene();

  // run prototype level
  // game.spawnEnemies();

  initIntroMessage(game);

  // console.log('All Done!');
  canvas.focus();
  game.sceneManager.loadBackground(background.beach, 1);
});

class Background extends Entity {
  constructor(game, spritesheet, verticalPixels, parallaxMult, initOffset) {
    super(game, {
      x: 0,
      y: initOffset
    });
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.parallaxMult = parallaxMult || 1;
    this.verticalPixels = verticalPixels;
    this.removeOnNextScroll = false;
  }

  draw() {
    this.ctx.drawImage(this.spritesheet,
      this.current.x, this.current.y);
  }

  update() {
    this.current.y += this.parallaxMult * this.game.backgroundSpeed;
    if (this.current.y >= this.game.surfaceHeight) {
      if (this.removeOnNextScroll) {
        this.removeFromWorld = true;
      } else {
        // Adjust for overshoot
        this.current.y = -this.verticalPixels * 2 + this.game.surfaceHeight + (this.current.y - this.game.surfaceHeight);
      }
    }
  }
}

class ShieldEntity extends Entity {
  constructor(game, point) {
    super(game, point);
    // console.log('Inside constructor');
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
    removePowerUp('shield');
    if (!shield.entities.length) {
      shield.hasShield = false;
    }
  }
}
