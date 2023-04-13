ig.module('game.entities.controllers.stage-ctrl')
.requires(
	'game.entities.addon.page-controller'
	,'game.entities.objects.stage-box'
)
.defines(function(){
	EntityStageCtrl = EntityPageController.extend({
		images:[
			new ig.Image('media/graphics/backgrounds/bg-01.png'),
			new ig.Image('media/graphics/sprites/ingame.png')
		],
		init:function(x, y, settings){
			this.parent(x, y, settings);
			if(!ig.global.wm){
				this.create();
			}
		},

		create:function(){
			var bgmVol = ig.game.sessionData.bgmVol;
			ig.soundHandler.bgmPlayer.volume(bgmVol);

			var sfxVol = ig.game.sessionData.sfxVol;
			ig.soundHandler.sfxPlayer.volume(sfxVol);
			
			this.pageNow = 0;
			this.pageReady = false;
			this.isTweening = false;

			this.gInGame = ig.game.addGroup();

			this.bg = ig.CallAsset.addImage(this.centerX, this.centerY, 'bg-01');
			this.bg.anchor.setTo(0.5);
			this.gBG.add(this.bg);

			this.gStage = ig.game.addGroup(this.centerX, this.centerY);
			this.gInGame.add(this.gStage);

			this.stageBg = ig.CallAsset.addFrameImage(0, 0, 'ingame/big-box');
			this.stageBg.anchor.setTo(0.5);
			this.gStage.add(this.stageBg);

			this.closeBtn = ig.CallAsset.addFrame(this.stageBg.size.x * 0.5, -this.stageBg.size.y * 0.5, 'ingame/buttons/close', {}, EntityClickBtn);
			this.closeBtn.x -= this.closeBtn.size.x * 0.7;
			this.closeBtn.y += this.closeBtn.size.y * 0.7;
			this.closeBtn.onClick.add(function(){
				ig.game.changePage(LevelMainmenu)
			}, this)
			this.gStage.add(this.closeBtn)

			this.showTitle = ig.game.addText(0, this.closeBtn.y + 2, _STRINGS['Game']['stage'], 65, fonts.font1);
			this.showTitle.anchor.setTo(0.5);
			this.showTitle.fill = '#B66200';
			this.gStage.add(this.showTitle);

			this.gBoxes = ig.game.addGroup();
			this.gStage.add(this.gBoxes)

			this.prevBtn = ig.CallAsset.addFrame(this.centerX - (this.stageBg.size.x * 0.5), this.gh * 0.87, 'ingame/buttons/btn-prev', {}, EntityClickBtn);
			this.prevBtn.x += this.prevBtn.size.x * 0.5;
			this.prevBtn.onStartClick.add(function(){
				this.pageNow--;
			}, this)
			this.prevBtn.onClick.add(function(){
				if(this.onGoing) return;
				this.changePage();
			}, this)
			this.gInGame.add(this.prevBtn);

			this.nextBtn = ig.CallAsset.addFrame(this.centerX + (this.stageBg.size.x * 0.5), this.prevBtn.y, 'ingame/buttons/btn-next', {}, EntityClickBtn);
			this.nextBtn.x -= this.nextBtn.size.x * 0.5;
			this.nextBtn.onStartClick.add(function(){
				this.pageNow++;
			}, this)
			this.nextBtn.onClick.add(function(){
				if(this.onGoing) return;
				this.changePage();
			}, this)
			this.gInGame.add(this.nextBtn);

			this.gCont.add(this.gInGame);

			this.onGoing = false;
			this.generateBoxes();
			// this.changePage();
			this.preparePage();

			this.pageTags = [];
			var countStage = parseInt(ig.GameData.totalStages / this.boxes.length) + 1;
			if(ig.GameData.totalStages % this.boxes.length == 0) countStage -= 1;
			for(var a = 0; a < countStage; a++){
				var tag = ig.CallAsset.addFrameImage(this.centerX, this.nextBtn.y, 'ingame/stages/page_tag2');
				tag.anchor.setTo(0.5);
				this.gInGame.add(tag);

				var mid = parseInt(countStage/2);
				var border = 1.2;
				var x = this.centerX - (tag.width * border * mid);
				if(countStage % 2 == 0) x = this.centerX - (tag.width * (border/2)) - (tag.width * border * (mid - 1));
				x += (tag.width * a * border);

				tag.x = x;
				this.pageTags.push(tag)
			}
			// console.log(countStage)

			this.fsBtn = ig.game.spawnEntity(ig.FullscreenButton, 5, 5, { 
			    enterImage: new ig.Image("media/graphics/sprites/enter-fullscreen.png"), 
			    exitImage: new ig.Image("media/graphics/sprites/exit-fullscreen.png") 
			});
		},

		generateBoxes:function(){
			this.boxes = [];
			for(var a = 0; a < 4; a++){
				for(var b = 0; b < 4; b++){
					// var box = ig.game.addGroup(0, 0, {boxId:this.boxes.length}, EntityStageBox);
					var box = ig.CallAsset.addFrame(0, 0, 'ingame/stages/stage-box-on-0', {boxId:this.boxes.length}, EntityStageBox)
					box.isTweening = false;
					this.gBoxes.add(box);

					box.x = -(box.size.x * 0.51) - (box.size.x * 1.02) + (box.size.x * b * 1.02);
					box.y = (-this.stageBg.size.y * 0.245) + (box.size.y * a * 1);
					box.create();

					this.boxes.push(box)

					// box.setScale(0, 1);
				}
			}

			// ig.GameData.openStageUntil(14);
			this.gBoxes.scale.x = 0;
			this.pageNow = parseInt(ig.game.sessionData.unlockedStages.length / this.boxes.length)
			if(this.pageNow * this.boxes.length >= ig.GameData.totalStages) this.pageNow--;
		},

		setPage:function(){
			for(var a = 0; a < this.boxes.length; a++){
				var stageId = (this.pageNow * this.boxes.length) + a;
				var box = this.boxes[a];
				box.inputEnabled = false;
				this.checkBox(box)

				if(stageId <= ig.game.sessionData.unlockedStages.length){
					box.inputEnabled = true;
				}
			}
		},

		setTag:function(){
			for(var a = 0; a < this.pageTags.length; a++){
				var tag = this.pageTags[a];
				tag.frameName = 'ingame/stages/page_tag2';
				if(a == this.pageNow) tag.frameName = 'ingame/stages/page_tag1';
			}
		},

		changePage:function(){
			if(this.isTweening) return;
			this.prevBtn.inputEnabled = false;
			this.nextBtn.inputEnabled = false;

			this.isTweening = true;

			var tween = new ig.TweenDef(this.gBoxes.scale)
			.to({x:0}, 100)
			.easing(ig.Tween.Easing.Quadratic.EaseOut)
			.onComplete(function(){
				this.isTweening = false;
				for(var a = 0; a < this.boxes.length; a++){
					var box = this.boxes[a];
					this.checkBox(box)
				}

				this.tweenBack();
			}.bind(this))
			.start();

			this.setTag();
		},

		checkBox:function(box){
			box.frameName = 'ingame/stages/stage-box-off-nostar';
			box.visible = false;
			var boxId = this.boxes.indexOf(box);
			var stageId = (this.pageNow * this.boxes.length) + boxId;
			box.stageId = stageId;

			if(stageId < ig.GameData.totalStages){
				box.visible = true;
				box.comingSoon.visible = false;
				box.showStage.visible = true;
				box.showStage.setText((box.stageId + 1) + '');

				if(stageId <= ig.game.sessionData.unlockedStages.length){
					box.frameName = 'ingame/stages/stage-box-on-0';
					if(stageId < ig.game.sessionData.unlockedStages.length){
						var totStar = ig.game.sessionData.unlockedStages[stageId]
						// console.log(totStar)
						box.frameName = 'ingame/stages/stage-box-on-' + totStar;
					}
				}
			} else if(stageId == ig.GameData.totalStages){
				box.visible = true;
				box.frameName = 'ingame/stages/stage-box-off'
				box.comingSoon.visible = true;
				box.showStage.visible = false;
			} else {
				box.isTweening = false;
			}
		},

		tweenBack:function(box){
			if(this.isTweening) return;
			this.isTweening = true;
			var tween = new ig.TweenDef(this.gBoxes.scale)
			.to({x:1}, 100)
			.easing(ig.Tween.Easing.Quadratic.EaseOut)
			.onComplete(function(){
				this.isTweening = false;
				this.setPage();
				this.prevBtn.inputEnabled = true;
				this.nextBtn.inputEnabled = true;
			}.bind(this))
			.start();
		},

		preparePage:function(){
			this.prevBtn.setScale(0);
			this.nextBtn.setScale(0);
			this.gStage.y = -this.stageBg.size.y * 0.6;
			for(var a = 0; a < this.boxes.length; a++){
				var box = this.boxes[a];
				box.inputEnabled = false;
			}
		},

		startPage:function(){
			var tween = new ig.TweenDef(this.gStage)
			.to({y:this.gh * 0.49}, 100)
			.onComplete(function(){
				this.changePage();
				var timing = 200;
				var tween1 = new ig.TweenDef(this.prevBtn.scale)
				.to({x:1, y:1}, timing)
				.start();

				var tween1 = new ig.TweenDef(this.nextBtn.scale)
				.to({x:1, y:1}, timing)
				.start(); 
			}.bind(this))
			.start();
		},

		checkAllTweening:function(){
			var isTweening = false;
			for(var a = 0; a < this.boxes.length; a++){
				if(this.boxes[a].isTweening){
					isTweening = true;
				}
			}

			return isTweening;
		},

		update:function(){
			this.parent();
			if(!ig.game.transition.isClosed && !this.pageReady){
				this.pageReady = true;
				this.startPage();
			}

			if(this.pageNow > 0){
				if(!this.isTweening) this.prevBtn.inputEnabled = true;
				this.prevBtn.frameName = 'ingame/buttons/btn-prev';
			} else {
				this.prevBtn.inputEnabled = false;
				this.prevBtn.frameName = 'ingame/buttons/btn-prev2';
			}

			if((this.pageNow + 1) * this.boxes.length >= ig.GameData.totalStages){
				this.nextBtn.inputEnabled = false;
				this.nextBtn.frameName = 'ingame/buttons/btn-next2';
			} else {
				if(!this.isTweening) this.nextBtn.inputEnabled = true;
				this.nextBtn.frameName = 'ingame/buttons/btn-next';
			}

			this.fsBtn.update();
		},

		draw:function(){
			this.parent();
			this.fsBtn.draw();
			// var bound = this.showTitle.getBounds();
			// ig.game.geomDebug.rect(bound, 'red', 0.5)
		}
	});
});