class Editor {
    constructor(game)   {
        this.originalGame = game;
        this.game = new NukesAndOrigami();
        this.previewGame = new Preview();
        this.ctx = game.ctx;
        this.game.init(this.ctx);
        this.game.start();
        this.originalGame.editorPause();
        this.ctx.clearRect(0, 0, 2000, 2000);    
        this.init();
        this.myScenes = [];
        this.myScenes.push(new Scene());
        this.currentScene = 0;
    }

    init()  {
        const options = {};
        this.previewCanvas = document.getElementById('preview');
        this.preview = this.previewCanvas.getContext('2d');
        this.previewGame.init(this.preview);
        this.previewGame.start();
        addEvent(
            document.getElementById('goBack'),
            'click',
            () => {
              const container = document.getElementById('scoreboard');
              container.style.display = 'initial';
              const editor = document.getElementById('editor');
              editor.style.display = 'none';
              const fps = document.getElementById('fps')
              fps.style.display = 'initial';
              this.game = null;
              this.previewGame = null;
              this.originalGame.resume();
            },
        );
        var elems = document.querySelectorAll('select');
        this.instances = M.FormSelect.init(elems, options);
        var gameReference = this.game;
        var previewReference = this.previewGame;
        document.addEventListener('change', function(event) {
            switch(event.target.id) {
                case 'chooseBackground':
                    gameReference.sceneManager.loadBackground(eval(event.target.value));
                    break;
                case 'chooseEnemy':
                    previewReference.clearEntities();
                    let add = new Ship(previewReference, eval(event.target.value));
                    add.current.x = 100;
                    add.current.y = 0;
                    previewReference.addEntity(add);
                    break;
                case 'chooseWeapon':
                    previewReference.ship.initializeWeapon(eval(event.target.value));
                    break;
                case 'choosePath':
                    console.log("Path chosen: " + event.target.value);
                    break;
            }
        });
        // addEvent(
        //     document.getElementById('preview'),
        //     'click',
        //     () => {
        //         this.previewGame.clearEntities();
        //         let manifest = this.getEnemySelection();
        //         let add = new Ship(this.previewGame, manifest);
        //         // add.sprite.scale -= 0.2;
        //         add.current.x = 100;
        //         add.current.y = 0;
        //         if(this.instances[2].el.value != 'None')    {
        //             add.initializeWeapon(eval(this.instances[2].el.value));
        //         }
        //         this.previewGame.addEntity(add);
        //         this.game.sceneManager.loadBackground(eval(this.instances[0].el.value));
        //         //this.previewGame.addEntity(getEnemySelection());
        //         // console.log(val.getSelectedValues());
        //         var div = document.createElement('div');
        //         div.setAttribute('class', 'timelineElement');
        //         div.style.marginLeft = '105px';
        //         // div.style.marginTop = '-100px';
        //         document.getElementById('timelineBorder').appendChild(div);
        //     },
        // );
        document.querySelectorAll('#fps').forEach(e => e.style.display = 'none');
    }

}

class Scene {
    constructor()   {
        this.choreography = [];
        this.enemies = [];
        this.initialXPoints = []
        this.paths = []; 
        this.enemyWeaponOveride = [];
    }

    addEnemy(enemy, initial, path, overide) {
        this.enemies.push(enemy);
        this.paths.push(path);
        if(override)    {
            this.enemyWeaponOveride.push(overide);
        } else {
            this.enemyWeaponOveride.push('None');
        }
        if(initial) {
            this.initialXPoints.push(initial);
        }
    }

    getJSON()   {
        let obj = {
            waves: [{
                    choreography: [
                        {
                        //intro choreography. Doesn't always exist.
                        }
                    ],
                },
                {
                    choreography: [
                        {
                            id: 'spawnEnemies' //should always be here
                        },
                        {
                            //enemy choreography. Should always exist.
                        }
                    ],
                //     numOfEnemies:
                //     ships: []
                //     paths: []
                //     shipManifestOverride: [{
                //             config: {

                //             },
                //             weapon: {
                //                 payload: {

                //                 }
                //             }
                //         },
                //         {...all configs}
                //     ],
                //     waitUntilEnemiesGone:
                // },
            // ]
                },
            ]
        };
        return obj;
    }
}

class Preview extends GameEngine    {
    constructor()   {
        super();
        this.ship;
    }

    addEntity(e)    {
        super.addEntity(e);
        if(e instanceof Ship)   {
            this.ship = e;
        }
    }

    getPlayerLocation(point) {
        const deltaX = 0;
        const deltaY = 300;
        const angle = Math.atan2(deltaY, deltaX);
        const radius = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    
        return {
          radius,
          angle,
        };
    }

    clearEntities() {
        this.entities.splice(0, this.entities.length);
    }
}