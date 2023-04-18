ig.module('game.entities.objects.item-list')
.requires(
	'game.entities.addon.group'
	,'game.entities.objects.canvas-itemlist'
)
.defines(function(){
	EntityItemList = EntityGroup.extend({
		maxItems : 0,
		itemLists:[],
		init:function(x, y, settings){
			this.parent(x, y, settings);
			this.create();
		},

		create:function(){
			this.isCompleted = false;

			// var pieceTypes = [];
			// var max = 2 + ig.GameData.stage;
			// if(max > curState().pieceTypes.length) max = curState().pieceTypes.length;
			// if(max > 5) max = 5;
			// for(var a = 0; a < max; a++){				
			// 	var id = null;
			// 	while(!id){
			// 		var temp = ig.game.rnd.pick(curState().pieceTypes)
			// 		if(pieceTypes.indexOf(temp) < 0){
			// 			id = temp;
			// 		}
			// 	}

			// 	pieceTypes.push(id);
			// }

			// this.itemLists = curState().itemLists;

			this.listBox = ig.game.spawnEntity(EntityCanvasItemlist, 0, 0);
			this.listBox.anchor.setTo(0.5);
			this.add(this.listBox)

			// this.itemBox = ig.CallAsset.addFrameImage(this.listBox.size.x * 0.5, -4, 'game/woodplate-box');
			// this.itemBox.anchor.setTo(0.5);
			// this.itemBox.x -= (this.itemBox.size.x * 0.52);
			// this.add(this.itemBox)

			var listBoxData = ig.CallAsset.searchSpriteData('game/woodplate')
			var itemBoxData = ig.CallAsset.searchSpriteData('game/woodplate-box')
			var tileData = ig.CallAsset.searchSpriteData('game/tile')

			this.items = [];
			var itemsPos = this.listBox.image.itemsPos;
			for(var a = 0; a < this.itemLists.length; a++){
				var id = this.itemLists[a];
				var pos = itemsPos[a];

				var icon = ig.CallAsset.addFrameImage(pos.x, pos.y, 'game/gem' + id);
				icon.anchor.setTo(0.5);
				icon.scale.setTo(pos.scale)
				icon.jewelId = id;
				this.add(icon);
				
				icon.itemLeft = 10;
				var txt = ig.game.addText(icon.x + (tileData.frame.w * icon.scale.x * 0.4), icon.y + (itemBoxData.frame.h * 0.4), icon.itemLeft + '', 32, fonts.font1);
				txt.anchor.setTo(0.5, 1);
				txt.align = 'center';
				this.add(txt);

				icon.showLeft = txt;
				icon.visible = false;

				// this.remove(icon)
				// icon.groupParent = this;
				this.items.push(icon)
			}
		},

		checkId:function(id){
			var isExist = false;
			for(var a = 0; a < this.items.length; a++){
				var item = this.items[a];
				if(id == item.jewelId) isExist = true;
			}

			return isExist;
		},

		update:function(){
			this.parent();

			var listComplete = 0;
			for(var a = 0; a < this.items.length; a++){
				var icon = this.items[a];
				icon.showLeft.setText(icon.itemLeft)
				if(icon.itemLeft <= 0){
					listComplete++;
				}
			}

			if(!curState().gBoard.checkAllMovement()){
				if(listComplete == this.items.length){
					this.isCompleted = true;
					if(!curState().gameOver && !curState().gamePaused){
						// console.log('list complete')
						curState().gamePaused = true;
						curState().pauseBtn.inputEnabled = false;
						curState().lastCall();
					}
				}
			}
		},

		draw:function(){
			this.parent();
		}
	})
})