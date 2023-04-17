ig.module('game.entities.controllers.mainmenu-ctrl')
.requires(
	'game.entities.addon.page-controller'
	,'game.entities.objects.options'
	,'game.entities.objects.click-btn2'
)
.defines(function(){
	EntityMainmenuCtrl = EntityPageController.extend({
		titleAnimated:false,
		init:function(x, y, settings){
			this.parent(x, y, settings);
			if(!ig.global.wm){
				this.create();
			}
		},

		create:function(){
			this.gInGame = ig.game.addGroup();

			this.bg = ig.CallAsset.addImage(this.centerX, this.centerY, 'bg-01');
			this.bg.anchor.setTo(0.5);
			this.gBG.add(this.bg);

			this.createGreyBg();

			this.gSetting = ig.game.addGroup(this.centerX, this.centerY, {}, EntityOptions);
			this.gFront.add(this.gSetting)

			this.title = ig.CallAsset.addFrameImage(this.centerX, this.gh * 0.24, 'ingame/title');
			this.title.anchor.setTo(0.5);
			this.gInGame.add(this.title);

			this.playBtn = ig.CallAsset.addFrame(this.centerX, this.gh * 0.62, 'ingame/buttons/play-btn1', {}, EntityClickBtn2);
			this.playBtn.onClick.add(function(){
				csound.sfxPlay('match3')
				ig.game.changePage(LevelStage)
			}, this)
			this.gInGame.add(this.playBtn)

			this.settingBtn = ig.CallAsset.addFrame(this.gw, this.gh, 'ingame/buttons/setting-btn', {isResponsive:false}, EntityClickBtn);
			this.settingBtn.x -= this.settingBtn.size.x * 0.7;
			this.settingBtn.y -= this.settingBtn.size.y * 0.7;
			this.settingBtn.onClick.add(this.gSetting.appear, this.gSetting);
			// this.settingBtn.onStartClick.add(function)
			this.gInGame.add(this.settingBtn);

			if(_SETTINGS['MoreGames']['Enabled']){
				this.moreBtn = ig.CallAsset.addFrame(0, this.settingBtn.y, 'ingame/buttons/more-btn', {isResponsive:false}, EntityClickBtn);
				this.moreBtn.x += this.moreBtn.size.x * 0.7;
				this.moreBtn.moreGames();
				this.gInGame.add(this.moreBtn);
			}

			this.gCont.add(this.gInGame);

			this.reposTitle()

			this.updateOnOrientationChange()
			this.startPage();

			this.createFSBtn(20, 20)
		},

		updateOnOrientationChange:function(){
			this.parent()
			
			var scaleX = ig.system.width / this.bg.width;
			var scaleY = ig.system.height / this.bg.height
			var bgScale = Math.max(scaleX, scaleY)
			this.bg.scale.setTo(bgScale)

			var gap = 20
			if(this.fsBtn){
				var gap = this.fsBtn.pos.x
			}

			this.settingBtn.x = ig.system.width - (this.settingBtn.size.x * 0.5) - gap;
			this.settingBtn.y = ig.system.height - (this.settingBtn.size.y * 0.5) - gap;

			if(_SETTINGS['MoreGames']['Enabled']){
				this.moreBtn.x = gap + (this.moreBtn.size.x * 0.5)
				this.moreBtn.y = this.settingBtn.y
			}

			if(this.titleAnimated){
				this.reposTitle()
			}
		},

		startPage:function(){
			this.greyBg.visible = true;
			this.playBtn.alpha = 0;
			this.oriSetting = new Vector2(this.settingBtn.x, this.settingBtn.y);
			this.reposTitle()

			this.title.y = -this.title.size.y * 0.6;
			this.title.alpha = 0;

			this.settingBtn.y = this.gh + (this.settingBtn.size.y * 0.6);
			this.settingBtn.alpha = 0

			this.playBtn.inputEnabled = false;
			this.settingBtn.inputEnabled = false;

			if(_SETTINGS['MoreGames']['Enabled']){
				this.moreBtn.hide();
				this.oriMore = new Vector2(this.moreBtn.x, this.moreBtn.y);
				this.moreBtn.y = this.gh + (this.moreBtn.size.y * 0.6)
				this.moreBtn.alpha = 0;
			}			
		},

		reposTitle:function(){
			console.log('reposTitle', ig.game.isPortrait)
			if(ig.game.isPortrait){
				var diffY = (ig.system.height - this.gh) / 2;
				this.title.y = (this.gh * 0.1) + (this.title.height / 2) - diffY
				console.log(this.title.y)
			} else {
				this.title.y = this.gh * 0.24
			}

			this.oriTitle = new Vector2(this.title.x, this.title.y);
		},

		setPage:function(){
			this.greyBg.visible = false;
			var timing = 300;

			var tweenTitle = new ig.TweenDef(this.title)
			.to({x:this.oriTitle.x, y:this.oriTitle.y, alpha:1}, timing)
			.onComplete(function(){
				this.titleAnimated = true;
				// this.titleAnimation();
			}.bind(this))
			.start();

			var tweenSetting = new ig.TweenDef(this.settingBtn)
			.to({y:this.oriSetting.y, alpha:1}, timing)
			.onComplete(function(){
				this.settingBtn.inputEnabled = true;
			}.bind(this))
			.start();

			var tweenPlayBtn = new ig.TweenDef(this.playBtn)
			.to({alpha:1}, timing)
			.onComplete(function(){
				this.playBtn.inputEnabled = true;
				// this.playAnimation();
			}.bind(this))
			.start();

			if(_SETTINGS['MoreGames']['Enabled']){
				var tweenMore = new ig.TweenDef(this.moreBtn)
				.to({y:this.oriMore.y, alpha:1}, timing)
				.onComplete(function(){
					this.moreBtn.show();
					setTimeout(function(){
						ig.sizeHandler.resize()
						ig.game.draw()
					}.bind(this), 150)
				}.bind(this))
				.start();
			}
		},

		titleAnimation:function(){
			this.reposTitle()

			var toY = this.title.y - 50;
			var tween = new ig.TweenDef(this.title)
			// .to({scale:{x:1.05, y:1.05}, angle:-10}, 0.15)
			.to({y:toY}, 3000)
			.repeat(1)
			.yoyo(true)
			.onComplete(function(){
				this.titleAnimation()
				// setTimeout(this.titleAnimation.bind(this), 2000)
			}.bind(this))
			.start();

			this.titleAnimated = true
		},

		playAnimation:function(){
			var tween = new ig.TweenDef(this.playBtn.scale)
			.to({x:1.1, y:1.1}, 2000)
			.yoyo(true)
			.repeat(-1)
			.onComplete(function(){
				// setTimeout(this.playAnimation.bind(this), 1000)
			}.bind(this))
			.start();
		},

		update:function(){
			this.parent();
			if(!ig.game.transition.isClosed){
				if(!this.pageReady){
					this.pageReady = true;
					this.setPage();
				}				
			}

			this.fsBtn.update();
		},

		draw:function(){
			this.parent();
			this.fsBtn.draw();
		},
	})
})