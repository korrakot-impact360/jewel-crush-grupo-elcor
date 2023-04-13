ig.module('plugins.addon.world')
.defines(function(){
	ig.World = {};
	ig.World.globalPos = function(object){
		var position = {x:object.x, y:object.y};
		var parentPos = object.groupParent ? ig.World.parentPos(object.groupParent, position.x, position.y) : {x:position.x, y:position.y};
		return parentPos;
	};

	ig.World.parentPos = function(parent, x, y){
		x = x ? x : 0;
		y = y ? y : 0;
		var position = {x:x, y:y};
		var greatParent = false;
		while(!greatParent){
			position = ig.World.countPos(parent, position);
			if(parent.groupParent){
				parent = parent.groupParent;
			} else {
				greatParent = true;
			}
		}
		
		return position;
	};

	ig.World.countPos = function(parent, position){
		position.x = (position.x * parent.scale.x) + parent.x;
		position.y = (position.y * parent.scale.y) + parent.y;
		position = ig.World.checkPointRotate(parent, parent._rotation, position)

		return position;
	};

	ig.World.checkPointRotate = function(oriPos, oriRad, centerPos){
		var originX = oriPos.x;
		var originY = oriPos.y;
		var centerX = centerPos.x;
		var centerY = centerPos.y;
		var distance = ig.game.math.distance(originX, originY, centerX, centerY);
		var originAngle = ig.game.math.angleBetween(originX, originY, centerX, centerY);

		var pos = {x:0,y:0};
		pos.x = originX + (distance * Math.cos(oriRad + originAngle));
		pos.y = originY + (distance * Math.sin(oriRad + originAngle));

		return pos;
	}

	ig.World.getBounds = function(poss){
		var pos1 = poss[0];
		var minX = pos1.x;
		var maxX = pos1.x;
		var minY = pos1.y;
		var maxY = pos1.y;
		for(var a = 0; a < poss.length; a++){
			var pos = poss[a];
			if(pos.x < minX) minX = pos.x;
			if(pos.x > maxX) maxX = pos.x;
			if(pos.y < minY) minY = pos.y;
			if(pos.y > maxY) maxY = pos.y;
		}

		var width = maxX - minX;
		var height = maxY - minY;
		var box = ig.game.geom.rectangle(minX, minY, width, height);
		return box;
	}
})