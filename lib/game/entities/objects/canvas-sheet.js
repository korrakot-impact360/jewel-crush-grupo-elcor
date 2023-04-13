ig.module('game.entities.objects.canvas-sheet')
.requires(
	'game.entities.addon.manual-draw-entity',
	'plugins.addon.custom-canvas'
)
.defines(function(){	
	EntityCanvasSheet = EntityManualDrawEntity.extend({
		init: function(x, y, setting ) {
			this.parent(x, y, setting);

			// var x = curState().centerX;
			// var y = curState().gh * 0.55;
			this.canvasImg = new ig.ImageCanvas();

			this.setShape(this.canvasImg.width, this.canvasImg.height)
			this.anchor.setTo(0.5)
		},

		drawShape:function(){
			var context = ig.system.context;
			context.save();

			this.canvasImg.draw(0, 0)

			context.restore();
		}
	});

	ig.ImageCanvas = ig.CustomCanvas.extend({
		drawEle : null,
		exists : true,
		gameImg: new ig.Image('media/graphics/sprites/game.png'),
		init:function(x, y){
			this.tileRaw = ig.Image.cache[imgCache['game'].path.img]
			this.tileImgData = ig.CallAsset.searchSpriteData('game/tile')

			this.x = x ? x : 0;
			this.y = y ? y : 0;

			var mapData = ig.GameData.stageMaps[0]
			var width = this.tileImgData.frame.w * mapData[0].length;
			var height = this.tileImgData.frame.h * mapData.length;

			this.parent('gameBg', width, height)
		},

		drawImageCanvas:function(context){
			var drawCtx = context;
			var drawEle = context.canvas;
			var scale = ig.system.scale;
			var tileWidthScaled = Math.floor(drawEle.width * scale);
			var tileHeightScaled = Math.floor(drawEle.height * scale);

			// var drawCtx = ig.game.hiddenCanvases.draw.ctx;
			drawCtx.save();

			drawCtx.clearRect(0,0,drawEle.width,drawEle.height);

			var maps = ig.GameData.stageMaps[0];
			var mapId = parseInt(ig.GameData.stage / 5);
			if(mapId >= ig.GameData.stageMaps.length){
				mapId = ig.game.rnd.integerInRange(0, ig.GameData.stageMaps.length - 1); 
			}
			maps = ig.GameData.stageMaps[mapId];

			for(var a = 0; a < maps.length; a++){
				for(var b = 0; b < maps[a].length; b++){
					var data = maps[a][b];
					if(data == 1){
						var tile = this.tileImgData;
						var row = maps.length;
						var col = maps[a].length;

						var x = 0;
						var y = 0;
						var center = (col - 1) / 2;
						x = (tile.frame.w * b);

						center = (row - 1) / 2;
						y = (tile.frame.h * a);

						// console.log(this.x, this.y)

						drawCtx.drawImage( 
							this.tileRaw.data, tile.frame.x, tile.frame.y, tile.frame.w, tile.frame.h,
							ig.system.getDrawPos(x), 
							ig.system.getDrawPos(y),
							tile.frame.w, tile.frame.h
						);
					}
				}
			}
			
			drawCtx.restore();

			// console.log('draw bg')
		},
	})
})