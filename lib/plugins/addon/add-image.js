ig.module('plugins.addon.add-image')
.requires(
	'plugins.addon.raw-image'
)
.defines(function(){
	ig.ImagePosition = ig.Class.extend({
		x : 0,
		y : 0,
		init:function(parentObj){
			this.parentObj = parentObj;
			this.x = parentObj.x;
			this.y = parentObj.y;
		},

		setTo:function(x, y){
			this.x = x ? x : this.x;
			this.y = y ? y : this.y;
			this.parentObj.x = this.x;
			this.parentObj.y = this.y;
		},
	});

	ig.AddImage = ig.RawImage.extend({
		name : "Image",
		sourceX : 0,
		sourceY : 0,
		spriteData : null,

		isReady : false,
		isResponsive:true,
		isCameraLock:false,

		init:function(x, y, path, settings){
			// debugger;
			this.parent(path, settings);

			this.x = x;
			this.y = y;

			this.position = new ig.ImagePosition(this);
			// this.resize(this.scale.x, this.scale.y)
		},

		addChild:function(child){
			child.groupParent = this;
			this.children.push(child);

			ig.game.checkZIndexGroups();
		},
		
		removeChild:function(child){
			var idx = this.children.indexOf(child);
			this.children.splice(idx, 1);
			child.zIndex = -1;
			child.groupParent = null;

			ig.game.checkZIndexGroups();
		},

		setProperty:function(){
			var sizeX = this.width;
			var sizeY = this.height;

			var normalX = -(sizeX * this.anchor.x);
			var normalY = -(sizeY * this.anchor.y);

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}

			var bound = ig.game.geom.rectangle(normalX, normalY, sizeX, sizeY);
			var points = [];
			points[0] = {x:bound.x, y:bound.y};
			points[1] = {x:bound.right,y:bound.y};
			points[2] = {x:bound.right,y:bound.bottom};
			points[3] = {x:bound.x,y:bound.bottom};

			for(var a = 0; a < points.length; a++){
				var pos = ig.World.parentPos(this, points[a].x, points[a].y);
				points[a] = {x:pos.x,y:pos.y};
			}

			var box = ig.World.getBounds(points)

			this.pos.x = box.x - screenX
			this.pos.y = box.y - screenY

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(this.pos.x, this.pos.y, ig.game.anchorType)
				this.pos.x = anchorPos.x;
				this.pos.y = anchorPos.y;
			}
			
			this.size.x = box.width;
			this.size.y = box.height;

			var _tempScaleX = this.lastScale.x;
			var _tempScaleY = this.lastScale.y;
			var curScaleX = this.scale.x;
			var curScaleY = this.scale.y;

			if(curScaleX != _tempScaleX || curScaleY != _tempScaleY){
				this.scale.x = parseFloat(this.scale.x.toFixed(3));
				this.scale.y = parseFloat(this.scale.y.toFixed(3));
				this.setScale(this.scale.x, this.scale.y)
			}

			if(this.position.x != this.x || this.position.y != this.y){
				this.position.setTo(this.x, this.y);
			}

			if(this.angle != this._angle){
				this.setAngle(this.angle);
			}

			if(this.rotation != this._rotation){
				this.setRotation(this.rotation);
			}
		},

		setAngle:function(angle){
			this._angle = angle;
			// var degToRad = ig.game.math.degToRad(this.angle);
			var degToRad = (this.angle).toRad();
			this.rotation = degToRad;
		},
		
		setRotation:function(rad){
			this._rotation = rad;
			var radToDeg = (this.rotation).toDeg();
			this.angle = radToDeg;
		},

		getBounds:function(){
			var posX = this.pos.x;
			var posY = this.pos.y;
			var sizeX = this.size.x;
			var sizeY = this.size.y;

			var bound = ig.game.geom.rectangle(posX, posY, sizeX, sizeY)
			return bound;
		},
		
		updateChildren:function(){
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(!child || !child.exists || !child.alive) continue;
				if(child.update) child.update();
			}
		},

		drawChildren:function(){
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(!child || !child.exists || !child.alive) continue;
				if(child.draw) child.draw();
			}
		},

		kill:function(){
			this.exists = false;
			
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				child.kill();
			}
			
			ig.game.checkZIndexGroups();
			
			var context = ig.system.context;
			context.save();
			context.clearRect(this.pos.x, this.pos.y, this.width, this.height);
			context.restore();
		},

		setScale:function(x, y){
			this.scale.setTo(x, y);
			this.lastScale.setTo(x, y);
			this._scale.setTo(Math.abs(x), Math.abs(y));
		},

		update:function(){
			this.parent();
			this.setProperty();
			this.updateChildren();
		},

		draw:function(){
			if(!this.exists || !this.visible || !this.alive) return;
			if(this.size.x < 1 || this.size.y < 1){
				this.checkProperties();
				this.setFrame();
				return;
			}
			
			if(this.drawSize.x < 1 || this.drawSize.y < 1) return;
			var parentPos = this.groupParent ? ig.game.parentPos(this.groupParent) : {x:0, y:0};
			var parentX = parentPos.x;
			var parentY = parentPos.y;

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}

			var targetX = parentX + this.x - screenX;
			var targetY = parentY + this.y - screenY;
			
			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(targetX, targetY, ig.game.anchorType)
				targetX = anchorPos.x;
				targetY = anchorPos.y;			
			}

			var sourceX = this.sourceX;
			var sourceY = this.sourceY;
			var width = this.drawSize.x;
			var height = this.drawSize.y;

			var flipX = 1;
			var flipY = 1;
			if(this.scale.x < 0) flipX = -1;
			if(this.scale.y < 0) flipY = -1;

			var radToAngle = (this.rotation).toDeg();

			var sizeX = this.width;
			var sizeY = this.height;
			var pivotX = (sizeX * this.anchor.x);
			var pivotY = (sizeY * this.anchor.y);

			var context = ig.system.context;
			context.save();

			if( this.alpha != 1) {
				context.globalAlpha *= this.alpha;
			}
		
			context.translate(
				ig.system.getDrawPos(targetX),
				ig.system.getDrawPos(targetY)
			);

			context.rotate(this.rotation);
			context.scale(this._scale.x, this._scale.y);

			if(flipX < 0 || flipY < 0){
				context.save();
				context.scale(flipX, flipY);
			}

			context.translate(
				ig.system.getDrawPos(-targetX),
				ig.system.getDrawPos(-targetY)
			);

			context.translate(
				ig.system.getDrawPos(targetX - pivotX),
				ig.system.getDrawPos(targetY - pivotY)
			);

			this.parent(0, 0, sourceX, sourceY, width, height, false, false);

			context.translate(
				ig.system.getDrawPos(-targetX + pivotX),
				ig.system.getDrawPos(-targetY + pivotY)
			);

			this.drawChildren();
			
			if(flipX < 0 || flipY < 0){
				context.restore();
			}

			ig.system.context.restore();
		},
	});
});