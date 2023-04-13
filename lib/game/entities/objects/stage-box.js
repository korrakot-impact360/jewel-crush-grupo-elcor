ig.module('game.entities.objects.stage-box')
.requires('game.entities.objects.click-btn')
.defines(function(){
	EntityStageBox = EntityClickBtn.extend({
		init:function(x, y, settings){
			this.parent(x, y, settings);
			// this.create();
		},

		setProperties:function(path){
			this.parent(path);

			// this.create();
		},

		create:function(){
			this.onGoing = false;

			this.stageId = this.boxId;
			this.showStage = ig.game.addText(0, -this.size.y * 0.1, this.stageId + '', 60, fonts.font1);
			this.showStage.anchor.setTo(0.5);
			this.addChild(this.showStage);

			this.comingSoon = ig.game.addText(0, -5, _STRINGS['Game']['comingsoon'], 18, fonts.font1);
			this.comingSoon.anchor.setTo(0.5);
			this.comingSoon.wordWrap = true;
			this.comingSoon.wordWrapWidth = this.width * 0.8;
			this.comingSoon.lineSpacing = 3;
			this.comingSoon.align = 'center';
			this.addChild(this.comingSoon)

			this.comingSoon.visible = false;

			this.onClick.add(this.activate, this)
		},

		setPage:function(){
			var starLength = ig.game.sessionData.unlockedStages[this.stageId];
			for(var a = 0; a < starLength; a++){
				var star = this.stars[a];
				star.playAnim('on')
			}
		},

		activate:function(){
			ig.game.disableBtns();
			ig.GameData.stage = this.stageId;
			ig.GameData.trialMode = true;
			ig.game.changePage(LevelGameplay)
		},

		update:function(){
			this.parent();
		},
	})
})