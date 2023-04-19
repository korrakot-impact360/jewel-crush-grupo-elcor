ig.module('game.entities.addon.custom-text')
.requires(
	'game.entities.addon.custom-entity',
	'plugins.addon.add-signal'
)
.defines(function(){
	EntityCustomText = EntityCustomEntity.extend({
		name : "Text",
		fontType:'',
		fontSize:12,
		lineSpacing : 0,
		fill : '#ffffff',
		wordWrap : false,
		wordWrapWidth : 0,
		letterSpacing:0,
		// wordSpacing:0,
		isJustified:false,

		offsetHeight:0,
		offsetWidth:0,
		textOffsetX:0,
		textOffsetY:0,

		stroke:"black",
		strokeThickness:0,

		lines:[],

		miterLimit:2,

		textAnchor:{		
			x : 0,
			y : 0,
		},

		exists : true,

		separator: ' ',	//for wordWrap sign, if using alphabet usually its separated by space, but language like japanese and chinese doesnt use space for separator, so you can set it to ''

		showText : '',
		align : 'left',
		style : {
			enableShadow : false,
			shadowOffsetX : 0,
			shadowOffsetY : 0,
			shadowColor : 'black',
			shadowBlur : 0,
			shadowStroke : false,
			shadowFill : false,
		},

		textReady:false,
		gradientData:{
			enabled:false,
			colorStopper:[],	//{stopper:0, color:'red'}, {stopper:0.2, color:'white'}
			typeGradient : "linear", //linear, circular
			gradientPos:{x1:0, y1:0, x2:0, y2:0},	//local pos 
			gradient:null,
		},

		init:function(x, y, settings){
			this.x = x;
			this.y = y;
			this.parent(x, y, settings);
			this.showText = '';

			this.onClick = new ig.AddSignal(this);
			this.onRelease = new ig.AddSignal(this);

			this.textCanvas = ig.$new('canvas');
		},

		inputProperty:function(lineText, size, font){
			// debugger;
			this.showText = lineText;
			// console.log(lineText, this.showText)
			this.fontSize = size;
			this.fontType = font;
			this.updateText();
			// var size = this.setLength();
			// this.size.x = size.x;
			// this.size.y = size.y;

			// console.log(lineText, this.pos)
		},

		setShadow:function(x, y, color, blur, shadowStroke, shadowFill){
			if (x === undefined) { x = 0; }
		    if (y === undefined) { y = 0; }
		    if (color === undefined) { color = 'rgba(0, 0, 0, 1)'; }
		    if (blur === undefined) { blur = 0; }
		    if (shadowStroke === undefined) { shadowStroke = true; }
		    if (shadowFill === undefined) { shadowFill = true; }

		    this.style.shadowOffsetX = x;
		    this.style.shadowOffsetY = y;
		    this.style.shadowColor = color;
		    this.style.shadowBlur = blur;
		    this.style.shadowStroke = shadowStroke;
		    this.style.shadowFill = shadowFill;
		    this.style.enableShadow = true;

		    return this;
		},

		checkLines:function(){
		    var result = '';
		    try {
			    var text = this.showText;
			    var lines = text.split('\n');
		    } catch (err) {
		    	throw "text not detected";
		    }
		    
		    var maxWidth = null;
		    var text = this.showText;
		    var lines = text.split('\n');

		    // if(this.showText == _STRINGS['Game']['comingsoon'] && this.visible){
		    // 	console.log(lines)
		    // }

		    if(!this.wordWrap){
		    	return text;
		    } else {			    	
				var context = this.textCanvas.getContext('2d');

				var fontSize = this.fontSize;
				var style = fontSize + 'px ' + this.fontType;

				context.save();
				context.font = style;
				if(this.strokeThickness > 0){
					context.strokeStyle = this.stroke;
					context.lineWidth = this.strokeThickness;
				}

			    for(var a = 0; a < lines.length; a++){
			    	var line = lines[a];
			    	var words = line.split(this.separator);
		    		var lineWidth = 0;

			    	for(var b = 0; b < words.length; b++){
			    		var word = words[b];

	    				var space = '';
	    				if(b > 0){
	    					space = this.separator;
	    				}

	    				var tempTxt = space + word;
			    		var spaceWidth = context.measureText(tempTxt).width;
			    		var alphabetWidth = (tempTxt.length - 1) * this.letterSpacing
			    		lineWidth += spaceWidth + alphabetWidth;

		    			if(lineWidth >= this.wordWrapWidth && b > 0){
		    				tempTxt = '\n' + word;
		    				lineWidth = context.measureText(word).width;
		    			} 

	    				result += tempTxt;
			    	}

			    	if(a < lines.length - 1){
				    	result += '\n';
			    	}
			    }
			    
			    context.restore();
			    // debugger;
			    return result;
		    }
		},		

		updateText:function(){
			this.lines = [];
			var text = this.checkLines();
			var lines = text.split('\n');
			for(var a = 0; a < lines.length; a++){
				var line = lines[a];
				this.lines.push(line);
			}

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
		},

		getDimension:function(){
			// console.log(context.font);
			// debugger;

			var context = this.textCanvas.getContext('2d');
			var style = this.fontSize + 'px ' + this.fontType;

			context.save();
			context.font = style;

			var maxWidth = null;
			var height = 0;
			for(var a = 0; a < this.lines.length; a++){
				var line = this.lines[a];
				var width = 0;
				for(var b = 0; b < line.length; b++){
					var alphabetWidth = context.measureText(line[b]).width;
					// width += alphabetWidth + this.strokeThickness;
					width += alphabetWidth;
				}

				var letterSpacing = (line.length - 1) * this.letterSpacing
				width += letterSpacing;

				if(!maxWidth){
					maxWidth = width;
				} else {
					if(width > maxWidth){
						maxWidth = width;
					}
				}

				// debugger;
				var lineSpacing = 0
				if(a < this.lines.length - 1){
					lineSpacing = this.lineSpacing
				}
				height += (this.fontSize + lineSpacing);
			}

			context.restore();

			this.width = maxWidth + this.strokeThickness + this.offsetWidth;
			this.height = height + this.strokeThickness + this.offsetHeight;

			this.textCanvas.width = this.width;
			this.textCanvas.height = this.height;
		},

		setLength:function(){			
			var tempWidth = this._scale.x * this.width;
			var tempHeight = this._scale.y * this.height;
			var tempVector = this.groupParent ? ig.World.getGlobalDimension(this.groupParent, tempWidth, tempHeight) : {width:tempWidth, height:tempHeight};
			return {x:tempVector.width, y:tempVector.height}
		},

		setScale:function(x, y){
			this.scale.setTo(x, y);
			this.lastScale.setTo(x, y);
			this._scale.setTo(Math.abs(x), Math.abs(y));
		},

		setText:function(text){
			var temp = text + "";
			this.showText = temp;
		},

		getBounds:function(){
			var posX = this.pos.x;
			var posY = this.pos.y;
			var sizeX = this.size.x;
			var sizeY = this.size.y;

			var bound = ig.game.geom.rectangle(posX, posY, sizeX, sizeY)
			var minX = bound.x;
			var maxX = bound.right;
			var minY = bound.y;
			var maxY = bound.bottom;

			var bound = this.parent(minX, maxX, minY, maxY)
			return bound;
		},

		setProperty:function(){
			var sizeX = this.width;
			var sizeY = this.height;

			var normalX = -(sizeX * this.anchor.x);
			var normalY = -(sizeY * this.anchor.y);

			var bound = ig.game.geom.rectangle(normalX, normalY, sizeX, sizeY);
			var points = [];
			points[0] = {x:bound.x, y:bound.y};
			points[1] = {x:bound.right,y:bound.y};
			points[2] = {x:bound.right,y:bound.bottom};
			points[3] = {x:bound.x,y:bound.bottom};

			for(var a = 0; a < points.length; a++){
				var pos = ig.World.parentPos(this, points[a].x, points[a].y);
				points[a] = {x:pos.x,y:pos.y};
			}

			var box = ig.World.getBounds(points)

			this.pos.x = box.x;
			this.pos.y = box.y;

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(this.pos.x, this.pos.y, ig.game.anchorType)
				this.pos.x = anchorPos.x;
				this.pos.y = anchorPos.y;
			}

			this.size.x = box.width;
			this.size.y = box.height;

			var _tempScaleX = this.lastScale.x;
			var _tempScaleY = this.lastScale.y;
			var curScaleX = this.scale.x;
			var curScaleY = this.scale.y;

			if(curScaleX != _tempScaleX || curScaleY != _tempScaleY){
				this.scale.x = parseFloat(this.scale.x.toFixed(3));
				this.scale.y = parseFloat(this.scale.y.toFixed(3));
				this.setScale(this.scale.x, this.scale.y)
			}

			if(this.position.x != this.x || this.position.y != this.y){
				this.position.setTo(this.x, this.y);
			}

			if(this.angle != this._angle){
				this.setAngle(this.angle);
			}

			if(this.rotation != this._rotation){
				this.setRotation(this.rotation);
			}
		},

		addChild:function(child){
			child.groupParent = this;
			this.children.push(child);
			ig.game.checkZIndexGroups();
		},
		
		removeChild:function(child){
			var idx = this.children.indexOf(child);
			this.children.splice(idx, 1);
			child.zIndex = -1;
			child.groupParent = null;

			ig.game.checkZIndexGroups();
		},

		checkPointer:function(){
			if(!this.inputEnabled) return;
			var thisBound = ig.game.geom.rectangle(this.pos.x, this.pos.y, this.size.x, this.size.y);
			var pointer = ig.game.pointer.pos;
			if(pointer.x >= thisBound.x && pointer.x <= thisBound.right){
				if(pointer.y >= thisBound.y && pointer.y <= thisBound.bottom){
					ig.game.pointer.check(this);
				}
			}
		},

		update:function(){
			this.updateOtherEntities()
			
			if(!this.exists) return;
			if(ig.game && ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}

			this.sorting();			

			this.updateText();
			this.setProperty();
			this.updateChildren();
			this.checkPointer();

			if(this.isClicked){
				if(!ig.input.state('click')){
					this.released();
				}
			}
		},

		setGradient:function(x1, y1, x2, y2, colorStopper, typeGradient, r1, r2){
			typeGradient = typeGradient ? typeGradient : "linear";
			this.gradientData.enabled = true
			this.gradientData.gradientPos = {x1:x1, y1:y1, x2:x2, y2:y2, r1:r1, r2:r2}
			this.gradientData.colorStopper = colorStopper
			this.gradientData.typeGradient = typeGradient
			// console.log(this.gradientData)
		},

		draw:function(){
			this.drawOtherEntities()
			
			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}

			if(!this.visible) return;
			if(!Math.floor(this.size.x) || !Math.floor(this.size.y)) return;

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}

			var parentPos = this.groupParent ? ig.game.parentPos(this.groupParent) : {x:0, y:0};
			var parentX = parentPos.x;
			var parentY = parentPos.y;
			var targetX = parentX + this.x - screenX;
			var targetY = parentY + this.y - screenY;

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(targetX, targetY, ig.game.anchorType)
				targetX = anchorPos.x;
				targetY = anchorPos.y;			
			}

			var flipX = 1;
			var flipY = 1;
			if(this.scale.x < 0) flipX = -1;
			if(this.scale.y < 0) flipY = -1;

			var context = ig.system.context;
			context.save();

			if( this.alpha != 1) {
				ig.system.context.globalAlpha *= this.alpha;
			}
						
			context.translate(
				ig.system.getDrawPos(targetX),
				ig.system.getDrawPos(targetY)
			);

			context.rotate(this.rotation);
			context.scale(this._scale.x, this._scale.y);

			if(flipX < 0 || flipY < 0){
				context.save();
				context.scale(flipX, flipY);
			}

			var sizeX = this.width;
			var sizeY = this.height;
			var imgX = (sizeX * this.anchor.x);
			var imgY = (sizeY * this.anchor.y);
			context.save()
			context.translate(-imgX, -imgY)

			this.drawTextContext()
			this.drawTextCanvas()

			context.restore()

			context.translate(
				ig.system.getDrawPos(-targetX),
				ig.system.getDrawPos(-targetY)
			);

			this.drawChildren();

			if(flipX < 0 || flipY < 0){
				context.restore();
			}

			context.restore();
		},

		drawTextCanvas:function(){
			if(!Math.floor(this.textCanvas.width) || !Math.floor(this.textCanvas.height)) return;
			var context = ig.system.context;
			context.drawImage(this.textCanvas, 0, 0, this.textCanvas.width, this.textCanvas.height, 0, 0, this.textCanvas.width, this.textCanvas.height)
		},

		drawTextContext:function(){
			var context = this.textCanvas.getContext('2d');
			context.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height)

			context.save()

			var fontSize = this.fontSize;
			var style = fontSize + 'px ' + this.fontType;

			if(this.gradientData.enabled){
				var pos = this.gradientData.gradientPos

				if(this.gradientData.typeGradient == 'linear'){
					var gradient = context.createLinearGradient(pos.x1, pos.y1, pos.x2, pos.y2);
				} else {
					var gradient = context.createRadialGradient(pos.x1, pos.y1, pos.r1, pos.x2, pos.y2, pos.r2)
				}

				var colorStopper = this.gradientData.colorStopper
				for(var a = 0; a < colorStopper.length; a++){
					var colorData = this.gradientData.colorStopper[a];
					gradient.addColorStop(colorData.stopper, colorData.color)
				}
				
				var fill = gradient;
			} else {
				var fill = this.fill
			}

			context.fillStyle = fill;
			context.textBaseline = 'alphabetic';
			context.font = style;
			// context.textAlign = this.align;
			context.textAlign = 'left'
			context.miterLimit = this.miterLimit

			var pivotTxt = (this.width * this.textAnchor.x);
			var pivotX = pivotTxt;
			var pivotY = 0;

			var targetX = pivotX + this.textOffsetX;
			var targetY = pivotY + this.textOffsetY;

			if(this.style.enableShadow){
				context.save();
				context.shadowOffsetX = this.style.shadowOffsetX;
		        context.shadowOffsetY = this.style.shadowOffsetY;
		        context.shadowColor = this.style.shadowColor;
		        context.shadowBlur = this.style.shadowBlur;
			}
			
			this.drawText(targetX, targetY, true)

			if(this.style.enableShadow && this.strokeThickness > 0){
				context.restore();
			}

			this.drawText(targetX, targetY)

			if(this.style.enableShadow && this.strokeThickness <= 0){
				context.restore();
			}

			context.restore()
		},

		drawText:function(targetX, targetY, drawStrokeMode){
			// var context = ig.system.context
			var context = this.textCanvas.getContext('2d');
			for(var a = 0; a < this.lines.length; a++){
				var line = this.lines[a];

				var totAlphabets = line.length;
				var lineHeight = this.fontSize + this.lineSpacing;
				var lineWidth = context.measureText(line).width;
				var totletterSpacingWidth = (totAlphabets - 1) * this.letterSpacing;
				var totLineWidth = lineWidth + totletterSpacingWidth;

				var y = targetY + (0.8 * this.fontSize) + (a * lineHeight);

				var alphabetX = 0;
				if(this.align == 'left' || this.align == 'center'){
					for(var b = 0; b < totAlphabets; b++){
						var alphabet = line[b]
						var alphabetWidth = context.measureText(alphabet).width
						var totAlphabetWidth = alphabetWidth + this.letterSpacing;
						var x = targetX + alphabetX;
						if(this.align == 'center'){
							x = targetX - (totLineWidth / 2) + alphabetX
						}

						if(this.strokeThickness > 0){
							x += (this.strokeThickness/2)
						}

						if(drawStrokeMode){
							this.drawStroke(x, y, alphabet)
						} else {
							context.fillText(alphabet, x, y)
						}

						alphabetX += totAlphabetWidth;
						// console.log(alphabetWidth + this.letterSpacing)
					}
				} else if(this.align == 'right'){
					for(var b = totAlphabets - 1; b >= 0; b--){
						var alphabet = line[b];
						var alphabetWidth = context.measureText(alphabet).width
						var totAlphabetWidth = alphabetWidth + this.letterSpacing;

						var x = targetX - alphabetX - alphabetWidth;

						if(this.strokeThickness > 0){
							x += (this.strokeThickness/2)
						}

						if(drawStrokeMode){
							this.drawStroke(x, y, alphabet)
						} else {
							context.fillText(alphabet, x, y)
						}

						alphabetX += totAlphabetWidth;
					}
				}

			}
		},

		drawStroke:function(x, y, text){
			// var context = ig.system.context;
			var context = this.textCanvas.getContext('2d')
			if(this.strokeThickness > 0){
				context.strokeStyle = this.stroke;
				context.lineWidth = this.strokeThickness;
				context.strokeText(text, x, y);
			}	
		},

		clicked:function(){
			if(this.isClicked) return;
			this.isClicked = true;		
			this.onClick.dispatch(this);	
		},

		released:function(){
			if(!this.isClicked) return;
			this.isClicked = false;
			this.onRelease.dispatch(this);
		},
	});
});