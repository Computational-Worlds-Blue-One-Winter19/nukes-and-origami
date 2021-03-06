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
AM.queueDownload('./img/bat.png');
AM.queueDownload('./img/bird.png');
AM.queueDownload('./img/crane.png');
AM.queueDownload('./img/dove.png');
AM.queueDownload('./img/eagle.png');
AM.queueDownload('./img/goose.png');
AM.queueDownload('./img/hummer.png');
AM.queueDownload('./img/owl.png');
AM.queueDownload('./img/pigeon.png');
AM.queueDownload('./img/swallow.png');
AM.queueDownload('./img/beta.png');
AM.queueDownload('./img/crab.png');
AM.queueDownload('./img/dolphinRight.png');
AM.queueDownload('./img/dolphinLeft.png');
AM.queueDownload('./img/eel.png');
AM.queueDownload('./img/fish.png');
AM.queueDownload('./img/frog.png');
AM.queueDownload('./img/manta.png');
AM.queueDownload('./img/octopus.png');
AM.queueDownload('./img/seahorse.png');
AM.queueDownload('./img/turtle.png');
AM.queueDownload('./img/mini-crane-sheet.png');
AM.queueDownload('./img/plane-small.png');
AM.queueDownload('./img/purple-plane-small.png');
AM.queueDownload('./img/notebook.png');
AM.queueDownload('./img/bullet.png');
AM.queueDownload('./img/nuke_single.png');
AM.queueDownload('./img/rainbow_ball.png');
AM.queueDownload('./img/shield-icon.png');
AM.queueDownload('./img/shield.png');
AM.queueDownload('./img/rapid-bullet.png');
AM.queueDownload('./img/paper_ball.png');
AM.queueDownload('./img/clouds.png');
AM.queueDownload('./img/water-overlay.png');
AM.queueDownload('./img/7_shoot_sheet.png');
AM.queueDownload('./img/glass_ball.png');
AM.queueDownload('./img/laser_red.png');
AM.queueDownload('./img/cut_laser.png');
AM.queueDownload('./img/heart.png');
AM.queueDownload('./img/reverse.png');
AM.queueDownload('./img/fire-rate.png');
AM.queueDownload('./img/space1024x3072.png');
AM.queueDownload('./img/light_blue_plane.png');
AM.queueDownload('./img/verticalscrollingbeach.png');
AM.queueDownload('./img/verticalscrollingcemetary.png');
AM.queueDownload('./img/verticalscrollingtrees.png');
AM.queueDownload('./img/verticalscrollingdesert.png');
AM.queueDownload('./img/verticalscrollingfallcity.png');
AM.queueDownload('./img/verticalscrollingvegascity.png');

AM.queueDownload('./img/seamless_pattern.png');
AM.queueDownload('./img/missile.png');
AM.queueDownload('./img/gunup.png');
AM.queueDownload('./img/chaingun.png');
AM.queueDownload('./img/explosion-sheet.png');
AM.queueDownload('./img/white_background.jpg');
AM.queueDownload('./img/rapid-bullet-horizontal.png');

/**
 * NukesAndOrigami extends GameEngine and adds additional functions
 * to manage state, add assets, etc.
 */
class NukesAndOrigami extends GameEngine {
  constructor() {
    super();
    this.lives = 3;
    this.hits = 0;
    this.score = 0;

    this.defaultBackgroundSpeed = 2;
    this.warpBackgroundSpeed = 70;
    this.accelerationAmount = 40;
    this.decelerationAmount = 25;
    this.backgroundSpeed = this.defaultBackgroundSpeed;

    this.sounds = {
      gameLoop: {
        path: 'https://storage.googleapis.com/nukes-and-origami/static/Game_Loop_v.1.ogg',
        // Two instances of a howler are needed to loop sounds, so we'll need
        // references of these instances to stop or pause music
        instances: [],
        volume: 0.09,
      },
    };

    this.sceneManager = new SceneManager(this);
  }

  /**
    Loads all stages into scenemanager.

    @param startScene an optional scene name to start from, if provided the game
                      will start from the specified scene
  */
  initializeSceneManager(startScene) {
    // load completed levels
    const levelOrder = [
      scene.levelOne,
      scene.levelTwo,
      scene.levelThree,
      scene.waterIntro,
      scene.waterOne,
      scene.waterTwo,
      scene.waterThree,
      scene.waterFour,
      scene.waterFivePointFive,
      scene.waterManta,
      scene.waterFive,
      scene.waterSix,
      scene.waterFinalBoss,
      scene.thanksForPlayingScene,
      scene.oneWaveTest,
      scene.waveBank,
      scene.easyPaper,
      scene.bossTest,
      scene.gamma,
      scene.endingScene,
    ];

    if (startScene) {
      while (levelOrder[0] != scene[startScene]) {
        levelOrder.shift();
      }
    }

    this.sceneManager.scenes = levelOrder;
  }

  startWaterLevel() {
    // this.sceneManager.scenes.push(scene.waterTwo);
    // this.sceneManager.scenes.push(scene.waterThree);
    this.sceneManager.scenes.push(scene.invertedDemo);
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

  // Override
  draw() {
    super.draw();
    if (this.player) {
      this.player.draw(); // Player over everything
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
    const powerUp = getPowerUp(enemy.powerup) || getRandomPowerUp(enemy.dropItems);
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
      if (e instanceof Ship && !e.isPlayer && !e.snapLine) {
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
      // Let's check to see if we can enable god mode for prof marriott
      const name = Cookies.get('name') || '';
      if (name.toLowerCase() !== 'chris' && name.toLowerCase() !== 'algorithm0r') {
        this.lives -= 1;
        removeLifeFromBoard();
        player.invincTime += this.clockTick;
      }
    }
    if (this.lives === 0) { // game over
      this.gameOver();
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
    this.player = new Plane(this, ship.jaredTestPlane);
    this.addEntity(this.player);

    // introduce test enemies
    function spawn(that) {
      count = 3;

      ship.testDove.config.origin = {
        x: 200,
        y: -50,
      };
      that.addEntity(new Ship(that, ship.testDove));
      ship.testDove.config.origin = {
        x: 500,
        y: -50,
      };
      that.addEntity(new Ship(that, ship.testDove));
      ship.testDove.config.origin = {
        x: 800,
        y: -50,
      };
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

  // add background and player
  // game.addBackground();
  game.spawnPlayer();

  // view test stage
  // game.testScene();
  // game.sceneManager.scenes.push(scene.jaredTestScene);

  // run completed levels
  initIntroMessage(game);

  // run first prototype level
  // game.spawnEnemies();

  canvas.focus();
  game.sceneManager.loadBackground(background.paper, 1);
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
    this.upperSpawnLimit = 100;
    this.lowerSpawnLimit = 768 - 350;
    this.timeBetweenWaves = 1;

    this.waveTimer = 0;
    this.waitTime = 0;
    this.currentScene = null;
    this.wave = null;
    this.waves = null;
    this.entitiesInWave = [];

    // for checkpoints
    this.waveCounter = 0;
    this.sceneCounter = 0;
    this.checkPointWaveState = null;
    this.checkPointWaveCounter = 0;
    this.checkPointSceneState = null;
    this.checkPointSceneCounter = 0;
    this.checkPointChoreographyState = null;

    // Used for keeping track of animation sequences (e.g. going to warp speed)
    this.cutsceneStack = [];

    this.atDefaultSpeed = true;
    this.acceleratingToWarpSpeed = false;
    this.atWarpSpeed = false;
    this.deceleratingFromWarpSpeed = false;
    this.displayingMessage = false;
    this.waitUntilAtDefaultSpeed = false;

    this.scenes = new Array();
  }

  // Do a cool animation into the new background.
  loadBackground(background, init) {
    const that = this;
    // insert backgrounds on top of previously placed ones
    let i = 0;
    while (this.game.entities[i] instanceof Background) {
      this.game.entities[i].removeOnNextScroll = true;
      i++;
    }
    background.layers.slice().reverse().forEach((bg) => {
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
    // Check if the scene has any associated audio
    // if (scene.audio) {
    // console.log(`${JSON.stringify(scene.audio)}`);
    if (!introAudio.source_loop[1]._playing) {
      if (bossAudio.source_loop[1]._playing || bossAudio.source_loop[2]._playing) {
        bossAudio.stop = true;
        stopAudio(bossAudio, 1);
        stopAudio(bossAudio, 2);
      }


      introAudio.stop = false;
      // playAudio(bossAudio, 1);

      playAudio(introAudio, 1);
    }
    // playAudio(introAudio, 1);
    // }

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
      const manifestCopy = _.cloneDeep(wave.ships[i]);
      manifestCopy.path = wave.paths ? _.cloneDeep(wave.paths[i]) : 0;
      if (wave.shipManifestOverride) {
        // use lodash
        _.merge(manifestCopy, wave.shipManifestOverride[i]);
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
      this.choreography = _.clone(wave.choreography);
      this.loopChoreography = _.clone(wave.choreography);
    } else {
      // No choreography specified? default is to just load enemies.
      this.loadEnemies(wave);
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
        this.sceneCounter++;
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
            this.waveCounter++;
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

  // A choreographed wave calls this method to update.
  choreographyUpdate() {
    // Is choreography over?
    if (this.choreography.length == 0) {
      // Are there enemies we are waiting for?
      if (this.enemiesInWave) {
        console.log('handling enemy leaving')
        this.handleEnemyWaveCompletion();
        return;
      }
      this.wave = false;
      this.waveTimer = 0;
      this.choreography = 0;
      return;
    }

    this.currentChor = this.choreography[0];

    // console.log('--------------');
    // console.log(this.choreography);
    // console.log(' and current chor ');
    // console.log(this.currentChor);
    // console.log(' and current wave ');
    // console.log(this.wave);

    // Handle all possible choreography cases here. This will get long.
    switch (this.currentChor.id) {
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
        if (this.currentChor.init) {
          if (this.waveTimer > this.currentChor.duration) {
            hideMessage('message-overlay');
            this.choreography.shift();
          }
        } else {
          if (this.currentChor.type === 'warning') {
            console.log('Stoping audio');
            introAudio.stop = true;
            stopAudio(introAudio, 1);
            stopAudio(introAudio, 2);


            if (!bossAudio.source_loop[1]._playing && !bossAudio.source_loop[2]._playing) {
              bossAudio.stop = false;
              console.log('Playing boss audio');
              playAudio(bossAudio, 1);
            }

            showMessage(this.currentChor.text[0], this.currentChor.text[1], 1);
          } else {
            showMessage(this.currentChor.text[0], this.currentChor.text[1]);
          }

          // Post the score after the user has finished the game only if god mode isn't enabled
          const name = Cookies.get('name') || '';
          const isgodModEnabled = name.toLowerCase() === 'chris' || name.toLowerCase() === 'algorithm0r';
          if (this.currentChor.type === 'gameOver' && !isgodModEnabled) {
            const playerName = Cookies.get('name');
            const playerScore = this.game.score;
            if (playerName) {
              saveLeaderBoardScore(playerName, playerScore);
            }
          }

          // If duration isn't specified, just move on
          if (!this.currentChor.duration) {
            this.choreography.shift();
          } else {
            // Else start countdown
            this.waveTimer = 0;
            this.currentChor.init = true;
          }
        }
        break;

      case 'wait':
        if (this.currentChor.init) {
          if (this.waveTimer >= this.currentChor.duration) {
            this.waveTimer = 0;
            this.choreography.shift();
          }
          // Also check if the enemies are dead
          if (this.enemiesInWave) {
            // console.log('checking dead');
            this.handleEnemyWaveCompletion();
          }
        } else {
          this.waveTimer = 0;
          this.currentChor.init = true;
        }
        break;

      case 'hideMessage':
        hideMessage('message-overlay');
        this.choreography.shift();
        break;

      case 'spawnEnemies':
        // only spawn enemies once
        if (!this.currentChor.init) {
          this.loadEnemies(this.wave);
          this.enemiesInWave = true;
          this.currentChor.init = true;
        }
        this.choreography.shift();
        break;

      case 'loadBackground':
        this.loadBackground(this.currentChor.bg);
        this.choreography.shift();
        break;

      case 'swapRing':
        // If it exists,
        if (this.entitiesInWave[this.currentChor.enemyIndex]) {
          this.entitiesInWave[this.currentChor.enemyIndex].initializeWeapon(this.currentChor.ring);
        }
        this.choreography.shift();
        break;

      case 'swapSlaveRing':
        if (this.entitiesInWave[this.currentChor.enemyIndex].slaves) {
          this.entitiesInWave[this.currentChor.enemyIndex].initializeSlaveWeapon(this.currentChor.slaveIndex, this.currentChor.ring);
        }
        this.choreography.shift();
        break;

      case 'resetChoreography':
        this.choreography.shift();
        this.waveTimer = 0;
        this.choreography = _.cloneDeep(this.loopChoreography).slice(this.currentChor.index,
          this.loopChoreography.length);
        break;

      case 'checkpoint':
        // save the current states of waves the scene
        this.checkPointWaveState = _.cloneDeep(this.waves);
        this.checkPointWaveState.unshift(this.wave);
        this.checkPointSceneState = _.cloneDeep(this.scenes);
        this.checkPointChoreographyState = _.cloneDeep(this.choreography);
        this.checkPointScore = this.game.score;
        this.choreography.shift();
        // Create a cookie for this level (the user unlocked this point to start
        // from in the future)
        Cookies.set(this.currentChor.prettyName, this.currentChor.sceneName);
        break;

      default:
        break;
    }
  }

  loadCheckpoint() {
    // load last saved checkpoint state
    if (this.entitiesInWave) {
      // remove all enemies on screen.
      this.entitiesInWave.forEach((element) => {
        element.removeFromWorld = true;
      });
      this.game.entities.forEach((element) => {
        if (element instanceof Projectile) {
          element.removeFromWorld = true;
        }
      })
    }
    updateScoreBoard(this.checkPointScore);
    this.game.score = this.checkPointScore;
    this.scenes = this.checkPointSceneState;
    this.waves = this.checkPointWaveState;
    this.waves.unshift(scene.restartFromCheckpoint.waves[0])
    // this.choreography = this.checkPointChoreographyState;
    this.waveTimer = 0;
    this.game.lives = 3;
    for (let i = 0; i < this.game.lives; i++) {
      addLife();
    }
  }

  handleEnemyWaveCompletion() {
    // Are we waiting for enemies to be killed/go off screen before we
    // continue?
    if (this.wave.waitUntilEnemiesGone) {
      if (this.entitiesInWave.length == 0) {
        this.wave = false;
        this.waveTimer = 0;
        this.enemiesInWave = false;
        // Also advance choreography if we have it.
        if (this.choreography) {
          this.choreography = 0;
        }
      }
    }
  }
}

class Background extends Entity {
  constructor(game, spritesheet, verticalPixels, parallaxMult, initOffset) {
    super(game, {
      x: 0,
      y: initOffset,
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
