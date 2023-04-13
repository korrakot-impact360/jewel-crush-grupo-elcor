ig.module('game.entities.objects.click-btn')
.requires('game.entities.addon.sprite')
.defines(function(){
	EntityClickBtn = EntitySprite.extend({
		name:'click-btn',
		btnType:1,
		clickableLayer:null,
		setProperties:function(path){
			this.parent(path);

			this.onStartClick = new ig.AddSignal(this);
			this.onGoing = false;
			this.inputEnabled = true;

			this.anchor.setTo(0.5);
		},

		changePage:function(stageName){
			ig.game.changePage(stageName)
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

		tweenClick:function(){
			csound.sfxPlay('click');
			var toX = this.scale.x * 0.9;
			var toY = this.scale.y * 0.9;
			var timing = 65;

			var tween = new ig.TweenDef(this.scale)
			.to({x:toX, y:toY}, timing)
			.easing(ig.Tween.Easing.Bounce.EaseInOut)
			.repeat(1)
			.yoyo(true)
			.onComplete(function(){
				this.onGoing = false;
				this.inputEnabled = true;
				this.onClick.dispatch();

				this.released();
			}.bind(this))
			.start();
		},

		checkArea:function(){

		},

		clicked:function(){
			// if(!ig.game.math.rectContains(this.getBounds(), ig.game.pointer.pos.x, ig.game.pointer.pos.y)) return;
			if(ig.game.transition && ig.game.transition.isClosed) return;
			if(this.isClicked || this.onGoing) return;
			this.inputEnabled = false;
			this.isClicked = true;
			this.onGoing = true;
			this.onStartClick.dispatch();
			this.tweenClick();
		},

		released:function(){
			if(!this.isClicked || this.onGoing) return;
			this.isClicked = false;
			this.onRelease.dispatch();
		},

		update:function(){
			this.parent();
			if(this.clickableLayer){
				this.clickableLayer.update(this.pos.x, this.pos.y, this.size.x, this.size.y)
			}
		},

		draw:function(){
			this.parent();
			// var rect = this.getBounds();
			// ig.game.debug.rect(rect, 'red', 0.5)
		},
	});
});