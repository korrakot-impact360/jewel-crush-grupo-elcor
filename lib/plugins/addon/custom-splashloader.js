ig.module('plugins.addon.custom-splashloader')
.requires('plugins.splash-loader')
.defines(function(){
    ig.SplashLoader.inject({
        _unloadedAtlas:[],
        _unloadedCustomResources:[],
        isExists:true,

        load:function(){
            ig.system.clear( '#000' );

            if(!this.resources.length && !this.loadAssets.length && !this.customResources.length){
                this.end();
                return;
            }

            if(this.customResources.length){                
                for( var i = 0; i < this.customResources.length; i++ ) {
                    this._unloadedCustomResources.push( this.customResources[i].path );
                }
            }

            if(this.loadAssets.length){
                for(var a = 0; a < this.loadAssets.length; a++){
                    var data = this.loadAssets[a];
                    data.loaded = false;
                    this._unloadedAtlas.push(data)
                }
            }

            if(!this.resources.length){
                if(!this.customResources.length){
                    this.loadingAssets();
                } else {
                    this.loadCustomResource()
                }
            }

            for( var i = 0; i < this.resources.length; i++ ) {
                this.loadResource( this.resources[i] );
            }

            this._intervalId = setInterval( this.draw.bind(this), 16 );
        },

        _loadCallback:function(path, status){
            if( status ) {
                this._unloaded.erase( path );
            }
            else {
                throw( 'Failed to load resource: ' + path );
            }
            
            var totUnloaded = this._unloaded.length + this._unloadedAtlas.length + this._unloadedCustomResources.length
            var totResources = this.resources.length + this.loadAssets.length + this.customResources.length
            this.status = 1 - (totUnloaded / totResources)
            if( this._unloaded.length == 0 ) { // all done?
                if(this.customResources.length){
                    this.loadCustomResource()
                } else {               
                    if(this.loadAssets.length){
                        this.loadingAssets()
                    } else {
                        setTimeout( this.end.bind(this), 250 );
                    }
                }
            }
        },

        loadCustomResource:function(){
            for(var a = 0; a < this.customResources.length; a++){
                var res = this.customResources[a]
                res.load(this._loadCustomCallback.bind(this))
            }
        },

        _loadCustomCallback: function( path, status ) {
            if( status ) {
                this.storeImgPathFromResources(path)
                
                this._unloadedCustomResources.erase( path );
            }
            else {
                throw( 'Failed to load resource: ' + path );
            }
            
            var totUnloaded = this._unloaded.length + this._unloadedAtlas.length + this._unloadedCustomResources.length
            var totResources = this.resources.length + this.loadAssets.length + this.customResources.length
            this.status = 1 - (totUnloaded / totResources)

            if( this._unloadedCustomResources.length == 0) { // all done?
                if(this.loadAssets.length){
                    this.loadingAssets();
                } else {
                    setTimeout( this.end.bind(this), 250 );
                }
            }
        },

        storeImgPathFromResources:function(path){
            var dotSplitted = path.split('.');
            var folderPath = "";
            for(var i = 0; i < dotSplitted.length - 1; i++) {
                folderPath = folderPath + dotSplitted[i];
            }
            var folders = folderPath.split('/');
            var name = folders[folders.length - 1];
            var checkCache = imgCache[name];
            if(!checkCache) {
                imgCache[name] = {
                    path: {
                        img: '',
                        json: ''
                    }
                }
            }

            var ext = dotSplitted[dotSplitted.length - 1];
            if(ext == "png" || ext == "PNG" || ext == 'jpg' || ext == "JPG") {
                imgCache[name].path.img = path;
            } else if(ext == 'scml') {
                var checkScml = spriterCache[name]
                if(checkScml){
                    spriterCache[name].path = path;
                } else {
                    spriterCache[name] = {path:path}
                }
            } else {
                imgCache[name].path[dotSplitted[dotSplitted.length - 1]] = path;
            }
        },

        loadingAssets:function(){
            for(var a = 0; a < this.loadAssets.length; a++){
                var data = this.loadAssets[a];
                var callback = null;
                if(data.type == 'image'){
                    callback = this.imgLoaded.bind(this);
                } else if(data.type == 'json'){
                    data.path = "";
                    callback = this.jsonLoaded.bind(this);
                } else if(data.type == 'scml'){
                    callback = this.spriterLoaded.bind(this)
                }

                ig.Asset[data.type](data.name, data.path, callback);

                console.log(data.type)
            }

            if(!this.loadAssets.length){
                setTimeout( this.end.bind(this), 250 );
            }
        },

        spriterLoaded:function(path, status){
            if(status){
                for(var a = 0; a < this._unloadedAtlas.length; a++){
                    var data = this._unloadedAtlas[a];
                    if(data.path == path && data.type == 'scml'){
                        this._unloadedAtlas[a].loaded = true;
                    }
                }
            } else {
                throw('Failed to load scml: ' + path);
            }

            this.checkUnloadedAtlas();
        },

        jsonLoaded:function(data, name){
            if(data){
                var id = -1;
                for(var a = 0; a < this._unloadedAtlas.length; a++){
                    var data = this._unloadedAtlas[a];
                    if(data.name == name && data.type == 'json'){
                        this._unloadedAtlas[a].loaded = true;
                    }
                }
                console.log('Json Loaded')
            } else {
                throw('Failed to load atlas: ' + name);
            }

            this.checkUnloadedAtlas();
        },

        imgLoaded:function(path, status){
            if(status){
                var id = -1;
                for(var a = 0; a < this._unloadedAtlas.length; a++){
                    var data = this._unloadedAtlas[a];
                    if(data.path == path && data.type == 'image'){
                        this._unloadedAtlas[a].loaded = true;
                    }
                }
            } else {
                throw('Failed to load image: ' + path);
            }
            
            this.checkUnloadedAtlas();
        },

        checkUnloadedAtlas:function(){
            var countFinished = 0;
            for(var a = 0; a < this._unloadedAtlas.length; a++){
                var data = this._unloadedAtlas[a];
                if(data.loaded){
                    countFinished++;
                }
            }

            var countUnloaded = this._unloadedAtlas.length - countFinished

            var totUnloaded = this._unloaded.length + countUnloaded + this._unloadedCustomResources.length
            var totResources = this.resources.length + this.loadAssets.length + this.customResources.length
            this.status = 1 - (totUnloaded / totResources)

            if( countFinished == this.loadAssets.length ) { // all done?
                setTimeout( this.end.bind(this), 250 );
            }
        },
    })
})