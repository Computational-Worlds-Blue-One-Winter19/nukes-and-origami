function loadTemplates() {

  /***** PROJECTILES: SHAPES AND SPRITES *****/
  projectile.circleBullet = {
    radius: 6,
    draw: function (ctx) {
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  /***** RING: FIRING PATTERNS *****/
  ring.spiralAlpha1 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1
    },
    rotation: {
      angle: 720,
      frequency: 4
    },
    firing: {
      count: 3,
      loadTime: 0.01,
      cooldownTime: .1,
      rapidReload: true,
      targetPlayer: false
    }
  }

ring.spiralAlpha2 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1
    },
    rotation: {
      angle: 720,
      frequency: 4
    },
    firing: {
      count: 1,
      loadTime: 0.05,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: false
    }
  }

  ring.spiralAlpha3 = {
    payload: {
      type: projectile.circleBullet,
      speed: 500,
      acceleration: 1
    },
    rotation: {
      angle: 180,
      frequency: 1
    },
    firing: {
      count: 1,
      loadTime: 0.05,
      cooldownTime: .01,
      rapidReload: true,
      targetPlayer: false
    }
  }

  ring.spiralAlpha4 = {
    payload: {
      type: projectile.circleBullet,
      speed: 300,
      acceleration: 1
    },
    rotation: {
      angle: 180,
      frequency: 20
    },
    firing: {
      angle: 90,
      count: 10,
      loadTime: 0.05,
      cooldownTime: .45,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: true
    }
  }

  ring.uniLinear = {
    payload: {
      type: projectile.circleBullet,
      speed: 250,
      acceleration: 1
    },
    firing: {
      angle: 90,
      count: 1,
      loadTime: 0.005,
      cooldownTime: .15,
      rapidReload: true,
      targetPlayer: true,
      viewTurret: false,
      pulse: {
        duration: 2,
        delay: .5
      }
    }
  }

  /***** ENEMY SHIPS *****/
  ship.demoCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0
    },
    path: [[180, 100, 5], [0, 100, 5], [180, 100, 5], [0, 100, 5], [90, 100, 60]],
    weapon: ring.spiralAlpha4
  };

  ship.idleCrane = {
    config: {
      hitValue: 5,
      radius: 50,
      sprite: sprite.crane,
      snapLine: 150,
      snapLineSpeed: 150,
      snapLineWait: 0,
      origin: {
        x: 500, // omit x to get random position
        y: -50
      },
      weaponsOnEntrance: false,
      weaponsAdvantage: 0
    },
    weapon: ring.uniLinear
  };


  /***** ALL PLAYER THINGS *****/
  projectile.player1 = {
    radius: 8,
    draw: function (ctx) {
      ctx.strokeStyle = 'orange';
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, this.config.radius, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  /** A simple ring for the player only shoots up */
  ring.player = {
    payload: {
      type: projectile.player1,
      speed: 500,
      acceleration: 1
    },
    firing: {
      angle: 270,
      count: 1,
      loadTime: 0.01,
      cooldownTime: .25,
      rapidReload: true,
      viewTurret: false
    }
  }

  ship.player = {
    config: {
      radius: 40,
      sprite: sprite.plane,
      speed: 400
    },
    weapon: ring.player
  }

} // end of objects file
