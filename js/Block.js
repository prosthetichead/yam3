//
//Block extends Sprite
// 


Block = function(game, x, y, spriteMapName, mapIndex){
	Phaser.Sprite.call(this, game, x, y, spriteMapName, mapIndex);
};

Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;

//Called automaticly by world update.
Block.prototype.update = function() {

};