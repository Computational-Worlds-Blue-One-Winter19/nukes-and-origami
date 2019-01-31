
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

// /**
//  * A generic Weapon. The weapon has a payload and a cooldown period.
//  * The position of the turret is sent to each enemy,
//  * along with
//  */
// class Weapon {
//   constructor(owner, manifest) {
//     this.owner = owner;
//     this.payload = manifest.payload;
//     this.loadTime = manifest.loadTime;
//     this.cooldownTime = manifest.cooldownTime;
//     this.fullCount = manifest.turretCount || 1;
//     this.rapidReload = manifest.rapidReload;
//     //this.targeting = manifest.targeting;
//     //this.bulletSpeed = manifest.bulletSpeed;
//     //this.bulletAcceleration = manifest.bulletAcceleration;
//     this.bay = [];
//     this.isLoaded = false;
//     this.elapsedLoadTime = 0;
//     this.elapsedFireTime = 0;
//   }

//   update() {
//     const elapsedTime = this.owner.game.clockTick;

//     if (this.isLoaded) {
//       // manage firing sequence
//       this.elapsedFireTime += elapsedTime;

//       if (this.elapsedFireTime > this.cooldownTime) {
//         this.fireAll();
//         this.elapsedFireTime = 0;
//         this.reload();
//       }
//     } else {
//       // manage load sequence
//       this.elapsedLoadTime += elapsedTime;

//       if (this.elapsedLoadTime > this.loadTime) {
//         this.elapsedLoadTime = 0;
//         this.loadNext();
//       }

//       if (this.bay.length === this.fullCount) {
//         this.isLoaded = true;
//         this.elapsedLoadTime = 0;
//       }
//     }
//   }

//   fireAll() {
//     for (let projectile of this.bay) {
//       if (this.targetPlayer) {
//         // update heading before launch
//         const target = this.getPlayerHeading(projectile.originX, projectile.originY);
//         projectile.angle = target.angle;
//         projectile.distance = target.distance;
//       } else {
//         // Fire straight down
//         projectile.angle = Math.PI / 2;
//         // Some large number to ensure the bullet goes off screen.
//         projectile.distance = 1000;
//       }

//       projectile.isSpawned = true;
//     }
//   }

//   reload() {
//     this.bay = [];

//     if (this.rapidReload) {
//       for (let i = 0; i < this.fullCount; i++) {
//         this.loadNext();
//       }
//     } else {
//       this.isLoaded = false;
//     }
//   }

//   loadNext() {
//     const angle = this.getPlayerHeading(this.owner.current.x, this.owner.current.y).angle;
//     const origin = this.getTurretPosition(angle);

//     const manifest = {
//       owner: this.owner,
//       origin,
//       angle,
//       payload: this.payload,
//       rotation: this.rotation
//     };

//     const newProjectile = new Projectile(this.owner.game, manifest);
//     this.bay.push(newProjectile);
//     this.owner.game.addEntity(newProjectile);
//   }

//   getTurretPosition(angle) {
//     const x = this.owner.config.radius * Math.cos(angle) + this.owner.current.x;
//     const y = this.owner.config.radius * Math.sin(angle) + this.owner.current.y;
//     return { x, y };
//   }

//   // returns the coordinates of the player with respect to the given point
//   getPlayerHeading(originX, originY) {
//     const player = this.owner.game.player;

//     const deltaX = player.current.x - originX;
//     const deltaY = player.current.y - originY;
//     const angle = Math.atan2(deltaY, deltaX);

//     return {
//       angle,
//       distance: (deltaX * deltaX + deltaY * deltaY),
//     };
//   }
// }
