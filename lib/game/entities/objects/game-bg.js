ig.module('game.entities.objects.game-bg')
.requires('game.entities.addon.manual-draw-entity')
.defines(function(){
	EntityGameBg = EntityManualDrawEntity.extend({
		bgImage:null,
		init:function(x, y, settings){
			this.parent(x, y, settings)

			this.bgPortrait = ig.Image.cache[imgCache['bg-01'].path.img]
			this.bgLandscape = ig.Image.cache[imgCache['bg-02'].path.img]
		},

		setShape:function(x, y){
			this.parent(x, y)

			if(ig.game.isPortrait){
				this.bgImage = this.bgPortrait;
			} else {
				this.bgImage = this.bgLandscape;
			}
		},

		drawShape:function(){
			if(!this.bgImage) return;

			var context = ig.system.context;
			context.save()
			var scaleX = this.width / this.bgImage.width;
			var scaleY = this.height / this.bgImage.height;
			var scale = Math.max(scaleX, scaleY)
			context.translate(this.width/2, this.height/2)
			context.scale(scale, scale)
			var bgX = -(this.bg.width/2)
			var bgY = -(this.bg.height/2)
			this.bgImage.draw(bgX, bgY)
			context.restore()
		}
	})
})