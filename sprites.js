function loadSpriteSheets() {
  /** The Crane spritesheet configuration */
  sprite.crane = {
    default: {
      default: {
        image: AM.getAsset('./img/crane-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 440,
          frameHeight: 330,
          frameCount: 4,
          timePerFrame: 0.1,
          scale: 0.6,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/crane-sheet-HIT.png'),
        dimension: {
          originX: 1760,
          originY: 0,
          frameWidth: 440,
          frameHeight: 330,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.6,
          flip: false,
          loop: true
        }
      }
    }
  }

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
          loop: true
        },
      },
    },
  };

  sprite.bat = {
    default: {
      default: {
        image: AM.getAsset('./img/bat-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 330,
          frameHeight: 190,
          frameCount: 4,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/bat-sheet-HIT.png'),
        dimension: {
          originX: 1320,
          originY: 0,
          frameWidth: 330,
          frameHeight: 190,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
    }
  }

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
          loop: true
        },
      },
      hit:  {
        image: AM.getAsset('./img/swallow-sheet-HIT.png'),
        dimension: {
          originX: 7389,
          originY: 0,
          frameWidth: 616,
          frameHeight: 330,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
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
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/swallow-sheet-HIT.png'),
        dimension: {
          originX: 7389,
          originY: 0,
          frameWidth: 616,
          frameHeight: 330,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 1,
          flip: false,
          loop: true
        }
      }
    },
  };

  sprite.owl = {
    default: {
      default: {
        image: AM.getAsset('./img/owl-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 620,
          frameHeight: 330,
          frameCount: 10,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        },
      },
      hit:  {
        image: AM.getAsset('./img/owl-sheet-HIT.png'),
        dimension: {
          originX: 6196,
          originY: 0,
          frameWidth: 620,
          frameHeight: 330,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        },
      }
    },
    boss: {
      default: {
        image: AM.getAsset('./img/owl-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 620,
          frameHeight: 330,
          frameCount: 10,
          timePerFrame: 0.1,
          scale: 1,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/owl-sheet-HIT.png'),
        dimension: {
          originX: 6196,
          originY: 0,
          frameWidth: 620,
          frameHeight: 330,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        },
      }
    }
  }

  sprite.dove = {
    default: {
      default: {
        image: AM.getAsset('./img/dove-sheet-HIT.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 617,
          frameHeight: 330,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/dove-sheet-HIT.png'),
        dimension: {
          originX: 3705,
          originY: 0,
          frameWidth: 617,
          frameHeight: 330,
          frameCount: 1,
          timePerFrame: 0.2,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
    }
  }

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
          timePerFrame: 0,
          scale: 0.2,
          flip: false,
          loop: false
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
          frameWidth: 256,
          frameHeight: 256,
          frameCount: 1,
          timePerFrame: 0,
          scale: 0.15,
          flip: false,
          loop: false
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
        timePerFrame: 0,
        scale: 1,
        flip: false,
        loop: false
      },
    },
  };

  sprite.rapidFire = {
    default: {
      default: {
        image: AM.getAsset('./img/rapid-bullet.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 1280,
          frameHeight: 360,
          frameCount: 1,
          timePerFrame: 0,
          scale: 0.10,
          flip: false,
          loop: false
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
          loop: true
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
          loop: true
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
          loop: true
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
          loop: true
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
          loop: true
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
          loop: true
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
          loop: false
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
          loop: false
        }
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
          loop: false
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
          loop: false
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
          loop: true
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
          loop: true
        }
      },
      hit:  {
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
          loop: false
        }
      }
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
          loop: false
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
          loop: false
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
          loop: false
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
          loop: true
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
          loop: true
        }
      },
      hit:  {
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
          loop: false
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
          loop: false
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
          loop: false
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
          loop: true
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
          loop: true
        },
      },
    },
  }; // end purple plane

  sprite.explosion = {
    default:  {
        image: AM.getAsset('./img/explosion-sheet.png'),
        dimension:  {
          originX: 0,
          originY: 0,
          frameWidth: 483,
          frameHeight: 383,
          frameCount: 3,
          timePerFrame: 0.1,
          scale: 1.0,
          flip: false,
          loop: false
      },
    },
  }; //end explosion
}
