ig.module('plugins.addon.entity-debug')
.defines(function(){
	ig.EntityDebug = ig.Class.extend({
		colors: {
			names: '#fff',
			velocities: '#0f0',
			boxes: '#f00'
		},

		drawDebugBoxes:function(){
			if(!ig.game.entities.length) return;
			var context = ig.system.context;
			context.save()
			context.strokeStyle = this.colors.boxes;
			context.lineWidth = 1;
			var groups = ig.game.getEntitiesByType(EntityGroup);
			for(var a = 0; a < ig.game.entities.length; a++){
				var ent = ig.game.entities[a];
				if(ent instanceof EntityGroup) continue;

				context.strokeRect(	
					ig.system.getDrawPos(ent.pos.x.round()) - 0.5,
					ig.system.getDrawPos(ent.pos.y.round()) - 0.5,
					ent.size.x * ig.system.scale,
					ent.size.y * ig.system.scale
				);
			}

			context.restore()
		}
	})
})