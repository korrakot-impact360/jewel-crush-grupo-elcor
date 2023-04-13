ig.module('game.entities.objects.power-up')
.requires('game.entities.objects.piece')
.defines(function(){
	EntityPowerUp = EntityPiece.extend({
		isBombed:false,
		lineEffects:null,
		init:function(x, y, settings){
			this.parent(x, y, settings)
		},

		setProperties:function(path){
			this.parent(path)

			this.setPowerUp();
		},

		setPowerUp:function(){
			if(this.powerUpId == 0) return;
			this.powerUpImg = [];
			if(this.powerUpId == 4){
				this.pieceId = -1;
			} else if(this.powerUpId == 5){
				this.pieceId = -2;
			}
		},

		createPowerUpImg:function(id){
			var addOn = '';
			var addAnim = ''
			if(id == 1 || id == 2){
				addOn = '-1';
				addAnim = '-'
			}
			var anim = ig.CallAsset.addFrame(0, 0, 'game/powerup' + id + addOn);
			anim.anchor.setTo(0.5)
			this.addChild(anim);

			var seq = ig.GenerateFrameNames('game/powerup' + id + addAnim, 1, 2, '', 1)
			anim.addAnim('anim', 0.2, seq, false);
			anim.playAnim('anim');

			return anim;
		},

		checkClick:function(){
			// console.log('powerUpId ' + this.powerUpId)
			if(!curState().gameStart || curState().gamePaused || curState().gameOver) return;
			// console.log(curState().checkOnGoing, curState().pieceClicked)
			if(curState().checkOnGoing) return;
			if(curState().pieceClicked) return;
			if(curState().gBoard.checkAllMovement()) return;

			this.parent();
			// console.log('click', 'col' + this.col, 'row' + this.row)
		},

		releaseClick:function(pointer){
			if(!curState().pieceClicked) return;
			if(this.powerUpId == 5){
				this.isBreak = true;
				curState().moveLeft--;
				if(curState().moveLeft < 1) {
					// curState().gameEnd();
					curState().gameOver = true;
				}
				curState().checkAfterTutor();
				this.tweenExplode();
				return;
			} else {
				this.tweenRelease();
			}

			var clicked = this;
			var hover = this.checkPiece(pointer);
			if(hover != null){
				if(hover.powerUpId == 4 && this.powerUpId == 4){
					this.exchangeThis(hover);
				} else {
					if(this.pieceId != hover.pieceId){
						this.exchangeThis(hover)
						curState().checkAfterTutor();										
					} else {
						this.checkPointer()
						if(!curState().pieceHover){
							curState().pieceClicked = null;
						}
					}
				}
			} else {
				this.checkPointer();
				if(!curState().pieceHover){
					curState().pieceClicked = null;
				}
			}
		},

		exchangeThis:function(hover){
			var diffCol = Math.abs(this.col - hover.col);
			var diffRow = Math.abs(this.row - hover.row);

			if(diffCol == 0 && diffRow == 1 ||
				diffCol == 1 && diffRow == 0){
				// this.tweenChange(hover);
				curState().pieceHover = hover;
				curState().gBoard.exchangePieces(this, hover);
			} else {
				this.checkPointer()
				if(!curState().pieceHover){
					curState().pieceClicked = null;
				}
			}
		},

		onDestroy:function(useEffect){
			// if(this.isBreaking) return;
			// this.isBreaking = true;
			useEffect = (useEffect == false) ? useEffect : true;
			this.parent(useEffect)
			// this.isMoving = true;
			// this.isBreak = true;
			// curState().gBoard.createMatchEffect(this);

			if(!useEffect){
				if(this.powerUpId == 5){
					var tweenPiece = new ig.TweenDef(piece)
					.to({alpha:0}, 10)
					.start();
				}
			}
				
			this.checkPowerUp();
		},

		checkPowerUp:function(){
			if(this.powerUpId == 0 || curState().gBoard.isDestroyAll) return;
			if(this.powerUpId == 5){
				this.explodeAround();
				// console.log('bomb', this.isBreak)
			} else if(this.powerUpId == 4){
				this.selectSameId();
				csound.sfxPlay('samecolor')
			}

			if(this.powerUpId <= 3){
				if(!this.lineEffects){
					if(this.powerUpId == 1){
						this.selectVertical();
					} else if(this.powerUpId == 2){
						this.selectHorizontal();
					} else if(this.powerUpId == 3){
						this.selectVertical();
						this.selectHorizontal();
					}
					csound.sfxPlay('effect')
					var tile = curState().gBoard.tiles[this.row][this.col];
					this.lineEffects = ig.game.addGroup(tile.x, tile.y, {targets:[this]}, EntityLineEffects);
					curState().gBoard.gFrontBoard.add(this.lineEffects)
				}
			} else {				
				if(curState().hint){
					curState().matches = [];
					curState().hint.kill();
					curState().hint = null;
					curState().hintCD = 0;
				}
			}

			curState().checkAfterTutor();
		},

		selectVertical:function(){
			this.verPowerUp = [];
			var pieces = curState().gBoard.pieces;
			var upPiece = this.row - 1;
			if(upPiece >= 0){
				var id = -1;
				checkUp:
				for(var a = upPiece; a >= 0; a--){
					id++;
					var piece = pieces[a][this.col];
					if(!piece || !piece.exists || piece.isBreak) continue;
					curState().chain++;
					var timer = id * 100;
					setTimeout(function(){
						// this.onDestroy();
					}.bind(piece), timer)
					piece.isMoving = true;
					// piece.isBreak = true;
				}				
			}

			var downPiece = this.row + 1;
			if(downPiece < pieces.length){
				var id = -1;
				checkDown:
				for(var a = downPiece; a < pieces.length; a++){
					var piece = pieces[a][this.col];
					id++;
					if(!piece || !piece.exists || piece.isBreak) continue;
					curState().chain++;
					var timer = id * 100;
					setTimeout(function(){
						// this.onDestroy()
					}.bind(piece), timer)
					piece.isMoving = true;
					// piece.isBreak = true;
				}
			}

			var soundId = 1;
			if(curState().chain > 10 && curState().chain < 20) soundId = 2;
			else if(curState().chain >= 20) soundId = 3;

			csound.sfxPlay('match' + soundId)
		},

		selectHorizontal:function(){
			this.horPowerUp = [];
			var pieces = curState().gBoard.pieces;
			var leftPiece = this.col - 1;
			if(leftPiece >= 0){
				var id = -1;
				checkLeft:
				for(var a = leftPiece; a >= 0; a--){
					var piece = pieces[this.row][a];
					id++;
					if(!piece || !piece.exists || piece.isBreak) continue;
					curState().chain++;
					var timer = id * 100;
					setTimeout(function(){
						// this.onDestroy()
					}.bind(piece), timer)
					piece.isMoving = true;
					// piece.isBreak = true;
				}				
			}

			var rightPiece = this.col + 1;
			if(rightPiece < pieces[this.row].length){
				var id = -1;
				checkRight:
				for(var a = rightPiece; a < pieces[this.row].length; a++){
					var piece = pieces[this.row][a];
					id++;
					if(!piece || !piece.exists || piece.isBreak) continue;
					curState().chain++;
					var timer = id * 100;
					setTimeout(function(){
						// this.onDestroy()
					}.bind(piece), timer)
					piece.isMoving = true;
					// piece.isBreak = true;
				}
			}

			var soundId = 1;
			if(curState().chain > 10 && curState().chain < 20) soundId = 2;
			else if(curState().chain >= 20) soundId = 3;

			csound.sfxPlay('match' + soundId)
		},

		selectSameId:function(){
			var samePieces = [];
			if(this.pieceId < 0){
				this.pieceId = ig.game.rnd.pick(curState().pieceTypes)
			}	
			var pieces = curState().gBoard.pieces;
			for(var a = 0; a < pieces.length; a++){
				for(var b = 0; b < pieces[a].length; b++){
					var piece = pieces[a][b];
					if(!piece || !piece.exists || piece.isBreak) continue; 
					if(piece.pieceId == this.pieceId){
						// piece.onDestroy();
						curState().chain++;
						piece.isBreak = true;
						samePieces.push(piece)
					}
				}
			}

			for(var a = 0; a < samePieces.length; a++){
				var piece = samePieces[a];
				var timer = 200;
				var scale = 1.3;
				var tween = new ig.TweenDef(piece.scale)
				.to({x:scale,y:scale}, timer)
				.easing(ig.Tween.Easing.Quadratic.EaseOut)
				.onComplete(function(){
					curState().timeEvent.add(0.3, function(){
						this.onDestroy();
					}, this)
				}.bind(piece))
				.start();
			}

			// var effects = ig.game.addGroup(this.x, this.y, {targets:samePieces,sourceTarget:this, breakPieces:true}, EntitySamecolorEffect);
			// curState().gBoard.gEffect.add(effects)

			var soundId = 1;
			if(curState().chain > 10 && curState().chain < 20) soundId = 2;
			else if(curState().chain >= 20) soundId = 3;

			csound.sfxPlay('match' + soundId)
		},

		tweenExplode:function(){
			var scale = 0.7;
			var toX = this.scale.x * scale;
			var toY = this.scale.y * scale;
			var easing = ig.Tween.Easing.Bounce.EaseIn;
			var tween = new ig.TweenDef(this.scale)
			.to({x:toX,y:toY}, 100)
			.yoyo(true)
			.repeat(1)
			.easing(easing)
			.onComplete(this.onDestroy.bind(this))
			.start()
		},

		explodeAround:function(){			
			csound.sfxPlay('bomb')
			var pieces = curState().gBoard.pieces;
			var maps = curState().gBoard.maps;
			var minCol = this.col - 1;
			var maxCol = this.col + 1;
			var minRow = this.row - 1;
			var maxRow = this.row + 1;

			if(minRow < 0) minRow = 0;
			if(maxRow >= maps.length) maxRow = this.row;
			if(minCol < 0) minCol = 0;
			if(maxCol >= maps[this.row].length) maxCol = this.col;

			for(var a = minRow; a <= maxRow; a++){
				for(var b = minCol; b <= maxCol; b++){
					var piece = pieces[a][b];
					if(!piece || !piece.exists || piece.isBreak) continue;
					if(piece == this) continue;
					curState().chain++;
					piece.isBreak = true;
					curState().timeEvent.add(0.15, piece.onDestroy, piece);
					// piece.onDestroy();
				}
			}

			curState().checkOnGoing = true;
			curState().gBoard.isCheckingBoard = false;
			curState().gBoard.onGoing = false;

			// this.kill();
		},

		destroyAll:function(){
			var pieces = curState().gBoard.pieces;
			for(var a = 0; a < pieces.length; a++){
				for(var b = 0; b < pieces[a].length; b++){
					var piece = pieces[a][b];
					if(!piece || !piece.exists || piece.isBreak) continue;
					curState().chain++;
					piece.onDestroy();
				}
			}

			curState().gBoard.onGoing = true
			var toX = curState().gInGame.x + 20
			var tween = new ig.TweenDef(curState().gInGame)
			.to({x:toX}, 30)
			.onComplete(function(){
				this.onGoing = false;
			}.bind(curState().gBoard))
			.repeat(3)
			.yoyo(true)
			.start();
		},
	})
})