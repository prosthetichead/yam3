//Timer Bar


TimerBar = function(game, x, y, width, height){

  width = width || 500;
  height = height || 50;

  Phaser.Image.call(this, game, x, y, 'timerbar_1');
  this.border = new Phaser.Image(game,x,y,'timerbar_1');
  this.background = new Phaser.Image(game,x,y,'timerbar_3');
  this.bar = new Phaser.Image(game,x,y,'timerbar_2');
  this.addChild(this.background);
  this.addChild(this.bar);
  this.addChild(this.border);

  this.width = width;
  this.height = height;

  this.originalWidth = this.bar.width;
  this.cropRect = new Phaser.Rectangle(0, 0, this.bar.width, this.bar.height);
};

TimerBar.prototype = Object.create(Phaser.Image.prototype);
TimerBar.prototype.constructor = TimerBar;
  
//Called automaticly by world update.
TimerBar.prototype.update = function() {
  this.bar.updateCrop();
};

TimerBar.prototype.setNewPercent = function(newPercent) {
  var tween = game.add.tween(this.cropRect).to( { width: (newPercent * this.originalWidth) }, 3000, Phaser.Easing.Linear.None, false, 0, 1000, true);
  this.bar.crop(this.cropRect);
  tween.start();
};

//Decresses the bar over a time period in ms
TimerBar.prototype.setNewTimer = function(ms) {
  this.cropRect.width = this.originalWidth;
  var tween = game.add.tween(this.cropRect).to( { width: 0 }, ms, Phaser.Easing.Linear.None, false, 0, 1000, true);
  this.bar.crop(this.cropRect);
  tween.start();
}