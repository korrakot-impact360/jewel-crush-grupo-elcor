ig.module('game.entities.objects.item-list')
.requires('game.entities.addon.group')
.defines(function(){
	EntityItemList = EntityGroup.extend({
		maxItems : 0,
		init:function(x, y, settings){
			this.parent(x, y, settings);
			this.create();
		},

		create:function(){
			this.isCompleted = false;

			var pieceTypes = [];
			var max = 2 + ig.GameData.stage;
			if(max > curState().pieceTypes.length) max = curState().pieceTypes.length;
			if(max > 5) max = 5;
			for(var a = 0; a < max; a++){				
				var id = null;
				while(!id){
					var temp = ig.game.rnd.pick(curState().pieceTypes)
					if(pieceTypes.indexOf(temp) < 0){
						id = temp;
					}
				}

				pieceTypes.push(id);
			}

			this.itemLists = pieceTypes;

			this.listBox = ig.CallAsset.addFrameImage(0, 0, 'game/woodplate');
			this.listBox.anchor.setTo(0.5);
			// this.add(this.listBox)

			this.itemBox = ig.CallAsset.addFrameImage(this.listBox.size.x * 0.5, -4, 'game/woodplate-box');
			this.itemBox.anchor.setTo(0.5);
			this.itemBox.x -= (this.itemBox.size.x * 0.52);
			// this.add(this.itemBox)

			this.items = [];
			for(var a = 0; a < max; a++){
				var id = pieceTypes[a];

				var icon = ig.CallAsset.addFrameImage(0, this.itemBox.y, 'game/gem' + id);
				icon.anchor.setTo(0.5);
				icon.setScale(0.5)
				icon.jewelId = id;
				this.add(icon);

				icon.x = this.itemBox.x - ((this.itemBox.size.x / 5.5) * 2) + ((this.itemBox.size.x / 5.5) * a);
				
				icon.itemLeft = 10;
				var txt = ig.game.addText(icon.x + (icon.width * icon.scale.x * 0.5), icon.y + (icon.height * icon.scale.y * 0.5), icon.itemLeft + '', 16, fonts.font1);
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