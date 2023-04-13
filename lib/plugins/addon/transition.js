ig.module('plugins.addon.transition')
.requires(
	// 'game.add-on.add-image',
	// 'game.add-on.add-text'
)

.defines(function(){
	ig.Transition = ig.Class.extend({
		tweenTransition:null,
		name : "Transition",
		isClosed : false,
		isRunning : false,
		tweenTime : 300,
		fill:'white',

		init:function(){

		},

		create:function(){
			this.alpha = 1;
			this.isClosed = true;
		},

		update:function(){

		},

		draw:function(){
			// if(!this.isRunning) return;
			var rect = ig.game.geom.rectangle(0, 0, ig.system.width, ig.system.height);
			ig.game.geomDebug.rect(rect, this.fill, this.alpha);
		},

		close:function(loadIdx){
			if(this.isRunning || this.isClosed) return;
			if(curState().curtainBg) curState().curtainBg.visible = true;
			this.isRunning = true;
			this.stateIdx = loadIdx;

			var tweenClose = new ig.TweenDef(this)
			.to({alpha : 1}, this.tweenTime)
			.onComplete(function(){
				this.isRunning = false;
				this.isClosed = true;
				ig.game.director.loadLevel(this.stateIdx);
			}.bind(this))
			.start();
		},

		open:function(){
			if(this.isRunning || !this.isClosed) return;
			// this.addZIndex();
			this.isRunning = true;

			// var tweenOpen = new Tweener(this.bg);
			var tweenOpen = new ig.TweenDef(this)
			.to({alpha:0}, this.tweenTime)
			.onComplete(function(){
				this.isRunning = false;
				this.isClosed = false;
				if(curState().curtainBg) curState().curtainBg.visible = false;
			}.bind(this))
			.start();
		},
	});
});