ig.module('game.entities.objects.canvas-itemlist')
.requires(
	'game.entities.addon.manual-draw-entity'
	,'plugins.addon.custom-canvas'
)
.defines(function(){
	EntityCanvasItemlist = EntityManualDrawEntity.extend({
		init:function(x, y, settings){
			this.parent(x, y, settings);

			this.image = new ig.CanvasItemList()
			this.setShape(this.image.width, this.image.height)
		},

		drawShape:function(){
			this.image.draw(0, 0)
		}
	})

	ig.CanvasItemList = ig.CustomCanvas.extend({
		itemsPos : [],
		init:function(){
			this.itemBoxData = ig.CallAsset.searchSpriteData('game/woodplate')
			this.gameImg = ig.Image.cache[imgCache['game'].path.img]
			this.pieceTypes = curState().itemLists;

			this.parent('item-list', this.itemBoxData.frame.w, this.itemBoxData.frame.h, {renewCanvas:true})
		},

		drawImageCanvas:function(context){
			context.save()
			context.clearRect(0, 0, this.width, this.height)

			var woodPlateData = ig.CallAsset.searchSpriteData('game/woodplate')
			width = woodPlateData.frame.w;
			height = woodPlateData.frame.h;
			sourceX = woodPlateData.frame.x;
			sourceY = woodPlateData.frame.y;
			x = 0;
			y = 0;
			var itemBox = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			context.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			var innerBoxData = ig.CallAsset.searchSpriteData('game/woodplate-box')
			width = innerBoxData.frame.w;
			height = innerBoxData.frame.h;
			sourceX = innerBoxData.frame.x;
			sourceY = innerBoxData.frame.y;
			x = itemBox.x + itemBox.width - (width * 1.02);
			y = itemBox.y + (itemBox.height * 0.5) - (height * 0.5) //- 4;

			var innerBox = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			context.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			var targetFontSize = 46
			var style = targetFontSize + 'px ' + fonts.font1;

			x = itemBox.x + 35;
			y = itemBox.y + (itemBox.height * 0.5) + (targetFontSize * 0.3)

			context.fillStyle = 'white';
			context.textBaseline = 'alphabetic';
			context.font = style;
			context.textAlign = 'left';

			context.fillText(_STRINGS['Game']['target'], x, y);

			var tileData = ig.CallAsset.searchSpriteData('game/tile')
			// console.log(this.pieceTypes.length)
			for(var a = 0; a < this.pieceTypes.length; a++){
				var gemData = ig.CallAsset.searchSpriteData('game/gem' + this.pieceTypes[a])

				sourceX = gemData.frame.x;
				sourceY = gemData.frame.y;
				width = gemData.frame.w
				height = gemData.frame.h;

				var iconScale = 0.5
				var scaledSize = {x:gemData.frame.w * iconScale, y:gemData.frame.h * iconScale}
				var blockSize = innerBox.width / 5.5;
				var maxItem = 5
				var totBlockWidth = blockSize * maxItem
				x = innerBox.x + ((innerBox.width - totBlockWidth) * 0.5) + (blockSize * 0.5) + (blockSize * a);
				y = innerBox.y + (innerBox.height * 0.5);


				context.save();

				context.translate(
					ig.system.getDrawPos(x),
					ig.system.getDrawPos(y)
				);

				context.scale(iconScale, iconScale);

				var drawX = -(width/2)
				var drawY = -(height/2)
				context.drawImage(this.gameImg.data, sourceX, sourceY, width, height, drawX, drawY, width, height)

				context.restore();

				var itemX = x - (itemBox.width * 0.5)
				var itemY = y - (itemBox.height * 0.5)
				this.itemsPos[a] = {x:itemX, y:itemY, scale:iconScale}
			}

			context.restore()
		},
	})
})