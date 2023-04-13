ig.module('plugins.addon.custom-debug')
.defines(function(){
	ig.CustomDebug = ig.Class.extend({
		init:function(){

		},

		rect:function(rect, fillRect, alpha, strokeSetting){
			var ctx = ig.system.context;
			ctx.save();
			ctx.globalAlpha = alpha;

            if(strokeSetting){
            	ctx.strokeStyle = strokeSetting.strokeStyle;
            	ctx.lineWidth = strokeSetting.lineWidth;
            	ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
            }

			ctx.fillStyle = fillRect;
			ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
			ctx.restore();
		},

		circle:function(circle, fill, alpha, strokeSetting){
			var context = ig.system.context;
			context.save();
			context.globalAlpha = alpha;
			context.beginPath();
			context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);

            if(strokeSetting){
            	ctx.strokeStyle = strokeSetting.strokeStyle;
            	ctx.lineWidth = strokeSetting.lineWidth;
            	ctx.stroke()
            }

			context.fillStyle = fill;
			context.fill();
			context.restore();
		},

		polygon:function(polygon, fill, alpha, strokeSetting){
			if(!polygon.points || polygon.points.length == 0) return;
			var ctx = ig.system.context;
			ctx.save();
			ctx.globalAlpha = alpha;

			ctx.beginPath();

			var point = polygon.points[0];
			ctx.moveTo(point.x, point.y);

			var points = polygon.points;
			for(var a = 1; a < points.length; a++){
				var point = points[a];
				ctx.lineTo(point.x, point.y);
			}

			ctx.closePath();

            if(strokeSetting){
            	ctx.strokeStyle = strokeSetting.strokeStyle;
            	ctx.lineWidth = strokeSetting.lineWidth;
            	ctx.stroke()
            }

			ctx.fillStyle = fill;
			ctx.fill();
			ctx.restore();
		},

		satPolygon:function(polygon, fill, alpha, strokeSetting){
			var ctx = ig.system.context;
			ctx.save();
			ctx.globalAlpha = alpha;

			ctx.beginPath();

			var point = polygon.pointList[0];
			ctx.moveTo(point.x, point.y);

			var points = polygon.pointList;
			for(var a = 1; a < points.length; a++){
				var point = points[a];
				ctx.lineTo(point.x, point.y);
			}

			ctx.closePath();

            if(strokeSetting){
            	ctx.strokeStyle = strokeSetting.strokeStyle;
            	ctx.lineWidth = strokeSetting.lineWidth;
            	ctx.stroke()
            }

			ctx.fillStyle = fill;
			ctx.fill();
			ctx.restore();	
		},

		satCircle:function(circle, fill, alpha, strokeSetting){
			var context = ig.system.context;
			context.save();
			context.globalAlpha = alpha;
			context.beginPath();
			context.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI, false);

            if(strokeSetting){
            	ctx.strokeStyle = strokeSetting.strokeStyle;
            	ctx.lineWidth = strokeSetting.lineWidth;
            	ctx.stroke()
            }

			context.fillStyle = fill;
			context.fill();
			context.restore();
		},

        roundRect: function (roundRect, fill, alpha, strokeSetting) {
            var ctx = ig.system.context;
            ctx.save()
            ctx.beginPath();
            ctx.moveTo(roundRect.x + roundRect.radius, roundRect.y);
            ctx.lineTo(roundRect.x + roundRect.width - roundRect.radius, roundRect.y);
            ctx.quadraticCurveTo(roundRect.x + roundRect.width, roundRect.y, roundRect.x + roundRect.width, roundRect.y + roundRect.radius);
            ctx.lineTo(roundRect.x + roundRect.width, roundRect.y + roundRect.height - roundRect.radius);
            ctx.quadraticCurveTo(roundRect.x + roundRect.width, roundRect.y + roundRect.height, roundRect.x + roundRect.width - roundRect.radius, roundRect.y + roundRect.height);
            ctx.lineTo(roundRect.x + roundRect.radius, roundRect.y + roundRect.height);
            ctx.quadraticCurveTo(roundRect.x, roundRect.y + roundRect.height, roundRect.x, roundRect.y + roundRect.height - roundRect.radius);
            ctx.lineTo(roundRect.x, roundRect.y + roundRect.radius);
            ctx.quadraticCurveTo(roundRect.x, roundRect.y, roundRect.x + roundRect.radius, roundRect.y);
            ctx.closePath();

            ctx.globalAlpha = alpha

            if(strokeSetting){
            	ctx.strokeStyle = strokeSetting.strokeStyle;
            	ctx.lineWidth = strokeSetting.lineWidth;
            	ctx.stroke()
            }

            ctx.fillStyle = fill;
            ctx.fill();
            
            ctx.restore()
        },

        halfCircleRect:function(halfCircleRect, fill, alpha, strokeSetting){
        	var context = ig.system.context;
        	context.save()

        	context.beginPath();
        	var beginX = halfCircleRect.x + halfCircleRect.radius + halfCircleRect.tipRad
        	var lineWidth = halfCircleRect.width - (2 * halfCircleRect.radius) - (2 * halfCircleRect.tipRad)
        	context.moveTo(beginX, halfCircleRect.y)

        	//upper line
        	context.lineTo(beginX + lineWidth, halfCircleRect.y)

        	//right half circle
        	var rightHalfCircleRadX = halfCircleRect.x + halfCircleRect.width;
        	var rightHalfCircleRadY = halfCircleRect.y + (halfCircleRect.height/2)

        	//
        	var roundTipRightX1 = beginX + lineWidth + halfCircleRect.tipRad;
        	var roundTipRightY1 = halfCircleRect.y
        	var radRight = ig.game.math.angleBetween(roundTipRightX1, roundTipRightY1, rightHalfCircleRadX, rightHalfCircleRadY)
        	var roundTipRightX2 = roundTipRightX1 + (Math.cos(radRight) * halfCircleRect.tipRad)
        	var roundTipRightY2 = roundTipRightY1 + (Math.sin(radRight) * halfCircleRect.tipRad)
        	context.quadraticCurveTo(roundTipRightX1, roundTipRightY1, roundTipRightX2, roundTipRightY2)

        	var roundTipRightX3 = roundTipRightX1
        	var roundTipRightY3 = halfCircleRect.y + halfCircleRect.height
        	var radRightBottom = ig.game.math.angleBetween(roundTipRightX3, roundTipRightY3, rightHalfCircleRadX, rightHalfCircleRadY)
        	var roundTipRightX4 = roundTipRightX3 + (Math.cos(radRightBottom) * halfCircleRect.tipRad)
        	var roundTipRightY4 = roundTipRightY3 + (Math.sin(radRightBottom) * halfCircleRect.tipRad)

        	context.quadraticCurveTo(rightHalfCircleRadX, rightHalfCircleRadY, roundTipRightX4, roundTipRightY4)
        	var rightBottomLineX = beginX + lineWidth;
        	var rightBottomLineY = halfCircleRect.y + halfCircleRect.height
        	context.quadraticCurveTo(roundTipRightX3, roundTipRightY3, rightBottomLineX, rightBottomLineY)

        	var bottomLineX = beginX
        	var bottomLineY = halfCircleRect.y + halfCircleRect.height
        	context.lineTo(bottomLineX, bottomLineY)

        	var roundTipLeftX1 = bottomLineX - halfCircleRect.tipRad
        	var roundTipLeftY1 = bottomLineY;
        	var radLeftBottom = ig.game.math.angleBetween(roundTipLeftX1, roundTipLeftY1, halfCircleRect.x, rightHalfCircleRadY)
        	var roundTipLeftX2 = roundTipLeftX1 + (Math.cos(radLeftBottom) * halfCircleRect.tipRad)
        	var roundTipLeftY2 = roundTipLeftY1 + (Math.sin(radLeftBottom) * halfCircleRect.tipRad)
        	context.quadraticCurveTo(roundTipLeftX1, roundTipLeftY1, roundTipLeftX2, roundTipLeftY2)

        	var roundTipLeftX3 = roundTipLeftX1
        	var roundTipLeftY3 = halfCircleRect.y
        	var radLeftUp = ig.game.math.angleBetween(roundTipLeftX3, roundTipLeftY3, halfCircleRect.x, rightHalfCircleRadY)
        	var roundTipLeftX4 = roundTipLeftX3 + (Math.cos(radLeftUp) * halfCircleRect.tipRad)
        	var roundTipLeftY4 = roundTipLeftY3 + (Math.sin(radLeftUp) * halfCircleRect.tipRad)
        	context.quadraticCurveTo(halfCircleRect.x, rightHalfCircleRadY, roundTipLeftX4, roundTipLeftY4)
        	context.quadraticCurveTo(roundTipLeftX3, roundTipLeftY3, beginX, halfCircleRect.y)

            context.globalAlpha = alpha

            if(strokeSetting){
            	context.strokeStyle = strokeSetting.strokeStyle;
            	context.lineWidth = strokeSetting.lineWidth;
            	context.stroke()
            }

            context.fillStyle = fill;
            context.fill();

        	context.restore()
        },
	});
});