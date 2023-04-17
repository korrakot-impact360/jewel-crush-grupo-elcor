ig.module('game.entities.objects.options')
.requires(
	'game.entities.addon.group',
	'plugins.addon.add-signal',
	'game.entities.buttons.button-sound'
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

			this.showTitle = ig.game.addText(0, this.bg.y - (this.bg.size.y * 0.3), texts, 120, fonts.font1);
			this.showTitle.anchor.setTo(0.5);
			this.showTitle.fill = '#B66200';
			this.add(this.showTitle);

			this.bgmIcon = ig.CallAsset.addFrameImage(this.bg.x - (this.bg.width * 0.15), this.bg.y - (this.bg.height * 0.14), 'ingame/settings/bgm-icon')
			this.bgmIcon.anchor.setTo(0.5)
			this.add(this.bgmIcon)

			this.bgmBtn = ig.game.spawnEntity(EntityButtonSound, this.bg.width * 0.13, this.bgmIcon.y)
			this.add(this.bgmBtn)

			this.sfxIcon = ig.CallAsset.addFrameImage(this.bgmIcon.x, this.bgmIcon.y + (this.bgmBtn.height) + 5, 'ingame/settings/sfx-icon')
			this.sfxIcon.anchor.setTo(0.5)
			this.add(this.sfxIcon)

			this.sfxBtn = ig.game.spawnEntity(EntityButtonSound, this.bgmBtn.x, this.sfxIcon.y, {btnType:"sfx"})
			this.add(this.sfxBtn)

			this.okBtn = ig.CallAsset.addFrame(0, this.bg.y + (this.bg.size.y * 0.25), 'ingame/buttons/ok-btn', {}, EntityClickBtn)
			this.okBtn.onClick.add(function(){
				this.disappear();
			}, this);
			this.add(this.okBtn);

			var txt = ig.game.addText(0.01, 0.01, _STRINGS['Buttons']['ok'], 70, fonts.font1);
			txt.anchor.setTo(0.5);
			txt.fill = 'white';
			this.okBtn.addChild(txt)

			this.prepare()
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

		prepare:function(){
			// this.y -= this.bg.size.y * 0.5
			// this.isActive = true;
			this.y = -this.bg.size.y * 1.1;
			this.alpha = 0;
			this.visible = false;
			curState().greyBg.alpha = 0;
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

		update:function(){
			this.parent();
		},
	});
});