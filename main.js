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
AM.queueDownload('./img/spacebg.png');
AM.queueDownload('./img/paper-wallpaper.png');
AM.queueDownload('./img/lined-paper.png');
AM.queueDownload('./img/bullet.png');
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
    // player.invincTime += this.clockTick;
    if(player.invincTime == 0)  {
      this.lives -= 1;
      removeLifeFromBoard()
      player.invincTime += this.clockTick;
    }
    if (this.lives === 0) { // game over 
      //this.gameOver()
    } 
  }

  // eventually this should be scripted.
  spawnEnemy() {
    //path: [[180, 100, 5], [0, 100, 5], [180, 100, 5], [0, 100, 5], [90, 100, 60]];
    
    //let crane2 = new Ship(this, ship.demoCrane);
    //crane1.initializePath([[180, 100, 5], [0, 100, 5]]);
    //crane2.initializePath([[90,25,60]]);
    
    //let crane1 = new Ship(this, ship.idleCrane);
    
    this.addEntity(new Ship(this, ship.idleBat));
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
  
  loadSpriteSheets();
  loadTemplates();
  
  const game = new NukesAndOrigami();
  game.init(ctx);
  game.spawnPlayer();
  game.start();
  game.spawnEnemy();
  console.log('All Done!');
  canvas.focus();
});

/** Global helpers (could go elsewhere) */
function toRadians(angle) {
  return angle * Math.PI / 180;
}
