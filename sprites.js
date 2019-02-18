function loadSpriteSheets() {
  /** The Crane spritesheet configuration */
  sprite.crane = {
    default: {
      default: {
        image: AM.getAsset('./img/crane-sheet.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 220,
          frameHeight: 165,
          frameCount: 4,
          timePerFrame: 0.1,
          scale: 0.6,
          flip: false,
        },
      },
    },
  };

  /** Experiment: mini-sized Crane projectiles */
  sprite.miniCrane = {
    default: {
      default: {
        image: AM.getAsset('./img/mini-crane-sheet.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 55,
          frameHeight: 41,
          frameCount: 4,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
        },
      },
    },
  };

  sprite.bat = {
    default: {
      default: {
        image: AM.getAsset('./img/bat-sheet.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 330,
          frameHeight: 190,
          frameCount: 4,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
        },
      },
    },
  };

  sprite.swallow = {
    default: {
      default: {
        image: AM.getAsset('./img/swallow-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 616,
          frameHeight: 330,
          frameCount: 12,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
        },
      },
    },
    boss: {
      default: {
        image: AM.getAsset('./img/swallow-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 616,
          frameHeight: 330,
          frameCount: 12,
          timePerFrame: 0.1,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  sprite.owl = {
    default: {
      default: {
        image: AM.getAsset('./img/owl.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 620,
          frameHeight: 330,
          frameCount: 10,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
        },
      },
    },
    boss: {
      default: {
        image: AM.getAsset('./img/owl.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 620,
          frameHeight: 330,
          frameCount: 10,
          timePerFrame: 0.1,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  sprite.dove = {
    default: {
      default: {
        image: AM.getAsset('./img/dove.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 617,
          frameHeight: 330,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
        },
      },
    },
  };

  // Power up sprites
  sprite.rainbowBall = {
    default: {
      default: {
        image: AM.getAsset('./img/rainbow_ball.png'),
        dimension: {
          originX: 0,
          originY: 0,
          // LOL THIS BALL IMAGE IS BIGGER THAN 4K
          frameWidth: 300,
          frameHeight: 288,
          frameCount: 1,
          timePerFrame: 30,
          scale: 0.2,
          flip: false,
        },
      },
    },
  };

  sprite.heartIcon = {
    default: {
      default: {
        image: AM.getAsset('./img/heart.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 100,
          frameHeight: 83,
          frameCount: 1,
          timePerFrame: 30,
          scale: 0.5,
          flip: false,
        },
      },
    },
  };

  sprite.shieldIcon = {
    default: {
      default: {
        image: AM.getAsset('./img/shield-icon.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 53,
          frameHeight: 57,
          frameCount: 1,
          timePerFrame: 30,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  sprite.shield = {
    default: {
      image: AM.getAsset('./img/shield.png'),
      dimension: {
        originX: 50,
        originY: 50,
        frameWidth: 50,
        frameHeight: 50,
        frameCount: 1,
        timePerFrame: 30,
        scale: 1,
        flip: false,
      },
    },
  };

  sprite.rapidFire = {
    default: {
      default: {
        image: AM.getAsset('./img/fire-rate.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 57,
          frameHeight: 50,
          frameCount: 1,
          timePerFrame: 60,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  sprite.reverseControls = {
    default: {
      default: {
        image: AM.getAsset('./img/reverse.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 62,
          frameHeight: 54,
          frameCount: 1,
          timePerFrame: 30,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  sprite.homingMissile = {
    default: {
      default: {
        image: AM.getAsset('./img/missile.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 320,
          frameHeight: 170,
          frameCount: 1,
          timePerFrame: 30,
          scale: 0.5,
          flip: false,
        },
      },
    },
  };

  sprite.gunUp = {
    default: {
      default: {
        image: AM.getAsset('./img/gunup.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 100,
          frameHeight: 46,
          frameCount: 1,
          timePerFrame: 30,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  sprite.chainGun = {
    default: {
      default: {
        image: AM.getAsset('./img/chaingun.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 100,
          frameHeight: 100,
          frameCount: 1,
          timePerFrame: 30,
          scale: 1,
          flip: false,
        },
      },
    },
  };

  /** Laser sprite */
  // sprite.testLaser = {
  //   default: {
  //     image: AM.getAsset('./img/7_shoot_sheet.png'),
  //     dimension: {
  //       originX: 176,
  //       originY: 176,
  //       frameWidth: 12,
  //       frameHeight: 60,
  //       frameCount: 5,
  //       timePerFrame: 20,
  //       scale: 1.0,
  //       flip: false,
  //     }
  //   }
  // }

  sprite.testLaser = {
    default: {
      default: {
        image: AM.getAsset('./img/laser_red.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 32,
          frameHeight: 128,
          frameCount: 11,
          timePerFrame: 20,
          scale: 0.5,
          flip: false,
        },
      },
    },
  };

  sprite.laser = {
    orange: {
      default: {
        image: AM.getAsset('./img/7_shoot_sheet.png'),
        dimension: {
          originX: 176,
          originY: 177,
          frameWidth: 12,
          frameHeight: 54,
          frameCount: 5,
          timePerFrame: 20,
          scale: 0.6,
          flip: false,
        },
      },
    },
    yellow: {
      default: {
        image: AM.getAsset('./img/7_shoot_sheet.png'),
        dimension: {
          originX: 176,
          originY: 283,
          frameWidth: 12,
          frameHeight: 54,
          frameCount: 5,
          timePerFrame: 20,
          scale: 0.5,
          flip: false,
        },
      },
    },
    white: {
      default: {
        image: AM.getAsset('./img/7_shoot_sheet.png'),
        dimension: {
          originX: 176,
          originY: 389,
          frameWidth: 12,
          frameHeight: 54,
          frameCount: 5,
          timePerFrame: 20,
          scale: 0.5,
          flip: false,
        },
      },
    },
    bigGreen: {
      default: {
        image: AM.getAsset('./img/7_shoot_sheet.png'),
        dimension: {
          originX: 8,
          originY: 282,
          frameWidth: 26,
          frameHeight: 78,
          frameCount: 5,
          timePerFrame: 20,
          scale: 0.5,
          flip: false,
        },
      },
    },
    bigOrange: {
      default: {
        image: AM.getAsset('./img/7_shoot_sheet.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 52,
          frameHeight: 140,
          frameCount: 5,
          timePerFrame: 20,
          scale: 0.5,
          flip: false,
        },
      },
    },
  };

  sprite.cutLaser = {
    default: {
      default: {
        image: AM.getAsset('./img/cut_laser.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 128,
          frameHeight: 46,
          frameCount: 1,
          timePerFrame: 20,
          scale: 0.3,
          flip: false,
        },
      },
    },
  };

  sprite.plane = {
    purple: {
      default: {
        image: AM.getAsset('./img/purple-plane-small.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      right: {
        image: AM.getAsset('./img/purple-plane-small.png'),
        dimension: {
          originX: 60,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      left: {
        image: AM.getAsset('./img/purple-plane-small.png'),
        dimension: {
          originX: 120,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      rollRight: {
        image: AM.getAsset('./img/purple-plane-small.png'),
        dimension: {
          originX: 0,
          originY: 66,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 8,
          timePerFrame: 0.07,
          scale: 1.0,
          flip: false,
        },
      },
      rollLeft: {
        image: AM.getAsset('./img/purple-plane-small.png'),
        dimension: {
          originX: 0,
          originY: 132,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 8,
          timePerFrame: 0.07,
          scale: 1.0,
          flip: false,
        },
      },
    },
    red: {
      default: {
        image: AM.getAsset('./img/plane-small.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      right: {
        image: AM.getAsset('./img/plane-small.png'),
        dimension: {
          originX: 60,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      left: {
        image: AM.getAsset('./img/plane-small.png'),
        dimension: {
          originX: 120,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      rollRight: {
        image: AM.getAsset('./img/plane-small.png'),
        dimension: {
          originX: 0,
          originY: 66,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 8,
          timePerFrame: 0.07,
          scale: 1.0,
          flip: false,
        },
      },
      rollLeft: {
        image: AM.getAsset('./img/plane-small.png'),
        dimension: {
          originX: 0,
          originY: 132,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 8,
          timePerFrame: 0.07,
          scale: 1.0,
          flip: false,
        },
      },
    },
    lightBlue: {
      default: {
        image: AM.getAsset('./img/light_blue_plane.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      right: {
        image: AM.getAsset('./img/light_blue_plane.png'),
        dimension: {
          originX: 60,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      left: {
        image: AM.getAsset('./img/light_blue_plane.png'),
        dimension: {
          originX: 120,
          originY: 0,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 1,
          timePerFrame: 0,
          scale: 1.0,
          flip: false,
        },
      },
      rollRight: {
        image: AM.getAsset('./img/light_blue_plane.png'),
        dimension: {
          originX: 0,
          originY: 66,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 8,
          timePerFrame: 0.07,
          scale: 1.0,
          flip: false,
        },
      },
      rollLeft: {
        image: AM.getAsset('./img/light_blue_plane.png'),
        dimension: {
          originX: 0,
          originY: 132,
          frameWidth: 60,
          frameHeight: 66,
          frameCount: 8,
          timePerFrame: 0.07,
          scale: 1.0,
          flip: false,
        },
      },
    },
  }; // end purple plane
}
