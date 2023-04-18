ig.module('game.entities.objects.canvas-upbar')
.requires(
	// 'game.entities.addon.group', 
	'game.entities.addon.manual-draw-entity'
	,'plugins.addon.custom-canvas'
)
.defines(function(){
	CanvasUpbar = ig.CustomCanvas.extend({
		exists : true,
		pieceTypes : [],
		init:function(settings){
			this.gameImg = ig.Image.cache[imgCache['game'].path.img]
			this.headerData = ig.CallAsset.searchSpriteData('game/header')

			// var height = curState().centerY
			var height = this.headerData.frame.h;

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
			x = (headerImg.width) - width - 5;
			y = 5
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

			var scoreFontSize = 50
			var style = scoreFontSize + 'px ' + fonts.font1;

			drawCtx.fillStyle = 'white';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'center';
			x += (width * 0.5);
			y -= (scoreFontSize * 0.2) + 5

			drawCtx.fillText(_STRINGS['Game']['score'], x, y);

			var level = _t(_STRINGS['Game']['level'], ig.GameData.stage + 1)
			var levelFontSize = 70
			var style = levelFontSize + 'px ' + fonts.font1;
			drawCtx.fillStyle = 'white';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'center';
			x = headerImg.width * 0.17
			y = (headerImg.height * 0.5) + 36
			drawCtx.fillText(level, x, y);

			var moveFontSize = 40;
			var style = moveFontSize + 'px ' + fonts.font1;
			drawCtx.fillStyle = '#ffc328';
			drawCtx.textBaseline = 'alphabetic';
			drawCtx.font = style;
			drawCtx.textAlign = 'center';
			x = headerImg.width * 0.5;
			y = (headerImg.height * 0.4) + 16
			drawCtx.fillText(_STRINGS['Game']['move'], x, y);

			drawCtx.restore();
		},
	});

	EntityCanvasUpbar = EntityManualDrawEntity.extend({
		init:function(x,y,settings){
			this.parent(x, y, settings)

			this.image = new CanvasUpbar(settings);

			this.setShape(this.image.width, this.image.height)
			this.anchor.setTo(0.5, 0)
		},

		drawShape:function(){
			var context = ig.system.context;
			context.save();

			this.image.draw(0, 0)

			context.restore();
		},
	});
});