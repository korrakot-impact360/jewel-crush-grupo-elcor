ig.module('game.entities.controllers.gameplay-ctrl')
.requires(
	'game.entities.addon.page-controller'
	,'game.entities.objects.item-list'
	,'game.entities.objects.play-board'
	,'game.entities.objects.result'
	,'game.entities.objects.line-effects'
	,'game.entities.objects.samecolor-effect'

	,'game.entities.objects.canvas-sheet'
	,'game.entities.objects.canvas-upbar'
	
	//test
	,'game.entities.objects.test-powerup'
)
.defines(function(){
	EntityGameplayCtrl = EntityPageController.extend({
		init:function(x, y, settings){
			this.parent(x, y, settings);
			if(!ig.global.wm){
				this.create();
			}
		},

		create:function(){
			var bgmVol = ig.game.sessionData.bgmVol;
			ig.soundHandler.bgmPlayer.volume(bgmVol);

			var sfxVol = ig.game.sessionData.sfxVol;
			ig.soundHandler.sfxPlayer.volume(sfxVol);

			this.gInGame = ig.game.addGroup(0.001, 0.001);
			this.gInFront = ig.game.addGroup();

			this.gameOver = false;
			this.gamePaused = false;
			this.gameStart = true;

			var curStage = ig.GameData.stage;

			var mapId = parseInt(ig.GameData.stage / 5);
			if(mapId >= ig.GameData.stageMaps.length){
				mapId = ig.game.rnd.integerInRange(0, ig.GameData.stageMaps.length - 1); 
			}

			this.mapId = mapId

			this.pieceTypes =  [];
			var maxType = 5 + (parseInt(ig.GameData.stage/2));
			if(maxType > 6) maxType = 6
			for(var a = 0; a < maxType; a++){
				var id = null;
				while(!id){
					var temp = ig.game.rnd.integerInRange(2, 9);
					var check = this.pieceTypes.indexOf(temp);
					if(check < 0){
						id = temp;
					}
				}

				this.pieceTypes.push(id);
			}

			var pieceTypes = [];
			var max = 2 + ig.GameData.stage;
			if(max > this.pieceTypes.length) max = this.pieceTypes.length;
			if(max > 5) max = 5;
			for(var a = 0; a < max; a++){				
				var id = null;
				while(!id){
					var temp = ig.game.rnd.pick(this.pieceTypes)
					if(pieceTypes.indexOf(temp) < 0){
						id = temp;
					}
				}

				pieceTypes.push(id);
			}

			this.itemLists = pieceTypes

			this.plScore = 0;
			// this.moveLeft = ig.GameData.defaultMoves;
			this.moveLeft = ig.GameData.defaultMoves + (parseInt((curStage / 5) * 2) + 10)

			var moveId = parseInt(ig.GameData.stage / 5);
			var multiMove = this.moveLeft + (moveId * 5)
			// if(ig.GameData.stage < ig.GameData.stageMoves.length ){
				// this.moveLeft = ig.GameData.stageMoves[curStage];
			// }
			this.stageScore = ig.GameData.defaultScore + (curStage * (ig.GameData.defaultScore * 1.2));
			this.stageScore = parseInt(this.stageScore)

			this.pieceClicked = null;
			this.pieceHover = null;
			this.checkOnGoing = false;

			this.hintCD = 0;
			this.maxHint = 10;			
			this.matches = [];
			this.hintSign = null;

			this.handTutor = null;

			this.createGreyBg();

			this.bg = ig.CallAsset.addImage(this.centerX, this.centerY, 'bg-01');
			this.bg.anchor.setTo(0.5)
			this.gBG.add(this.bg)

			this.gHeader = ig.game.addGroup(this.centerX, 0);
			this.gInFront.add(this.gHeader);

			this.upHeader = ig.game.addGroup(0, 0, {pieceTypes:this.itemLists}, EntityCanvasUpbar);
			this.gHeader.add(this.upHeader)
			
			this.gList = ig.game.addGroup(0, this.gh * 0.2, {itemLists:this.itemLists}, EntityItemList);
			this.gHeader.add(this.gList);

			this.pauseG = ig.game.addGroup();
			this.gFront.add(this.pauseG);

			var btnBg = ig.CallAsset.searchSpriteData('game/btn-bg')
			this.pauseBtn = ig.CallAsset.addFrame(this.upHeader.x + (this.upHeader.width * 0.5) - (btnBg.frame.w * 0.5) - 5, this.upHeader.y + (btnBg.frame.h * 0.5) + 2, 'ingame/buttons/pause-btn', {}, EntityClickBtn);
			this.pauseBtn.onStartClick.add(this.startPause, this);
			this.pauseBtn.onClick.add(this.createPause, this);
			this.gHeader.add(this.pauseBtn)

			this.greyBg.alpha = 0

			var scoreBoxData = ig.CallAsset.searchSpriteData('game/small-box')
			this.showScore = ig.game.addText(this.upHeader.size.x * 0.33, (this.upHeader.size.y * 0.5) + 2, this.plScore + '', Math.floor(scoreBoxData.frame.h * 0.6), fonts.font1);
			this.showScore.anchor.setTo(0.5);
			this.gHeader.add(this.showScore)

			this.showMoves = ig.game.addText(0, this.upHeader.size.y * 0.7, this.moveLeft + '', 120, fonts.font1);
			this.showMoves.anchor.setTo(0.5);
			this.gHeader.add(this.showMoves)

			this.gBoard = ig.game.addGroup(this.centerX, this.gh * 0.55, {}, EntityPlayBoard);
			this.gBoard.scale.setTo(0.88)
			this.gInGame.add(this.gBoard);

			this.gStars = ig.game.addGroup(this.centerX, this.gh * 0.91);
			this.gInFront.add(this.gStars);

			this.starBarBg = ig.CallAsset.addFrameImage(0, 0, 'game/star-bar-bg');
			this.starBarBg.anchor.setTo(0.5);
			this.gStars.add(this.starBarBg)

			this.starBar = ig.CallAsset.addFrameImage(-1, -6, 'game/star-bar');
			this.starBar.anchor.setTo(0.5);
			this.gStars.add(this.starBar)

			this.stars = [];
			var border = [0.5, 0.75, 0.95];
			this.borderStars = border;
			var width = this.starBar.width;
			for(var a = 0; a < 3; a++){
				var star = ig.CallAsset.addFrameImage(0, this.starBarBg.y + (this.starBarBg.size.y * 0.5) - 10, 'game/star-tag-off');
				star.anchor.setTo(0.5, 1);
				star.inState = 'off';
				this.gStars.add(star);

				star.x = (this.starBar.x - (this.starBar.width * 0.5)) + (this.starBar.width * border[a]);
				this.stars.push(star);
			}

			this.resultGroup = ig.game.addGroup();
			this.gFront.add(this.resultGroup);

			this.gCont.add(this.gInGame);
			this.gCont.add(this.gInFront)

			this.pageReady = false;
			this.chain = 0; 

			if(this.showFps){
				this.showFps.x = 10;
				this.showFps.anchor.setTo(0);
			}

			this.updateOnOrientationChange()

			this.startGame();

			// this.gameEnd()
		},

		updateOnOrientationChange:function(){
			this.parent()
			
			var scaleX = ig.system.width / this.bg.width;
			var scaleY = ig.system.height / this.bg.height;
			var scale = Math.max(scaleX, scaleY)
			this.bg.scale.setTo(scale)

			var diffX = (ig.system.width - this.gw) / 2;
			var diffY = (ig.system.height - this.gh) / 2;

			this.gHeader.y = -diffY + 0.01
			this.gStars.y = (this.gh * 0.9) + diffY
		},

		startGame:function(){
			this.gBoard.checkPossibleMove()
			// this.gBoard.reshuffle();
			// this.timeEvent.add(0.1, this.checkTutor, this)
			// if(this.matches.length)
			this.checkTutor();
		},

		createPause:function(){
			this.gPause = ig.game.addGroup(this.centerX, this.centerY, {}, EntityOptions);
			this.gPause.pauseFunction();
			this.gPause.onResume.add(this.resumeGame, this);
			this.gPause.appear();
			this.pauseG.add(this.gPause);
		},

		checkTutor:function(){
			console.log('read tutor')
			this.tutorMatches = [];
			for(var a = 0; a < this.matches.length; a++){
				this.tutorMatches.push(this.matches[a])
			}

			var stage = ig.GameData.stage;
			var tutorPower = ig.GameData.unlockPowerUp;
			if(stage == 0){
				this.createHand();
				this.timeEvent.add(0.2, this.tweenHand, this)
				this.hintCD = this.maxHint;
			} else if(stage == tutorPower[0]){
				this.gBoard.checkPoss(this.matches[0], this.matches[1]);
				if(this.matches[0].checkTilesCol.length >= 3 || this.matches[0].checkTilesRow.length >= 3){
					var pickPiece = this.matches[0]
				} else {
					var pickPiece = this.matches[1]
				}
				var idx = this.matches.indexOf(pickPiece);
				var powerId = ig.game.rnd.integerInRange(1, 3);
				this.gBoard.replacePiece(pickPiece, powerId, pickPiece.pieceId)
				this.matches[idx] = this.gBoard.pieces[pickPiece.row][pickPiece.col]
				this.tutorMatches[idx] = this.gBoard.pieces[pickPiece.row][pickPiece.col]
				this.createHand();				
				this.timeEvent.add(0.2, this.tweenHand, this)
				this.createHint();
				// this.hintCD = this.maxHint;
			} else if(stage == tutorPower[1]){
				var pickId = 0
				var pickPiece = this.matches[pickId]
				var powerId = 4;	
				this.gBoard.replacePiece(pickPiece, powerId)
				this.matches[pickId] = this.gBoard.pieces[pickPiece.row][pickPiece.col];
				this.tutorMatches = this.matches

				this.createHint();
				this.createHand();	

				this.timeEvent.add(0.2, this.tweenHand, this)
			} else if(stage == tutorPower[2]){
				// var pickId = ig.game.rnd.pick([0,1]);
				var pickId = 0;
				var pickPiece = this.matches[pickId]
				var row = pickPiece.row;
				var col = pickPiece.col;			
				var powerId = 5;
				this.gBoard.replacePiece(pickPiece, powerId)

				this.tutorMatches[pickId] = this.gBoard.pieces[pickPiece.row][pickPiece.col]
				this.matches[pickId] = this.gBoard.pieces[pickPiece.row][pickPiece.col]

				this.createHand();

				this.timeEvent.add(0.2, function(){
					var tween = new ig.TweenDef(this.handTutor.scale)
					.to({x:1.1,y:1.1}, 1000)
					.yoyo(true)
					.repeat(-1)
					.start();
				}, this)
			} else if(stage == (tutorPower[2] + 1)){
				for(var a = 0; a < this.matches.length; a++){
					var piece = this.matches[a];
					this.gBoard.replacePiece(piece, 4);
					this.matches[a] = this.gBoard.pieces[piece.row][piece.col]
					this.tutorMatches[a] = this.gBoard.pieces[piece.row][piece.col]
				}

				this.createHand();				
				this.timeEvent.add(0.2, this.tweenHand, this)
				this.createHint();
				// this.hintCD = this.maxHint;
			} else if(stage == tutorPower[3]){
				for(var a = 0; a < this.matches.length; a++){
					var piece = this.matches[a];
					var powerUpId = ig.game.rnd.integerInRange(1, 3);
					var pieceId = piece.pieceId;
					this.gBoard.replacePiece(piece, powerUpId, pieceId)

					this.matches[a] = this.gBoard.pieces[piece.row][piece.col];
					this.tutorMatches[a] = this.matches[a];
				}

				this.createHand();
				this.timeEvent.add(0.2, this.tweenHand, this);
				// this.hintCD = this.maxHint;
				this.createHint();
			}
		},

		checkAfterTutor:function(){
			var stage = ig.GameData.stage;
			if(this.handTutor){
				this.handTutor.kill();
				this.handTutor = null;
			}

			if(this.hint){
				this.hint.kill();
				this.hint = null;
			}

			if(ig.GameData.trialMode){
				ig.GameData.trialMode = false;
			}
		},

		createHand:function(){
			var tile1 = this.tutorMatches[0];
			var tile2 = this.tutorMatches[1];
			if(tile1.x == 0) tile1.x += 0.001;
			if(tile1.y == 0) tile1.y += 0.001
			this.handTutor = ig.CallAsset.addFrame(tile1.x, tile1.y, 'game/finger');
			this.gBoard.gFrontBoard.add(this.handTutor)
		},

		tweenHand:function(){
			var tile1 = this.tutorMatches[0];
			var tile2 = this.tutorMatches[1];
			// if(!tile1 || !tile2) return;
			this.handTutor.x = tile1.x;
			this.handTutor.y = tile1.y;
			var toX = tile2.x;
			var toY = tile2.y;
			if(toX == 0) toX += 0.05;
			if(toY == 0) toY += 0.05;
			var delay = 0.5
			var tween = new ig.TweenDef(this.handTutor);
			tween.to({x:toX,y:toY}, 500)
			tween.delay(delay)
			tween.onComplete(function(){
				this.timeEvent.add(0.5, function(){
					if(this.handTutor){
						this.tweenHand();						
					}
				}, this);
			}.bind(this));
			tween.start();
		},

		createHint:function(){
			if(this.matches.length < 2) return;
			if(this.hint) return;
			var piece1 = this.matches[0];
			var piece2 = this.matches[1];
			if(piece1.row == piece2.row){
				var posX = (piece1.x + piece2.x) / 2;
				var posY = piece1.y;
				var angle = 0;
			} else {
				var posX = piece1.x;
				var posY = (piece1.y + piece2.y) / 2;
				var angle = 90
			}

			this.hint = ig.CallAsset.addFrame(posX, posY, 'game/hint1');
			this.hint.anchor.setTo(0.5);
			this.hint.angle = angle
			var frames = ig.GenerateFrameNames('game/hint', 1, 2, '', 1);
			this.hint.addAnim('hint', 0.2, frames, false);
			this.hint.playAnim('hint')
			this.gBoard.gPieces.add(this.hint);
		},

		startPause:function(){
			this.gamePaused = true;
			this.greyBg.visible = true;
		},

		resumeGame:function(){
			this.gamePaused = false;
			this.greyBg.visible = false;
			this.gPause.kill();
		},

		lastCall:function(){
			if(this.moveLeft <= 0){
				if(!this.gameOver){
					// this.gameOver = true;
					this.checkAllPowerUp();
					return;
				}
			}

			// this.gHeader.alpha = 0.1

			// console.log('chain ' + this.chain)
			var addChain = 30;
			var maxPerStep = 3;
			if(ig.GameData.stage < 5) {
				addChain = 10
				maxPerStep = 5;
			}
			this.chain += addChain;
			var extraBonus = this.moveLeft;
			if(extraBonus > maxPerStep) extraBonus = maxPerStep;

			var tempPieces = [];
			for(var a = 0; a < this.gBoard.pieces.length; a++){
				for(var b = 0; b < this.gBoard.pieces[a].length; b++){
					var piece = this.gBoard.pieces[a][b];
					if(!piece) continue;
					tempPieces.push(piece)
				}
			}

			var picked = [];
			var onCompletes = [];
			for(var a = 0; a < extraBonus; a++){
				var rndPiece = null;
				while(!rndPiece){
					var temp = ig.game.rnd.pick(tempPieces);
					if(temp.powerUpId == 0){
						var check = picked.indexOf(temp);
						if(check < 0){
							rndPiece = temp;
						}
					}
				}

				var onComplete = new ig.AddSignal(this.gBoard);
				onComplete.add(function(){
					var board = curState().gBoard;
					var powerId = ig.game.rnd.integerInRange(1,5);
					var pieceId = -1;
					if(powerId <= 3){
						pieceId = this.pieceId;
					}
					board.replacePiece(this, powerId, pieceId)
					var piece = curState().gBoard.pieces[this.row][this.col];
					piece.isBreak = true;
					curState().timeEvent.add(0.4, function(){
						var piece = curState().gBoard.pieces[this.row][this.col];
						if(!piece) return
						piece.onDestroy();
					}, this)
				}, rndPiece)
				picked.push(rndPiece);
				onCompletes.push(onComplete);
			}

			this.moveLeft -= extraBonus;
			var sourceBound = this.showMoves.getBounds();
			var playBoard = curState().gBoard
			var board = playBoard.gFrontBoard;
			var boardBound = board.getBounds();
			var boardPos = {
				x:board.pos.x,
				y:board.pos.y
			}
			var boardDist = ig.game.math.distance(boardPos.x, boardPos.y, sourceBound.centerX, sourceBound.centerY)
			var boardRad = ig.game.math.angleBetween(boardPos.x, boardPos.y, sourceBound.centerX, sourceBound.centerY)
			var localX = board.x + (Math.cos(boardRad) * (boardDist / playBoard.scale.x))
			var localY = board.y + (Math.sin(boardRad) * (boardDist / playBoard.scale.y))
			var localPos = new Vector2(localX, localY)
			var effect = ig.game.addGroup(localPos.x, localPos.y, {targets:picked,onCompletes:onCompletes,speed:8}, EntitySamecolorEffect);
			this.gBoard.gFrontBoard.add(effect)

			// this.lastCall();
			this.gamePaused = false;
		},

		checkAllPowerUp:function(){
			var exist = false;
			for(var a = 0; a < this.gBoard.pieces.length; a++){
				for(var b = 0; b < this.gBoard.pieces[a].length; b++){
					var piece = this.gBoard.pieces[a][b];
					if(!piece) continue;
					if(piece.powerUpId > 0){
						if(piece.powerUpId == 4){
							piece.pieceId = ig.game.rnd.pick(this.pieceTypes)
						}
						piece.onDestroy();
						exist = true;
					}
				}
			}

			if(!exist){
				this.gameOver = true;
			} else {
				this.gamePaused = false;
			}
		},

		gameEnd:function(){
			// if(this.gameOver) return;
			this.gameOver = true;

			if(!this.gResult){
				this.gResult = ig.game.addGroup(this.centerX, this.centerY, {}, EntityResult);
				this.resultGroup.add(this.gResult);

				this.gResult.tweenIn();
			}
		},

		update:function(){
            if(!this.isReady){
                this.isReady = true;
                if(this.curtainBg) this.curtainBg.visible = false;
                if(ig.game.transition) {
                	this.timeEvent.add(0.5, function(){
	                	ig.game.transition.open();
                	}, this)
                }
            }

            if(ig.game.transition.isClosed) {
	            this.timeEvent.update();
				this.starBar.drawSize.x = 0;
            	return;
            }

            this.parent();

			if(!ig.game.transition.isClosed && !this.pageReady){
				if(!this.gBoard.checkAllMovement()){
					this.pageReady = true;
					// this.startGame();
				}
			}

			this.showMoves.setText(this.moveLeft);

			var tempWidth = (this.plScore/this.stageScore) * this.starBar.width;
			if(tempWidth > this.starBar.width) tempWidth = this.starBar.width;
			this.starBar.drawSize.x = tempWidth;

			for(var a = 0; a < this.stars.length; a++){
				var star = this.stars[a];
				var border = this.borderStars[a] * this.stageScore;
				if(this.plScore >= border && star.inState == 'off'){
					star.frameName = 'game/star-tag-on';
					star.inState = 'on'
				}
			}

			this.showScore.setText(ig.game.writeThousands(this.plScore));
			var scoreBox = ig.CallAsset.searchSpriteData('game/small-box')
			var maxScoreW = scoreBox.frame.w * 0.85
			if(this.showScore.width >= maxScoreW){
				if(this.showScore.size.x >= maxScoreW){
					this.showScore.scale.setTo(maxScoreW / this.showScore.width);
				}
			} else {
				if(this.showScore.scale.x < 1){
					this.showScore.scale.setTo(1);
				}
			}

			if(!this.gameOver || !this.gamePaused){
				var countMS = ig.game.customTime.physicsElapsedMS * 0.001;
				this.hintCD += countMS;
				if(this.hintCD >= this.maxHint){
					this.hintCD = 0;
					this.createHint();
				}
			}

			// this.fsBtn.update();
		},

		draw:function(){
			this.parent();
			// this.fsBtn.draw();
		},
	})
})