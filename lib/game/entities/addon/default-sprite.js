ig.module('game.entities.addon.default-sprite')
.requires(
	'game.entities.addon.sprite'
	,'plugins.addon.custom-animation'
)
.defines(function(){
	EntityDefaultSprite = EntitySprite.extend({
		setProperties:function(path){
			this.anims = {};
			this.currentAnim = null;

			this.imgName = "";
			for(var obj in imgCache){
				var data = imgCache[obj];
				if(data.path.img == path){
					this.imgName = obj;
				}
			}

			this.path = path;

			this.animSheet = new ig.CustomAnimSheet(path, this.width, this.height);
			// debugger;

			this.size.x = this.width;
			this.size.y = this.height;
		},

		setFrame:function(){},

		addAnim: function( name, frameTime, sequence, stop ) {
			if( !this.animSheet ) {
				throw( 'No animSheet to add the animation '+name+' to.' );
			}
			var a = new ig.CustomAnimation( this.animSheet, frameTime, sequence, stop, this );
			this.anims[name] = a;
			
			return a;
		},

		draw:function(){	//modif
			this.drawOtherEntities()
			
			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}

			if(!this.visible) return;
			if(this.size.x < 1 || this.size.y < 1) return;

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
			var targetY = parentY + this.y - screenY			

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
			var imgX = sizeX * this.anchor.x;
			var imgY = sizeY * this.anchor.y;

			if(this.currentAnim){
				this.currentAnim.draw(-imgX, -imgY)
			} else {
				if(this.animSheet){
					this.animSheet.image.draw(-imgX, -imgY, 0, 0, sizeX, sizeY)
				}
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
	})
})