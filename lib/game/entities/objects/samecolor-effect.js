ig.module('game.entities.objects.samecolor-effect')
.requires('game.entities.addon.group')
.defines(function(){
	EntitySamecolorEffect = EntityGroup.extend({
		targets:[],
		breakPieces:false,
		sourceTarget:{},
		onCompletes:[],
		speed:10,
		isMoving:true,
		init:function(x, y, settings){
			this.parent(x, y, settings);

			this.effects = [];

			this.createEffects();
		},

		createEffects:function(){
			for(var a = 0; a < this.targets.length; a++){
				var target = this.targets[a];
				target.isMoving = true;
				target.isBreak = true;

				var onComplete = this.onCompletes[a] ? this.onCompletes[a] : this.tweenOnComplete.bind(this);
				var rad = ig.game.math.angleBetween(this.x, this.y, target.x, target.y)
				var deg = ig.game.math.radToDeg(rad) + 180;
				rad = ig.game.math.degToRad(deg)

				var effect = ig.CallAsset.addFrame(0, 0, 'game/effects/match01');
				// effect.anchor.setTo(0.25, 0.5);
				effect.anchor.setTo(0.5)
				var frames = ig.GenerateFrameNames('game/effects/match', 6, 8, '', 2);
				effect.addAnim('run', 0.02, frames, false);
				effect.playAnim('run')
				effect.rotation = rad;
				effect.onGoing = true;
				effect.isMoving = true;
				effect.targetPiece = target;
				effect.breakPieces = this.breakPieces;
				effect.onComplete = onComplete;
				this.add(effect);

				this.effects.push(effect)

				// this.tweenEffect(effect, target)
			}
		},

		tweenEffect:function(effect, target){
			var targetBound = target.getBounds();
			var targetDist = ig.game.math.distance(this.pos.x, this.pos.y, targetBound.centerX, targetBound.centerY)
			var targetRad = ig.game.math.angleBetween(this.pos.x, this.pos.y, targetBound.centerX, targetBound.centerY)
			var localX = this.x + (Math.cos(targetRad) * targetDist)
			var localY = this.y + (Math.sin(targetRad) * targetDist)
			var dest = new Vector2(localX, localY)
			// var dest = this.toLocal(targetBound.centerX, targetBound.centerY)
			var toX = dest.x;
			var toY = dest.y
			var tween = new ig.TweenDef(effect)
			.to({x:toX, y:toY}, 300)
			.onComplete(function(){		
				// return;
				if(this.breakPieces){
					// this.targetPiece.onDestroy();
					if(this.onComplete){
						this.onComplete(this.targetPiece, this)
					}
				} else {
					if(this.onComplete && typeof(this.onComplete.dispatch) == 'function'){
						this.onComplete.dispatch();	
					} else {
						if(this.onComplete){
							this.onComplete(this.targetPiece, this)
						}
					}
				}

				var tweenAlpha = new ig.TweenDef(this)
				.to({alpha:0}, 200)
				.onComplete(function(){
					this.onGoing = false;
				}.bind(this))
				.start();
				// this.onGoing = false;
			}.bind(effect))
			.start();
		},

		tweenOnComplete:function(piece, effect){
			var timer = 200;
			var tween = new ig.TweenDef(piece.scale)
			.to({x:1.2,y:1.2}, timer)
			.easing(ig.Tween.Easing.Quadratic.EaseOut)
			.onComplete(function(){
				curState().timeEvent.add(0.2, function(){
					this.onDestroy();
				}, this)
			}.bind(piece))
			.start();
		},

		moveEffects:function(){
			for(var a = 0; a < this.effects.length; a++){
				var effect = this.effects[a];
				if(!effect.onGoing || !effect.isMoving) continue;
				var target = effect.targetPiece;

				var targetBound = target.getBounds()
				var targetDist = ig.game.math.distance(this.pos.x, this.pos.y, targetBound.centerX, targetBound.centerY)
				var targetRad = ig.game.math.angleBetween(this.pos.x, this.pos.y, targetBound.centerX, targetBound.centerY)
				var localX = Math.cos(targetRad) * targetDist;
				var localY = Math.sin(targetRad) * targetDist;
				var localTarget = new Vector2(localX, localY)

				var oriDist = ig.game.math.distance(0, 0, localTarget.x, localTarget.y);
				var speed = oriDist / this.speed;
				// console.log(oriDist)
				var rad = ig.game.math.angleBetween(0, 0, localTarget.x, localTarget.y)
				var speedX = speed * Math.cos(rad);
				var speedY = speed * Math.sin(rad);
				var toX = effect.x + speedX;
				var toY = effect.y + speedY;
				var tempDistance = ig.game.math.distance(effect.x, effect.y, localTarget.x, localTarget.y);
				if(tempDistance <= speed){
					toX = localTarget.x;
					toY = localTarget.y
					effect.isMoving = false;
				}

				effect.x = toX;
				effect.y = toY;
			}
		},

		doOnCOmplete:function(){
			for(var a = 0; a < this.effects.length; a++){
				var effect = this.effects[a];
				if(effect.isMoving) continue;

				if(this.breakPieces){
					// this.targetPiece.onDestroy();
					if(effect.onComplete){
						effect.onComplete(effect.targetPiece, effect)
					}
				} else {
					if(effect.onComplete && typeof(effect.onComplete.dispatch) == 'function'){
						effect.onComplete.dispatch();	
					} else {
						if(effect.onComplete){
							effect.onComplete(effect.targetPiece, effect)
						}
					}
				}

				var tweenAlpha = new ig.TweenDef(effect)
				.to({alpha:0}, 200)
				.onComplete(function(){
					this.onGoing = false;
				}.bind(effect))
				.start();
			}
		},

		update:function(){
			this.parent();

			if(this.effects.length == 0) return;
			this.moveEffects();

			var onGoing = false;
			var isMoving = false;
			for(var a = 0; a < this.effects.length; a++){
				var effect = this.effects[a];
				if(effect.onGoing) onGoing = true;
				if(effect.isMoving) isMoving = true;
			}
			
			if(!isMoving && this.isMoving){
				this.isMoving = false;
				this.doOnCOmplete()
			}

			if(!onGoing){
				this.kill();
			}
		},

		draw:function(){
			this.parent();
		}
	})
})