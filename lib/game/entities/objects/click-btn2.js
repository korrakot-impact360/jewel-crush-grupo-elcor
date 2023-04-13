ig.module('game.entities.objects.click-btn2')
.requires('game.entities.addon.sprite')
.defines(function(){
	EntityClickBtn2 = EntitySprite.extend({
		init:function(x, y, settings){
			this.parent(x, y, settings);
		},

		setProperties:function(path){
			this.parent(path);

			this.anchor.setTo(0.5);

			this.inputEnabled = true;
			this.isClicked = false;
		},

		moreGames:function(){
			this.setProperty();
			this.name = 'more-games';
			this.div_layer_name = 'more-games';
			if(_SETTINGS.MoreGames.Enabled){
				if(_SETTINGS.MoreGames.Link)
				{
					this.link=_SETTINGS.MoreGames.Link;
				}
				if(_SETTINGS.MoreGames.NewWindow)
				{
					this.newWindow = _SETTINGS.MoreGames.NewWindow;
				}
				this.clickableLayer = new ClickableDivLayer(this);
			} else {
				this.kill();
			}
		},
		
        show:function(){
        	if(!this.exists || this.name != 'more-games') return;
            var elem = ig.domHandler.getElementById("#"+this.div_layer_name);
            ig.domHandler.show(elem);
        },

        hide:function(){
        	if(!this.exists || this.name != 'more-games') return;
            var elem = ig.domHandler.getElementById("#"+this.div_layer_name);
            ig.domHandler.hide(elem);
        },

		clicked:function(){
			if(this.isClicked) return;
			this.isClicked = true;
			this.frameName = 'ingame/buttons/play-btn2';
			// this.playAnim('clicked');
		},

		released:function(){
			if(!this.isClicked) return;
			this.isClicked = false;
			this.frameName = 'ingame/buttons/play-btn1'
			// this.playAnim('released');
			this.onClick.dispatch();
		},

		update:function(){
			this.parent();
			if(this.clickableLayer){
				// this.clickableLayer.pos = new Vector2(this.pos.x, this.pos.y);
				this.clickableLayer.size = new Vector2(this.size.x, this.size.y);
				this.clickableLayer.update(this.pos.x, this.pos.y)
			}
		},
	})
})