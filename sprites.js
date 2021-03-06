function loadSpriteSheets() {
  /** The Crane spritesheet configuration */
  sprite.crane = {
    default: {
      default: {
        image: AM.getAsset('./img/crane.png'),
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
        image: AM.getAsset('./img/crane.png'),
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
        image: AM.getAsset('./img/bat.png'),
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
        image: AM.getAsset('./img/bat.png'),
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
        image: AM.getAsset('./img/swallow.png'),
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
        image: AM.getAsset('./img/swallow.png'),
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
        image: AM.getAsset('./img/swallow.png'),
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
        image: AM.getAsset('./img/swallow.png'),
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
          loop: true
        },
      },
      hit:  {
        image: AM.getAsset('./img/owl.png'),
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
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/owl.png'),
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
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/dove.png'),
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

  sprite.pigeon = {
    default: {
      default: {
        image: AM.getAsset('./img/pigeon.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 530,
          frameHeight: 460,
          frameCount: 10,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/pigeon.png'),
        dimension: {
          originX: 0,
          originY: 460,
          frameWidth: 530,
          frameHeight: 460,
          frameCount: 10,
          timePerFrame: 0.2,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.bird = {
    default: {
      default: {
        image: AM.getAsset('./img/bird.png'),
        dimension:  {
          originX: 0,
          originY: 0,
          frameWidth: 774,
          frameHeight: 430,
          frameCount: 8,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/bird.png'),
        dimension:  {
          originX: 6192,
          originY: 0,
          frameWidth: 774,
          frameHeight: 430,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.eagleBoss = {
    default: {
      default: {
        image: AM.getAsset('./img/eagle.png'),
        dimension:  {
          originX: 0,
          originY: 0,
          frameWidth: 1000,
          frameHeight: 500,
          frameCount: 8,
          timePerFrame: 0.2,
          scale: 1.5,
          flip: false,
          loop: true
        },
        // hit: {
        //   interval: 0.08,
        //   duration: 0.08,
        // }
      },
      hit:  {
        image: AM.getAsset('./img/eagle.png'),
        dimension:  {
          originX: 0,
          originY: 501,
          frameWidth: 1000,
          frameHeight: 500,
          frameCount: 8,
          timePerFrame: 0.2,
          scale: 1.5,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.goose = {
    default: {
      default: {
        image: AM.getAsset('./img/goose.png'),
        dimension:  {
          originX: 0,
          originY: 0,
          frameWidth: 627,
          frameHeight: 430,
          frameCount: 8,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/goose.png'),
        dimension:  {
          originX: 5016,
          originY: 0,
          frameWidth: 627,
          frameHeight: 430,
          frameCount: 1,
          timePerFrame: 0.1,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.hummer = {
    default: {
      default: {
        image: AM.getAsset('./img/hummer.png'),
        dimension:  {
          originX: 0,
          originY: 0,
          frameWidth: 430,
          frameHeight: 424,
          frameCount: 6,
          timePerFrame: 0.08,
          scale: 0.3,
          flip: false,
          loop: true
        }
      },
      hit:  {
        image: AM.getAsset('./img/hummer.png'),
        dimension:  {
          originX: 0,
          originY: 424,
          frameWidth: 430,
          frameHeight: 424,
          frameCount: 6,
          timePerFrame: 0.08,
          scale: 0.3,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.beta = {
    default: {
      default: {
        image: AM.getAsset('./img/beta.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 300,
          frameHeight: 430,
          frameCount: 8,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/beta.png'),
        dimension: {
          originX: 0,
          originY: 430,
          frameWidth: 300,
          frameHeight: 430,
          frameCount: 8,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.crab = {
    default: {
      default: {
        image: AM.getAsset('./img/crab.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 320,
          frameHeight: 230,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/crab.png'),
        dimension: {
          originX: 0,
          originY: 230,
          frameWidth: 320,
          frameHeight: 230,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    },
    boss: {
      default: {
        image: AM.getAsset('./img/crab.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 320,
          frameHeight: 230,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 1.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/crab.png'),
        dimension: {
          originX: 0,
          originY: 230,
          frameWidth: 320,
          frameHeight: 230,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 1.5,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.dolphinRight = {
    default: {
      default: {
        image: AM.getAsset('./img/dolphinRight.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 420,
          frameHeight: 210,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/dolphinRight.png'),
        dimension: {
          originX: 0,
          originY: 210,
          frameWidth: 420,
          frameHeight: 210,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.dolphinLeft = {
    default: {
      default: {
        image: AM.getAsset('./img/dolphinLeft.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 420,
          frameHeight: 210,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: true,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/dolphinLeft.png'),
        dimension: {
          originX: 0,
          originY: 210,
          frameWidth: 420,
          frameHeight: 210,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: true,
          loop: true
        }
      }
    }
  }

  sprite.eel = {
    default: {
      default: {
        image: AM.getAsset('./img/eel.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 80,
          frameHeight: 450,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/eel.png'),
        dimension: {
          originX: 0,
          originY: 80,
          frameWidth: 80,
          frameHeight: 450,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.fish = {
    default: {
      default: {
        image: AM.getAsset('./img/fish.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 200,
          frameHeight: 210,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/fish.png'),
        dimension: {
          originX: 0,
          originY: 210,
          frameWidth: 200,
          frameHeight: 210,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    },
    bullet: {
      default: {
        image: AM.getAsset('./img/fish.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 200,
          frameHeight: 210,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.1,
          flip: false,
          loop: true
        },
      }
    }
  }

  sprite.frog = {
    default: {
      default: {
        image: AM.getAsset('./img/frog.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 300,
          frameHeight: 280,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/frog.png'),
        dimension: {
          originX: 0,
          originY: 280,
          frameWidth: 300,
          frameHeight: 280,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    }
  }

  sprite.manta = {
    default: {
      default: {
        image: AM.getAsset('./img/manta.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 670,
          frameHeight: 450,
          frameCount: 8,
          timePerFrame: 0.1,
          scale: 1,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/manta.png'),
        dimension: {
          originX: 0,
          originY: 450,
          frameWidth: 670,
          frameHeight: 450,
          frameCount: 8,
          timePerFrame: 0.1,
          scale: 1,
          flip: false,
          loop: true
        }
      }
    } 
  }

  sprite.octopus = {
    default: {
      default: {
        image: AM.getAsset('./img/octopus.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 500,
          frameHeight: 388,
          frameCount: 6,
          timePerFrame: 0.15,
          scale: 1.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/octopus.png'),
        dimension: {
          originX: 0,
          originY: 389,
          frameWidth: 500,
          frameHeight: 388,
          frameCount: 6,
          timePerFrame: 0.15,
          scale: 1.5,
          flip: false,
          loop: true
        }
      }
    } 
  }

  sprite.seahorse = {
    default: {
      default: {
        image: AM.getAsset('./img/seahorse.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 230,
          frameHeight: 420,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/seahorse.png'),
        dimension: {
          originX: 0,
          originY: 420,
          frameWidth: 230,
          frameHeight: 420,
          frameCount: 6,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      }
    } 
  }

  sprite.turtle = {
    default: {
      default: {
        image: AM.getAsset('./img/turtle.png'),
        dimension: {
          originX: 0,
          originY: 0,
          frameWidth: 250,
          frameHeight: 200,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
          flip: false,
          loop: true
        }
      },
      hit: {
        image: AM.getAsset('./img/turtle.png'),
        dimension: {
          originX: 0,
          originY: 200,
          frameWidth: 250,
          frameHeight: 200,
          frameCount: 2,
          timePerFrame: 0.1,
          scale: 0.5,
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
          timePerFrame: 0,
          scale: 1,
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
          timePerFrame: 0,
          scale: 1,
          flip: false,
          loop: false
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
          scale: 0.2,
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
      hit:  {
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
          loop: false
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
