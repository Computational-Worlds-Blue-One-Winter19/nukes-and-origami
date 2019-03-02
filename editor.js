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
        this.myScenes = [];
        this.myScenes.push(new Scene());
        this.currentScene = 0;
        this.selected = new EnemyInstance();
        this.selected.addX('No');
        this.init();
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

        var collapsibles = document.querySelectorAll('.collapsible');
        var collapsibleInstances = M.Collapsible.init(collapsibles, options);

        var _this = this;
        document.addEventListener('change', function(event) {
            switch(event.target.id) {
                case 'chooseBackground':
                    _this.game.sceneManager.loadBackground(eval(event.target.value));
                    break;
                case 'chooseEnemy':
                    _this.previewGame.clearEntities();
                    let add = new Ship(_this.previewGame, eval(event.target.value));
                    add.current.x = 100;
                    add.current.y = 0;
                    _this.previewGame.addEntity(add);
                    _this.selected.addShip(event.target.value);
                    break;
                case 'chooseWeapon':
                    _this.previewGame.ship.initializeWeapon(eval(event.target.value));
                    _this.selected.addWeapon(event.target.value);
                    break;
                case 'choosePath':
                    _this.selected.addPath(event.target.value);
                    break;
                case 'xRange':
                    if(document.getElementById('customX').checked)  {
                        _this.selected.addX(event.target.value);
                    } else {
                        _this.selected.addX('No');
                    }
                    break;
                case 'customX':
                    if(!event.target.checked)    {
                        _this.selected.addX('No');
                    } else {
                        _this.selected.addX(document.getElementById('xRange').value);
                        // _this.selected.addX()
                    }
                    break;
            }
        });

        var addEnemyBtn = document.getElementById('addEnemy');
        addEnemyBtn.addEventListener('click', function(event) {
            console.log("activated my trap card");
            let table = document.getElementById('currentEnemies');
            let row = table.insertRow(-1);
            let val1 = row.insertCell(0);
            let val2 = row.insertCell(1);
            let val3 = row.insertCell(2);
            let val4 = row.insertCell(3);
            let remove = row.insertCell(4);
            val1.innerHTML = _this.selected.ship;
            val2.innerHTML = _this.selected.weapon;
            val3.innerHTML = _this.selected.path;
            val4.innerHTML = _this.selected.x;
            remove.innerHTML = `<td><a class="waves-effect waves-light btn" id="removeTableRow">Remove</a></td>`;
            var removeTableEntry = document.querySelectorAll('#removeTableRow');
            removeTableEntry.forEach(e => 
                e.addEventListener('click', function(event) {
                    // console.log("Removing row:" + e.parentElement.parentElement.rowIndex);
                    // table.deleteRow(event.target.parentElement.parentElement.rowIndex - 1);
                    console.log("test");
                    })
            );
        });
        document.querySelectorAll('#fps').forEach(e => e.style.display = 'none');
        document.getElementById('customX').checked = false;
        document.getElementById('chooseWeapon').value = 'ring.singleTargetPlayer';
        let shipManifest = document.getElementById('chooseEnemy').value;
        let add = new Ship(this.previewGame, eval(shipManifest));
        add.current.x = 100;
        add.current.y = 0;
        this.previewGame.addEntity(add);
        this.selected.addShip(shipManifest);
        this.selected.addWeapon(document.getElementById('chooseWeapon').value);
        this.selected.addPath(document.getElementById('choosePath').value);
    }

    addEnemyToScene()   {

    }

}

class EnemyInstance   {
    addWeapon(wep)  {
        this.weapon = wep;
    }

    addShip(ship)   {
        this.ship = ship;
    }

    addPath(path)   {
        this.path = path;
    }

    addX(x) {
        this.x = x;
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