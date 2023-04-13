ig.module('game.entities.addon.custom-entity')
.requires('impact.entity')
.defines(function(){
	EntityPos = ig.Class.extend({
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

	EntityCustomEntity = ig.Entity.extend({
		name : "Entity",
		exists : true,
		alive : true,
		_alive : true,
		visible : true,
		_visible : true,
		zIndex : -1,
		isResponsive:true,

		x:0, 
		y:0,

		canvasPos : {x:0,y:0},
		
		setPosition:function(x, y){
			this.x = x ? x : this.x;
			this.y = y ? y : this.x;
		},

		children : [],
		groupParent : null,

		anchor : {
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

		scale : {
			x:1,
			y:1,

			setTo:function(x, y){
				this.x = x;

				if(y == 0){
					this.y = 0;
				} else {
					this.y = y ? y : this.x;
				}
			}
		},

		_scale : {
			x : 1,
			y : 1,
			setTo:function(x, y){
				this.x = Math.abs(x) * ig.system.scale;
				if(y == 0){
					this.y = 0;
				} else {
					this.y = y ? Math.abs(y) * ig.system.scale : this.x;
				}
			}
		},

		inputEnabled : false,
		frameName : '',

		alpha : 1,
		currentPlay : 'idle',

		width : 0,
		height : 0,

		angle : 0,
		_angle : 0,
		rotation : 0,
		_rotation : 0,

		isClicked : false,
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

		gravityFactor : 0,
		forseenVisible:false,
		isCameraLock:false,

		useCustomEntity:true,
		
		init:function(x, y, settings){
			this.parent(x, y, settings);
			this.position = new EntityPos(this);
		},

		setProperty:function(){

		},

		setRotation:function(rad){
			this._rotation = rad;
			var radToDeg = (this.rotation).toDeg();
			this.angle = radToDeg;
		},

		setAngle:function(angle){
			this._angle = angle;
			var degToRad = (this.angle).toRad();
			this.rotation = degToRad;
		},

		getBounds:function(minX, maxX, minY, maxY){			
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(!child || !child.exists) continue;
				// debugger;
				if(!child.getBounds) continue;
				var childBound = child.getBounds();

				if(minX == null){
					minX = childBound.x;
				} else {
					if(childBound.x < minX){
						minX = childBound.x;
					}
				}

				if(maxX == null){
					maxX = childBound.right;
				} else {
					if(childBound.right > maxX){
						maxX = childBound.right;
					}
				}

				if(minY == null){
					minY = childBound.y;
				} else {
					if(childBound.y < minY){
						minY = childBound.y;
					}
				}

				if(maxY == null){
					maxY = childBound.bottom;
				} else {
					if(childBound.bottom > maxY){
						maxY = childBound.bottom;
					}
				}
			}
			
			var groupWidth = maxX - minX;
			var groupHeight = maxY - minY;

			var bound = ig.game.geom.rectangle(minX, minY, groupWidth, groupHeight);
			return bound;
			// return {x:posX, y:posY, width:sizeX, height:sizeY, right:boundRight, bottom:boundBottom}; 
		},

		toLocal:function(x, y){
			var toX = x - this.pos.x;
			var toY = y - this.pos.y;
			return new Vector2(toX, toY)
		},

		toGlobal:function(x, y){
			var globalPos = ig.World.parentPos(this, x, y);
			return globalPos;
		},

		updateChildren:function(){
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(!child || !child.exists || !child.alive) continue;
				if(child.update) child.update();
			}

			if(this.visible != this._visible){
				this._visible = this.visible;
			}
		},

		drawChildren:function(){
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				if(!child || !child.exists || !child.alive) continue;
				if(child.draw) child.draw();
			}
		},

		updateOtherEntities:function(){
			if(!this instanceof ig.Entity) return;
			var zIndex = ig.game.entities.indexOf(this);
			for(var a = 0; a < zIndex; a++){
				var ent = ig.game.entities[a];
				var checkIdx = ig.game.checkedOtherEntities.indexOf(ent)
				if(!ent.useCustomEntity && checkIdx < 0){
					ent.update()
					ig.game.checkedOtherEntities.push(ent)
				}
			}
		},

		drawOtherEntities:function(){
			if(!this instanceof ig.Entity) return;
			var context = ig.system.context;
			context.save()
			context.setTransform(1, 0, 0, 1, 0, 0);

			var zIndex = ig.game.entities.indexOf(this);
			for(var a = 0; a < zIndex; a++){
				var ent = ig.game.entities[a];
				var checkIdx = ig.game.drawedOtherEntities.indexOf(ent)
				if(!ent.useCustomEntity && checkIdx < 0){
					ent.draw()
					ig.game.drawedOtherEntities.push(ent)
				}
			}

			context.restore()
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

		kill:function(){
			this.exists = false;
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				child.kill();
			}

			ig.game.checkZIndexGroups();
			
			this.clearContext();
			
			this.parent();
		},

		clearContext:function(){
			var context = ig.system.context;
			context.save();
			context.clearRect(this.pos.x, this.pos.y, this.width, this.height);
			context.restore();
		},
	});
});