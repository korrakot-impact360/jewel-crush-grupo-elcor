ig.module('game.entities.objects.line-effects')
.requires('game.entities.addon.group')
.defines(function(){
	EntityLineEffects = EntityGroup.extend({
		targets : [],
		particles:[],
		particleMax:100,
		speed:15,
		typePowerUp:1,
		init:function(x, y, settings){
			this.parent(x, y, settings);	
			this.startBounds = [];
			this.effects = [];

			this.startMoving = false;

			this.settingLineEffect();
			this.settingDoughnutCircle();
			this.tweenLine();
		},

		settingDoughnutCircle:function(){
			this.outerCircle = ig.CallAsset.addFrame(0, 0, 'game/effects/match01');
			this.outerCircle.anchor.setTo(0.5);
			this.outerCircle.scale.setTo(0)
			this.add(this.outerCircle);

			var frames = ig.GenerateFrameNames('game/effects/match', 1, 20, '', 2);
			var anim = this.outerCircle.addAnim('match', 0.02, frames, true)
			anim.onComplete.add(function(){
				this.outerCircle.kill();
			}, this)
		},

		settingLineEffect:function(){
			var target = this.targets[0]
			var powerUpId = target.powerUpId;
			// var powerUpId = this.typePowerUp;
			// powerUpId = 1
			var moves = ['left', 'right']
			var startAngle = 0;
			if(powerUpId == 1) {
				startAngle = 90;
				moves = ['up', 'down']
			}
			var addAngle = 180;
			var totEffect = 2;
			if(powerUpId == 3) {
				totEffect = 4;
				addAngle = 90;
				moves = ['left','up', 'right', 'down']
			}

			// totEffect = 1

			for(var a = 0; a < totEffect; a++){
				var effect = ig.CallAsset.addFrame(0, 0, 'game/effects/1')
				effect.anchor.setTo(0.25, 0.5);
				var frames = ig.GenerateFrameNames('game/effects/', 1, 6, '', 1);
				effect.addAnim('run', 0.15, frames, false);
				effect.playAnim('run')
				effect.angle = startAngle + (a * addAngle);
				effect.animSheet.size.x = 0
				effect.onGoing = true;
				effect.goTo = moves[a];
				effect.targetPiece = null;
				effect.targets = [];
				effect.isOut = false;
				this.add(effect);

				this.pieceTargets(effect, target.row, target.col)

				this.effects.push(effect);

				// console.log(effect.targets)
				// this.tweenEffects(effect)
			}	

			// console.log(this.effects.length)		
		},

		pieceTargets:function(effect, row, col){
			var pieces = curState().gBoard.pieces;
			if(effect.goTo == 'left'){
				var toCol = col - 1;
				if(toCol >= 0){
					var temp = pieces[row][toCol]
					if(temp && !temp.isBreak){
						if(effect.targets.indexOf(temp) < 0){
							temp.isBreak = true
							temp.isMoving = true
							effect.targets.push(temp)
						}
					}

					col = toCol;
					this.pieceTargets(effect, row, col)
				} 
			} else if(effect.goTo == 'right'){
				var toCol = col + 1;
				if(toCol < pieces[row].length){
					var temp = pieces[row][toCol];
					if(temp && !temp.isBreak){
						if(effect.targets.indexOf(temp) < 0){
							temp.isBreak = true
							temp.isMoving = true
							effect.targets.push(temp)
						}
					}

					col = toCol
					this.pieceTargets(effect, row, col)
				} 				
			} else if(effect.goTo == 'up'){
				var toRow = row - 1;
				if(toRow >= 0){
					var temp = pieces[toRow][col];
					if(temp && !temp.isBreak){
						if(effect.targets.indexOf(temp) < 0){
							temp.isBreak = true
							temp.isMoving = true
							effect.targets.push(temp)
						}
					}

					row = toRow;
					this.pieceTargets(effect, row, col)
				} 
			} else if(effect.goTo == 'down'){
				var toRow = row + 1;
				if(toRow < pieces.length){
					var temp = pieces[toRow][col];
					if(temp && !temp.isBreak){
						if(effect.targets.indexOf(temp) < 0){
							temp.isBreak = true
							temp.isMoving = true
							effect.targets.push(temp)
						}
					}

					row = toRow;
					this.pieceTargets(effect, row, col)
				}
			}
		},

		moveEffects:function(){
			if(!this.startMoving) return;
			var target = this.targets[0]
			var max = this.toLocal(curState().gw, curState().gh);
			var min = this.toLocal(0, 0)
			var speed = this.speed * ig.GameData.fps * ig.system.tick
			for(var a = 0; a < this.effects.length; a++){
				var effect = this.effects[a];
				var width = 0;
				if(!effect.onGoing) continue;

				// var min = ?
				var target = null;
				if(effect.targets.length > 0){
					target = effect.targets[0];
					if(target){
						var bound = target.getBounds();
						var localPos = effect.groupParent.toLocal(bound.centerX, bound.centerY)
					}
				}

				if(effect.goTo == 'left'){
					effect.x -= speed;
					if(effect.targets.length > 0){
						if(target){
							var dist = ig.game.math.distance(effect.x, effect.y, localPos.x, effect.y)
							if(dist <= speed){
								effect.x = localPos.x;
								this.destroyTarget(effect, target)
							} 
						}
					} 

					width = Math.abs(effect.x);
					if(width > effect.size.x) width = effect.size.x;
					// if(effect.x + (effect.size.x * (1 - effect.anchor.x)) < (min.x)){
				} else if(effect.goTo == 'right'){
					// if(effect.x - (effect.size.x * (1 - effect.anchor.x)) > (max.x)){
					effect.x += speed;
					if(effect.targets.length > 0){
						if(target){
							var dist = ig.game.math.distance(effect.x, effect.y, localPos.x, effect.y)
							if(dist <= speed){
								effect.x = localPos.x;
								this.destroyTarget(effect, target)
							}
						}
					} 

					width = Math.abs(effect.x);
					if(width > effect.size.x) width = effect.size.x;
				} else if(effect.goTo == 'up'){
					effect.y -= speed
					if(effect.targets.length > 0){
						if(target){
							var dist = ig.game.math.distance(effect.x, effect.y, effect.x, localPos.y)
							if(dist <= speed){
								effect.y = localPos.y;
								this.destroyTarget(effect, target)
							}
						}
					}

					width = Math.abs(effect.y);
					if(width > effect.size.x) width = effect.size.x;
				} else if(effect.goTo == 'down'){
					effect.y += speed
					if(effect.targets.length > 0){
						if(target){
							var dist = ig.game.math.distance(effect.x, effect.y, effect.x, localPos.y)
							if(dist <= speed){
								effect.y = localPos.y;
								this.destroyTarget(effect, target)
							}
						}				
					}

					width = Math.abs(effect.y);
					if(width > effect.size.x) width = effect.size.x;
				}

				if(!effect.isOut){
					if(effect.targets.length <= 0) {
						// console.log('stop going')
						effect.isOut = true;
						this.hideEffect(effect)	
					} else {
						var effectBound = effect.getBounds()
						var board = curState().gBoard;
						var minX = 0;
						var maxX = ig.game.gw;
						var minY = 0;
						var maxY = ig.game.gh
						if(effectBound.x > maxX || effectBound.right < minX || effectBound.y > maxY || effectBound.bottom < minY){
							effect.isOut = true;
							this.hideEffect(effect)
						}
					}
				}

				// effect.animSheet.size.x = width;
			}
		},

		destroyTarget:function(effect, target){
			target.onDestroy();
			var id = effect.targets.indexOf(target)
			effect.targets.splice(id, 1);

			if(effect.targets.length == 0){
				// console.log('stop going')
				this.hideEffect(effect)			
			}
		},

		hideEffect:function(effect){
			if(!effect.isOut) return;
			effect.isOut = true;
			var tween = new ig.TweenDef(effect)
			.to({alpha:0}, 300)
			.onComplete(function(){
				this.onGoing = false;
			}.bind(effect))
			.start();
		},

		checkLeftOver:function(){
			for(var a = 0; a < this.effects.length; a++){
				var effect = this.effects[a];
				var targets = effect.targets;
				for(var b = 0; b < targets.length; b++){
					var target = targets[b];
					target.onDestroy()
				}
			}
		},

		update:function(){
			this.parent()
			this.moveEffects();

			var onGoing = false;
			if(this.effects.length == 0) return
			for(var a = 0; a < this.effects.length; a++){
				var effect = this.effects[a];
				if(effect.onGoing) onGoing = true;
			}

			if(!onGoing){
				// console.log('kill this')
				this.checkLeftOver()
				this.kill();
			}
		},

		tweenLine:function(){
			var timer = 100
			var tweenOuter = new ig.TweenDef(this.outerCircle.scale);
			tweenOuter.to({x:1,y:1}, timer);
			tweenOuter.onComplete(function(){
				this.startMoving = true;
				// this.settingLineEffect();
				this.outerCircle.playAnim('match')
				// curState().timeEvent.add(0.1, this.tweenAlphaOuter, this)
			}.bind(this));
			tweenOuter.start();
		},

		tweenAlphaOuter:function(){
			var timer = 100
			var tweenOuter = new ig.TweenDef(this.outerCircle);
			tweenOuter.to({alpha:0}, timer);
			tweenOuter.start();
		},

		draw:function(){
			this.parent();
		},
	});
});