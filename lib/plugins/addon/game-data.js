ig.module('plugins.addon.game-data')
.defines(function(){
	ig.GameData = {		
		totalStages : 30,
		stage : 6,
		fps:60,

		defaultMoves : 10,
		defaultScore : 1000,
		defaultMove : 10,
		defPieceScore : 50,

		trialMode:true,

		unlockPowerUp:[1, 3, 5, 2], //line tutor, bomb tutor, same color tutor, match 4 and more tutor

		stageMaps : [	//dont give any 0 in the middle
			[
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1]
			],
			[				
				[0, 0, 0, 1, 0, 0, 0],
				[0, 0, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 1, 0],
				[1, 1, 1, 1, 1, 1, 1],
				[0, 1, 1, 1, 1, 1, 0],
				[0, 0, 1, 1, 1, 0, 0],
				[0, 0, 0, 1, 0, 0, 0]
			],
			[
				[0, 0, 1, 1, 1, 0, 0],
				[0, 0, 1, 1, 1, 0, 0],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[0, 0, 1, 1, 1, 0, 0],
				[0, 0, 1, 1, 1, 0, 0]
			],
			[			
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 0, 1, 1, 1],
				[1, 1, 0, 0, 0, 1, 1],
				[1, 1, 1, 0, 1, 1, 1],
				[1, 1, 0, 0, 0, 1, 1],
				[1, 1, 1, 0, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1]
			],
			[			
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 0, 1, 0, 1, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 1, 0, 1, 0, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1]
			],
			[
				[0, 0, 1, 0, 1, 0, 0],
				[0, 1, 1, 1, 1, 1, 0],
				[1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1],
				[0, 1, 1, 1, 1, 1, 0],
				[0, 0, 1, 1, 1, 0, 0],
				[0, 0, 0, 1, 0, 0, 0]
			],
		],

		stageMoves:[
			10,
		],

		stageGoals: [
			1000,
		],

		openAllStage:function(){

		},

		openStageUntil:function(until, changePage){
			ig.game.sessionData.unlockedStages = [];
			for(var a = 0; a < until; a++){
				ig.game.sessionData.unlockedStages[a] = 3;
			}

			if(changePage){
				ig.game.changePage(LevelStage)
			}
		},

		nextScore:function(stage){
			var score = ig.GameData.defaultScore + (stage * ig.GameData.defaultScore * 0.8)
			return score;
		},

		decideGoals:function(stage){
			var lists = [];

		},
	};
});