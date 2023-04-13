ig.module('game.entities.addon.manual-draw-entity')
.requires(
	'game.entities.addon.custom-entity'
	,'plugins.addon.add-signal'
)
.defines(function(){
	EntityManualDrawEntity = EntityCustomEntity.extend({
		type : ig.Entity.TYPE.A,
		init:function(x, y, settings){
			this.x = x;
			this.y = y;

			this.onClick = new ig.AddSignal(this);
			this.onRelease = new ig.AddSignal(this);

			this.parent(x, y, settings)
		},

		setShape:function(x, y){
			//set your shape here especially width and height
			this.width = x;
			this.height = y;
			this.size.x = this.width;
			this.size.y = this.height;
		},
		
		addChild:function(child){
			child.groupParent = this;
			this.children.push(child);
			ig.game.checkZIndexGroups();
			if(child.setProperty) child.setProperty();
		},

		removeChild:function(child){
			var idx = this.children.indexOf(child);
			this.children.splice(idx, 1);
			child.zIndex = -1;
			child.groupParent = null;

			ig.game.checkZIndexGroups();
		},

		setScale:function(x, y){
			this.scale.setTo(x, y);
			this.lastScale.setTo(x, y);
			this._scale.setTo(Math.abs(x), Math.abs(y));
		},

		getBounds:function(){			
			var posX = this.pos.x;
			var posY = this.pos.y;
			var sizeX = this.size.x;
			var sizeY = this.size.y;

			var bound = ig.game.geom.rectangle(posX, posY, sizeX, sizeY)
			var minX = bound.x;
			var maxX = bound.right;
			var minY = bound.y;
			var maxY = bound.bottom;

			var bound = this.parent(minX, maxX, minY, maxY)
			return bound;
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

		update:function(){
			this.updateOtherEntities()
			
			if(!this.exists) return;
			if(this.zIndex < 0) return;
			
			this.setProperty();
			this.sorting();
			this.updateChildren();

			// this.animSheet.update();

			if(this.isClicked){
				if(!ig.input.state('click')){
					this.released();
				}
			}
		},

		draw:function(){	//modif
			this.drawOtherEntities()
			
			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}

			if(!this.visible) return;
			if(!Math.floor(this.size.x) || !Math.floor(this.size.y)) return;

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}

			var parentPos = this.groupParent ? ig.game.parentPos(this.groupParent) : {x:0, y:0};
			var parentX = parentPos.x;
			var parentY = parentPos.y;
			var targetX = parentX + this.x - screenX;
			var targetY = parentY + this.y - screenY;

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(targetX, targetY, ig.game.anchorType)
				targetX = anchorPos.x;
				targetY = anchorPos.y;			
			}

			var flipX = 1;
			var flipY = 1;
			if(this.scale.x < 0) flipX = -1;
			if(this.scale.y < 0) flipY = -1;

			var context = ig.system.context;
			context.save();

			if( this.alpha != 1) {
				ig.system.context.globalAlpha *= this.alpha;
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

			var sizeX = this.width;
			var sizeY = this.height;
			var imgX = (sizeX * this.anchor.x);
			var imgY = (sizeY * this.anchor.y);
			context.save()
			context.translate(-imgX, -imgY)
			this.drawShape()
			context.restore()

			context.translate(
				ig.system.getDrawPos(-targetX),
				ig.system.getDrawPos(-targetY)
			);

			this.drawChildren();

			if(flipX < 0 || flipY < 0){
				context.restore();
			}

			context.restore();
		},

		drawShape:function(){
			//custom draw
		},

		clicked:function(){
			// console.log('click')
			if(this.isClicked) return;
			this.isClicked = true;		
			this.onClick.dispatch(this);	
		},

		released:function(){
			if(!this.isClicked) return;
			this.isClicked = false;
			this.onRelease.dispatch(this);
		},
	});
})