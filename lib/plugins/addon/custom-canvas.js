ig.module('plugins.addon.custom-canvas')
.defines(function(){
	ig.CustomCanvas = ig.Class.extend({
		sourceX:0,
		sourceY:0,
		size:{x:0, y:0},
		renewCanvas:false,
		init:function(canvasName, width, height, settings){
			ig.merge(this, settings);

			this.height = height;
			this.width = width;
			this.size.x = width;
			this.size.y = height;
			this.canvasName = canvasName;

			var checkCanvas = this.setCanvas(width, height)

			this.drawEle = hiddenCanvases[canvasName].ele;
			this.drawCtx = hiddenCanvases[canvasName].ctx;

			this.drawImageCanvas(checkCanvas.ctx)
		},

		setCanvas:function(width, height){
			var checkCanvas = hiddenCanvases[this.canvasName];
			if(!checkCanvas){
				hiddenCanvases[this.canvasName] = this.create_canvas_context(width, height);
				checkCanvas = hiddenCanvases[this.canvasName]
			} else {
				if(this.renewCanvas){
					hiddenCanvases[this.canvasName] = this.create_canvas_context(width, height);
					checkCanvas = hiddenCanvases[this.canvasName]
				}
			}

			return checkCanvas;
		},
		
        create_canvas_context: function(w, h) {
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            return {
                ele: canvas,
                ctx: ctx
            };
        },

        drawImageCanvas:function(context){},

        draw:function(x, y){			
			var scale = ig.system.scale;

			ig.system.context.save();			
			ig.system.context.drawImage(this.drawEle, this.sourceX, this.sourceY, this.size.x, this.size.y, 
				ig.system.getDrawPos(x), 
				ig.system.getDrawPos(y), 
				this.size.x, this.size.y);
			ig.system.context.restore();			
			ig.Image.drawCount++;
        },
	})
})