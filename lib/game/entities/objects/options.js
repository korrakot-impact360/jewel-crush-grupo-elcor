ig.module('game.entities.objects.options')
.requires(
	'game.entities.addon.group',
	'plugins.addon.add-signal'
)
.defines(function(){
	EntityOptions = EntityGroup.extend({
		name : "setting-group",
		init:function(x, y, setting){
			this.parent(x, y, setting);

			this.isActive = false;
			this.onGoing = false;

			this.isBgmClicked = false;
			this.isSfxClicked = false;

			this.onResume = new ig.AddSignal(this);
			this.startResume = new ig.AddSignal(this);

			this.onPause = new ig.AddSignal(this);
			this.onStartPause = new ig.AddSignal(this);

			this.create();
		},

		create:function(){
			this.mode = 'setting';

			this.bg = ig.CallAsset.addFrameImage(0, 0, 'ingame/settings/settings');
			this.bg.anchor.setTo(0.5);
			this.bg.y += (this.bg.size.y * 0.5);
			this.add(this.bg);

			var texts = _STRINGS['Game']['settings'];

			this.showTitle = ig.game.addText(0, this.bg.y - (this.bg.size.y * 0.27), texts, 70, fonts.font1);
			this.showTitle.anchor.setTo(0.5);
			this.showTitle.fill = '#B66200';
			this.add(this.showTitle);

			var descTxtFill = '#7f2a39';

			this.gBgm = ig.game.addGroup(0, this.bg.y - (this.bg.size.y * 0.1));
			this.add(this.gBgm);

			var anchor = 0.27;

			this.bgmIcon = ig.CallAsset.addFrame(0, 0, 'ingame/settings/bgm-icon');
			this.bgmIcon.anchor.setTo(0, 0.5);
			this.bgmIcon.x -= this.bg.size.x * anchor;
			this.gBgm.add(this.bgmIcon)
			
			// this.bgmIcon.y += this.bgmIcon.size.y * 0.5

			this.gBgmBar = ig.game.addGroup(this.bg.size.x * anchor, 0);
			this.gBgm.add(this.gBgmBar);

			this.bgmBarBg = ig.CallAsset.addFrame(0, 0, 'ingame/settings/slider-bg');
			this.bgmBarBg.anchor.setTo(0, 0.5);
			this.bgmBarBg.inputEnabled = true;
			this.bgmBarBg.onClick.add(function(){
				this.isBgmClicked = true;
			}, this);
			this.bgmBarBg.onRelease.add(function(){
				csound.sfxPlay('click');
				this.isBgmClicked = false;
				ig.game.save('bgmVol', ig.game.sessionData.bgmVol)
			}, this);
			this.gBgmBar.add(this.bgmBarBg);

			var width = (this.bgmBarBg.pos.x + this.bgmBarBg.size.x) - this.gBgm.pos.x;
			this.gBgmBar.x -= this.bgmBarBg.size.x;
			// this.gBgmBar.y -= this.bgmBarBg.size.y * 0.9;

			this.bgmBar = ig.CallAsset.addFrameImage(this.bgmBarBg.x, this.bgmBarBg.y, 'ingame/settings/slider-bar');
			this.bgmBar.anchor.setTo(0, 0.5);
			this.gBgmBar.add(this.bgmBar)

			this.bgmSlider = ig.CallAsset.addFrame(0, 0, 'ingame/settings/slider');
			this.bgmSlider.anchor.setTo(0.5);
			this.bgmSlider.inputEnabled = true;
			this.bgmSlider.onClick.add(function(){
				this.isBgmClicked = true;
			}, this);
			this.bgmSlider.onRelease.add(function(){
				csound.sfxPlay('click');
				ig.game.save('bgmVol', ig.game.sessionData.bgmVol)
				this.isBgmClicked = false;
			}, this);
			this.gBgmBar.add(this.bgmSlider);

			this.gSfx = ig.game.addGroup(0, this.gBgm.y + (this.bgmIcon.size.y * 1.5));
			this.add(this.gSfx);

			this.sfxIcon = ig.CallAsset.addFrame(this.bgmIcon.x, this.bgmIcon.y, 'ingame/settings/sfx-icon');
			this.sfxIcon.anchor.setTo(0, 0.5);
			this.gSfx.add(this.sfxIcon);

			this.gSfxBar = ig.game.addGroup(this.gBgmBar.x, this.gBgmBar.y);
			this.gSfx.add(this.gSfxBar);

			this.sfxBarBg = ig.CallAsset.addFrame(0, 0, 'ingame/settings/slider-bg');
			this.sfxBarBg.anchor.setTo(0, 0.5);
			this.sfxBarBg.inputEnabled = true;
			this.sfxBarBg.onClick.add(function(){
				this.isSfxClicked = true;
			}, this);
			this.sfxBarBg.onRelease.add(function(){
				csound.sfxPlay('click');
				this.isSfxClicked = false;
				ig.game.save("sfxVol", ig.game.sessionData.sfxVol)
			}, this);
			this.gSfxBar.add(this.sfxBarBg);

			this.sfxBar = ig.CallAsset.addFrameImage(this.sfxBarBg.x, this.sfxBarBg.y, 'ingame/settings/slider-bar');
			this.sfxBar.anchor.setTo(0, 0.5);
			this.gSfxBar.add(this.sfxBar)

			this.sfxSlider = ig.CallAsset.addFrame(0, 0, 'ingame/settings/slider');
			this.sfxSlider.anchor.setTo(0.5);
			this.sfxSlider.inputEnabled = true;
			this.sfxSlider.onClick.add(function(){
				this.isSfxClicked = true;
			}, this);
			this.sfxSlider.onRelease.add(function(){
				csound.sfxPlay('click');
				this.isSfxClicked = false;
				ig.game.save("sfxVol", ig.game.sessionData.sfxVol)
			}, this);
			this.gSfxBar.add(this.sfxSlider);

			this.okBtn = ig.CallAsset.addFrame(0, this.bg.y + (this.bg.size.y * 0.25), 'ingame/buttons/ok-btn', {}, EntityClickBtn)
			this.okBtn.anchor.setTo(0.5);
			this.okBtn.onClick.add(function(){
				this.disappear();
			}, this);
			this.add(this.okBtn);

			var txt = ig.game.addText(0, 0, _STRINGS['Buttons']['ok'], 35, fonts.font1);
			txt.anchor.setTo(0.5);
			txt.fill = 'white';
			this.okBtn.addChild(txt)

			this.setStartVolume();
		},

		pauseFunction:function(){
			this.mode = 'pause';
			var txt = _STRINGS['Game']['paused']
			this.showTitle.setText(txt)

			var resumePos = this.okBtn.position;
			this.okBtn.kill();

			this.okBtn = ig.CallAsset.addFrame(0, resumePos.y, 'ingame/buttons/play-small', {}, EntityClickBtn);
			this.okBtn.onClick.add(function(){
				this.disappear();
			}, this);
			this.okBtn.onStartClick.add(function(){
				this.buttonEnabled();
			}, this);
			this.add(this.okBtn);

			this.homeBtn = ig.CallAsset.addFrame(this.okBtn.x + (this.okBtn.size.x * 0.5), this.okBtn.y, 'ingame/buttons/menu', {}, EntityClickBtn);
			this.homeBtn.x += this.homeBtn.size.x * 0.7
			this.homeBtn.onStartClick.add(ig.game.disableBtns, ig.game);
			this.homeBtn.onClick.add(function(obj){
				obj.changePage(LevelMainmenu);
			}, this);
			this.add(this.homeBtn); 

			this.replayBtn = ig.CallAsset.addFrame(this.okBtn.x - (this.okBtn.size.x * 0.5), this.okBtn.y, 'ingame/buttons/replay', {}, EntityClickBtn);
			this.replayBtn.x -= this.replayBtn.size.x * 1.1;
			this.replayBtn.onStartClick.add(ig.game.disableBtns, ig.game);
			this.replayBtn.onClick.add(function(obj){
				obj.changePage(LevelGameplay);
			}, this);
			this.add(this.replayBtn);
		},

		setStartVolume:function(){
			// this.y -= this.bg.size.y * 0.5
			// this.isActive = true;
			this.y = -this.bg.size.y * 1.1;
			this.alpha = 0;
			this.visible = false;
			curState().greyBg.alpha = 0;
			// curState().greyBg.scale.x = 0;

			var bgmVol = ig.game.sessionData.bgmVol;
			ig.soundHandler.bgmPlayer.volume(bgmVol);

			var sfxVol = ig.game.sessionData.sfxVol;
			ig.soundHandler.sfxPlayer.volume(sfxVol);
		},

		moreBtnSetting:function(){
			if(_SETTINGS['MoreGames']['Enabled']){
				var idMainmenu = ig.game.director.levels.indexOf(LevelMainmenu);
				var idx = ig.game.director.currentLevel;
				if(idx == idMainmenu){
					if(this.isActive){
						curState().moreBtn.hide();
					} else {
						curState().moreBtn.show();
					}
				}
			}
		},

		buttonEnabled:function(){
			if(this.isActive){
				this.okBtn.inputEnabled = true;
				if(this.mode == 'pause'){
					// this.homeBtn.inputEnabled = true;
					// this.replayBtn.inputEnabled = true;
				}
			} else {
				this.okBtn.inputEnabled = false;
				if(this.mode == 'pause'){
					// this.homeBtn.inputEnabled = false;
					// this.replayBtn.inputEnabled = false;
				}
			}
		},

		appear:function(){
			if(this.onGoing) return;
			this.onStartPause.dispatch();

			var timing = 300;
			this.onGoing = true;
			this.isActive = true;
			this.visible = true;
			this.buttonEnabled();
			this.moreBtnSetting();

			var toY = curState().centerY - (this.bg.size.y * 0.5);

			curState().greyBg.visible = true;
			var tweenBg = new ig.TweenDef(curState().greyBg)
			.to({alpha:1}, timing)
			.start();

			var tweenGroup = new ig.TweenDef(this)
			.to({alpha:1, y:toY}, timing)
			.onComplete(function(){
				this.onGoing = false;
				this.onPause.dispatch();

				if(this.mode == 'pause'){

				}
			}.bind(this))
			.start();

			if(this.mode == 'pause'){
				curState().gamePaused = true;
			}
		},

		disappear:function(){
			if(this.onGoing) return;
			this.onGoing = true;
			this.isActive = false;
			this.startResume.dispatch();
			
			var timing = 300;

			var tweenBg = new ig.TweenDef(curState().greyBg)
			.to({alpha:0}, timing)
			.start();

			var toY = -this.bg.size.y * 1.1;
			var tweenGroup = new ig.TweenDef(this)
			.to({alpha:0, y:toY}, timing)
			.onComplete(function(){
				this.onGoing = false;
				this.visible = false;
				curState().greyBg.visible = false;
				if(this.mode == 'pause'){
					curState().gamePaused = false;
				}
				this.moreBtnSetting();
				this.onResume.dispatch();
			}.bind(this))
			.start();
		},

		updateBgm:function(){
			if(!this.isActive || !this.isBgmClicked) return;

			var length = this.bgmBarBg.size.x;

			var sliderX = ig.game.pointer.pos.x - this.gBgmBar.pos.x;
			if(sliderX < 0) sliderX = 0;
			if(sliderX > this.bgmBarBg.width) sliderX = this.bgmBarBg.width;

			var volume = sliderX / length;
			ig.soundHandler.bgmPlayer.volume(volume);
			ig.game.sessionData.bgmVol = volume;

			// ig.game.saveAll();
		},

		updateSfx:function(){
			if(!this.isActive || !this.isSfxClicked) return;

			var length = this.sfxBarBg.size.x;

			var sliderX = ig.game.pointer.pos.x - this.gSfxBar.pos.x;
			if(sliderX < 0) sliderX = 0;
			if(sliderX > this.sfxBarBg.width) sliderX = this.sfxBarBg.width;

			var volume = sliderX / length;
			ig.soundHandler.sfxPlayer.volume(volume);
			ig.game.sessionData.sfxVol = volume;

			// ig.game.saveAll();
		},

		update:function(){
			this.parent();

			// this.showTitle.x = this.titleBox.x - (this.showTitle.size.x * 0.5);
			// this.showTitle.y = this.titleBox.y + (this.showTitle.size.y * 0.5) - 5;

			this.updateBgm();
			this.updateSfx();

			var minX = this.bgmSlider.size.x * 0.5;
			var maxX = this.bgmBarBg.size.x - (this.bgmSlider.size.x * 0.5);

			var bgmX = ig.game.sessionData.bgmVol * this.bgmBarBg.size.x;
			if(bgmX < minX) bgmX = minX;
			else if(bgmX > maxX) bgmX = maxX;
			var sfxX = ig.game.sessionData.sfxVol * this.sfxBarBg.size.x;
			if(sfxX < minX) sfxX = minX;
			else if(sfxX > maxX) sfxX = maxX;

			this.bgmSlider.x = bgmX; 
			this.sfxSlider.x = sfxX;

			this.bgmBar.drawSize.x = bgmX;
			this.sfxBar.drawSize.x = sfxX;
			// console.log(bgmX)
		},
	});
});