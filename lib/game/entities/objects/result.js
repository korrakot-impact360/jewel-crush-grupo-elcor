ig.module('game.entities.objects.result')
.requires('game.entities.addon.group')
.defines(function(){
	EntityResult = EntityGroup.extend({
		isCompleted : false,
		init:function(x, y, settings){
			this.parent(x, y, settings);
			this.create();
		},

		create:function(){
			this.isIn = false;
			this.bg = ig.CallAsset.addFrameImage(0, 0, 'ingame/settings/settings');
			this.bg.anchor.setTo(0.5);
			this.add(this.bg);

			this.ribbon = ig.CallAsset.addFrameImage(0, -this.bg.size.y * 0.45, 'game/result-ribbon')
			this.ribbon.anchor.setTo(0.5);
			this.add(this.ribbon);

			this.stars = [];
			for(var a = 0; a < 3; a++){
				var oriY = -this.bg.size.y * 0.28
				var star = ig.CallAsset.addFrameImage(0, oriY, 'game/result-star-bg');
				star.anchor.setTo(0.5);
				this.add(star);

				var x = -(star.size.x * 1.1) + (star.size.x * 1.1 * a)
				star.x = x;
				if(a == 0) {
					star.angle = -10
					star.y += 5
				} else if(a == 2){
					star.angle = 10;
					star.y = this.stars[0].y
				}

				var starOn = ig.CallAsset.addFrameImage(star.x, star.y, 'game/result-star');
				starOn.anchor.setTo(0.5);
				starOn.angle = star.angle;
				starOn.scale.setTo(0)
				this.add(starOn);

				star.starOn = starOn
				this.stars.push(star);
			}

			this.scoreTxt = ig.game.addText(-(this.bg.size.x * 0.3), -this.bg.size.y * 0.13, _STRINGS['Game']['score'], 70, fonts.font1);
			this.scoreTxt.anchor.setTo(0, 0.5);
			this.scoreTxt.fill = '#cc7509';
			this.add(this.scoreTxt)

			this.showScore = ig.game.addText(this.bg.size.x * 0.3, this.scoreTxt.y, '0000', this.scoreTxt.fontSize, fonts.font1);
			this.showScore.anchor.setTo(1, 0.5);
			this.showScore.fill = 'white';
			this.add(this.showScore)

			this.highScoreTxt = ig.game.addText(this.scoreTxt.x, this.scoreTxt.y + (this.scoreTxt.size.y * 1.2), _STRINGS['Game']['highscore'], this.scoreTxt.fontSize, fonts.font1);
			this.highScoreTxt.anchor.setTo(0, 0.5);
			this.highScoreTxt.fill = this.scoreTxt.fill;
			this.add(this.highScoreTxt);

			this.showHigh = ig.game.addText(this.showScore.x, this.highScoreTxt.y, '0000', this.highScoreTxt.fontSize, fonts.font1);
			this.showHigh.anchor.setTo(1, 0.5);
			this.showHigh.fill = 'white';
			this.add(this.showHigh)

			this.goalBox = ig.CallAsset.addFrameImage(0, this.bg.size.y * 0.15, 'game/result-list');
			this.goalBox.anchor.setTo(0.5);
			this.add(this.goalBox);

			this.homeBtn = ig.CallAsset.addFrame(-this.bg.size.x * 0.2, this.bg.size.y * 0.35, 'ingame/buttons/menu', {}, EntityClickBtn);
			this.homeBtn.onClick.add(function(){
				ig.game.changePage(LevelMainmenu)
			}, this);
			this.add(this.homeBtn)

			this.replayBtn = ig.CallAsset.addFrame(0, this.homeBtn.y, 'ingame/buttons/replay', {}, EntityClickBtn);
			this.replayBtn.onStartClick.add(function(){
				ig.game.disableBtns();
			}, this);
			this.replayBtn.onClick.add(function(){
				ig.game.changePage(LevelGameplay)
			}, this);
			this.add(this.replayBtn)

			this.nextBtn = ig.CallAsset.addFrame(this.bg.size.x * 0.2, this.homeBtn.y, 'ingame/buttons/next-stage', {}, EntityClickBtn);
			this.nextBtn.onClick.add(function(){
				var tempStage = ig.GameData.stage + 1;
				if(tempStage < ig.GameData.totalStages){
					ig.GameData.stage = tempStage;
					ig.game.changePage(LevelGameplay)
				} else {
					ig.game.changePage(LevelMainmenu)
				}
			}, this)
			this.add(this.nextBtn)

			// this.createList();
			this.prepare();
		},

		createList:function(){
			var goalLists = curState().gList.items;
			var isCompleted = true;
			var goalBoxWidth = this.goalBox.width * 0.85
			var boxWidth = goalBoxWidth / 5;
			var totTargetWidth = boxWidth * goalLists.length;
			for(var a = 0; a < goalLists.length; a++){
				var list = goalLists[a];
				var item = ig.CallAsset.addFrameImage(this.goalBox.x, this.goalBox.y, 'game/gem' + list.jewelId);
				item.anchor.setTo(0.5);
				item.scale.setTo(0.8);
				this.add(item)
				item.setProperty();
				
				var startX = this.goalBox.x - (totTargetWidth / 2) + (boxWidth/2)
				item.x = startX + (boxWidth * a)

				var sign = ig.CallAsset.addFrameImage(item.x + (item.width * item.scale.x * 0.4), item.y + (item.height * item.scale.y * 0.35), 'game/result-uncomplete');
				sign.anchor.setTo(1);
				// list.itemLeft = 0
				if(list.itemLeft == 0){
					sign.frameName = 'game/result-complete'
				} else {
					isCompleted = false
				}
				this.add(sign)
			}

			if(!isCompleted){
				this.showScore.setText('---')
				this.nextBtn.inputEnabled = false;
				this.nextBtn.frameName = 'ingame/buttons/next-stage-off';

				var highScore = '---';
				if(ig.GameData.stage < ig.game.sessionData.highScores.length){
					highScore = ig.game.sessionData.highScores[ig.GameData.stage];
				} 

				this.showHigh.setText(ig.game.writeThousands(highScore))
			} else {
				var score = curState().plScore;
				this.showScore.setText(ig.game.writeThousands(score))
				
				var highScore = score;
				if(ig.GameData.stage < ig.game.sessionData.highScores.length){
					highScore = ig.game.sessionData.highScores[ig.GameData.stage];
					if(score > highScore){
						highScore = score;
						ig.game.sessionData.highScores[ig.GameData.stage] = highScore
						ig.game.save('highScores', ig.game.sessionData.highScores);
					}
				} else {
					ig.game.sessionData.highScores.push(highScore)
					ig.game.save('highScores', ig.game.sessionData.highScores);
				}
				this.showHigh.setText(ig.game.writeThousands(highScore))
			}

			this.isCompleted = isCompleted
		}, 

		prepare:function(){
			// this.update();
			this.alpha = 0;
			this.y = -this.size.y * 0.6;
		},

		tweenIn:function(){
			if(this.isIn) return;
			this.isIn = true;
			this.createList();
			curState().greyBg.alpha = 1;
			curState().greyBg.visible = true;

			var timer = 300;
			var tween = new ig.TweenDef(curState().greyBg)
			.to({alpha:1}, timer)
			.onComplete(this.tweenStars.bind(this))
			.start();

			var tweenIn = new ig.TweenDef(this)
			.to({alpha:1, y:curState().centerY}, timer)
			.start();
		},

		tweenStars:function(){
			var totStar = 0;
			for(var a = 0; a < curState().stars.length; a++){
				var star = curState().stars[a];
				if(star.inState == 'on'){
					totStar++
				}
			}

			if(this.isCompleted){
				if(ig.GameData.stage < ig.game.sessionData.unlockedStages.length){
					var stars = ig.game.sessionData.unlockedStages[ig.GameData.stage];
					if(totStar > stars){
						ig.game.sessionData.unlockedStages[ig.GameData.stage] = totStar;
						ig.game.save('unlockedStages', ig.game.sessionData.unlockedStages);
					}
				} else {
					ig.game.sessionData.unlockedStages.push(totStar);
					ig.game.save('unlockedStages', ig.game.sessionData.unlockedStages);
				}
			} else {
				totStar = 0;
			}

			for(var a = 0; a < totStar; a++){
				var star = this.stars[a].starOn;
				var timer = 200;
				var delay = a * timer;
				var tween2 = new ig.TweenDef(star.scale)
				.to({x:1,y:1},timer);

				var tween = new ig.TweenDef(star.scale)
				.to({x:1.2,y:1.2},timer)
				.delay(delay)
				.onStart(function(){
					csound.sfxPlay('starpop')
				}.bind(this))
				tween.chain(tween2);
				tween.start();
			}
		},

		update:function(){
			this.parent();

			var border = 270;
			if(this.showScore.width >= border && this.showScore.scale.x == 1){
				this.showScore.scale.setTo(border/this.showScore.width);
			}

			if(this.showHigh.width >= border && this.showHigh.scale.x == 1){
				this.showHigh.scale.setTo(border/this.showHigh.width)
			}
		}
	})
})