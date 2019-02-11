const DEFAULT_DROP_RATE = 50;
const MAX_RANDOM = 100;

class PowerUp {
  /**
   * Constructor for a power up
   * @param {Optional && Int} dropRate Drop rate determines the change that the power up is dropped,
   * if one isn't given the DEFAULT_DROP_RATE is used
   */
  constructor(dropRate) {
    this.dropRate = dropRate || DEFAULT_DROP_RATE;
  }

  /**
     * Retrieves an init point for the power up using either the provided manifest or
     * by generating an appropraite point for the game
     * @param {GameEngine} game
     * @param {??} manifest
     */
  static getInitPoint(game, manifest) {
    // Check if the manifest has a coordinate else generate a random one
    const coordinate = manifest.coordinate || generateRandomPoint(game);

    return coordinate;
  }

  /**
     * Generates and returns a random coordinate inside the game canvas by using its surface
     * width and height
     * @param {GameEngine} game
     */
  static generateRandomPoint(game) {
    const width = game.surfaceWidth;
    const height = game.surfaceHeight;

    const x = getRandomInt(width);
    const y = getRandomInt(height);

    return { x, y };
  }

  /**
     * Generates a random integer value from 0(inclusive) - max (exclusive)
     * @param {Int} max
     */
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  /**
   * Returns whether or not the power up should be dropped
   */
  shouldDrop() {
    return PowerUp.getRandomInt(MAX_RANDOM) < this.dropRate;
  }
}

class ExtraLife extends PowerUp {
  constructor() {
    super(50);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.rainbowBall,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          entity.game.lives += 1;
          addLife();
        },
      },
    };
  }
}

class Shield extends PowerUp {
  constructor() {
    super(100);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.shieldIcon,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          // Add the power up to the screen inventory

          addPowerUp('./img/shield-icon.png', 'shield');


          const currentX = entity.game.player.current.x;
          const currentY = entity.game.player.current.y;

          const shield = new ShieldEntity(entity.game, {
            x: currentX,
            y: currentY,
          });

          entity.game.player.shield.hasShield = true;
          entity.game.player.shield.entities.push(shield);

          entity.game.addEntity(shield);
        },
      },
    };
  }
}

class RapidFire extends PowerUp {
  constructor() {
    super(100);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.rapidFire,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          if (entity.weapon.config.cooldownTime > 0.05) {
            entity.weapon.config.cooldownTime -= 0.1;
            addPowerUp('./img/rapid-bullet.png', 'rapidFire');
          }
        },
      },
    };
  }
}
