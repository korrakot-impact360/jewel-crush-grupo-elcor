ig.module('plugins.addon.asset-reader')
.requires(
	'impact.image'
)
.defines(function(){
	ig.Asset = {
	};

	ig.Asset.image = function(name, path, callback){
		var checkCache = imgCache[name];
		if(!checkCache){
			imgCache[name] = {path:{img:path, json:''}}
		} else {
			imgCache[name].path.img = path;
		}

		var checkImg = ig.Image.cache[path]
		if(checkImg){
			var image = checkImg
		} else {
			var image = new ig.Image(path);
			ig.Image.cache[path] = image;
		}
			
		image.load(callback)
	};

	ig.Asset.json = function(name, url, callback){		
		var data = _SPRITESHEET[name];
		var checkCache = imgCache[name];
		if(!checkCache){
			imgCache[name] = {path:{img:'', json:""}}
		}

    	var exists = ig.Asset.getJsonDataByKey(name);
		// console.log(data);
    	if(!exists){
    		jsonCache[name] = data;
    	} else {
    		console.log('json data exists')
    	}

    	if(callback) callback(data, name);
	};
	
	ig.Asset.scml = function(name, path, callback){
		var checkCache = spriterCache[name];
		if(!checkCache){
			spriterCache[name] = {path:path}
		} else {
			spriterCache[name].path = path;
		}

		// debugger
		var checkSpriter = SpriterScml.cache[path]
		if(checkSpriter){
			var spriter = checkSpriter;
		} else {
			var spriter = new SpriterScml(path);
		}

		spriter.load(callback)
	};

	ig.Asset.getJsonDataByKey = function(key){
		var exists = null;

		var temp = jsonCache[key];
		if(temp){
			exists = temp;
		}

		return exists;
	};

	ig.Asset.getJsonDataByImageName = function(imgName){
		var data = null;
		for(var d in jsonCache){
			var temp = jsonCache[d];
			if(temp.meta.image == imgName){
				data = temp;
			}
		}

		return data;
	};
});