ig.module('game.entities.buttons.button')
.requires(
	'impact.entity',
	'plugins.data.vector'
)
.defines(function() {
	EntityButton = ig.Entity.extend({
		collides:ig.Entity.COLLIDES.NEVER,
		type:ig.Entity.TYPE.A,
		size:new Vector2(48,48),
		fillColor:null,
		zIndex:95000,
		
		init:function(x,y,settings){
			this.parent(x,y,settings);
			
			if(!ig.global.wm)
			{
				if(!isNaN(settings.zIndex))
				{
					this.zIndex=settings.zIndex;
				}
			}
			//Pick a random color
			var r=Math.floor(Math.random()*256);
			var g=Math.floor(Math.random()*256);
			var b=Math.floor(Math.random()*256);
			var a=1;
			this.fillColor = "rgba("+r+","+b+","+g+","+a+")";
		},
		clicked:function(){
			console.warn("no implementation on clicked()");
		},
		clicking:function(){
			console.warn("no implementation on clicking()");
		},
		released:function(){
			console.warn("no implementation on released()");
		},
		
		
		
	});
});