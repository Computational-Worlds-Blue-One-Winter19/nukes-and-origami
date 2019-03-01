class Editor {
    constructor(game)   {
        this.game = game;
        this.ctx = game.ctx;
        this.game.editorPause();
        this.ctx.clearRect(0, 0, 2000, 2000);    
        this.init();

        
    }

    init()  {
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

    }
}