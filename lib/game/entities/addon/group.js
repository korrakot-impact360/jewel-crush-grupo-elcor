ig.module('game.entities.addon.group')
.requires('game.entities.addon.custom-entity')

.defines(function(){
	EntityGroup = EntityCustomEntity.extend({		
		name : "Group",
		init:function(x, y, setting){
			this.x = x ? x : 0;
			this.y = y ? y : 0;
			this.parent(x, y, setting);
		},

		add:function(child){
			child.groupParent = this;
			this.children.push(child);
			ig.game.checkZIndexGroups();

			if(child.setProperty) child.setProperty();

			this.setLength();
		},

		remove:function(child){
			var idx = this.children.indexOf(child);
			this.children.splice(idx, 1);
			child.zIndex = -1;
			child.groupParent = null;

			ig.game.checkZIndexGroups();

			if(child.setProperty) child.setProperty();
			
			this.setLength();
		},

		removeAll:function(){
			for(var a = 0; a < this.children.length; a++){
				var child = this.children[a];
				child.zIndex = -1;
				child.groupParent = null;
			}

			this.children = [];
			
			ig.game.checkZIndexGroups();
			this.setProperty();
			this.setLength();
		},

		bringToTop:function(child){
			var idx = this.children.indexOf(child);
			if(idx < 0) return;
			this.children.splice(idx, 1);
			this.children.push(child);

			ig.game.checkZIndexGroups();
		},

		sendToBack:function(child){
			var idx = this.children.indexOf(child);
			if(idx < 0) return;
			this.children.splice(idx, 1);
			this.children.splice(0, 0, child);

			ig.game.checkZIndexGroups();
		},

		getBounds:function(){
			var minX = this.pos.x;
			var maxX = this.pos.x;
			var minY = this.pos.y;
			var maxY = this.pos.y;

			var bound = this.parent(minX, maxX, minY, maxY)
			return bound;
			// return {x:minX, y:minY, width:groupWidth, height:groupHeight, right:maxX, bottom:maxY};
		},

		setProperty:function(){
			var parentPos = this.groupParent ? ig.World.parentPos(this.groupParent, this.x, this.y) : {x:this.x, y:this.y};
			var parentX = parentPos.x;
			var parentY = parentPos.y;

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}
			
			this.pos.x = parentX - screenX;
			this.pos.y = parentY - screenY;

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(this.pos.x, this.pos.y, ig.game.anchorType)
				this.pos.x = anchorPos.x;
				this.pos.y = anchorPos.y;
			}

			var _tempScaleX = this.lastScale.x;
			var _tempScaleY = this.lastScale.y;
			var curScaleX = this.scale.x;
			var curScaleY = this.scale.y;

			if(curScaleX != _tempScaleX || curScaleY != _tempScaleY){
				this.scale.x = parseFloat(this.scale.x.toFixed(2));
				this.scale.y = parseFloat(this.scale.y.toFixed(2));
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

			this.anchor.setTo(0);
		},

		setScale:function(x, y){
			this.scale.setTo(x, y);
			this.lastScale.setTo(x, y);
			this._scale.setTo(x, y);
		},

		setLength:function(){
			var boundThis = this.getBounds();
			this.width = boundThis.width;
			this.height = boundThis.height;
			this.size.x = this.width;
			this.size.y = this.height;
		},

		sortByYAscending:function(){
			var children = [];
			while(children.length < this.children.length){
				var minY = null;
				for(var a = 0; a < this.children.length; a++){
					var child = this.children[a];
					var idx = children.indexOf(child);
					if(idx >= 0) continue;
					if(!minY){
						minY = child;
					} else {
						var bound = child.getBounds();
						var boundY = bound.y + bound.height;

						var curBound = minY.getBounds();
						var curBoundY = curBound.y + curBound.height;
						if(boundY < curBoundY){
							minY = child;
						}
					}
				}

				children.push(minY);
			}

			this.children = [];
			for(var a = 0; a < children.length; a++){
				var child = children[a];
				this.children.push(child);
			}

			ig.game.checkZIndexGroups();
			this.setLength();
		},

		update:function(){
			this.updateOtherEntities()
			
			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}

			this.sorting();
			this.updateChildren();

			this.setLength();

			this.setProperty();
		},

		draw:function(){
			this.drawOtherEntities()
			
			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}
			if(!this.visible) return;

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
	});
});
