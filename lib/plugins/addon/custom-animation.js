ig.module('plugins.addon.custom-animation')
.requires(
	'impact.animation',
	'plugins.addon.raw-image',
	'plugins.addon.add-signal'
)
.defines(function(){
	ig.CustomAnimSheet = ig.AnimationSheet.extend({
		init: function( path, width, height ) {
			this.image = new ig.RawImage(path);
			
			this.width = width ? width : this.image.size.x;
			this.height = height ? height : this.image.size.y;
		}
	});

	ig.CustomAnimation = ig.Animation.extend({
		init: function( sheet, frameTime, sequence, stop, spriteParent ) {
			this.parent(sheet, frameTime, sequence, stop);

			this.onComplete = new ig.AddSignal(spriteParent);
			this.onLoop = new ig.AddSignal(spriteParent);
			this.onEnterFrame = new ig.AddSignal(spriteParent);
			this.onStart = new ig.AddSignal(spriteParent);

			this.isComplete = false;
			this.isLooping = false;
			this.isStarting = false;
			this.prevFrame = this.frame;

			this.isPaused = false;
		},
		
		update:function(){
			if(this.isPaused) return;
			
			this.parent();
			this.sheet.image.update();

			if(this.frame == 0 && this.loopCount == 0){
				if(!this.isStarting){
					this.isStarting = true;
					this.onStart.dispatch();
				}
			} else {
				this.isStarting = false;
			}

			if(this.frame == 0 && this.loopCount > 0){
				if(!this.isLooping){
					this.isLooping = true;
					this.onLoop.dispatch();
				}
			} else {
				if(this.isLooping) this.isLooping = false;
			}

			if(this.prevFrame != this.frame){
				this.prevFrame = this.frame;
				this.onEnterFrame.dispatch();
			}

			if(this.stop && this.loopCount > 0){
				if(!this.isComplete){
					this.isComplete = true;
					this.onComplete.dispatch();
				}
			} else {
				this.isComplete = false;
			}
		},

		draw: function( targetX, targetY ) {
			var bbsize = Math.max(this.sheet.width, this.sheet.height);
			
			// On screen?
			if(
			   targetX > ig.system.width || targetY > ig.system.height ||
			   targetX + bbsize < 0 || targetY + bbsize < 0
			) {
				return;
			}

			if(this.sheet.width < 1 || this.sheet.height < 1) return;
			this.sheet.image.drawTile(
				targetX, targetY,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
		}
	});
});