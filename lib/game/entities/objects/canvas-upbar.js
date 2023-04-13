ig.module('game.entities.objects.canvas-upbar')
.requires(
	'game.entities.addon.group', 
	'plugins.addon.custom-canvas'
)
.defines(function(){
	CanvasUpbar = ig.CustomCanvas.extend({
		exists : true,
		pieceTypes : [],
		init:function(settings){
			this.gameImg = ig.Image.cache[imgCache['game'].path.img]
			this.headerData = ig.CallAsset.searchSpriteData('game/header')

			var height = curState().centerY

			this.parent('upperBar', this.headerData.frame.w, height, settings)
		},

        drawImageCanvas:function(context){
			var drawCtx = context;
			var drawEle = context.canvas;
			var scale = ig.system.scale;
			var tileWidthScaled = Math.floor(drawEle.width * scale);
			var tileHeightScaled = Math.floor(drawEle.height * scale);

			drawCtx.save();

			drawCtx.clearRect(0,0,drawEle.width,drawEle.height);

			var x = 0;
			var y = 0;

			var width = this.headerData.frame.w;
			var height = this.headerData.frame.h;
			var sourceX = this.headerData.frame.x;
			var sourceY = this.headerData.frame.y;
			var headerImg = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			drawCtx.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			var btnBgData = ig.CallAsset.searchSpriteData('game/btn-bg')
			width = btnBgData.frame.w;
			height = btnBgData.frame.h;
			sourceX = btnBgData.frame.x;
			sourceY = btnBgData.frame.y;
			x = (headerImg.width * 0.5) + (curState().centerX - (width * 1.01));
			y = (height * 0.51) - (height * 0.5)
			var btnBg = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			drawCtx.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			var smallBoxData = ig.CallAsset.searchSpriteData('game/small-box')
			width = smallBoxData.frame.w;
			height = smallBoxData.frame.h;
			sourceX = smallBoxData.frame.x;
			sourceY = smallBoxData.frame.y;
			x = (headerImg.width * 0.5) + (headerImg.width * 0.33) - (width * 0.5)
			y = (headerImg.height * 0.5) - (height * 0.5)
			var smallBox = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			drawCtx.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			var style = 'bold 25px ' + fonts.font1;

			drawCtx.fillStyle = 'white';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'center';
			x += (width * 0.5);
			y += (height * 0.5) - (25)

			drawCtx.fillText(_STRINGS['Game']['score'], x, y);

			var level = _t(_STRINGS['Game']['level'], ig.GameData.stage + 1)
			var style = 'bold 35px ' + fonts.font1;
			drawCtx.fillStyle = 'white';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'center';
			x = headerImg.width * 0.17
			y = (headerImg.height * 0.5) + 18
			drawCtx.fillText(level, x, y);

			var style = 'normal 20px ' + fonts.font1;
			drawCtx.fillStyle = '#ffc328';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'center';
			x = headerImg.width * 0.5;
			y = (headerImg.height * 0.4) + 8
			drawCtx.fillText(_STRINGS['Game']['move'], x, y);

			var woodPlateData = ig.CallAsset.searchSpriteData('game/woodplate')
			width = woodPlateData.frame.w;
			height = woodPlateData.frame.h;
			sourceX = woodPlateData.frame.x;
			sourceY = woodPlateData.frame.y;
			x = curState().centerX - (width * 0.5);
			y = (curState().gh * 0.225) - (height * 0.5);
			var itemBox = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			drawCtx.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			var innerBoxData = ig.CallAsset.searchSpriteData('game/woodplate-box')
			width = innerBoxData.frame.w;
			height = innerBoxData.frame.h;
			sourceX = innerBoxData.frame.x;
			sourceY = innerBoxData.frame.y;
			x = itemBox.x + itemBox.width - (width * 1.02);
			y = itemBox.y + (itemBox.height * 0.5) - (height * 0.5) - 4;

			var innerBox = {x:x, y:y, width:width, height:height, sourceX:sourceX, sourceY:sourceY};

			drawCtx.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

			x = itemBox.x + (itemBox.width * 0.05);
			y = itemBox.y + (itemBox.height - 27)

			var style = 'normal 23px ' + fonts.font1;

			drawCtx.fillStyle = 'white';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'left';

			drawCtx.fillText(_STRINGS['Game']['target'], x, y);

			// console.log(this.pieceTypes.length)
			for(var a = 0; a < this.pieceTypes.length; a++){
				var gemData = ig.CallAsset.searchSpriteData('game/gem' + this.pieceTypes[a])

				var scaledSize = {x:gemData.frame.w * 0.5, y:gemData.frame.h * 0.5}
				x = innerBox.x + (innerBox.width * 0.5) - ((innerBox.width / 5.5) * 2) - (scaledSize.x * 0.5) + ((innerBox.width / 5.5) * a);
				y = innerBox.y + (innerBox.height * 0.5) - (scaledSize.y * 0.5);

				sourceX = gemData.frame.x;
				sourceY = gemData.frame.y;
				width = gemData.frame.w
				height = gemData.frame.h;

				drawCtx.save();

				drawCtx.translate(
					ig.system.getDrawPos(x),
					ig.system.getDrawPos(y)
				);

				drawCtx.scale(0.5, 0.5);

				drawCtx.translate(
					ig.system.getDrawPos(-x),
					ig.system.getDrawPos(-y)
				);

				drawCtx.drawImage(this.gameImg.data, sourceX, sourceY, width, height, x, y, width, height)

				drawCtx.restore();
			}

			drawCtx.restore();
		},
	});

	EntityCanvasUpbar = EntityGroup.extend({
		init:function(x,y,settings){
			this.parent(x, y, settings)

			this.image = new CanvasUpbar(settings);

			this.size.x = this.image.width;
			this.size.y = this.image.height

		},

		draw:function(){if(!this.exists) return;
			this.parent();

			var context = ig.system.context;
			context.save();

			this.image.draw(this.pos.x, this.pos.y)

			context.restore();
		},
	});
});