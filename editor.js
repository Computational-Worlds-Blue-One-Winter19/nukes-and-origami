class Editor {
    constructor(game)   {
        this.game = game;
        this.previewGame = new Preview();
        this.ctx = game.ctx;
        this.game.editorPause();
        this.ctx.clearRect(0, 0, 2000, 2000);    
        this.init();
    }

    init()  {
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
              this.game.resume();
            },
        );
        // var elems = document.querySelectorAll('.dropdown-trigger');
        const options = {};
        // var instances = M.Dropdown.init(elems, options);
        //var elems = document.querySelectorAll('.dropdown-trigger');
        var elems = document.querySelectorAll('select');
        this.instances = M.FormSelect.init(elems, options);
        //const val = M.Dropdown.getInstance(dropDown);
        addEvent(
            document.getElementById('preview'),
            'click',
            () => {
                this.previewGame.clearEntities();
                let manifest = this.getEnemySelection();
                let add = new Ship(this.previewGame, manifest);
                // add.sprite.scale -= 0.2;
                add.current.x = 100;
                add.current.y = 0;
                if(this.instances[1].el.value != 'None')    {
                    add.initializeWeapon(eval(this.instances[1].el.value));
                }
                this.previewGame.addEntity(add);
                //this.previewGame.addEntity(getEnemySelection());
                // console.log(val.getSelectedValues());
            },
        );
    }

    getEnemySelection() {
        switch(this.instances[0].el.value)  {
            case 'Bat':
                return ship.bat;
            case 'Bird':
                return ship.bird;
            case 'Crane':
                return ship.crane;
            case 'Dove':
                return ship.dove;
            case 'Eagle':
                return ship.previewEagle;
            case 'Goose':
                return ship.goose;
            case 'Hummer':
                return ship.hummer;
            case 'Owl':
                return ship.owl;
            case 'Pigeon':
                return ship.pigeon;
            case 'Swallow':
                return ship.swallow;
            default:
                return null;
        }
    }

}

class Preview extends GameEngine    {
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