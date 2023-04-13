ig.module('plugins.addon.custom-storage')
.requires(
	'impact.game',
	'plugins.io.storage-manager'
	// 'plugins.impact-storage'
	// ,'plugins.fake-storage'
)
.defines(function(){
	ig.Game.inject({
		loadAll:function(){
	        var data = this.storage.get(this.storageName);
	        if(data === null || typeof(data) === "undefined"){
	            // Init Data to Store
	            data = this.initData();
	        }else{
				try{
					var value = LZString.decompressFromUTF16(data);
					value = JSON.parse(atob(value))
				} catch(e) {
					var value = this.initData();
				}

				data = value;
	            // Process Existed Data
	        }
	        
	        for(var key in data){
				this.sessionData[key] = data[key];
	        }

	        this.saveAll();
		},

		saveAll:function(){
			var data = btoa(JSON.stringify(this.sessionData));
			data = LZString.compressToUTF16(data);

	        this.storage.set(this.storageName, data);
		},

	    load:function(key){
	        var data = this.storage.get(this.storageName);

			try{
				var value = LZString.decompressFromUTF16(data);
				value = JSON.parse(atob(value))
			} catch(e) {
				var value = this.initData();
			}

			data = value;

	        this.sessionData[key] = data[key];

	        return this.sessionData[key];
	    },

	    save:function(key, value){
	        var data = this.storage.get(this.storageName);

			try{
				var decrypt = LZString.decompressFromUTF16(data);
				decrypt = JSON.parse(atob(decrypt))
			} catch(e) {
				var decrypt = this.initData();
			}

			data = decrypt;
	        data[key] = value;

			var data = btoa(JSON.stringify(data));
			data = LZString.compressToUTF16(data);

	        this.storage.set(this.storageName, data);
	    },
	});
})