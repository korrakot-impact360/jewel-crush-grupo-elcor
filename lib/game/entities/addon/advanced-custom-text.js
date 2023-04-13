ig.module('game.entities.addon.advanced-custom-text')
.requires('game.entities.addon.custom-text')
.defines(function(){
	EntityAdvancedCustomText = EntityCustomText.extend({		
		textDatas:[],
		inputProperty:function(lineText, size, font){
			if(Array.isArray(lineText)){
				this.textDatas = [];
				var text = ""
				for(var a = 0; a < lineText.length; a++){
					var obj = lineText[a];
					text += obj.text

					this.textDatas.push(obj)
				}

				lineText = text;
			}

			this.parent(lineText, size, font)
		},

		checkLines:function(){
			if(!this.textDatas){
				return this.parent()
			} else {
			    var result = '';
			    try {
				    var text = this.showText;
				    var lines = text.split('\n');
			    } catch (err) {
			    	throw "text not detected";
			    }
			    
			    var maxWidth = null;
			    var	text = [];

				var context = ig.system.context;

				var fontSize = this.fontSize;
				var style = this.fontWeight + ' ' + fontSize + 'px ' + this.fontType;

				context.save();
				context.font = style;
				if(this.strokeThickness > 0){
					context.strokeStyle = this.stroke;
					context.lineWidth = this.strokeThickness;
				}

    			text.push([])
	    		var lineWidth = 0;

				for(var a = 0; a < this.textDatas.length; a++){
					var obj = this.textDatas[a];
					var lines = obj.text.split('\n');
					for(var b = 0; b < lines.length; b++){
						var line = lines[b]
						var words = line.split(' ');

			    		if(b > 0){
			    			lineWidth = 0
			    			text.push([])
			    		}

		    			var wordDatas = text[text.length - 1]

		    			for(var c = 0; c < words.length; c++){
		    				var word = words[c];
		    				if(word.length == 0) continue;

		    				var	space = ' ';
		    				if(a < this.textDatas.length - 1){
		    					if(lines.length > 1){
		    						if(b < lines.length - 1 && c == words.length - 1){
		    							space = ''
		    						}
		    					}
		    				} else {
		    					if(c == words.length - 1){
			    					space = ''
		    					}
		    				}

		    				var tempTxt = word + space;
		    				if(this.wordWrap){
					    		var spaceWidth = context.measureText(tempTxt).width;
					    		lineWidth += spaceWidth;

					    		if(lineWidth >= this.wordWrapWidth){
					    			text.push([])
					    			wordDatas = text[text.length - 1]
				    				lineWidth = spaceWidth;
					    		}
		    				}

			    			var wordData = {text:tempTxt, fill:obj.fill}
			    			wordDatas.push(wordData)
		    			}	
					}
				}

				// debugger
				return text;
			}
		},

		updateText:function(){
			if(!this.textDatas){
				this.parent()
			} else {
				this.lines = this.checkLines();
				// console.log(this.lines)
				// debugger;

				this.textAnchor.x = 0;
				switch(this.align){
					case 'right' :
						this.textAnchor.x = 1;
						break;

					case 'center' :
						this.textAnchor.x = 0.5;
						break;

					case 'left' :
						this.textAnchor.x = 0;
						break;
				}

				this.getDimension();
			}
		},

		getDimension:function(){
			if(!this.textDatas){
				this.parent()
			} else {
				var context = ig.system.context;
				var style = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontType;

				context.save();
				context.font = style;

				var maxWidth = null;
				var height = 0;
				for(var a = 0; a < this.lines.length; a++){
					var line = this.lines[a];
					var width = 0;
					for(var b = 0; b < line.length; b++){
						var obj = line[b]
						var word = obj.text
						var alphabetWidth = context.measureText(word).width;
						// width += alphabetWidth + this.strokeThickness;
						width += alphabetWidth;
					}

					if(!maxWidth){
						maxWidth = width;
					} else {
						if(width > maxWidth){
							maxWidth = width;
						}
					}

					height += (this.fontSize + this.lineSpacing);
				}

				this.width = maxWidth + this.strokeThickness;
				this.height = height + this.strokeThickness;

				context.restore();
			}
		},

		draw:function(){	
			if(!this.textDatas){
				this.parent()
				return;
			}

			if(!this.exists) return;
			if(ig.game && ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}
			if(!this.visible) return;
			// debugger;	

			var parentPos = this.groupParent ? ig.game.parentPos(this.groupParent) : {x:0, y:0};
			var parentX = parentPos.x + this.x;
			var parentY = parentPos.y + this.y;

			var pivotTxt = (this.width * this.textAnchor.x);
			var pivotX = (this.width * this.anchor.x) - pivotTxt;
			var pivotY = (this.height * this.anchor.y);

			var targetX = parentX - pivotX;
			var targetY = parentY - pivotY;
			
			if(ig.game.useResponsive && this.isResponsive){				
				var anchorPos = ig.responsive.toAnchor(targetX, targetY, ig.game.anchorType)
				targetX = anchorPos.x;
				targetY = anchorPos.y;

				var anchorPos = ig.responsive.toAnchor(parentX, parentY, ig.game.anchorType)
				parentX = anchorPos.x;
				parentY = anchorPos.y;		
			}

			var flipX = 1;
			var flipY = 1;
			if(this.scale.x < 0) flipX = -1;
			if(this.scale.y < 0) flipY = -1;

			var context = ig.system.context;
			var fontSize = this.fontSize;
			var style = this.fontWeight + ' ' + fontSize + 'px ' + this.fontType;

			context.save();
			
			if( this.alpha != 1) {
				context.globalAlpha = this.alpha;
			}

			context.translate(
				ig.system.getDrawPos(parentX),
				ig.system.getDrawPos(parentY)
			);

			context.rotate( this.rotation );

			context.scale(this._scale.x, this._scale.y);

			if(flipX < 0 || flipY < 0){
				context.save();
				context.scale(flipX, flipY);
			}

			context.translate(
				ig.system.getDrawPos(-parentX),
				ig.system.getDrawPos(-parentY)
			);
			// context.scale(this.scale.x, this.scale.y);

			context.textBaseline = 'alphabetic';
			context.font = style;
			context.textAlign = 'left';
			context.miterLimit = this.miterLimit

			if(this.style.enableShadow){
				context.save();
				context.shadowOffsetX = this.style.shadowOffsetX;
		        context.shadowOffsetY = this.style.shadowOffsetY;
		        context.shadowColor = this.style.shadowColor;
		        context.shadowBlur = this.style.shadowBlur;
			}
			
			for(var a = 0; a < this.lines.length; a++){
				var line = this.lines[a];

				var wordHeight = this.fontSize + this.lineSpacing;
				var y = targetY - this.lineSpacing + (0.8 * wordHeight) + (a * wordHeight);

				var lineWidth = 0
				for(var b = 0; b < line.length; b++){
					var obj = line[b]
					var word = obj.text;
					var wordWidth = context.measureText(word).width

					lineWidth += wordWidth
				}

				var lineX = targetX - (lineWidth * this.textAnchor.x)
				lineWidth = 0
				for(var b = 0; b < line.length; b++){
					var obj = line[b]
					var word = obj.text

					var wordX = lineX + lineWidth

					var wordWidth = context.measureText(word).width

					if(this.strokeThickness > 0){
						context.strokeStyle = this.stroke;
						context.lineWidth = this.strokeThickness;
						context.strokeText(word, wordX, y);
					}		

					lineWidth += wordWidth	
				}
			}	

			if(this.style.enableShadow && this.strokeThickness > 0){
				context.restore();
			}

			for(var a = 0; a < this.lines.length; a++){
				var line = this.lines[a];

				var wordHeight = this.fontSize + this.lineSpacing;
				var y = targetY - this.lineSpacing + (0.8 * wordHeight) + (a * wordHeight);

				var lineWidth = 0
				for(var b = 0; b < line.length; b++){
					var obj = line[b]
					var word = obj.text;
					var wordWidth = context.measureText(word).width

					lineWidth += wordWidth
				}

				var lineX = targetX - (lineWidth * this.textAnchor.x)
				lineWidth = 0
				for(var b = 0; b < line.length; b++){
					var obj = line[b]
					var word = obj.text

					var wordX = lineX + lineWidth

					var wordWidth = context.measureText(word).width

					context.fillStyle = obj.fill;
					context.fillText(word, wordX, y);
					
					lineWidth += wordWidth	
				}
			}

			if(this.style.enableShadow && this.strokeThickness <= 0){
				context.restore();
			}

			this.drawChildren();

			if(flipX < 0 || flipY < 0){
				context.restore();
			}
				
			if( this.alpha != 1) {
				context.globalAlpha = 1;
			}

			context.restore();
		},
	})
})