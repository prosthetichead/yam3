//YAM3
// 

var game = new Phaser.Game(640 , 960, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});
    
// Global Variables
    var blocksStartX = 128;
    var blocksStartY = 600;
    var blockPadding = 1;
    var blockSize = 64; 
    var blocksHigh = 5;
    var blocksWide = 6;

    var currentTile;
    var blocksArray = []; // blocksArray[(y * blocksWide) + x]
    var timerBar;
    
    var seed = new Date().getTime();
    var randomGen = new Phaser.RandomDataGenerator([seed]);

    //timers
    var attackTimer;
    var mainTimer;

    var currentPlayerStats = { HP: 100, DEF: 5, ATK: 3, LVL: 1}
    var currentEnemyStats = { HP: 30, DEF: 1, ATK: 5, LVL: 4, nextAttack: 10000}
   // var matchTextStyle = { font: "20px Helvetica", fill: "white", align: "center"};

    var currentSelectedBlockPos = {x: 0, y: 0};
    var currentSelectedBlock = null;

    //Text
    var timerText;

function preload() {
  // Set Scaling Mode
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  //Load images
  game.load.spritesheet('blocks', 'img/blocks.png', blockSize, blockSize); 
  game.load.spritesheet('timerbar_1', 'img/timerbar_1.png', 500, 54);
  game.load.spritesheet('timerbar_2', 'img/timerbar_2.png', 500, 54);
  game.load.spritesheet('timerbar_3', 'img/timerbar_3.png', 500, 54);

}

function create() {
       
    timerBar = new TimerBar(game, 0, 0);
    game.add.existing(timerBar);

    //create Blocks
    for (y = 0; y < blocksHigh; y++) {
        for (x = 0; x < blocksWide; x++) {
            //var block = game.add.sprite(, 'blocks', 1);
            //block = blocksGroup.create(, , 'blocks', );

            block = new Phaser.Sprite(game, (x*(blockSize+blockPadding))+blocksStartX, (y*(blockSize+blockPadding))+blocksStartY,
                'blocks', randomGen.integerInRange(1,5))
            game.add.existing(block);

            // Enable input.
            block.inputEnabled = true;
            block.input.enableDrag();
            block.events.onDragStart.add(selectBlock);
            block.events.onDragStop.add(releasedBlock);

            blocksArray.push(block);
        }
    }

    //create the timers
    attackTimer = game.time.create(false);

    //setup first Attack timer event
    attackTimer.add(currentEnemyStats.nextAttack, enemyAttack, this);
    timerBar.setNewTimer(currentEnemyStats.nextAttack);

    attackTimer.start();
}


function enemyAttack(){

    attackTimer.stop();
    attackTimer.destroy();
    //Roll attack against player
    currentPlayerStats.HP = currentPlayerStats.HP - (currentEnemyStats.ATK + randomGen.integerInRange(1, 10)) ;
    currentEnemyStats.nextAttack = randomGen.integerInRange(5000, 10000);

    attackTimer = game.time.create(false);
    attackTimer.add(currentEnemyStats.nextAttack, enemyAttack, this);
    attackTimer.start();
    timerBar.setNewTimer(currentEnemyStats.nextAttack);

}


function update() {
    var mouseX = game.input.activePointer.worldX;
    var mouseY = game.input.activePointer.worldY;
    
    testBlockOverlap(blockOverlapOccur, currentSelectedBlock);
    
    if(!currentSelectedBlock){
        testAllForMatches();
    }
}

function render() {
    //draw frame IDs 
    //for (var i = 0; i < blocksArray.length; ++i){
    //    blocksArray[i].tint = 0xffffff;
    //    game.debug.text(blocksArray.indexOf(blocksArray[i]), blocksArray[i].x+10, blocksArray[i].y+15, '#ffffff' ,'10px Courier');   
    //    game.debug.text(blocksArray[i].frame, blocksArray[i].x+28, blocksArray[i].y+35, '#ffffff' ,'14px Courier');     
    //    game.debug.text(i + ": " + blocksArray[i].x + ", " + blocksArray[i].y, 500, 15*i + 20);
    //}
    //game.debug.text("drop run completed: " + dropsCompleted, 10, 375)
    game.debug.text("HP: " + currentPlayerStats.HP, 10, 375);
    game.debug.text("Time Till Next Attack: " + (currentEnemyStats.nextAttack - attackTimer.ms), 10, 400);   
}







function selectBlock(block){
   block.bringToTop();

    currentSelectedBlock = block;
    currentSelectedBlockPos.x = block.x;
    currentSelectedBlockPos.y = block.y;

    var mouseX = game.input.activePointer.worldX;
    var mouseY = game.input.activePointer.worldY;

    block.x = mouseX;
    block.y = mouseY;  
}
function releasedBlock(block){
    block.x = currentSelectedBlockPos.x;
    block.y = currentSelectedBlockPos.y;
    currentSelectedBlock = null;
}
function blockOverlapOccur(block){
    var backupPos = {x: block.x, y: block.y};
    block.x = currentSelectedBlockPos.x;
    block.y = currentSelectedBlockPos.y;

    currentSelectedBlockPos = backupPos;
    swapArrayElements(blocksArray, blocksArray.indexOf(block), blocksArray.indexOf(currentSelectedBlock));
}

function testBlockOverlap(callBack, block)
{   
    if(block){
        for (var i = 0; i < blocksArray.length; ++i){

            var testBlock = blocksArray[i];

            if ((blocksArray[i] != block)){
                var blockCircle = new Phaser.Circle(block.x + (block.width/2), block.y + (block.height/2), 15);
                var testCircle = new Phaser.Circle(testBlock.x + (testBlock.width/2), testBlock.y + (testBlock.height/2), blockSize);
                if (Phaser.Circle.intersects(blockCircle, testCircle))
                    callBack(blocksArray[i]);
            }
        }
    }
    return false;
}

function testAllForMatches(){
    if(dropsCompleted){
        for (var i = 0; i < blocksArray.length; ++i){
            var block = blocksArray[i];
            if (block.frame != 0){
                var matches = testBlockForMatches(block);

                if (matches.horizonal.length >= 3) {
                    for (var j = 0; j < matches.horizonal.length; ++j) {
                        matchText("Match " + matches.horizonal.length, {x: matches.horizonal[1].x + (blockSize/2), y: matches.horizonal[1].y + (blockSize/2)})
                        matches.horizonal[j].frame = 0;
                    }
                    
                }
                if (matches.vertical.length >= 3) {
                    for (var j = 0; j < matches.vertical.length; ++j){
                        matchText("Match " + matches.vertical.length, {x: matches.vertical[1].x + (blockSize/2), y: matches.vertical[1].y + (blockSize/2)})
                        matches.vertical[j].frame = 0;
                    }
                }
            }
        }
        testAllForDrops();
    }
}

//displays the match text at a position ({x: ,y: })
function matchText(textString, position) {
    var textObject = game.add.text(position.x, position.y, textString,{fill: "white", fontSize: "20px"});
    textObject.alpha = .1;
    textObject.anchor.setTo(0.5, 0.5);
    var tweenA = game.add.tween(textObject).to( {alpha: 1}, 900, "Linear", false);
    var tweenB = game.add.tween(textObject).to( { alpha: 0}, 900, "Linear", false);
    tweenB.onComplete.add(function(textObject){
        textObject.destroy();
    });
    tweenA.chain(tweenB);
    tweenA.start();
}

///////////
// test a block for matches and return them in  
// matches object
function testBlockForMatches(block) {
    var matches = {horizonal: [block], vertical: [block]};

    for (var j = 0; j <= 3; ++j){
        testBlock = getAdjacentBlock(j, block);
        while (testBlock) {
            if (testBlock.frame == block.frame){
                if (j == 0 || j == 2) //Vertical Match
                    matches.vertical.push(testBlock);
                else
                    matches.horizonal.push(testBlock);
                //Get the next test block
                testBlock = getAdjacentBlock(j, testBlock);
            }
            else {
                //No Match break out
                break;
            }
        }
    }

    return matches;
}

var dropsCompleted = true;
function testAllForDrops() {
    
    var emptyBlocks = true;
    var tweens = [];

    //Drop the remaing Blocks
    for (x = 0; x < blocksWide; x++) {
        for (y = blocksHigh-1; y >= 0 ; y--) {
            //Look bottom to top for empty blocks and move any as low as posible
            block = blocksArray[( y * blocksWide) + x];
            if (block.frame != 0){
                blockBelow = getAdjacentBlock(2, block);
                var originalBlockPos = {x: block.x, y: block.y};
                while(blockBelow && blockBelow.frame == 0){
                    var blockPos = {x: block.x, y: block.y};
                    var blockBelowPos = {x: blockBelow.x, y: blockBelow.y};
                    swapArrayElements(blocksArray, blocksArray.indexOf(block), blocksArray.indexOf(blockBelow));
                    blockBelow.x = blockPos.x;
                    blockBelow.y = blockPos.y;
                    block.x = blockBelowPos.x;
                    block.y = blockBelowPos.y;
                    
                    blockBelow = getAdjacentBlock(2, block);
                }
                if (block.y != originalBlockPos.y) {
                    block.inputEnabled = false;

                    dropsCompleted = false;
                    tween = game.add.tween(block).from( { y:  originalBlockPos.y}, 1000, Phaser.Easing.Bounce.Out, false);
                    tween.onComplete.add(function(block){ 
                            block.inputEnabled = true;
                    });
                    tweens.push(tween);
                }
            }
        }
    }

    //set any empty blocks to a random frame and drop from a hight
    for (x = 0; x < blocksWide; x++) {
        for (y = blocksHigh-1; y >= 0 ; y--) {
            block = blocksArray[( y * blocksWide) + x];
            if (block.frame == 0){
                block.frame = randomGen.integerInRange(1,5);
                block.inputEnabled = false;
                
                dropsCompleted = false;
                tween = game.add.tween(block).from( { y:  block.y - 200}, 1000, Phaser.Easing.Bounce.Out, false);
                tween.onComplete.add(function(block){ 
                    block.inputEnabled = true;
                });
                tweens.push(tween);
            }

        }
    }

    if (tweens.length > 0){
        //Put a complete function on the final tween that will let other functions know Drops are completed at they can now run like normal
        tweens[tweens.length-1].onComplete.add(function(){ dropsCompleted = true });
        for (i = 0; i < tweens.length; i++){
            tweens[i].start();
        }
    }
}

//var 

////////
// get adjacent blocks based on a direction code.
// 0 up. 1 right. 2 down. 3 left. 
//
function getAdjacentBlock(directionCode, block){
    var index = blocksArray.indexOf(block);
    var x = (index % blocksWide);
    var y = parseInt((index / blocksWide));

    if (directionCode == 0 && (y-1 >= 0)) {  //Up 
        return blocksArray[( (y-1) * blocksWide) + x];
    }
    else if (directionCode == 1 && (x+1 < blocksWide)) { // Right
        return blocksArray[(y * blocksWide) + (x+1)];
    }
    else if (directionCode == 2 && (y+1 < blocksHigh)) { //Down
        return blocksArray[((y+1) * blocksWide) + (x)];
    }
    else if (directionCode == 3 && (x-1 >= 0)) { //Left
        return blocksArray[(y * blocksWide) + (x-1)];
    }
    else {
        return null;
    }
}

function swapArrayElements(array_object, index_a, index_b) {
    var temp = array_object[index_a];
    array_object[index_a] = array_object[index_b];
    array_object[index_b] = temp;
 }
