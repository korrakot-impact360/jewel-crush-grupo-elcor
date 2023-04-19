ig.module('game.entities.objects.play-board')
.requires(
	'game.entities.addon.group'
	,'game.entities.objects.piece'
	,'game.entities.objects.power-up'
)
.defines(function(){
	EntityPlayBoard = EntityGroup.extend({
		tileSize : {x:69, y:71},
		isDestroyAll : false,
		checkPiece1 : null,
		checkPiece2 : null,
		isCheckingBoard : false,
		checkEmptyTile : [],
		countTry:0,
		onGoing : false,
		emptyExists : false,
		emptyPieceInEmptySpace : [],
		matches:[],
		countCheck:0,
		init:function(x, y, settings){
			this.parent(x, y, settings);
			this.actAfterExchange = new ig.AddSignal(this);
			this.create();
		},

		create:function(){
			this.boardImg = ig.game.spawnEntity(EntityCanvasSheet, 0, 0);
			this.add(this.boardImg)

			this.gPieces = ig.game.addGroup();
			this.add(this.gPieces);

			var mapId = curState().mapId
			var maps = ig.GameData.stageMaps[mapId];
			// if(ig.GameData.stage < ig.GameData.stageMaps.length && ig.GameData.stageMaps[ig.GameData.stage] && ig.GameData.stageMaps[ig.GameData.stage].length > 0){
			// 	maps = ig.GameData.stageMaps[ig.GameData.stage]
			// }

			this.maps = maps;
			this.tiles = [];
			this.mapPos = [];
			for(var a = 0; a < maps.length; a++){ //row
				this.tiles[a] = [];
				this.mapPos[a] = [];
				for(var b = 0; b < maps[a].length; b++){	//col
					var data = maps[a][b];
					if(data == 0){
						var tile = null;
						var data = {row:a, col:b};
						this.checkEmptyTile.push(data);
						this.mapPos[a][b] = null;
					} else {
						var addTitle = '';
						var tile = ig.CallAsset.addFrameImage(0, 0, 'game/tile' + addTitle);
						tile.anchor.setTo(0.5);
						// tile.alpha = 0;
						tile.row = a;
						tile.col = b;
						// this.gPieces.add(tile);

						var row = maps.length;
						var col = maps[a].length;

						var x = 0;
						var y = 0;
						var center = (col - 1) / 2;
						x = (-tile.width * center) + (tile.width * b);

						center = (row - 1) / 2;
						y = (-tile.height * center) + (tile.height * a);
						tile.x = x;
						tile.y = y;		
						this.mapPos[a][b] = {x:x, y:y};				
					}

					this.tiles[a][b] = tile;
				}
			}

			this.pieces = [];
			for(var a = 0; a < this.tiles.length; a++){	//row
				this.pieces[a] = [];
				for(var b = 0; b < this.tiles[a].length; b++){	//col
					var tile = this.tiles[a][b];
					if(tile == null) {
						this.pieces[a][b] = null;
						continue;
					}
					var piece = this.createPiece(a, b);
					piece._row = a;
					piece._col = b;
					piece.alpha = 1
					piece.y = tile.y
					if(tile.y == 0) piece.y += 0.01
					piece.inputEnabled = true;
					// piece.tweenIn();
				}
			}

			this.gFrontBoard = ig.game.addGroup();
			this.add(this.gFrontBoard);

			this.gEffect = ig.game.addGroup();
			this.add(this.gEffect);
		},

		exchangePieces:function(piece1, piece2){
			curState().checkOnGoing = true;
			if(piece1.powerUpId == 4 && piece2.powerUpId == 4){
				this.isDestroyAll = true;
				this.actAfterExchange.add(function(){
					curState().pieceClicked.destroyAll();
				}, this);
				this.exchangeTween(piece1, piece2, false);
				curState().checkAfterTutor();
			} else if(piece1.powerUpId == 4 || piece2.powerUpId == 4){
				this.exchangeTween(piece1, piece2, false)
				if(piece1.powerUpId == 4) {
					curState().checkAfterTutor();
					this.actAfterExchange.add(function(){
						curState().pieceClicked.pieceId = curState().pieceHover.pieceId;
						curState().pieceClicked.onDestroy();
					}, this);
				}

				if(piece2.powerUpId == 4) {						
					curState().checkAfterTutor();
					this.actAfterExchange.add(function(){
						curState().pieceHover.pieceId = curState().pieceClicked.pieceId;
						curState().pieceHover.onDestroy();
					}, this);
				}
			} else if((piece1.powerUpId >= 1 && piece1.powerUpId <= 3) && (piece2.powerUpId >= 1 && piece2.powerUpId <= 3)){
				curState().checkAfterTutor();
				this.exchangeTween(piece1, piece2, false);	
				this.actAfterExchange.add(function(){
					curState().pieceClicked.onDestroy();
					curState().pieceHover.onDestroy();
				}, this);
			} else {
				this.exchangeTween(piece1, piece2, true);				
			}

			this.checkSurround(piece1, piece2);
		},

		exchangeTween:function(piece1, piece2, isChecking){
			if(this.onGoing) return;
			// csound.sfxPlay('slide')
			this.onGoing = true;
			this.isChecking = isChecking;
			var tile1 = this.tiles[piece1.row][piece1.col];
			var tile2 = this.tiles[piece2.row][piece2.col];
			var toTile1 = new Vector2(tile1.x, tile1.y);
			var toTile2 = new Vector2(tile2.x, tile2.y);
			var timing = 150;

			if(toTile2.x == 0) toTile2.x += 0.05;
			if(toTile2.y == 0) toTile2.y += 0.05;
			if(toTile1.x == 0) toTile1.x += 0.05;
			if(toTile1.y == 0) toTile1.y += 0.05;

			piece1.isMoving = true;
			piece2.isMoving = true;

			var tween1 = new ig.TweenDef(piece1)
			.to({x:toTile2.x, y:toTile2.y}, timing)
			.onComplete(function(){
				this.isMoving = false
			}.bind(piece1))
			.start();

			var tween2 = new ig.TweenDef(piece2)
			.to({x:toTile1.x, y:toTile1.y}, timing)
			.onComplete(function(){
				curState().gBoard.checkAfterExchange();
				this.isMoving = false;
			}.bind(piece2))
			.start();

			piece1.row = tile2.row;
			piece1.col = tile2.col;
			piece1._row = tile2.row;
			piece1._col = tile2.col;
			this.pieces[piece1.row][piece1.col] = piece1;

			piece2.row = tile1.row;
			piece2.col = tile1.col;
			piece2._row = tile1.row;
			piece2._col = tile1.col;
			this.pieces[piece2.row][piece2.col] = piece2;
		},

		checkAfterExchange:function(){			
			this.onGoing = false;
			if(this.isChecking) {
				this.checkSurrounding();
			} else {
				if(curState().pieceClicked){
					if(curState().pieceClicked.powerUpId == 4 && curState().pieceHover.powerUpId == 4){
						// curState().checkOnGoing = false;
					}					
				} else {
					curState().checkOnGoing = false;
				}

			}

			this.actAfterExchange.dispatch();
			curState().pieceClicked = null;
			curState().pieceHover = null;
			this.isChecking = false;
			this.actAfterExchange = new ig.AddSignal(this);
		},

		checkSurround:function(piece1, piece2){
			this.checkPieceAround(piece1, 1);
			this.checkPieceAround(piece2, 2);
		},

		checkPieceAround:function(piece, arrayId){
			if(!piece || !arrayId) return;
			// this['checkTilesRow' + arrayId] = [piece];
			// this['checkTilesCol' + arrayId] = [piece];
			this['checkPiece' + arrayId] = piece;
			piece.checkMatchAround();
		},

		checkSurrounding:function(){
			//to check if there is a match after exchanging place
			var piece1 = this.checkPiece1;
			var piece2 = this.checkPiece2;
			if(piece1.checkTilesRow.length < 3 && piece2.checkTilesRow.length < 3
				&& piece1.checkTilesCol.length < 3 && piece2.checkTilesCol.length < 3){
				piece1.checkTilesCol = [];
				piece1.checkTilesRow = [];
				piece2.checkTilesCol = [];
				piece2.checkTilesRow = [];
				this.exchangeTween(piece1, piece2, false);
			} else {
				curState().moveLeft--;
				if(curState().moveLeft < 1) {
					// curState().gameEnd();
					curState().gameOver = true;
				}
				piece1.checkPiecesAround();
				piece2.checkPiecesAround();
			}
		},

		createMatchEffect:function(piece){
			var spriteName = 'effects/match01';
			var seq = ig.GenerateFrameNames('effects/match', 1, 20, '', 2)
			var timer = 0.02;
			if(piece.powerUpId == 5) {
				spriteName = 'effects/bomb1';
				seq = ig.GenerateFrameNames('effects/bomb', 1, 9, '', 1)
				timer = 0.03;
			}

			var effect = ig.CallAsset.addFrame(piece.x, piece.y, spriteName);
			effect.piece = piece;
			var anchorX = 0.5
			var anchoredWidth = effect.width * anchorX;
			var anchorY = anchoredWidth / effect.height
			effect.anchor.setTo(anchorX, anchorY);

			var anim = effect.addAnim('match', timer, seq, true);
			anim.actInFrame = new ig.AddSignal(effect);
			anim.actInFrame.add(function(){
				this.checkIfMatchGoal();
				// console.log(this.row, this.col);
				curState().gBoard.pieces[this.row][this.col] = null;
				// this.kill();
			}, piece);
			anim.onEnterFrame.add(function(){
				// if(this.tile == 'effects/match09'){
				if(this.frame == 7){
					// this.spriteParent.piece.alpha = 0;
				}

				// if(this.spriteParent.piece.powerUpId < 5 && this.frame == 7){
				// 	this.spriteParent.piece.alpha = 0;
				// 	// this.actInFrame.dispatch();
				// }
			}, anim);
			anim.onComplete.add(function(){
				var anim = this.currentAnim;
				anim.actInFrame.dispatch();
				// this.piece.alpha = 1
				// if(this.piece.powerUpId == 5) anim.actInFrame.dispatch();
				this.kill();
				// curState().gBoard.checkBoard();
			}, effect);

			effect.playAnim('match')
			this.gEffect.add(effect)

			var goalExists = piece.checkItemGoal()

			if(!goalExists || piece.powerUpId == 5){
				var tweenPiece = new ig.TweenDef(piece)
				.to({alpha:0}, 160)
				.start();
			}
		},

		checkBoard:function(){
			//for checking empty space
			if(this.countTry >= 1000) return;
			this.emptyExists = false;
			this.countTry++;
			var stillEmpty = false;
			this.refillRow();
			this.checkBlindSpots();

			if(this.emptyExists){
				this.checkBoard();
			} else {
				this.moveAllPieces(true);
				curState().checkOnGoing = false;
			}
		},

		checkBlindSpots:function(){
			for(var a = 1; a < this.maps.length; a++){
				for(var b = 0; b < this.maps[a].length; b++){
					var tile = this.maps[a][b];
					var ground = this.tiles[a][b]
					var piece = this.pieces[a][b]
					if(tile == 0 || piece) continue;
					var rowAbove = this.maps[a-1][b];
					if(rowAbove == 0){
						var path = [ground]
						this.trackBlindPath(ground, path)
						this.emptyExists = true;
					}
				}
			}
		},

		trackBlindPath:function(tile, path, origin){
			var col = tile.col;
			var totCol = this.maps[tile.row].length;
			var leftCol = tile.col - 1;
			var rightCol = tile.col + 1;
			var underRow = tile.row + 1;
			var pathLeft = []
			var pathRight = [];

			if(leftCol >= 0){
				var checking = true;
				var tempPathLeft = [];
				while(checking && leftCol >= 0){
					var colLeft = this.maps[tile.row][leftCol];
					if(colLeft == 0){
						checking = false;
					} else {
						var tileLeft = this.tiles[tile.row][leftCol];
						tempPathLeft.push(tileLeft);
						var checkEnd = this.checkUpperRow(tileLeft, pathLeft);
						if(checkEnd.origin){
							pathLeft = tempPathLeft.concat(checkEnd.path);
							checking = false;
						} else {
							leftCol--;
						}
					}
				}
			}

			if(rightCol < this.maps[tile.row].length){
				var checking = true;
				var tempPathRight = [];
				while(checking && rightCol < this.maps[tile.row].length){
					var colRight = this.maps[tile.row][rightCol];
					if(colRight == 0){
						checking = false;
					} else {
						var tileRight = this.tiles[tile.row][rightCol];
						tempPathRight.push(tileRight);
						var checkEnd = this.checkUpperRow(tileRight, pathRight);
						if(checkEnd.origin){
							pathRight = tempPathRight.concat(checkEnd.path);
							checking = false;
						} else {
							rightCol++;
						}
					}
				}
			}

			if(pathLeft.length == 0 && pathRight.length == 0){
				tile = this.tiles[tile.row + 1][tile.col];
				path.push(tile);
				this.trackBlindPath(tile, path)
			} else {
				var foundPieceLeft = -1;
				var pieceLeft = null;
				var tempPathLeft = path.concat(pathLeft)
				for(var a = 0; a < tempPathLeft.length; a++){
					var ground = tempPathLeft[a];
					var piece = this.pieces[ground.row][ground.col];
					if(!piece) continue;
					foundPieceLeft = a;
					pieceLeft = piece;
					break;
				}

				var foundPieceRight = -1;
				var pieceRight = null;
				var tempPathRight = path.concat(pathRight);
				for(var a = 0; a < tempPathRight.length; a++){
					var ground = tempPathRight[a];
					var piece = this.pieces[ground.row][ground.col];
					if(!piece) continue;
					foundPieceRight = a;
					pieceRight = piece;
					break;
				}

				if(foundPieceRight >= 0 && foundPieceLeft >= 0){
					if(foundPieceLeft < foundPieceRight){
						this.resetPieceMap(tempPathLeft)
					} else if(foundPieceRight < foundPieceLeft){
						this.resetPieceMap(tempPathRight);
					} else {
						var pick = ig.game.rnd.pick([pieceRight, pieceLeft]);
						if(pick == pieceRight){
							this.resetPieceMap(tempPathRight);
						} else {
							this.resetPieceMap(tempPathLeft)
						}
					}
				} else if(foundPieceLeft >= 0 && foundPieceRight < 0){
					this.resetPieceMap(tempPathLeft)
				} else if(foundPieceRight >= 0 && foundPieceLeft < 0){
					this.resetPieceMap(tempPathRight)
				}

				// console.log(tile.row, tile.col, pathLeft, pathRight)
			}
		},

		checkUpperRow:function(tile, path){
			var originRow = false;
			if(tile.row == 0){
				originRow = true;
				return originRow;
			}

			var checking = true;
			var tempPath = [];
			while(checking == true){
				var upRow = tile.row - 1;
				var tileAbove = this.maps[upRow][tile.col];
				if(tileAbove == 0){
					checking = false
				} else {
					tempPath.push(this.tiles[upRow][tile.col])
					if(upRow == 0){
						originRow = true;
						checking = false;
						path = path.concat(tempPath)
					} else {
						tile = this.tiles[upRow][tile.col];
					}				
				}
			}

			return {origin:originRow, path:path};
		},

		resetPieceMap:function(path){
			var emptyExists = false;
			for(var a = 1; a < path.length; a++){
				var tile = path[a];
				var prevTile = path[a-1]
				var piece = this.pieces[tile.row][tile.col];
				var prevPiece = this.pieces[prevTile.row][prevTile.col]
				if(piece && !prevPiece){
					piece.setMapData(prevTile.row, prevTile.col)
					emptyExists = true;
				} else {
					if(!piece && tile.row == 0){
						this.createPiece(tile.row, tile.col);
						emptyExists = true;
					}
				}
			}

			if(emptyExists){
				this.resetPieceMap(path);
			}
		},

		refillRow:function(){
			var maxRow = this.maps.length - 1;
			var emptyTile = false;
			for(var a = 0; a < maxRow; a++){
				for(var b = 0; b < this.maps[a].length; b++){
					var tile = this.maps[a][b];
					if(tile == 0) continue;
					var piece = this.pieces[a][b]
					if(piece == null){
						if(a == 0){
							piece = this.createPiece(a, b);
							// piece._row = a;
							// piece._col = b;
							piece.tweenIn();
						} else {
							continue;
						}
					}

					var nextRow = a + 1;
					var nextPiece = this.pieces[nextRow][b];
					var nextTile = this.maps[nextRow][b];
					if(nextPiece == null && nextTile == 1){
						emptyTile = true;
						piece.setMapData(nextRow, b);
						this.emptyExists = true;
					}
				}
			}
		},

		moveAllPieces:function(isChecking){			
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b];
					if(!piece) continue;
					if(piece.alpha < 1) piece.tweenIn();
					if(piece.col == piece._col && piece.row == piece._row) continue;
					// if(piece.row != a || piece.col != b) return;
					piece.moveTo(isChecking);	
					// piece._row = piece.row;
					// piece._col = piece.col;
				}
			}
		},

		moveInstanly:function(isChecking){
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b];
					if(!piece || piece.isBreak || piece.isMoving || piece.onGoing) continue;
					if(piece.col == piece._col && piece.row == piece._row) continue;
					var tile = this.tiles[piece.row][piece.col];
					var toX = tile.x;
					var toY = tile.y;
					if(toX == 0) toX += 0.05;
					if(toY == 0) toY += 0.05;
					piece.x = toX;
					piece.y = toY;
					piece._row = piece.row;
					piece._col = piece.col;
					piece.onGoing = false;
					piece.isBreak = false;
				}
			}
		},

		createPiece:function(row, col, powerUpId, pieceId){
			var originTile = this.tiles[row][col];
			var x = originTile.x;
			var y = originTile.y - (originTile.height * 0.75);
			var posPowerUp = ig.game.rnd.realInRange(0, 100);
			if(powerUpId == undefined){
				powerUpId = 0;
			}

			var className = EntityPiece;
			var id = pieceId ? pieceId : ig.game.rnd.pick(curState().pieceTypes)

			if(powerUpId > 0){
				className = EntityPowerUp
			} else {
				if(posPowerUp > 95 && !curState().gList.isCompleted && curState().pageReady){
					var stage = ig.GameData.stage;
					var unlockStage = ig.GameData.unlockPowerUp;
					var rndPowerUp = ig.game.rnd.realInRange(0, 100);
					if(rndPowerUp <= 80 && stage >= unlockStage[0]){
						powerUpId = ig.game.rnd.integerInRange(1, 3);
					} else if(rndPowerUp > 80 && stage >= unlockStage[1]){
						powerUpId = 4;
					} else if(rndPowerUp > 80 && stage >= unlockStage[2]){
						powerUpId = ig.game.rnd.pick([4, 5]);
					}

					if(powerUpId > 0){
						className = EntityPowerUp
					}
					// powerUpId = 5;
					// console.log('powerUpId ' + powerUpId, 'row ' + row, 'col ' + col)
				}
			}

			// var piece = ig.CallAsset.addFrame(x, y, frameName, {pieceId:id, powerUpId:powerUpId}, className);
			var piece = ig.game.spawnEntity(className, x, y, {pieceId:id, powerUpId:powerUpId})
			piece.anchor.setTo(0.5);
			piece.row = row;
			piece.col = col;
			this.gPieces.add(piece);;

			var rndSpark = ig.game.rnd.realInRange(1, 100);
			var max = 30;
			if(ig.GameData.stage <= 5) max = 10
			if(rndSpark <= max){
				piece.createSparkling();
			}

			this.pieces[row][col] = piece;
			return piece;
		},

		checkAllMovement:function(){
			this.countCheck++;
			var isMoving = false;
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b];
					if(!piece) continue;
					if(piece.isMoving || piece.isBreak || piece.isIn) {
						isMoving = true;
						// console.log('col:' + piece.col, 'row:' + piece.row)
					}
				}
			}

			if(this.gEffect.children.length > 0){
				isMoving = true;
			}

			return isMoving;
		},

		checkAfterMoving:function(){
			var allSame = true;
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b]
					if(!piece || !piece.exists || piece.isBreak) continue;
					if(piece.row == piece._row && piece.col == piece._col) continue;
					allSame = false;
					piece._row = piece.row;
					piece._col = piece.col;
					if(piece.isChecking){
						piece.checkMatchAround();
					} else{
						piece.checkTilesCol = [];
						piece.checkTilesRow = [];
					}

					piece.checkPiecesAround();
					
					piece.checkTilesCol = [];
					piece.checkTilesRow = [];
				}
			}

			this.isDestroyAll = false;
		},

		checkPossibleMove:function(){
			// console.log('checkPossibleMove')
			var posExists = false;
			var matches = [];
			var countPieces = [];
			var temps = [];
			for(var a = 0; a < curState().pieceTypes.length; a++){
				countPieces.push(0)
			}

			var isEnough = false;
			checkRow :
			for(var a = 0; a < this.maps.length; a++){
				checkCol :
				for(var b = 0; b < this.maps[a].length; b++){
					var matches = [];
					var map = this.maps[a][b];
					var piece = this.pieces[a][b];
					if(map == 0 || !piece) continue;
					temps.push(piece);

					if(piece.powerUpId > 3){
						if(curState().pageReady){
							posExists = true;
							matches = [];
							break checkRow;
						}
					}

					var prevRow = null;
					if(a - 1 >= 0 && this.pieces[a-1][b]){
						prevRow = this.pieces[a-1][b];
						matches = [piece, prevRow]
						posExists = this.checkPoss(piece, prevRow)
					}

					if(!posExists){
						var nextRow = null;
						if(a + 1 < this.pieces.length && this.pieces[a+1][b]){
							nextRow = this.pieces[a+1][b]
							matches = [piece, nextRow]
							posExists = this.checkPoss(piece, nextRow)
						}
					}

					if(!posExists){
						var prevCol = null;
						if(b - 1 >= 0 && this.pieces[a][b-1]){
							prevCol = this.pieces[a][b-1]
							matches = [piece, prevCol]
							posExists = this.checkPoss(piece, prevCol)
						} 
					}

					if(!posExists){
						var nextCol = null;
						if(b + 1 < this.pieces[a].length && this.pieces[a][b+1]){
							nextCol = this.pieces[a][b+1]
							matches = [piece, nextCol]
							posExists = this.checkPoss(piece, nextCol)
						}
					}

					var idPiece = curState().pieceTypes.indexOf(piece.pieceId)
					countPieces[idPiece] += 1;
					if(countPieces[idPiece] >= 3){
						isEnough = true;
					}

					if(posExists){						
						break checkRow;
					}
				}
			}

			if(!posExists && curState().gList.isCompleted) posExists = true;

			if(!posExists){
				curState().matches = [];
				if(!isEnough){
					var pickPiece = ig.game.rnd.pick(temps)
					this.replacePiece(pickPiece)
				}

				this.reshuffle();
			} else {
				curState().matches = matches
				if(curState().pageReady){
					this.moveAllPieces(false)
				} else {
					if(!this.checkAfterShuffle()){
						this.moveInstanly(false);
					} else {
						this.reshuffle();
					}
				}
			}
			// console.log(posExists)
		},

		checkPoss:function(piece1, piece2){
			var posExists = false;
			if(!piece1 || !piece2) return posExists;
			var tempRow1 = piece1.row;
			var tempCol1 = piece1.col;
			var tempRow2 = piece2.row;
			var tempCol2 = piece2.col;

			piece1.row = tempRow2;
			piece1.col = tempCol2;
			piece2.row = tempRow1;
			piece2.col = tempCol1;
			piece1.checkMatchAround();
			piece2.checkMatchAround();
			if(piece1.checkTilesRow.length >= 3 || piece1.checkTilesCol.length >= 3 ||
				piece2.checkTilesRow.length >= 3 || piece2.checkTilesCol.length >= 3){
				if(piece1.pieceId != piece2.pieceId) {
					posExists = true;
				}
			} 

			if(piece1.powerUpId > 0 && piece2.powerUpId > 0){
				posExists = true;
			}

			piece1.row = tempRow1;
			piece1.col = tempCol1;
			piece2.row = tempRow2;
			piece2.col = tempCol2;
			// piece1.checkTilesCol = [];
			// piece1.checkTilesRow = [];
			// piece2.checkTilesCol = [];
			// piece2.checkTilesRow = [];

			return posExists;
		},

		replacePiece:function(pickPiece, powerId, pieceId){
			if(!pickPiece) return;
			if(!powerId || powerId <= 0){
				powerId = ig.game.rnd.pick([4, 5])
			}

			var tile = this.tiles[pickPiece.row][pickPiece.col];
			var piece = this.createPiece(pickPiece.row, pickPiece.col, powerId, pieceId);
			piece._row = pickPiece.row;
			piece._col = pickPiece.col;
			piece.y = tile.y
			if(tile.y == 0) piece.y += 0.01
			piece.alpha = 1
			piece.inputEnabled = true;
			
			pickPiece.kill();			
		},

		reshuffle:function(){
			var tempPieces = [];
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b]
					if(!piece) continue;
					tempPieces.push(piece)					
				}
			}

			this.pieces = [];
			for(var a = 0; a < this.maps.length; a++){
				this.pieces[a] = [];
				for(var b = 0; b < this.maps[a].length; b++){
					var map = this.maps[a][b];
					if(map == 0) {
						this.pieces[a][b] = null;
						continue;
					}

					var temp = null;
					while(!temp){
						var rndId = ig.game.rnd.integerInRange(0, tempPieces.length - 1);
						temp = tempPieces[rndId];
						tempPieces.splice(rndId, 1);
					}

					temp.row = a;
					temp.col = b;
					// temp.visible = false;
					this.pieces[a][b] = temp;
				}
			}

			if(this.checkAfterShuffle()){
				this.reshuffle();
			} else {
				this.checkPossibleMove();
			}
		},

		checkAfterShuffle:function(){
			var reshuffle = false;
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b];
					if(!piece || piece.isBreak) continue;
					piece.checkMatchAround();
					if(piece.checkTilesCol.length >= 3 || piece.checkTilesRow.length >= 3){
						reshuffle = true;
					}

					piece.checkTilesCol = [];
					piece.checkTilesRow = [];
				}
			}

			return reshuffle;
		},

		update:function(){
			this.parent();
			if(!this.checkAllMovement() && !this.onGoing && curState().pageReady){
				if(curState().checkOnGoing){
					if(!this.isCheckingBoard){
						this.isCheckingBoard = true;
						this.checkBoard();
						this.countTry = 0;
					}
				} else {
					if(this.isCheckingBoard){
						// this.checkAfterMoving();
						this.isCheckingBoard = false;
					} else {
						if(curState().gameOver){
							curState().gameEnd();
						} else {
							this.checkPossibleMove();
						}
					}
					
					this.checkAfterMoving();
					// this.setupAllPieces();
				}

				if(this.countCheck > 0){
					this.countCheck = 0
				}
			}
		},
	})
})