ig.module('plugins.addon.math-collection')
.defines(function(){
	ig.MathCollection = ig.Class.extend({
		DEG_TO_RAD : Math.PI / 180,
		RAD_TO_DEG : 180 / Math.PI,

		degToRad: function (degrees) {
	        return degrees * this.DEG_TO_RAD;
	    },

	    radToDeg: function (radians) {
	        return radians * this.RAD_TO_DEG;
	    },
	    
		angleBetween:function (x1, y1, x2, y2) {
			//return radian
	        return Math.atan2(y2 - y1, x2 - x1);

	    },

	    angleBetweenPoints:function(point1, point2){
	    	return this.angleBetween(point1.x, point1.y, point2.x, point2.y);
	    },

	    distance:function (x1, y1, x2, y2) {

		    var dx = x1 - x2;
		    var dy = y1 - y2;

		    return Math.sqrt((dx * dx) + (dy * dy));

		},

		rectContains:function(a, x, y){
			if (a.width <= 0 || a.height <= 0)
		    {
		        return false;
		    }

		    return (x >= a.x && x < a.right && y >= a.y && y < a.bottom);
		},

		rectIntersects:function(a, b){
			if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0)
		    {
		        return false;
		    }

		    return !(a.right < b.x || a.bottom < b.y || a.x > b.right || a.y > b.bottom);
		},

		polygonContains:function(polygon, x, y){
			var inside = false;
			
			for (var i = -1, j = polygon.points.length - 1; ++i < polygon.points.length; j = i)
            {
                var ix = polygon.points[i].x;
                var iy = polygon.points[i].y;

                var jx = polygon.points[j].x;
                var jy = polygon.points[j].y;

                if (((iy <= y && y < jy) || (jy <= y && y < iy)) && (x < (jx - ix) * (y - iy) / (jy - iy) + ix))
                {
                    inside = !inside;
                }
            }

            return inside;
		},

		circleContains:function(a, x, y){
			if (a.radius > 0 && x >= a.left && x <= a.right && y >= a.top && y <= a.bottom)
		    {
		        var dx = (a.x - x) * (a.x - x);
		        var dy = (a.y - y) * (a.y - y);

		        return (dx + dy) <= (a.radius * a.radius);
		    }
		    else
		    {
		        return false;
		    }
		},

		catmullRom: function (p0, p1, p2, p3, t) {

	        var v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;

	        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

	    },

	    catmullRomInterpolation: function (v, k) {

	        var m = v.length - 1;
	        var f = m * k;
	        var i = Math.floor(f);

	        if (v[0] === v[m])
	        {
	            if (k < 0)
	            {
	                i = Math.floor(f = m * (1 + k));
	            }

	            return this.catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
	        }
	        else
	        {
	            if (k < 0)
	            {
	                return v[0] - (this.catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
	            }

	            if (k > 1)
	            {
	                return v[m] - (this.catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
	            }

	            return this.catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
	        }

	    },

	    factorial: function (value) {

	        if (value === 0)
	        {
	            return 1;
	        }

	        var res = value;

	        while(--value)
	        {
	            res *= value;
	        }

	        return res;

	    },

	    bernstein: function (n, i) {

	        return this.factorial(n) / this.factorial(i) / this.factorial(n - i);

	    },
	    
	    bezierInterpolation: function (v, k) {

	        var b = 0;
	        var n = v.length - 1;

	        for (var i = 0; i <= n; i++)
	        {
	            b += Math.pow(1 - k, n - i) * Math.pow(k, i) * v[i] * this.bernstein(n, i);
	        }

	        return b;

	    },

	    linear: function (p0, p1, t) {
	        return (p1 - p0) * t + p0;
	    },

	    linearInterpolation: function (v, k) {
	        var m = v.length - 1;
	        var f = m * k;
	        var i = Math.floor(f);

	        if (k < 0)
	        {
	            return this.linear(v[0], v[1], f);
	        }

	        if (k > 1)
	        {
	            return this.linear(v[m], v[m - 1], m - f);
	        }

	        return this.linear(v[i], v[i + 1 > m ? m : i + 1], f - i);

	    },
	});
});