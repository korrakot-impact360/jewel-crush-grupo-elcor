ig.module('plugins.addon.add-signal')
.defines(function(){
	ig.AddSignal = ig.Class.extend({
		init:function(bindObject){
			this.events = [];
			this.bindObject = bindObject;
		},

		add:function(callFunction, bindObject){
			if(typeof callFunction !== 'function') {
				throw "Argument not a function";
				return;
			}
			
			this.events.push(callFunction.bind(bindObject));
		},

		dispatch:function(){
			for(var a = 0; a < this.events.length; a++){
				var event = this.events[a];
				event(this.bindObject);
			}
		},
	});
});