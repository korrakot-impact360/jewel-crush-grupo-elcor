/**
 * Packer plugin by Afif
 *
 * docs : https://bit.ly/mjs-packer-plugin
 */
ig.module('plugins.packer.packer-plugin')
    .requires(
        'plugins.packer.packer-image-injector',
        'plugins.packer.packer-animation-injector'
    ).defines(function () {
        ig.AtlasImage = ig.Class.extend({

            init: function (path) {
                this.path = path;
            },

            load: function (loadCallback) {
                this.loadCallback = loadCallback || null;

                this.data = new Image();
                this.data.onload = this.onload.bind(this);
                this.data.onerror = this.onerror.bind(this);
                this.data.src = ig.prefix + this.path + ig.nocache;
            },

            onload: function (event) {
                this.loaded = true;
                ig.packer.refreshImageLoadedStatus();
                if (this.loadCallback) this.loadCallback(this.path, true);
            },

            onerror: function (event) {
                this.error = true;
                if (this.loadCallback) this.loadCallback(this.path, false);
            },

        });

        ig.packer = {
            textureJson: [],
            textureAtlas: [],
            jsonLoadStatus: [],
            atlasLoadStatus: [],
            textureExistStatus: [],

            pathMap: {},

            initCallback: null,

            initPacker: function (callback) {
                var version = "1.1.6"
                if (window.packerplugin && packerplugin.textures.length > 0) {
                    console.log("Packer Plugin " + version + " is enabled, loading " + packerplugin.textures.length + " texture atlases...");
                    ig.packer.initCallback = callback;

                    for (var i = 0; i < packerplugin.textures.length; i++) {
                        this.textureExistStatus.push(1);
                    }

                    this.loadAllJson();
                } else {
                    console.log("Packer Plugin " + version + " is disabled, loading individual images...");
                    callback();
                }
            },

            loadAllJson: function () {
                for (var i = 0; i < ig.packer.textureExistStatus.length; i++) {
                    if (ig.packer.textureExistStatus[i] == 1) {
                        ig.packer.textureJson.push(null);
                        ig.packer.textureAtlas.push(null);
                        ig.packer.jsonLoadStatus.push(1);
                        ig.packer.atlasLoadStatus.push(0);
                        var jsonString = window.packerplugin.json[packerplugin.textures[i]];
                        ig.packer.textureJson[i] = JSON.parse(jsonString);
                    }
                }
                ig.packer.onLoadJsonComplete();
            },

            onLoadJsonComplete: function () {
                for (var i = 0; i < ig.packer.textureJson.length; i++) {
                    var json = ig.packer.textureJson[i];
                    for (var key in json.frames) {
                        ig.packer.pathMap[key] = { path: key, textureIndex: i };
                    }

                    var url = 'media/graphics/packed/' + packerplugin.textures[i] + '.png';
                    if (packerplugin.textures[i].indexOf("big-jpg") >= 0) {
                        url = 'media/graphics/packed/' + packerplugin.textures[i] + '.jpg';
                    }


                    var atlas = new ig.AtlasImage(url);
                    ig.packer.textureAtlas[i] = atlas;
                    ig.addResource(atlas);
                }

                // console.log(ig.resources);
                ig.packer.initCallback();
            },

            isImageInAtlas: function (path) {
                if (Object.hasOwnProperty.call(ig.packer.pathMap, path)) {
                    return true;
                }
                return false;
            },


            refreshImageLoadedStatus: function (path) {
                for (var imgKey in ig.Image.cache) {
                    if (Object.hasOwnProperty.call(ig.Image.cache, imgKey)) {
                        var img = ig.Image.cache[imgKey];
                        if (ig.packer.isImageInAtlas(img.path)) img.loaded = ig.packer.isImageLoadedForPath(img.path);
                    }
                }
            },

            isImageLoadedForPath: function (path) {
                var index = ig.packer.pathMap[path].textureIndex;
                return ig.packer.textureAtlas[index].loaded ? true : false;
            },

            getAtlasImage: function (path) {
                var index = ig.packer.pathMap[path].textureIndex;
                if (!ig.packer.textureAtlas[index].loaded) return null;
                return ig.packer.textureAtlas[index].data;
            },

            getFrameData: function (path) {
                var index = ig.packer.pathMap[path].textureIndex;
                return ig.packer.textureJson[index].frames[path];
            }

        }
    });