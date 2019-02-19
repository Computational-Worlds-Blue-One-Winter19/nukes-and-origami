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
  constructor(dropRate) {
    super(dropRate);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.heartIcon.default,
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
  constructor(dropRate) {
    super(dropRate);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.shieldIcon.default,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          // Add the power up to the screen inventory

          addItem('./img/shield-icon.png', 'shield', 'powerUp');


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
  constructor(dropRate) {
    super(dropRate);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.rapidFire.default,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          // quick fix for change to weapon array. assuming that player only has one!
          // const ring = entity.weapon.slot[0].ring;
          // if (ring.config.cooldownTime > 0.05) {
          //   ring.config.cooldownTime -= 0.1;
          //   addPowerUp('./img/rapid-bullet.png', 'rapidFire');
          // }

          // // temp override to see if homing missle will work
          // entity.weapon.loadHomingMissile(() => {
          //   // send a callback to run this function if loadHomingMissle() is successful
          //   addPowerUp('./img/rapid-bullet.png', 'rapidFire');
          // });
          const ring = entity.weapon.slot[0].ring;
          if (ring.config.cooldownTime > 0.05) {
            ring.config.cooldownTime -= 0.1;
            addItem('./img/fire-rate.png', 'rapidFire', 'powerUp');
          }
        },
      },
    };
  }
}

function containsType(type) {
  const elements = document.getElementsByClassName(type);

  return elements.length === 1;
}
class HomingMissile extends PowerUp {
  constructor(dropRate) {
    super(dropRate);

    // Will be initial
    this.entity = null;

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.homingMissile.default,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          // this.entity = entity;
          // this.activate();
          if (!containsType('hommingMissile')) {
            addItem('./img/missile.png', 'hommingMissile', 'weapon');
            // entity.weapon.hasHomingMissile = true;
            entity.weapon.inventory.push(() => {
              // Pushing the function that will be used to activate the powerUp by the player
              entity.weapon.loadHomingMissile(ring.enemyHoming, () => {
                // send a callback to run this function if loadHomingMissle() is successful
                removeItem('hommingMissile', 'weapon');

                // Start the timer
                startTimer(20, entity.weapon.removeHomingMissile, entity.weapon);
              });
            });
          }
        },
      },
    };
  }
}


class ChainGun extends PowerUp {
  constructor(dropRate) {
    super(dropRate);

    // Will be initial
    this.entity = null;

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.chainGun.default,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          // this.entity = entity;
          // this.activate();
          if (!containsType('chainGun')) {
            addItem('./img/chaingun.png', 'chainGun', 'weapon');
            // entity.weapon.hasChainGun = true;
            entity.weapon.inventory.push(() => {
              // Pushing the function that will be used to activate the powerUp by the player
              entity.weapon.loadChainGun(ring.chainGun, () => {
                // send a callback to run this function if loadHomingMissle() is successful
                removeItem('chainGun', 'weapon');

                // Start the timer
                startTimer(20, entity.weapon.removeHomingMissile, entity.weapon);
              });
            });
          }
        },
      },
    };
  }
}


class InvertedControls extends PowerUp {
  constructor(dropRate) {
    super(dropRate);

    this.manifest = {
      owner: null,
      angle: Math.PI / 2,
      payload: {
        type: {
          sprite: sprite.reverseControls.default,
          radius: 30,
        },
        speed: 60,
        powerUp(entity) {
          entity.game.player.controls.hasInvertedControls = true;
          entity.game.player.controls.startTime = 0;

          showControlMessage('Controls Reversed!');
        },
      },
    };
  }
}


// From the collection of implemented powerups, retrieves and return a random one
function getRandomPowerUp(weapon) {
  const POWERUPS = [new InvertedControls(100), new Shield(100), new ExtraLife(100), new RapidFire(100)];
  // const POWERUPS = [];

  // No need to drop more missiles if the player already has one loaded, easy to modify if we decide to drop them
  // down the road
  if (!containsType('hommingMissile')) {
    POWERUPS.push(new HomingMissile(100));
  }

  if (!containsType('chainGun')) {
    POWERUPS.push(new ChainGun(100));
  }


  return POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
}

function playAudio() {
  // const audioUrl = 'http://soundbible.com/mp3/Pew_Pew-DKnight556-1379997159.mp3';
  // const audioUrl = 'https://www.soundsnap.com/streamers/play.php?id=1550204891.5066:07dd2b3c0504a70acdff1bd83a645f7ce86994a0:262b3417d5dbe0d06abc7f96b07a3047eae0118c5fdd5701af379bde5b98e874b9563b8f1a66b799c23077581c33a646f84ea85eb8e15204927f1bd6f575ff8ad6667cf0c6d30e37025852868d02574fc92aa6d8fdfd83a6f947cf919dc52fe1f3e191ec49730a4ec815e1312c716c429c11cdd8e93469bd965f24688c5d2255b14b4460c7a5ba86ea106899be86c5207c1cda458aae71b28987a1ff36c99edbc0443e52284ed1291123ec325a0f192299412f9ef7c2e2855d96ab5f6ea0feba99cbde8cc606fe1306571706e163266d';
  // const audioUrl = "http://soundbible.com/mp3/Laser%20Blasts-SoundBible.com-108608437.mp3"
  // array with souds to cycle trough
  // the more in the array, the faster you can retrigger the click
  const audio2 = [new Audio(audioUrl), new Audio(audioUrl), new Audio(audioUrl), new Audio(audioUrl), new Audio(audioUrl)]; // put it has much has you want
  let soundNb = 0; // counter

  audio2[soundNb++ % audio2.length].play();
}


// $('.btn2').click(() => audio2[soundNb++ % audio2.length].play());
