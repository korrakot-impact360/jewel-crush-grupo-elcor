ig.module('game.entities.buttons.button-sound')
.requires(
	'game.entities.addon.sprite'
)
.defines(function() {
	EntityButtonSound = EntitySprite.extend({
		btnType:'bgm',
		init:function(x,y,settings){
			this.parent(x,y,settings);

			var path = imgCache['ingame'].path.img;
			this.setProperties(path)

			this.frameName = 'ingame/buttons/ok-btn'
			this.setFrame()

			this.btnText = ig.game.addText(0, 0, '', 70, fonts.font1)
			this.btnText.anchor.setTo(0.5)
			this.addChild(this.btnText)

			this.saveName = this.btnType + 'On'
			this.soundName = this.btnType + 'Player'

			this.inputEnabled = true;
			this.anchor.setTo(0.5)
			this.scale.setTo(0.8)

			this.onClick.add(this.checkSound, this)

			this.changeFrame()
		},

		checkSound:function(){
			ig.game.sessionData[this.saveName] = !ig.game.sessionData[this.saveName]

			if(ig.game.sessionData[this.saveName]){
				ig.soundHandler[this.soundName].unmute()
				if(this.btnType == 'bgm'){
					var checkBgmPlay = ig.soundHandler.bgmPlayer.soundList['background'].playing()
					if(!checkBgmPlay){
						ig.soundHandler.bgmPlayer.play('background')
					}
				}
			} else {
				ig.soundHandler[this.soundName].mute()
			}

			this.changeFrame()

			ig.game.save(this.saveName, ig.game.sessionData[this.saveName])
		},

		changeFrame:function(){
			if(ig.game.sessionData[this.saveName]){
				this.btnText.setText(_STRINGS['Buttons']['on'])
			} else {
				this.btnText.setText(_STRINGS['Buttons']['off'])
			}
		},

		clicked:function(){
			csound.sfxPlay('click')
			this.parent()
		},

        draw:function()
        {
            this.parent();
        },
	});
});