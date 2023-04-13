ig.module('plugins.addon.sprite-animation')
.requires('plugins.addon.raw-image')
.defines(function(){
	ig.SpriteAnimationSheet = ig.RawImage.extend({
		init:function(x, y, path, settings){
			// this.parent(x, y, path, settings);
			this.parent(path, settings);
			this.x = x;
			this.y = y;
			// console.log(this)
		},

		draw:function(x, y){
			if(this.size.x < 1 || this.size.y < 1) {
				this.checkProperties();
				this.setFrame();
				this.spriteParent.width = this.width;
				this.spriteParent.height = this.height;
				this.spriteParent.size.x = this.width;
				this.spriteParent.size.y = this.height;
				return;
			}
			
			if(this.drawSize.x < 1 || this.drawSize.y < 1) return;
			x = !isNaN(x) ? x : 0;
			y = !isNaN(y) ? y : 0;

			this.parent(x, y, this.sourceX, this.sourceY, this.drawSize.x, this.drawSize.y);
		},
	});

	ig.SpriteAnimation = ig.Class.extend({
		timer: null,		
		sequence: [],		
		frame: 0,
		tile: 0,
		loopCount: 0,
		isPlaying:false,
		init:function(sheet, frameTime, sequence, stop, spriteParent ){
			this.spriteParent = spriteParent;

			this.sheet = sheet;
			this.pivot = {x: sheet.width/2, y: sheet.height/2 };
			this.timer = new ig.Timer();

			this.frameTime = frameTime;
			this.sequence = sequence;
			this.stop = !!stop;
			this.tile = this.sequence[0];
			// this.setFrame();

			this.onComplete = new ig.AddSignal(spriteParent);
			this.onLoop = new ig.AddSignal(spriteParent);
			this.onEnterFrame = new ig.AddSignal(spriteParent);
			this.onStart = new ig.AddSignal(spriteParent);

			this.isComplete = false;
			this.isLooping = false;
			this.isStarting = false;
			this.prevFrame = this.frame;

			this.isPaused = false;
		},

		setFrame:function(){
			// console.log(this.prevFrame, this.frame)
			this.sheet.frameName = this.tile;
			this.sheet.setFrame();
			if(this.sheet.frameName == this.tile){
				this.spriteParent.frameName = this.tile;
				this.spriteParent._frameName = this.spriteParent.frameName;
				this.spriteParent.width = this.sheet.width;
				this.spriteParent.height = this.sheet.height;
				this.spriteParent.setScale(this.spriteParent.scale.x, this.spriteParent.scale.y)
			}
		},

		rewind: function() {
			this.timer.set();
			this.loopCount = 0;
			this.frame = 0;
			this.tile = this.sequence[0];
			this.setFrame();

			// this.sheet.frameName = this.tile;
			// this.sheet.setFrame();
			
			// this.spriteParent.frameName = this.tile;
			// this.spriteParent._frameName = this.spriteParent.frameName;
			// this.spriteParent.width = this.sheet.width;
			// this.spriteParent.height = this.sheet.height;
			// this.spriteParent.setScale(this.spriteParent.scale.x, this.spriteParent.scale.y)
			// console.log(this.tile)
			return this;
		},
		
		
		gotoFrame: function( f ) {
			// Offset the timer by one tenth of a millisecond to make sure we
			// jump to the correct frame and circumvent rounding errors
			this.timer.set( this.frameTime * -f - 0.0001 );
			this.update();
		},
		
		
		gotoRandomFrame: function() {
			this.gotoFrame( Math.floor(Math.random() * this.sequence.length) )
		},
		
		
		pause:function(event){
			this.isPaused = true;
		},

		resume:function(event){
			this.timer = new ig.Timer();
			this.isPaused = false;
		},

		update: function() {
			if(this.isPaused) return;
			// console.log('anim update')
			var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
			this.loopCount = Math.floor(frameTotal / this.sequence.length);
			if( this.stop && this.loopCount > 0 ) {
				this.frame = this.sequence.length - 1;
			}
			else {
				this.frame = frameTotal % this.sequence.length;
			}

			this.tile = this.sequence[ this.frame ];

			// this.sheet.update();

			if(this.frame == 0 && this.loopCount == 0){
				if(!this.isStarting){
					this.isStarting = true;
					this.onStart.dispatch();
				}
			} else {
				this.isStarting = false;
			}

			if(this.frame == 0 && this.loopCount > 0){
				if(!this.isLooping){
					this.isLooping = true;
					this.onLoop.dispatch();
				}
			} else {
				if(this.isLooping) this.isLooping = false;
			}

			if(this.prevFrame != this.frame){
				this.prevFrame = this.frame;
				this.setFrame();
				this.onEnterFrame.dispatch();
			}

			if(this.stop && this.loopCount > 0){
				if(!this.isComplete){
					this.isComplete = true;
					this.isPlaying = false;
					this.onComplete.dispatch();
				}
			} else {
				this.isComplete = false;
			}
		},
	});

	ig.GenerateFrameNames = function(prefix, start, stop, suffix, zeroPad){
		if (suffix === undefined) { suffix = ''; }
		    var output = [];
		    var frame = '';
		    if (start < stop)
		    {
		        for (var i = start; i <= stop; i++)
		        {
		        	frame = '';
		            if (typeof zeroPad === 'number')
		            {
		                //  str, len, pad, dir
		                // frame = Phaser.Utils.pad(i.toString(), zeroPad, '0', 1);
		                var str = i.toString();
		                if(str.length < zeroPad){
		                	var gap = zeroPad - str.length;
		                	for(var a = 0; a < gap; a++){
	                			frame += '0';
		                	}
		                }
	                	frame += str;
		            }
		            else
		            {
		                frame = i.toString();
		            }

		            frame = prefix + frame + suffix;

		            output.push(frame);
		        }
		    }
		    else
		    {
		        for (var i = start; i >= stop; i--)
		        {
		            if (typeof zeroPad === 'number')
		            {
		                //  str, len, pad, dir
		                // frame = Phaser.Utils.pad(i.toString(), zeroPad, '0', 1);
		                var str = i.toString();
		                if(str.length < zeroPad){
		                	var gap = zeroPad - str.length;
		                	for(var a = 0; a < gap; a++){
	                			frame += '0';
		                	}
		                }
		                
	                	frame += str;
		            }
		            else
		            {
		                frame = i.toString();
		            }

		            frame = prefix + frame + suffix;

		            output.push(frame);
		        }
		    }

		    return output;
	};
});