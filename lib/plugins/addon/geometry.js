ig.module('plugins.addon.geometry')
.defines(function(){
	ig.Geometry = ig.Class.extend({
		rectangle:function(x, y, width, height){
			var rect = {};

			rect.x = x;
			rect.y = y;
			rect.width = width;
			rect.height = height;
			rect.right = x + width;
			rect.bottom = y + height;
			rect.halfWidth = width * 0.5;
			rect.halfHeight = height * 0.5;
			rect.centerX = rect.x + rect.halfWidth;
			rect.centerY = rect.y + rect.halfHeight;

			return rect;
		},

		roundRect:function(x, y, width, height, radius){
			var rect = this.rectangle(x, y, width, height)
			rect.radius = radius;

			return rect;
		},
		
		halfCircleRect:function(x, y, width, height, radius, tipRad){
			var rect = this.rectangle(x, y, width, height)
			rect.radius = radius;
			rect.tipRad = tipRad

			return rect;
			
		},

		circle:function(x, y, diameter){
			var circle = {
				x : 0,
				y : 0,
				diameter : 0,
				radius : 0,
				right:0,
				left:0,
				top:0,
				bottom:0,
			};

			circle.x = x;
			circle.y = y;
			circle.diameter = diameter;
			circle.radius = diameter * 0.5;
			circle.left = x - circle.radius;
			circle.right = x + circle.radius;
			circle.top = y - circle.radius;
			circle.bottom = y + circle.radius;

			return circle;
		},

		polygon:function(points){
			var poly = {
				points : [],
				closed : true,
			};

			poly.points = points;

			return poly;
		},
	});

	ig.Polygon = ig.Class.extend({
		points:[],
		closed:true,
		init:function(points){
			this.points = points;
		},
	});
});