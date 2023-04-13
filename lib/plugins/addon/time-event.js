ig.module('plugins.addon.time-event')
.requires('plugins.addon.add-signal')
.defines(function(){
	ig.CustomTime = ig.Class.extend({
		init:function(){
            // this.physicsElapsedMS = (1 / 60) * 1000;
            this._desiredFps = 60
            this.physicsElapsed = 1 / 60
            this.physicsElapsedMS = this.physicsElapsed * 1000;
        },

        setTime: function (value) {
            this._desiredFps = value
            this.physicsElapsed = 1 / value;
            this.physicsElapsedMS = this.physicsElapsed * 1000;
        },

        update: function () {
            var value = 1 / ig.system.tick;
            if (value != this._desiredFps) {
                this.setTime(value)
            }
        },
	});
	
	ig.TimeEvent = ig.Class.extend({
		events : [],
		add:function(timeDur, callback, bindObject, isLooping){
			//timedur should be in seconds
			isLooping = isLooping ? isLooping : false;

			var event = {
				curTime : 0, 
				duration : timeDur, 
				callFunction : callback, 
				bindObject : null,
				isLooping : isLooping, 
				loopCount : 0,
				isPaused : false,
			};

			event.callFunction = new ig.AddSignal(event);
			event.callFunction.add(callback, bindObject);
			event.bindObject = bindObject;

			this.events.push(event);

			return event;
		},

		pauseAll:function(){
			for(var a = 0; a < this.events.length; a++){
				var event = this.events[a];
				event.isPaused = true;
			}
		},

		resumeAll:function(){
			for(var a = 0; a < this.events.length; a++){
				var event = this.events[a];
				event.isPaused = false;
			}
		},

		pause:function(event){
			event.isPaused = true;
		},

		resume:function(event){
			event.isPaused = false;
		},

		remove:function(event){
			var idx = this.events.indexOf(event);
			if(idx < 0) return;
			this.events.splice(idx, 1);
		},

		removeAll:function(){
			this.events = [];
		},

		updateEvent:function(event){
			if(event.isPaused) return;
			if(event.curTime < event.duration){
				var countMS = ig.game.customTime.physicsElapsedMS * 0.001;
				event.curTime += countMS;
				if(event.curTime >= event.duration){
					event.callFunction.dispatch();
					if(event.isLooping){
						event.curTime = 0;
						event.loopCount++;
					} else {
						this.remove(event);
					}
				}
			}
		},

		update:function(){
			for(var a = 0; a < this.events.length; a++){
				var event = this.events[a];
				this.updateEvent(event);
			}
		},
	});
});