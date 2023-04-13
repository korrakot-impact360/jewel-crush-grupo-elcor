ig.module('game.entities.objects.piece')
.requires('game.entities.addon.sprite')
.defines(function(){
	EntityPiece = EntitySprite.extend({
		row:-1,
		col:-1,
		_row : -1,
		_col : -1,
		pieceId : 0,
		isMoving : false,
		isIn : false,
		moveAfter:false,
		checkTilesCol : [],
		checkTilesRow : [],
		powerUpId : 0, //1. vertical, 2. horizontal, 3. ver+hor, 4. same color
		isBreak : false,
		isBreaking : false,
		isChangingPlace:false,
		speed:10,
		destPos : {x:0, y:0},
		isChecking : false,
		startClick:{x:0,y:0},

		init:function(x, y, settings){
			this.parent(x, y, settings);	

			this.onCompleteMove = new ig.AddSignal(this);
		},

		setProperties:function(path){				
			this.parent(path);

			// this.inputEnabled = true;
			this.onGoing = false;
			this.isClicked = false;

			this.onClick.add(this.checkClick, this);
			this.onRelease.add(function(){
				this.releaseClick(ig.game.pointer.pos);
			}, this);

			// this.setScale(0);		
			this.alpha = 0;
			this.anchor.setTo(0.5);
			// this.visible = false;
		},

		createSparkling:function(){
			// return
			if(this.powerUpId > 3) return
			var rndX = ig.game.rnd.realInRange(0, 10);
			var rndY = ig.game.rnd.realInRange(-20, -18);
			var frameTime = ig.game.rnd.realInRange(0.15, 0.25)

			// var x = this.x + rndX;
			// var y = this.y + rndY;
			var x = rndX;
			var y = rndY

			this.sparkling = ig.CallAsset.addFrame(x, y, 'game/effects/sparkle/1');
			this.sparkling.anchor.setTo(0.5);
			var frame = ig.GenerateFrameNames('game/effects/sparkle/', 1, 6, '', 1);
			this.sparkling.addAnim('spark', frameTime, frame, false);
			this.sparkling.playAnim('spark');
			this.addChild(this.sparkling)
			// this.groupParent.add(this.sparkling)

			this.sparkling.offSet = {
				x: x - this.x,
				y: y - this.y
			}
			// this.addChild(this.sparkling)
		},

		tweenIn:function(){
			// return;
			if(this.isIn) return;
			this.isIn = true;
			var tile = curState().gBoard.tiles[this.row][this.col];
			var globalPos = curState().gBoard.gPieces.toGlobal(tile.x, tile.y)
			var toY = tile.y;
			var easing = ig.Tween.Easing.Quadratic.EaseOut;
			var timer = 100;
			var tween = new ig.TweenDef(this)
			.to({alpha:1}, timer)
			.onComplete(function(){
				this.isIn = false;
				if(this.moveAfter){
					this.moveTo(this.isChecking)
				}
				this.inputEnabled = true;
			}.bind(this))
			.easing(easing)
			.start();

			if(this.isMoving) return;
			var tweenTo = new ig.TweenDef(this)
			.to({y:toY}, timer)
			.easing(easing)
			.start();
		},

		tweenClick:function(){
			this.scale.setTo(1.1);
		},

		tweenRelease:function(pointer){
			this.scale.setTo(1)
		},

		checkClick:function(){
			if(!curState().gameStart || curState().gamePaused || curState().gameOver) return;			
			if(curState().checkOnGoing) return;
			if(curState().pieceClicked) return;
			if(curState().gBoard.checkAllMovement()) return;
			curState().pieceClicked = this;
			this.startClick.x = ig.game.pointer.pos.x;
			this.startClick.y = ig.game.pointer.pos.y;
			this.startClick.clickTime = Date.now();
			this.tweenClick();
			curState().chain = 0;
			this.checkTilesCol = [];
			this.checkTilesRow = [];
			// console.log('click ' + this.pieceId, 'col' + this.col, 'row' + this.row)
		},

		releaseClick:function(pointer){
			if(!curState().pieceClicked) return;
			this.tweenRelease();

			var clicked = this;
			var hover = this.checkPiece(pointer);
			if(hover != null && this.pieceId != hover.pieceId){
				var diffCol = Math.abs(this.col - hover.col);
				var diffRow = Math.abs(this.row - hover.row);

				if(diffCol == 0 && diffRow == 1 ||
					diffCol == 1 && diffRow == 0){
					// console.log('exchange this')
					// this.tweenChange(hover);
					curState().pieceHover = hover;
					if(curState().pieceHover){
						curState().pieceHover.checkTilesCol = [];
						curState().pieceHover.checkTilesRow = [];
					}

					curState().gBoard.exchangePieces(this, hover);
				} else {
					this.checkPointer()
					if(!curState().pieceHover){
						curState().pieceClicked = null;
					}
				}
			} else {
				this.checkPointer();
				if(!curState().pieceHover){
					curState().pieceClicked = null;
				}
			}
		},

		checkPointer:function(){
			var tile = curState().gBoard.tiles[this.row][this.col]
			var diffX = ig.game.pointer.pos.x - this.startClick.x;
			var diffY = ig.game.pointer.pos.y - this.startClick.y;

			var toCol = this.col;
			var toRow = this.row;
			if(diffX > 0 && Math.abs(diffX) >= tile.size.x && Math.abs(diffY) < (tile.size.y * 0.5)){
				toCol += 1;
				if(toCol >= curState().gBoard.pieces[this.row].length) toCol = this.col;
			} else if(diffX < 0 && Math.abs(diffX) >= tile.size.x && Math.abs(diffY) < (tile.size.y * 0.5)) {
				toCol -= 1;
				if(toCol < 0) toCol = this.col;
			} else if(diffY > 0 && Math.abs(diffY) >= tile.size.y && Math.abs(diffX) < (tile.size.x * 0.5)){
				toRow += 1;
				if(toRow >= curState().gBoard.pieces.length) toRow = this.row;
			} else if(diffY < 0 && Math.abs(diffY) > tile.size.y && Math.abs(diffX) < (tile.size.x * 0.5)){
				toRow -= 1;
				if(toRow < 0) toRow = this.row;
			}

			if(toRow != this.row || toCol != this.col){
				var tempPiece = curState().gBoard.pieces[toRow][toCol];
				if(tempPiece && !tempPiece.isBreak && tempPiece.powerUpId != 5){
					curState().pieceHover = tempPiece;
					if(curState().pieceHover){
						curState().pieceHover.checkTilesCol = [];
						curState().pieceHover.checkTilesRow = [];
					}
					curState().gBoard.exchangePieces(this, tempPiece)
				}
			}
		},

		checkPiece:function(pointer){
			var pieces = curState().gBoard.pieces;
			// console.log(ig.game.pointer.hoveringItem)
			var pointerHover = ig.game.pointer.hoveringItem;
			var hover = null;
			for(var a = 0; a < pieces.length; a++){
				for(var b = 0; b < pieces[a].length; b++){
					var piece = pieces[a][b];
					if(piece == null) continue;
					if(piece == this) continue;
					if(piece.powerUpId == 5) continue;
					if(pointerHover == piece){
						hover = piece;
						break;
					}
				}
			}

			return hover;
		},

		checkMatchAround:function(){
			this.checkTilesRow = [this];
			this.checkTilesCol = [this];

			this.checkCol(this);
			this.checkRow(this);
		},

		checkCol:function(piece){
			var pieces = curState().gBoard.pieces;
			var maps = curState().gBoard.maps;
			var row = this.row;
			var minCol = piece.col - 1;
			var maxCol = piece.col + 1;

			if(minCol < 0) minCol = 0;
			if(maxCol >= maps[row].length) maxCol = maps[row].length - 1;

			for(var b = minCol; b <= maxCol; b++){
				var p = pieces[row][b];
				var map = maps[row][b]
				if(!p || p.isBreak) continue;
				if(p.powerUpId > 3) continue;
				if(p == piece) continue;
				// if(p.row != p._row || p.col != p._col) continue;
				if(p.pieceId == piece.pieceId){
					// console.log('checked', piece.pieceId, p.pieceId)
					var idx = this.checkTilesCol.indexOf(p);
					if(idx < 0) {
						this.checkTilesCol.push(p);
						this.checkCol(p);
					}
				}
			}
		},

		checkRow:function(piece){
			var pieces = curState().gBoard.pieces;
			var maps = curState().gBoard.maps;
			var col = this.col;
			var minRow = piece.row - 1;
			var maxRow = piece.row + 1;
			if(minRow < 0) minRow = 0;
			if(maxRow >= maps.length) maxRow = maps.length - 1;

			for(var a = minRow; a <= maxRow; a++){
				var p = pieces[a][col];
				var map = maps[a][col]
				if(!p || p.isBreak) continue;
				if(p.powerUpId > 3) continue;
				if(p == piece) continue
				// if(p.row != p._row || p.col != p._col) continue;
				if(p.pieceId == piece.pieceId){
					// console.log('checked', piece.pieceId, p.pieceId)
					var idx = this.checkTilesRow.indexOf(p);
					if(idx < 0) {
						this.checkTilesRow.push(p);
						this.checkRow(p);
					}
				}
			}
		},

		checkPiecesAround:function(){
			curState().checkOnGoing = true;
			var playBoard = curState().gBoard;
			var checkPiece = curState().gBoard.pieces[this.row][this.col];
			if(checkPiece != this) return;

			var isFusing = this.preFuse();
			// console.log(isFusing)
			if(!isFusing){
				if(this.checkTilesCol.length >= 3){
					for(var a = 0; a < this.checkTilesCol.length; a++){
						var piece = this.checkTilesCol[a];
						if(!piece.exists || piece.isBreak) continue;
						curState().chain += 1;
						piece.onDestroy();
					}
				}

				if(this.checkTilesRow.length >= 3){
					for(var a = 0; a < this.checkTilesRow.length; a++){
						var piece = this.checkTilesRow[a];
						if(!piece.exists || piece.isBreak) continue;
						curState().chain += 1;
						piece.onDestroy();
					}				
				}
			}

			if(this.checkTilesRow.length >= 3 || this.checkTilesCol.length >= 3){
				// curState().chain += 1;
				if(curState().hint){
					curState().matches = [];
					curState().hint.kill();
					curState().hint = null;
					curState().hintCD = 0;
				}
				curState().checkAfterTutor()

				var soundId = 1;
				if(curState().chain > 10 && curState().chain < 20) soundId = 2;
				else if(curState().chain >= 20) soundId = 3;

				csound.sfxPlay('match' + soundId)
			}

			this.checkTilesCol = [];
			this.checkTilesRow = [];
		},

		preFuse:function(){
			var isFusing = true;
			if(this.checkTilesCol.length == 3 && this.checkTilesRow.length == 3){
				// console.log(this.checkTilesCol.length, this.checkTilesRow.length);
				if(ig.GameData.stage >= ig.GameData.unlockPowerUp[2]){
					this.fusePieces(this.checkTilesCol, 5);
					this.fusePieces(this.checkTilesRow);
				} else if(ig.GameData.stage >= ig.GameData.unlockPowerUp[0]){
					var powerUpId = ig.game.rnd.integerInRange(1,4)	
					this.fusePieces(this.checkTilesCol, powerUpId);
					this.fusePieces(this.checkTilesRow);
				} else {
					isFusing = false;
				}
			} else if(this.checkTilesCol.length == 4 && this.checkTilesRow.length < 3 && ig.GameData.stage >= ig.GameData.unlockPowerUp[0]){
				var powerUpId = ig.game.rnd.integerInRange(1,3)
				this.fusePieces(this.checkTilesCol, powerUpId)
			} else if(this.checkTilesCol.length < 3 && this.checkTilesRow.length == 4 && ig.GameData.stage >= ig.GameData.unlockPowerUp[0]){
				var powerUpId = ig.game.rnd.integerInRange(1,3)
				this.fusePieces(this.checkTilesRow, powerUpId)
			} else if(this.checkTilesCol.length >= 5 && this.checkTilesRow.length < 3){
				if(ig.GameData.stage >= ig.GameData.unlockPowerUp[1]){
					this.fusePieces(this.checkTilesCol, 4)
				} else if(ig.GameData.stage >= ig.GameData.unlockPowerUp[0]){
					var powerUpId = ig.game.rnd.integerInRange(1,3)	
					this.fusePieces(this.checkTilesCol, powerUpId)
				} else {
					isFusing = false;
				}
			} else if(this.checkTilesCol.length < 3 && this.checkTilesRow.length >= 5){
				if(ig.GameData.stage >= ig.GameData.unlockPowerUp[1]){
					this.fusePieces(this.checkTilesRow, 4)
				} else if(ig.GameData.stage >= ig.GameData.unlockPowerUp[0]){
					var powerUpId = ig.game.rnd.integerInRange(1,3)	
					this.fusePieces(this.checkTilesRow, powerUpId)
				} else {
					isFusing = false;
				}
			} else if((this.checkTilesRow.length > 3 && this.checkTilesCol.length >= 3) || (this.checkTilesRow.length >= 3 && this.checkTilesCol.length >= 3)){
				if(ig.GameData.stage >= ig.GameData.unlockPowerUp[1]){
					this.fusePieces(this.checkTilesCol, 4);
					this.fusePieces(this.checkTilesRow)
				} else if(ig.GameData.stage >= ig.GameData.unlockPowerUp[0]){
					var powerUpId = ig.game.rnd.integerInRange(1,3)	
					this.fusePieces(this.checkTilesCol, powerUpId)
				} else {
					isFusing = false;
				}
			} else {
				isFusing = false;
			}

			// if(isFusing) console.log(this.checkTilesCol.length, this.checkTilesRow.length);
			return isFusing;
		},

		fusePieces:function(pieces, typePower){
			this.groupParent.bringToTop(this);
			var tween = null;
			this.changeTo = typePower ? typePower : null;
			for(var a = 0; a < pieces.length; a++){
				var piece = pieces[a];
				if(!piece || !piece.exists || piece.isBreak) continue;

				if(piece == this) {
					var checkPiece = curState().gBoard.pieces[this.row][this.col];
					if(checkPiece == this){
						var effect = ig.CallAsset.addFrame(this.x, this.y, 'game/effects/match09');
						effect.anchor.setTo(0.5);
						effect.scale.setTo(0)
						curState().gBoard.gEffect.add(effect)

						var tweenAlpha = new ig.TweenDef(effect)
						.to({alpha:0}, 100)
						.onComplete(function(){
							this.kill();
						}.bind(effect));

						tween = new ig.TweenDef(effect.scale)
						.to({x:1,y:1}, 200)
						.onComplete(function(){
							if(this.checkTilesRow.length == 3 && this.checkTilesCol == 3){
								console.log(this.changeTo)
							}
							var pieceId = undefined;
							if(this.changeTo <= 3){
								pieceId = this.pieceId;
							}
							curState().gBoard.replacePiece(this, this.changeTo, pieceId)
							if(this.powerUpId > 0){
								this.checkPowerUp();
							}
						}.bind(this));
						tween.chain(tweenAlpha)
						tween.start();

						curState().gBoard.pieces[this.row][this.col] = null;
					}
				} else {
					piece.isBreak = true;
					curState().chain += 1;
					var toX = this.x;
					if(toX == 0) toX += 0.001;
					var toY = this.y;
					if(toY == 0) toY += 0.001;
					var timer = 100;

					tween = new ig.TweenDef(piece)
					.to({x:toX,y:toY}, timer)
					.easing(ig.Tween.Easing.Quadratic.EaseOut)
					.onComplete(function(){
						this.onDestroy(false);
					}.bind(piece))
					.start()
				}
			}
		},

		onDestroy:function(useEffect){
			// if(this.isBreaking) return;
			// this.isBreaking = true;
			useEffect = (useEffect == false) ? useEffect : true;
			var baseChain = parseInt(curState().chain / 5)
			var baseScore = ig.GameData.defPieceScore + (ig.GameData.defPieceScore * 0.1 * baseChain);
			curState().plScore += parseInt(baseScore)
			this.isMoving = true;
			this.isBreak = true;
			curState().hintCD = 0

			if(useEffect){
				var goalMatch = this.checkItemGoal();
				if(goalMatch && goalMatch.itemLeft > 0){
					this.checkIfMatchGoal();
					curState().gBoard.pieces[this.row][this.col] = null;
				} else {
					curState().gBoard.createMatchEffect(this);
				}
			} else {
				this.checkIfMatchGoal();
				curState().gBoard.pieces[this.row][this.col] = null;
			}

			// if(this.sparkling && this.sparkling.exists){
			// 	this.sparkling.kill();
			// }
		},

		checkIfMatchGoal:function(){
			var exists = this.checkItemGoal();

			if(exists && exists.itemLeft > 0){
				// console.log('goal exist')
				exists.itemLeft--;
				
				var existBound = exists.getBounds();
				var thisBound = this.getBounds();
				var dist = ig.game.math.distance(existBound.centerX, existBound.centerY, thisBound.centerX, thisBound.centerY)
				var radTo = ig.game.math.angleBetween(existBound.centerX, existBound.centerY, thisBound.centerX, thisBound.centerY)
				this.x = exists.x + (Math.cos(radTo) * dist);
				this.y = exists.y + (Math.sin(radTo) * dist);

				var toX = exists.x;
				var toY = exists.y;

				this.groupParent.remove(this)
				exists.groupParent.add(this)

				this.goToGoal(toX, toY, exists.scale.x, exists.scale.y);
			} else {
				this.kill();
			}
		},

		checkItemGoal:function(){
			var exists = null;
			if(this.powerUpId > 3) return exists;
			var itemLists = curState().gList.items;
			for(var a = 0; a < itemLists.length; a++){
				var item = itemLists[a];
				if(item.jewelId == this.pieceId){
					exists = item;
					break;
				}
			}

			return exists;
		},

		goToGoal:function(x, y, scaleX, scaleY){
			if(x == 0) x += 0.001;
			if(y == 0) y += 0.001;
			var timer = 300
			var tween = new ig.TweenDef(this)
			.to({x:x, y:y}, timer)
			.onComplete(function(){
				this.kill();
			}.bind(this))
			.start();

			var tweenScale = new ig.TweenDef(this.scale)
			.to({x:scaleX, y:scaleY}, timer)
			.start()
		},
		
		setMapData:function(row, col){
			curState().gBoard.pieces[this.row][this.col] = null;
			this.row = row;	
			this.col = col;
			curState().gBoard.pieces[this.row][this.col] = this;
		},

		moveTo:function(isChecking){
			if(this.isMoving) return;
			if(this.row == this._row && this.col == this._col) return;
			this.moveAfter = true;
			this.isChecking = isChecking;
			if(this.isIn) return;
			this.isMoving = true;
			// console.log(isChecking)
			// curState().gBoard.checkPieceAround(this, 1);
			// this._row = this.row;
			// this._col = this.col;
			// if(isChecking){
			// 	this.checkMatchAround();
			// } else {
			// 	this.checkTilesCol = [];
			// 	this.checkTilesRow = [];
			// }

			var tile = curState().gBoard.tiles[this.row][this.col];
			var toX = tile.x;
			var toY = tile.y;
			if(toX == 0) toX += 0.05;
			if(toY == 0) toY += 0.05;

			var easing = ig.Tween.Easing.Quadratic.EaseOut
			var timing = 200;
			var tween = new ig.TweenDef(this)
			.to({x:toX, y:toY}, timing)
			.easing(easing)
			.onComplete(function(){
				this.isMoving = false;
				this.moveAfter = false;
				// this.checkPiecesAround();
				// this._row = this.row;
				// this._col = this.col;
			}.bind(this))
			.start();
		},

		update:function(){
			this.parent();
			if(this.inputEnabled && !this.isMoving && !this.isBreak && this.alpha < 1){
				this.alpha = 1;
			}

			// if(this.sparkling){
			// 	if(this.isBreak && this.sparkling.exists){
			// 		this.sparkling.kill();
			// 	}

			// 	this.sparkling.x = this.sparkling.offSet.x - this.x;
			// 	this.sparkling.y = this.sparkling.offSet.y - this.y
			// }

			// if(this.isBreak){
			// 	if(this.sparkling && this.sparkling.exists){
			// 		this.sparkling.kill();
			// 	}
			// }
		},
	})
})