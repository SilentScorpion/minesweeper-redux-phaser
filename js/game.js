var game;

//Writing the algorithm here

/******* Spawner */
//A 2D Array: 0 => no bomb, 1 => bomb
//While creating the 2d Array, randomly spawn 10 bombs at different locations.
//Randomly spawn 1-2-3 bombs in a certain location, that can help the game intersting

/**** Algorithmic Construction */
//I've a 2-dimensional grid of boxes, each box has an outer property => Color ( visible on screen)
//Each box also has certain internal properties
//1. whether it is a bomb or not (0/1)
//2. Text value => Count of the adjacent bombs to a particular cell

//Initially all cells are interactable(), i.e user can click on any cell
//Once he clicks on a certain cell, floodFill() is called, revealing the
//boundaries where bombs are found

//floodFill() is called in all directions, => up, down, right, left till the last cell boundary
//is found
//Or till the bomb boundary is found

//If the user clicks on a mine, he dies and the game ends

//
var game;
var newColor =0x69ff91;
var oldColor = 0xf0eded;
var grid = [[]], cellGrid = [[]];
var mineCount = [[]];
var displayText = [[]];
var mines = [];

var leftBorder = 0,rightBorder = 7,topBorder = 0,bottomBorder = 7;
var deadAudio,winAudio;

var difficulty = {
    easy: 8,
    medium : 8,
    hard: 24,
}

var choosenDifficulty = 'medium';

var cellCount = 0;
var winText;
var flagCount = 0;

var testGrid = [
    [0,0,1,0,0,0,0,1],
    [0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,1],
    [0,0,0,0,0,0,0,0],
    [0,1,0,0,1,1,0,0],
];

var config = {
    type: Phaser.AUTO,
    backgroundColor: 0xffffff,
    scene: {
        preload: preload,
        create : create,
    },
    width: 600,
    height: 1200,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
}

game = new Phaser.Game(config);

function preload(){
    this.load.image('cell','assets/cell.png');
    this.load.image('mine','assets/mine.jpg');
    this.load.audio('dead','assets/dead.wav');
    this.load.audio('win','assets/win.ogg');
    this.load.image('flag','assets/flag.png');
    this.load.image('smiley','assets/smiley.png');
    this.load.image('sad','assets/sad.png');
}

function create(){
    cellCount = 0;
    flagCount = difficulty.medium;
    
    /**********************************
     * 
     */

    /**************************************
     * 
     * 
     *  */    
    //footer
    this.footer = this.add.text(game.config.width/2, game.config.height - 50,
                "#100DaysOfCode",{
                    'fontSize' : '40px',
                }).setOrigin(.5,.5);
    this.footer.tint = 0xdadada;

                
    this.flagsText = this.add.text(game.config.width/2,game.config.height/3 - 100,
                    '',{
                        'fontSize':'50px',
                    }).setOrigin(.5,.5);
    this.flagsText.tint = 0x000000;
    this.flagsText.text = flagCount;

    //Instructions
    this.instruction1 = this.add.text(game.config.width/2, game.config.height - 150,
                        "Left Click/Touch to reveal an empty square",{
                            'fontSize': '20px',
                        }).setOrigin(.5,.5);
    this.instruction1.tint = 0x343434;
    this.instruction2 = this.add.text(game.config.width/2, game.config.height - 125,
        "Long Press to flag/Unflag it",{
            'fontSize': '20px',
        }).setOrigin(.5,.5);
    this.instruction2.tint = 0x343434;

    this.title = this.add.text(game.config.width/2, 100, "Minesweeper",{
        'fontSize' : '75px',
    }).setOrigin(.5,.5);
    this.title.tint = 0x000000;

  
    winText = this.add.text(game.config.width/2, game.config.height/2, "YOU WIN!!!!",{
        'fontSize' : '75px',
    }).setOrigin(.5,.5);
    winText.tint = 0xff0000;
    winText.depth = 10;
    winText.setVisible(false);

    winAudio = this.sound.add('win');
    winAudio.volume = .5;


  //Initialize a 2d array of boxes
  for(let x = 0 ; x  < 8 ; x++){
      grid[x] = [];
      for(let y = 0 ; y < 8 ; y++){
          grid[x][y] = {
             v : 0,
             col : 0xf0eded,
          }
      }
  }
randomizeMines();
cellMineCount();
//
  //f0eded
  //Draw the grid cells on screen
  for(let i = 0 ; i < 8; i++){
      cellGrid[i] = [];
      displayText[i] = [];
      for(let j = 0 ; j < 8; j++){
         let x = game.config.width/5 + j * 50;
         let y = game.config.height/3 + i * 50;
         let cell = this.add.image(x,y,'cell').setOrigin(.5,.5);
         cell.setInteractive();
         cell.tint = grid[i][j].col;
         cell.name = ' ' + i + j;
         cellGrid[i][j] = cell;
         let t = this.add.text(x,y,'');
         t.tint = 0x000000;
         displayText[i][j] = t;
      }
  }


  this.input.on('gameobjectup', (pointer,gameobject) => {

    if(pointer.upTime - pointer.downTime < 500){
        if(gameobject.name != 'flag' || gameobject.name != 'diff'){
            let row = parseInt(gameobject.name.charAt(1));
            let col = parseInt(gameobject.name.charAt(2));
            orCellX = row;
            orCellY = col;
            floodFillMinesweeper(row, col);
            repaint();
        }
    }
    else{
        let flag = this.add.image(gameobject.x, gameobject.y,'flag').setOrigin(.5,.5);
        flag.name = 'flag';
        ++cellCount;
        --flagCount;
        this.flagsText.text = flagCount;
        flag.setInteractive().on('pointerup',function(pointer){
            flag.destroy();
            --cellCount;
            ++flagCount;
            this.flagsText.text = flagCount;
            
        },this);
        console.log(cellCount);

        if(cellCount == 64){
            console.log('you win');
            winText.setVisible(true);
            winAudio.play();
         }
        
    }

  },this);


  //Mines in places
  for(let i = 0 ; i < 8; i++){
        for(let j = 0 ; j < 8; j++){
            if(grid[i][j].v == 1){
                let mine =this.add.image(cellGrid[i][j].x, cellGrid[i][j].y, 'mine').setOrigin(.5,.5).setVisible(false);
                mines.push(mine);
            }
        }
    }

    //Dead audio
    deadAudio = this.sound.add('dead');
    deadAudio.volume = .25;
    

  
}



function randomizeMines(){
    
  //Randomize the location of the mines
    while(difficulty.medium != 0){

        let row = Phaser.Math.Between(0,7);
        let col = Phaser.Math.Between(0,7);
        if(grid[row][col].v == 0){
            grid[row][col].v = 1;
            difficulty.medium--;
        }
    }

    console.log(grid);
}


function cellMineCount(){
    for(let x = 0 ; x < 8 ; x++){
        mineCount[x] = [];
        for(let y = 0 ; y < 8 ; y++){
      
            let c = 0;

           if(x - 1 == -1){
               if(y - 1 == -1){
                   c = grid[x][y+1].v + grid[x+1][y].v + grid[x+1][y+1].v;
               }
               else if(y + 1 == 8){
                    c = grid[x][y - 1].v + grid[x+1][y - 1].v + grid[x+1][y].v;
               }
               else{
                c = grid[x][y - 1].v + grid[x][y + 1].v + grid[x+1][y -1].v + 
                    grid[x + 1][y].v + grid[x + 1][y+ 1 ].v;
               }
           }
           else if(x + 1 == 8){
               if(y - 1 == -1)
                    c = grid[x][y+1].v + grid[x-1][y].v + grid[x-1][y+1].v;
               else if(y + 1 == 8)
                    c = grid[x][y-1].v + grid[x-1][y-1].v + grid[x-1][y].v;
                else{
                    c =  grid[x][y - 1].v + grid[x][y+ 1].v + grid[x - 1][y].v  +
                        grid[x - 1][y - 1].v + grid[x - 1][y + 1].v;
                }
           }
           else if(y - 1 == -1){
               if(x - 1 == -1)
                    continue;
                else if(x + 1 == 8)
                    continue;
                else{
                    c = grid[x - 1][y].v + grid[x - 1][y+ 1].v + grid[x][y+ 1].v +
                        grid[x+ 1][y+ 1].v + grid[x + 1][y].v;
                }
           }
           else if(y + 1 == 8){
               if(x - 1 == -1)
                    continue;
                else if(x + 1 == 8)
                    continue;
                else{
                    c = grid[x - 1][y - 1].v + grid[x - 1][y].v + grid[x][y - 1].v  +
                        grid[x + 1][y - 1].v + grid[x + 1][y].v;
                }
           }
           else{
                 c = grid[x -1][y - 1].v + grid[x + 1][y - 1].v +
                    grid[x - 1][y].v + grid[x+ 1][y].v + 
                    grid[x - 1][y + 1].v + grid[x + 1][y + 1].v +
                    grid[x][y -1 ].v + grid[x][y+ 1].v;
           }

            mineCount[x][y] = c;

        } 
    }

    console.log(mineCount);
}


function repaint(){
    for(let i = 0 ; i < 8; i++){
        for(let j = 0 ; j < 8; j++){
           cellGrid[i][j].tint = grid[i][j].col;
        }
    }
    topBorder = leftBorder = 0;
    rightBorder = bottomBorder = 7;
}

function clear(){
    for(let i = 0 ; i < 8; i++){
        for(let j = 0 ; j < 8; j++){
           cellGrid[i][j].tint = oldColor;
           grid[i][j].col = oldColor;
        }
    }
}

function clearFlag(x,y){

}

//This is the modified version of flood fill algorithm used in Minesweeper
function floodFillMinesweeper(row, col){
    
    if(grid[row][col].v == 1){
        console.log('you died');
        showMines();
        deadAudio.play();
        
        return;
    }

    // if(grid[row][col].v == 1){
    //     if(row < orCellX){
    //         if(row > topBorder){
    //             topBorder = row;
    //         }
    //     }

    //     if(row > orCellX){
    //         if(row < bottomBorder){
    //             bottomBorder = row;
    //         }
    //     }

    //     if(col < orCellY){
    //         if(col > leftBorder){
    //             leftBorder = col;
    //         }
    //     }

        
    //     if(col > orCellY){
    //         if(col < rightBorder){
    //             rightBorder = col;
    //         }
    //     }
    // }
    

    if(grid[row][col].col == newColor)
        return;

    if(grid[row][col].v == 0){
        grid[row][col].v == 2;
        grid[row][col].col = newColor;
       cellCount++;

       console.log(cellCount);

        if(cellCount == (64 - difficulty.medium)){
           console.log('you win');
           winText.setVisible(true);
           winAudio.play();
        }

        if(mineCount[row][col] != 0){
            
            if(mineCount[row][col] == '1')
                displayText[row][col].tint = 0x0000ff; 
            else if(mineCount[row][col] == '2')
                displayText[row][col].tint = 0xff0000; 
            else if(mineCount[row][col] == '3')
                displayText[row][col].tint = 0x7a005d; 
            else 
                displayText[row][col].tint = 0x000000; 
            
         
            displayText[row][col].text = mineCount[row][col];

            return;
        }
   
        if(row < bottomBorder){
            floodFillMinesweeper(row + 1, col);
        }
    
        if(col < rightBorder)
        floodFillMinesweeper(row, col + 1);
    
        if(col > leftBorder)
        floodFillMinesweeper(row, col - 1);
    
        if(row > topBorder)
        floodFillMinesweeper(row - 1, col);


        
    }
};


//This is the original flood fill algorithm
function floodFill(row, col){
      

    if(row == 8 || col == 8 || row == -1 || col == -1)
    return;


    console.log(row + " " + col);

    if(grid[row][col].col == newColor)
        return;

    if(grid[row][col].v == 0){
        grid[row][col].v == 2;
        grid[row][col].col = newColor;

        if(row < 8){
            floodFill(row + 1, col);
        }
    
        if(col < 8)
            floodFill(row, col + 1);
    
        if(col > 0)
            floodFill(row, col - 1);
    
        if(row > 0)
            floodFill(row - 1, col);
    }
};

function showMines(){
    console.log('inside showMines()');
    for(let i = 0 ; i < mines.length; i++){
        mines[i].setVisible(true);
    }
}




