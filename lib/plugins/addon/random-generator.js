ig.module('plugins.addon.random-generator')
.defines(function(){
	ig.RandomGenerator = ig.Class.extend({
		init:function(seeds){
			if (typeof seeds === "undefined") { seeds = []; }

		    this.c = 1;
		    this.s0 = 0;
		    this.s1 = 0;
		    this.s2 = 0;

		    this.sow(seeds);
		},

		sow: function (seeds) {
	        // Always reset to default seed
			// if (typeof seeds === "undefined") { seeds = []; }
	        this.s0 = this.hash(' ');
	        this.s1 = this.hash(this.s0);
	        this.s2 = this.hash(this.s1);
	        this.c = 1;

	        if (!seeds)
	        {
	            return;
	        }

	        // Apply any seeds
	        for (var i = 0; i < seeds.length && (seeds[i] != null); i++)
	        {
	            var seed = seeds[i];

	            this.s0 -= this.hash(seed);
	            this.s0 += ~~(this.s0 < 0);
	            this.s1 -= this.hash(seed);
	            this.s1 += ~~(this.s1 < 0);
	            this.s2 -= this.hash(seed);
	            this.s2 += ~~(this.s2 < 0);
	        }

	    },

		rnd:function(){
			 var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

	        this.c = t | 0;
	        this.s0 = this.s1;
	        this.s1 = this.s2;
	        this.s2 = t - this.c;

	        return this.s2;
		},

		hash: function (data) {
	        var h, i, n;
	        n = 0xefc8249d;
	        data = data.toString();

	        for (i = 0; i < data.length; i++) {
	            n += data.charCodeAt(i);
	            h = 0.02519603282416938 * n;
	            n = h >>> 0;
	            h -= n;
	            h *= n;
	            n = h >>> 0;
	            h -= n;
	            n += h * 0x100000000;// 2^32
	        }

	        return (n >>> 0) * 2.3283064365386963e-10;// 2^-32

	    },

		frac: function() {
	        return this.rnd.apply(this) + (this.rnd.apply(this) * 0x200000 | 0) * 1.1102230246251565e-16;   // 2^-53
	    },

	    realInRange: function (min, max) {
	    	var rnd = this.frac() * (max - min) + min;
	        return rnd;
	    },

	    integerInRange: function (min, max, seeds) {
	    	var rnd = Math.floor(this.realInRange(0, max - min + 1) + min);
	        return rnd;
	    },

	    pick:function(array){
	    	var id = this.integerInRange(0, array.length - 1);
	    	return array[id]
	    },
	});
});