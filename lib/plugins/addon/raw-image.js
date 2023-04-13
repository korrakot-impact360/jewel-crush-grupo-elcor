ig.module('plugins.addon.raw-image')
.requires(
	'plugins.addon.custom-image'
)
.defines(function(){
	ig.RawImage = ig.CustomImage.extend({
		name:"Raw Image",
		sourceX : 0,
		sourceY : 0,
		spriteData : null,
		isReady : false,
		frameName : '',
		_frameName : '',
		imgWidth:0,
		imgHeight:0,
		curFrameData : null,	
		drawSize:{
			x:0,
			y:0
		},
		fullSize:{
			x:0,
			y:0,
		},
		
		init:function(path, settings){
			ig.merge(this, settings);

			this.imgName = "";
			for(var obj in imgCache){
				var data = imgCache[obj];
				if(data.path.img == path){
					this.imgName = obj
				}
			}
			
			this.parent(path);			
			this.checkProperties();

			// console.log('img: ', this.imgName)

		},

		checkProperties:function(){
			var checkData = ig.Image.cache[this.path];
			// var checkData = imageCache[this.path];
			var names = this.imgName.split('.');
			var tempJson = jsonCache[names[0]];

			if(checkData){
				this.width = checkData.width;
				this.height = checkData.height;
			} else {
				throw("image hasn't been loaded", this.imgName)
				// this.load(function(){
				// 	if(!imageCache[this.path]){
				// 		imageCache[this.path] = this
				// 	}
				// }.bind(this))
			}

			if(tempJson){
				this.spriteData = tempJson;
			}

			this.size.x = this.width;
			this.size.y = this.height;
			this.fullSize.x = this.size.x;
			this.fullSize.y = this.size.y;
			this.drawSize.x = this.width;
			this.drawSize.y = this.height;

			// console.log(this.size)
		},		

		setFrame:function(){
			if(!this.spriteData){
				// throw('json data doesnt exists');
				this.frameName = this._frameName;
				return;
			}

			if(this.frameName.length == 0) {
				this.curFrameData = null;
				this.sourceX = 0;
				this.sourceY = 0;
				this.width = this.image.width;
				this.height = this.image.height;
				this.size.x = this.width;
				this.size.y = this.height;
				this.fullSize.x = this.size.x;
				this.fullSize.y = this.size.y;
				this.drawSize.x = this.size.x;
				this.drawSize.y = this.size.y;
				this._frameName = this.frameName;
				return;
			}
			
			var exists = ig.CallAsset.searchSpriteData(this.frameName);

			if(!exists){
				throw('wrong frame name', this.frameName)
				this.frameName = this._frameName;
				return;
			} else {
				this.sourceX = exists.frame.x;
				this.sourceY = exists.frame.y;
				this.width = exists.sourceSize.w;
				this.height = exists.sourceSize.h;
				this.size.x = exists.sourceSize.w;
				this.size.y = exists.sourceSize.h;
				this.fullSize.x = this.size.x;
				this.fullSize.y = this.size.y;
				this.drawSize.x = this.size.x;
				this.drawSize.y = this.size.y;
				this.curFrameData = exists;
			}
			this._frameName = this.frameName;
		},

		update:function(){
			this.parent();
			if(this._frameName != this.frameName){
				this.setFrame();
			}
		}
	});
});