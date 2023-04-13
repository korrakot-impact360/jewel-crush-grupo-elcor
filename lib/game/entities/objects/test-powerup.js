ig.module('game.entities.objects.test-powerup')
.requires(
	'game.entities.objects.play-board'
	,'game.entities.objects.piece'
)
.defines(function(){
	EntityPiece.inject({
		setImage:function(){
			if(this.powerUpId > 3){
				var frameName = 'game/powerup' + this.powerUpId;
			} else if(this.powerUpId > 0 && this.powerUpId <= 3){
				var frameName = 'game/effects/line/gem' + this.pieceId + '-' + this.powerUpId
			} else {
				var pieceId = this.pieceId;
				if(this.pieceId <= 0) pieceId = 1;
				var frameName = 'game/gem' + (pieceId);
			}

			this.frameName = frameName
		},
	});

	EntityPlayBoard.inject({
		testPowerUp4:function(typeData){	//same color
			var rowFilled = [];
			var colFilled = [];
			for(var a = 0; a < this.pieces.length; a++){
				for(var b = 0; b < this.pieces[a].length; b++){
					var piece = this.pieces[a][b];
					var tile = this.tiles[a][b];
					if(!tile) continue;
					if(isNaN(rowFilled[b])) rowFilled[b] = 0;
					if(isNaN(colFilled[a])) colFilled[a] = 0;

					rowFilled[b]++;
					colFilled[a]++;
				}
			}

			var changeData = null;
			if(typeData.toChange == 'row'){	//test row
				for(var a = 0; a < rowFilled.length; a++){
					if(typeData.fromSide == 'left' && a == 0) continue;
					if(typeData.fromSide == 'right' && a == this.maps[0].length - 1) continue;
					var countData = rowFilled[a];
					if(countData == this.maps.length){
						for(var r = 0; r < 5; r++){
							var prevCol = a - 1;
							var nextCol = a + 1;
							if(prevCol >= 0){
								var tile = this.tiles[r][prevCol]
								if(tile && typeData.fromSide == 'left'){
									changeData = {}
									changeData.toSlide = {row:r, col:prevCol};
									changeData.toChange = {row:null, col:a}
									break;
								}
							}

							if(nextCol >= 0){
								var tile = this.tiles[r][nextCol];
								if(tile && typeData.fromSide == 'right'){
									changeData = {}
									changeData.toSlide = {row:r, col:prevCol};
									changeData.toChange = {row:null, col:a}
									break;	
								}
							}
						}
					}
				}
			} else if(typeData.toChange == 'col') {
				for(var r = 0; r < colFilled.length; r++){
					if(typeData.fromSide == 'up' && r == 0) continue;
					if(typeData.fromSide == 'down' && r == this.maps.length - 1) continue;

					var countData = colFilled[r];
					if(countData == this.maps[r].length){
						for(var c = 0; c < 5; c++){
							var prevRow = r - 1;
							var nextRow = r + 1;

							if(prevRow >= 0){
								var tile = this.tiles[prevRow][c];
								if(tile && typeData.fromSide == 'up'){
									changeData = {};
									changeData.toSlide = {row:prevRow, col:c};
									changeData.toChange = {row:r, col:null}
									break;
								}
							}

							if(nextRow >= 0){
								var tile = this.tiles[nextRow][c]
								if(tile && typeData.fromSide == 'down'){
									changeData = {};
									changeData.toSlide = {row:prevRow, col:c};
									changeData.toChange = {row:r, col:null}
									break;
								}
							}
						}
					}
				}
			}

			if(changeData){
				var pieceId = curState().pieceTypes[0]
				var pieceId2 = curState().pieceTypes[1];

				if(typeData.toChange == 'row'){
					for(var r = 0; r < 5; r++){
						var piece = this.pieces[r][changeData.toChange.col];
						if(r == changeData.toSlide.row){
							piece.pieceId = pieceId2
						} else {
							piece.pieceId = pieceId;
						}

						piece.powerUpId = 0;
						piece.setImage();
					}
				} else if(typeData.toChange == 'col'){
					for(var c = 0; c < 5; c++){
						var piece = this.pieces[changeData.toChange.row][c];
						if(c == changeData.toSlide.col){
							piece.pieceId = pieceId2;
						} else {
							piece.pieceId = pieceId;
						}

						piece.powerUpId = 0;
						piece.setImage();	
					}
				}

				var slidePiece = this.pieces[changeData.toSlide.row][changeData.toSlide.col];
				slidePiece.pieceId = pieceId;
				slidePiece.powerUpId = 0;
				slidePiece.setImage();
			}
		}
	})
})