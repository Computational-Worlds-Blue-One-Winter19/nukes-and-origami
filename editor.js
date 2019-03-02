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

    initGoBackButton() {
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
    }
    
    initAddEnemyButton() {
        var addEnemyBtn = document.getElementById('addEnemy');
        addEnemyBtn.addEventListener('click', () => {
            console.log("activated my trap card");
            let table = document.getElementById('currentEnemies');
            let row = table.insertRow(-1);
            let val1 = row.insertCell(0);
            let val2 = row.insertCell(1);
            let val3 = row.insertCell(2);
            let val4 = row.insertCell(3);
            let remove = row.insertCell(4);
            val1.innerHTML = this.selected.ship;
            val2.innerHTML = this.selected.weapon;
            val3.innerHTML = this.selected.path;
            val4.innerHTML = this.selected.x;
            remove.innerHTML = `<td><a class="waves-effect waves-light btn" id="removeTableRow">Remove</a></td>`;
            remove.addEventListener('click', (event) => {
                // console.log("Removing row:" + e.parentElement.parentElement.rowIndex);
                // If we remove rowIndex - 1 we'll be off by one
                table.deleteRow(event.target.parentElement.parentElement.rowIndex);
                console.log("test");
                })
        });
        // addEnemyBtn.addEventListener('click', function(event) {
            
        // });
    }

    init()  {
        const options = {};
        this.previewCanvas = document.getElementById('preview');
        this.preview = this.previewCanvas.getContext('2d');
        this.previewGame.init(this.preview);
        this.previewGame.start();
        
        var elems = document.querySelectorAll('select');
        this.instances = M.FormSelect.init(elems, options);

        var collapsibles = document.querySelectorAll('.collapsible');
        var collapsibleInstances = M.Collapsible.init(collapsibles, options);

        // Originally the reason why this was needed is because you noticed that this was pointing to the correct this(element) right?
        // That is because when you declare callbacks for event listeners using a function(event) 
        // everything inside the score of that new function gets a new this, not the one you're expecting

        // To avoid having to use _this when defining callbacks its best to use an anonymous function since they don't 
        // override/create the this value, thus the one you get access to the correct one. In this case to the this that
        // has access to the selected ships
        // var _this = this;
        document.addEventListener('change', (event) => {
            switch(event.target.id) {
                case 'chooseBackground':
                    this.game.sceneManager.loadBackground(eval(event.target.value));
                    break;
                case 'chooseEnemy':
                    this.previewGame.clearEntities();
                    let add = new Ship(this.previewGame, eval(event.target.value));
                    add.current.x = 100;
                    add.current.y = 0;
                    this.previewGame.addEntity(add);
                    this.selected.addShip(event.target.value);
                    break;
                case 'chooseWeapon':
                    this.previewGame.ship.initializeWeapon(eval(event.target.value));
                    this.selected.addWeapon(event.target.value);
                    break;
                case 'choosePath':
                    this.selected.addPath(event.target.value);
                    break;
                case 'xRange':
                    if(document.getElementById('customX').checked)  {
                        this.selected.addX(event.target.value);
                    } else {
                        this.selected.addX('No');
                    }
                    break;
                case 'customX':
                    if(!event.target.checked)    {
                        this.selected.addX('No');
                    } else {
                        this.selected.addX(document.getElementById('xRange').value);
                        // _this.selected.addX()
                    }
                    break;
            }
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

        this.initGoBackButton();
        this.initAddEnemyButton();
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