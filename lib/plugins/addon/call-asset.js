ig.module('plugins.addon.call-asset').defines(function() {
	ig.CallAsset = {};
	ig.CallAsset.checkJson = function(name) {
		var split = []
		for(var obj in jsonCache) {
			var datas = jsonCache[obj];
			for(var a = 0; a < datas.frames.length; a++) {
				var dataFrame = datas.frames[a];
				if(dataFrame.filename == name) {
					split.push(obj)
					split.push(name)
					break;
				}
			}
		}
		return split;
	};

	ig.CallAsset.searchSpriteData = function(frameName){
		var imageName = frameName.split('/')[0]
		var spriteData = null
		if(!jsonCache[imageName]) return spriteData;
		
		var datas = jsonCache[imageName].frames
		for(var a = 0; a < datas.length; a++){
			var data = datas[a]
			if(data.filename == frameName){
				spriteData = data
				break;
			}
		}

		return spriteData;
	};

	ig.CallAsset.addImage = function(x, y, name, settings, className) {
		var split = name.split('.');
		var path = '';
		if(split.length > 1) {
			path = name;
		} else {
			var temp = imgCache[name];
			if(temp) {
				path = temp.path.img;
			} else {
				throw ('Image is not found ' + name);
				return;
			}
		}
		// console.log('path: ', path)
		settings = settings ? settings : {};
		className = className ? className : 'ig.AddImage';
		if(typeof className == 'string') {
			className = stringToFunction(className)
		}
		var image = new className(x, y, path, settings);
		return image;
	};

	ig.CallAsset.addFrameImage = function(x, y, name, settings, className) {
		// var split = name.split('/');
		var split = ig.CallAsset.checkJson(name);
		if(split.length < 2) {
			throw ('not a frame in image', name)
			return;
		} else {
			var image = ig.CallAsset.addImage(x, y, split[0], settings, className);
			if(image) {
				image.frameName = name;
				image.setFrame();
				image.setProperty();
			}
			return image;
		}
	}

	ig.CallAsset.addSprite = function(x, y, name, settings, className) {
		// debugger;
		var split = name.split('.');
		var path = '';
		if(split.length > 1) {
			path = name;
		} else {
			var temp = imgCache[name];
			if(temp) {
				path = temp.path.img;
			} else {
				throw ('Image is not found', name);
				return;
			}
		}
		// console.log('path: ', path)
		settings = settings ? settings : {};
		className = className ? className : EntitySprite;
		var entity = ig.game.spawnEntity(className, x, y, settings);
		entity.setProperties(path);
		// entity.setProperty();
		return entity;
	};

	ig.CallAsset.addFrame = function(x, y, name, settings, className) {
		// var split = name.split('/');
		var split = ig.CallAsset.checkJson(name)
		if(split.length < 2) {
			throw ('not a frame in image')
			return;
		} else {
			var entity = ig.CallAsset.addSprite(x, y, split[0], settings, className);
			if(entity) {
				entity.frameName = name;
				entity.setFrame();
				entity.setProperty();
			}
			return entity;
		}
	};
	
	ig.CallAsset.addSpriter = function(x, y, name, settings, className) {
		var scmlPath = spriterCache[name].path;
		var scml = SpriterScml.cache[scmlPath];
		if(scml) {
			settings = settings ? settings : {};
			className = className ? className : EntitySpriterSprite;
			settings.scml = scml;
			var entity = ig.game.addGroup(x, y, settings, className)
			return entity;
		}
		return;
	};
});
