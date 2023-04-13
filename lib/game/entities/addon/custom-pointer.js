ig.module('game.entities.addon.custom-pointer')
.requires(
	'game.entities.pointer'
)

.defines(function(){
	EntityCustomPointer = EntityPointer.extend({
		name : "Pointer",
        size:{x:1, y:1},
		
        check: function( other ) {
            if(!other.useCustomEntity){
                this.parent(other)
            } else {
            	if(!other.exists || !other.inputEnabled || !ig.game.checkVisibility(other) || other.size.x < 1 || other.size.y < 1) return;
                if(!other.alive) return
                this.objectArray.push(other);
            }
        },

        kill:function(){
        	this.parent();
        	this.exists = false;
        },

        update:function(){
            this.parent();
            // console.log(this.objectArray)
        },
	});
});