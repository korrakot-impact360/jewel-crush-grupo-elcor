/**
 * Responsive plugin by Afif
 * 
 * dependency : size-handler
 * 
 * docs : http://bit.ly/responsive-plugin-doc
 */
ig.module('plugins.responsive.responsive-plugin')
    .requires(
        'impact.system',
        'impact.entity',
        'plugins.handlers.size-handler',
        'plugins.responsive.responsive-utils'
    ).defines(function () {
        console.log("Responsive Plugin 1.4")
        ig.SizeHandler.inject({

            resize: function () {
                this.parent()
            },

            sizeCalcs: function () {
                if (!this.originalResolution) {
                    this.originalResolution = new Vector2(this.desktop.actualResolution.x, this.desktop.actualResolution.y);
                    ig.responsive.originalWidth = this.desktop.actualResolution.x;
                    ig.responsive.originalHeight = this.desktop.actualResolution.y;
                }
                var innerWidth = window.innerWidth;
                var innerHeight = window.innerHeight;

                var newAspectRatio = innerWidth / innerHeight;
                var originalAspectRatio = this.originalResolution.x / this.originalResolution.y;
                var newWidth = 0;
                var newHeight = 0;
                this.windowSize = new Vector2(innerWidth, innerHeight);
                if (newAspectRatio < originalAspectRatio) {//if need to fill vertically
                    newWidth = this.originalResolution.x;
                    newHeight = newWidth / newAspectRatio;
                    ig.responsive.scaleX = 1;
                    ig.responsive.scaleY = newHeight / this.originalResolution.y;
                } else {
                    newHeight = this.originalResolution.y;
                    newWidth = newHeight * newAspectRatio;
                    ig.responsive.scaleX = newWidth / this.originalResolution.x;
                    ig.responsive.scaleY = 1;
                }

                this.scaleRatioMultiplier = new Vector2(innerWidth / newWidth, innerHeight / newHeight);
                this.desktop.actualResolution = new Vector2(newWidth, newHeight);
                this.mobile.actualResolution = new Vector2(newWidth, newHeight);
                this.desktop.actualSize = new Vector2(innerWidth, innerHeight);
                this.mobile.actualSize = new Vector2(innerWidth, innerHeight);
                ig.responsive.width = newWidth;
                ig.responsive.height = newHeight;
                ig.responsive.halfWidth = newWidth / 2;
                ig.responsive.halfHeight = newHeight / 2;
                ig.responsive.fillScale = Math.max(ig.responsive.scaleX, ig.responsive.scaleY);
            },

            resizeLayers: function (width, height) {
                ig.system.resize(ig.sizeHandler.desktop.actualResolution.x, ig.sizeHandler.desktop.actualResolution.y)
                for (var index = 0; index < this.coreDivsToResize.length; index++) {
                    var elem = ig.domHandler.getElementById(this.coreDivsToResize[index]);

                    var l = Math.floor(((ig.sizeHandler.windowSize.x / 2) - (ig.sizeHandler.desktop.actualSize.x / 2)));
                    var t = Math.floor(((ig.sizeHandler.windowSize.y / 2) - (ig.sizeHandler.desktop.actualSize.y / 2)));
                    if (l < 0) l = 0;
                    if (t < 0) t = 0;
                    ig.domHandler.resizeOffset(elem, Math.floor(ig.sizeHandler.desktop.actualSize.x), Math.floor(ig.sizeHandler.desktop.actualSize.y), l, t);
                }

                for (var key in this.adsToResize) {
                    var keyDiv = ig.domHandler.getElementById('#' + key);
                    var keyBox = ig.domHandler.getElementById('#' + key + '-Box');

                    var divLeft = (window.innerWidth - this.adsToResize[key]['box-width']) / 2 + "px";
                    var divTop = (window.innerHeight - this.adsToResize[key]['box-height']) / 2 + "px";

                    if (keyDiv) {
                        ig.domHandler.css(keyDiv, { width: window.innerWidth, height: window.innerHeight });
                    }
                    if (keyBox) {
                        ig.domHandler.css(keyBox, { left: divLeft, top: divTop });
                    }
                }

                var canvas = ig.domHandler.getElementById("#canvas");
                var offsets = ig.domHandler.getOffsets(canvas);
                var offsetLeft = offsets.left;
                var offsetTop = offsets.top;
                var aspectRatioMin = Math.min(ig.sizeHandler.scaleRatioMultiplier.x, ig.sizeHandler.scaleRatioMultiplier.y);

                for (var key in this.dynamicClickableEntityDivs) {
                    var div = ig.domHandler.getElementById("#" + key);

                    var posX = this.dynamicClickableEntityDivs[key]['entity_pos_x'];
                    var posY = this.dynamicClickableEntityDivs[key]['entity_pos_y'];
                    var sizeX = this.dynamicClickableEntityDivs[key]['width'];
                    var sizeY = this.dynamicClickableEntityDivs[key]['height'];

                    var divleft = Math.floor(offsetLeft + posX * this.scaleRatioMultiplier.x) + "px";
                    var divtop = Math.floor(offsetTop + posY * this.scaleRatioMultiplier.y) + "px";
                    var divwidth = Math.floor(sizeX * this.scaleRatioMultiplier.x) + "px";
                    var divheight = Math.floor(sizeY * this.scaleRatioMultiplier.y) + "px";

                    ig.domHandler.css(div, {
                        float: "left",
                        position: "absolute",
                        left: divleft,
                        top: divtop,
                        width: divwidth,
                        height: divheight,
                        "z-index": 3
                    });

                    if (this.dynamicClickableEntityDivs[key]['font-size']) {
                        var fontSize = this.dynamicClickableEntityDivs[key]['font-size'];
                        ig.domHandler.css(div, { "font-size": (fontSize * aspectRatioMin) + "px" });
                    }
                }

                $('#ajaxbar').width(this.windowSize.x);
                $('#ajaxbar').height(this.windowSize.y);
            },


            reorient: function () {
                if (!ig.ua.mobile) {
                    this.resize();
                }
                else {
                    this.resize();
                    this.resizeAds();
                }

                if (typeof (BABYLON) !== 'undefined' || window.BABYLON) this.resizeBabylon();
                if (ig.game) {
                    ig.game.update();
                    ig.game.draw();
                }
            },

            resizeBabylon: function () {

                var w = window.innerWidth;
                var h = window.innerHeight;
                var ratio = w / h;

                // var oriW = this.desktop.actualResolution.x
                // var oriH = this.desktop.actualResolution.y
                var oriW = ig.responsive.originalWidth
                var oriH = ig.responsive.originalHeight
                var oriRatio = oriW / oriH;

                var maxSize = Math.max(oriW, oriH);
                if (ig.ua.mobile) maxSize = 640;

                minSize = Math.min(oriW, oriH);

                if (ratio > oriRatio) {
                    if (h > oriH) h = oriH;
                    w = Math.floor((window.innerWidth / window.innerHeight) * h);

                    if (w > maxSize) w = maxSize;
                    h = Math.floor((window.innerHeight / window.innerWidth) * w);

                } else {
                    if (w > oriW) w = oriW;
                    h = Math.floor((window.innerHeight / window.innerWidth) * w);

                    if (h > maxSize) h = maxSize;
                    w = Math.floor((window.innerWidth / window.innerHeight) * h);
                }

                var renderRatioW = 1;
                var renderRatioH = 1;

                if (window.innerWidth > maxSize) {
                    renderRatioW = window.innerWidth / maxSize;
                }
                if (window.innerHeight > maxSize) {
                    renderRatioH = window.innerHeight / maxSize;
                }
                wgl.system.engine.setSize(w, h);
                wgl.system.engine.resize();
                wgl.system.engine.setHardwareScalingLevel(Math.max(renderRatioW, renderRatioH));

                ig.gameScene.zoomFactor = 1;
                if (ig.ua.mobile && minSize < maxSize) {
                    ig.gameScene.zoomFactor = maxSize / minSize;
                }
                ig.wglW = w;
                ig.wglH = h;
                ig.wglInnerW = window.innerWidth;
                ig.wglInnerH = window.innerHeight;

                console.log(
                    "babylon renderSize : ", wgl.system.engine.getRenderWidth(), wgl.system.engine.getRenderHeight(),
                    "hwScalingLevel : ", wgl.system.engine.getHardwareScalingLevel());
            }

        });

        ig.Entity.inject({
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                if (!this.anchorType && !settings.anchorType) this.anchorType = "none";
                this.anchoredPositionX = x;
                this.anchoredPositionY = y;
            },

            setAnchoredPosition: function (x, y, anchorTo) {
                if (!anchorTo) anchorTo = "default";
                this.anchorType = anchorTo;
                this.anchoredPositionX = x;
                this.anchoredPositionY = y;
            },

            update: function () {
                this.parent();
                if (this.anchorType != "" && this.anchorType != "none") {
                    var point = ig.responsive.toAnchor(this.anchoredPositionX, this.anchoredPositionY, this.anchorType);
                    this.pos.x = point.x;
                    this.pos.y = point.y;
                }
            }

        });
    });