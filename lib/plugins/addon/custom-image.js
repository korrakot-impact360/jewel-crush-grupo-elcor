ig.module('plugins.addon.custom-image')
.defines(function(){
	ig.CustomImage = ig.Class.extend({	
		x:0, 
		y:0,

		children : [],
		groupParent : null,
		visible : true,

		canvasPos : {x:0,y:0},

		setPosition:function(x, y){
			this.x = x;
			this.y = y;
		},

		pos : {
			x : 0,
			y : 0,
			setTo:function(x, y){
				this.x = x;
				this.y = y;
			}
		},

		size : {
			x : 0,
			y : 0,
		},

		anchor : {
			x:0, 
			y:0,

			setTo:function(x, y){
				this.x = x;

				if(y == 0){
					this.y = y;
				} else {
					this.y = y ? y : this.x;
				}
			}
		},

		scale : {
			x:1,
			y:1,
			setTo:function(x, y){
				this.x = x;

				if(y == 0){
					this.y = y;
				} else {
					this.y = y ? y : this.x;
				}
			}
		},

		_scale : {
			x : 1,
			y : 1,
			setTo:function(x, y){
				this.x = x * ig.system.scale;

				if(y == 0){
					this.y = y;
				} else {
					this.y = y ? y * ig.system.scale : this.x;
				}
			},
		},
		
		lastScale : {
			x:0, 
			y:0,
			setTo:function(x, y){
				this.x = x;

				if(y == 0){
					this.y = 0;
				} else {
					this.y = y ? y : this.x;
				}
			}
		},

		inputEnabled : false,
		frameName : '',

		alpha : 1,
		currentPlay : 'idle',
		angle : 0,
		_angle : 0,
		rotation : 0,
		_rotation:0,
		exists : true,
		alive : true,
		_alive : true,
		data:null,
		image:null,
		loaded:false,
		width:0,
		height:0,

		init:function( path ){
			// this.parent(path);
			this.path = path;
			var image = ig.Image.cache[path];
			if(image){
				this.image = image;
				this.loaded = true;
			}
		},

		ghostMode:function(){
			this._alive = false;
			this.ghosting();
		},

		ghosting:function(){
			this.alive = false
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				child.ghosting()
			}
		},

		revive:function(){
			this.alive = true;
			this._alive = true;
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(child._alive){
					child.revive()
				}
			}
		},

		sorting:function(){
			var tempChilds = [];
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(!child || !child.exists) continue;
				tempChilds.push(child);
			}

			this.children = [];
			for(var a = 0; a < tempChilds.length; a++){
				this.children.push(tempChilds[a]);
			}
		},

		update:function(){
			this.sorting();
		},
		
		draw: function( targetX, targetY, sourceX, sourceY, width, height) {
			if( !this.loaded ) { return; }
			if(!this.visible) return;
			
			var scale = ig.system.scale;
			sourceX = sourceX ? sourceX : 0;
			sourceY = sourceY ? sourceY : 0;
			width = (width ? width : this.width);
			height = (height ? height : this.height);

			var drawX = 0;
			var drawY = 0;
			var sourceW = width;
			var sourceH = height;
			var drawW = width;
			var drawH = height

			if(this.curFrameData){
				if(this.curFrameData.trimmed){
					drawX = this.curFrameData.spriteSourceSize.x;
					drawY = this.curFrameData.spriteSourceSize.y
				}

				drawW = this.curFrameData.frame.w;
				drawH = this.curFrameData.frame.h;
				var oriDrawW = drawX + drawW
				var oriDrawH = drawY + drawH

				var diffW = 0;
				var diffH = 0
				if(width < oriDrawW){
					diffW = oriDrawW - width;
				}

				if(height < oriDrawH){
					diffH = oriDrawH - height;
				}

				sourceW = drawW - diffW;
				sourceH = drawH - diffH;

				if(sourceW <= 0 || sourceH <= 0) return;
			}

			targetX += drawX;
			targetY += drawY;

			ig.system.context.save();
			
			this.image.draw(targetX, targetY, sourceX, sourceY, sourceW, sourceH)

			ig.system.context.restore();
			
			ig.Image.drawCount++;
		},
	});
});