ig.module('plugins.addon.text-plugin')
.defines(function(){
	ig.TextPlugin = ig.Class.extend({
		textSettings:{
			fontSize:20,
			fontType:'Arial',
			wordWrapWidth:100,
			letterSpacing:0,
			lineSpacing:0,
			separator:' ',
			align:'left',
			fill:'black'
		},

		init:function(settings){
			this.setTextSettings(settings)
		},

		setTextSettings:function(settings){
			ig.merge(this.textSettings, settings)
		},

		wordWrapText:function(fullText, context){	
			var textSettings = this.textSettings;

		    var result = '';
		    try {
			    var text = fullText;
			    var lines = text.split('\n');
		    } catch (err) {
		    	throw "text not detected";
		    }
		    
		    var maxWidth = null;

			var context = context ? context : ig.system.context;

			var fontSize = textSettings.fontSize;
			var style = fontSize + 'px ' + textSettings.fontType;

			context.save();
			context.font = style;

		    for(var a = 0; a < lines.length; a++){
		    	var line = lines[a];
		    	var words = line.split(textSettings.separator);
	    		var lineWidth = 0;

		    	for(var b = 0; b < words.length; b++){
		    		var word = words[b];

    				var space = '';
    				if(b > 0){
    					space = textSettings.separator;
    				}

    				var tempTxt = space + word;
		    		var spaceWidth = context.measureText(tempTxt).width;
		    		var alphabetWidth = (tempTxt.length - 1) * textSettings.letterSpacing
		    		lineWidth += spaceWidth + alphabetWidth;

	    			if(lineWidth >= textSettings.wordWrapWidth){
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

		    var textLines = result.split('\n')
		    return textLines;		    
		},

		drawWrappedText:function(textLines, targetX, targetY, context){
			var textSettings = this.textSettings;

			var context = context ? context : ig.system.context;

			context.save()

			var fontSize = textSettings.fontSize;
			var style = fontSize + 'px ' + textSettings.fontType;
			context.font = style;
			context.fillStyle = textSettings.fill;
			context.textBaseline = 'alphabetic';
			context.textAlign = 'left'

			var lines = textLines

			for(var a = 0; a < lines.length; a++){
				var line = lines[a];

				var totAlphabets = line.length;
				var lineHeight = textSettings.fontSize + textSettings.lineSpacing;
				var lineWidth = context.measureText(line).width;
				var totletterSpacingWidth = (totAlphabets - 1) * textSettings.letterSpacing;
				// console.log(totletterSpacingWidth)
				var totLineWidth = lineWidth + totletterSpacingWidth;

				var y = targetY + (fontSize * 0.8) + (a * lineHeight);

				var alphabetX = 0;
				if(textSettings.align == 'left' || textSettings.align == 'center'){
					for(var b = 0; b < totAlphabets; b++){
						var alphabet = line[b]
						var alphabetWidth = context.measureText(alphabet).width
						var totAlphabetWidth = alphabetWidth + textSettings.letterSpacing;
						var x = targetX + alphabetX;
						if(textSettings.align == 'center'){
							// console.log(textSettings.align)
							x = targetX - (totLineWidth / 2) + alphabetX
						}

						context.fillText(alphabet, x, y)

						alphabetX += totAlphabetWidth;
						// console.log(alphabetWidth + this.letterSpacing)
					}
				} else if(textSettings.align == 'right'){
					for(var b = totAlphabets - 1; b >= 0; b--){
						var alphabet = line[b];
						var alphabetWidth = context.measureText(alphabet).width
						var totAlphabetWidth = alphabetWidth + textSettings.letterSpacing;

						var x = targetX - alphabetX - alphabetWidth;

						context.fillText(alphabet, x, y)

						alphabetX += totAlphabetWidth;
					}
				}
			}

			context.restore()
		},
	})
})