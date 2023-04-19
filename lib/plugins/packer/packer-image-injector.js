/**
 * Packer plugin by Afif
 * Improved draw function by Tiyo (1.0.5)
 * Added drawCtx and drawImageCtx by Jason Low (1.1.5)
 * docs : https://bit.ly/mjs-packer-plugin
 */
ig.module('plugins.packer.packer-image-injector')
    .requires(
        'impact.image',
        'impact.animation'
    ).defines(function () {

        ig.Image.inject({

            tintCache: {},

            load: function (loadCallback) {
                if (ig.packer && ig.packer.isImageInAtlas(this.path)) {
                    this.frameData = ig.packer.getFrameData(this.path);
                    this.width = this.frameData.frame.w;
                    this.height = this.frameData.frame.h;
                    this.loaded = ig.packer.isImageLoadedForPath(this.path);
                    if (loadCallback) loadCallback(this.path, true);
                } else this.parent(loadCallback);
            },

            reload: function () {
                if (ig.packer.isImageInAtlas(this.path)) {

                } else this.parent();
            },

            resize: function (scale) {
                if (ig.packer.isImageInAtlas(this.path)) console.warn("PACKER PLUGIN WARNING! : image.scale is not supported, \nImage path:" + this.path);
                else this.parent(scale);
            },

            draw: function (targetX, targetY, sourceX, sourceY, width, height, targetW, targetH) {
                if (ig.packer.isImageInAtlas(this.path)) {
                    if (!this.atlasImage) {
                        this.atlasImage = ig.packer.getAtlasImage(this.path);
                        this.frameData = ig.packer.getFrameData(this.path);
                        this.width = this.frameData.frame.w;
                        this.height = this.frameData.frame.h;
                        if (!this.atlasImage) return;
                    }

                    sourceX = sourceX ? sourceX : 0;
                    sourceY = sourceY ? sourceY : 0;
                    width = width ? width : this.width;
                    height = height ? height : this.height;
                    targetW = targetW ? targetW : width;
                    targetH = targetH ? targetH : height;

                    ig.system.context.drawImage(
                        this.atlasImage, sourceX + this.frameData.frame.x, sourceY + this.frameData.frame.y, width, height,
                        ig.system.getDrawPos(targetX),
                        ig.system.getDrawPos(targetY),
                        targetW, targetH
                    );

                }
                else {
                    sourceX = sourceX ? sourceX : 0;
                    sourceY = sourceY ? sourceY : 0;
                    width = width ? width : this.width;
                    height = height ? height : this.height;
                    targetW = targetW ? targetW : width;
                    targetH = targetH ? targetH : height;
                    ig.system.context.drawImage(
                        this.data, sourceX, sourceY, width, height,
                        ig.system.getDrawPos(targetX),
                        ig.system.getDrawPos(targetY),
                        targetW, targetH
                    );
                }

                ig.Image.drawCount++;
            },

            drawImage: function (sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
                sx = sx ? sx : 0;
                sy = sy ? sy : 0;
                if (arguments.length <= 2) {//if pass 2 vars or fewer
                    this.draw(sx, sy)
                } else if (arguments.length <= 4) { // pass 3/4 vars
                    sWidth = sWidth ? sWidth : this.width;
                    sHeight = sHeight ? sHeight : this.height;
                    this.draw(sx, sy, 0, 0, this.width, this.height, sWidth, sHeight);
                } else {//more than 4 vars
                    dx = dx ? dx : 0;
                    dy = dy ? dy : 0;
                    sWidth = sWidth ? sWidth : this.width;
                    sHeight = sHeight ? sHeight : this.height;
                    dWidth = dWidth ? dWidth : this.width;
                    dHeight = dHeight ? dHeight : this.height;
                    this.draw(dx, dy, sx, sy, sWidth, sHeight, dWidth, dHeight);
                }
            },

            drawCtx: function (ctx, targetX, targetY, sourceX, sourceY, width, height, targetW, targetH) {
                if (ig.packer.isImageInAtlas(this.path)) {
                    if (!this.atlasImage) {
                        this.atlasImage = ig.packer.getAtlasImage(this.path);
                        this.frameData = ig.packer.getFrameData(this.path);
                        this.width = this.frameData.frame.w;
                        this.height = this.frameData.frame.h;
                        if (!this.atlasImage) return;
                    }

                    sourceX = sourceX ? sourceX : 0;
                    sourceY = sourceY ? sourceY : 0;
                    width = width ? width : this.width;
                    height = height ? height : this.height;
                    targetW = targetW ? targetW : width;
                    targetH = targetH ? targetH : height;

                    ctx.drawImage(
                        this.atlasImage, sourceX + this.frameData.frame.x, sourceY + this.frameData.frame.y, width, height,
                        ig.system.getDrawPos(targetX),
                        ig.system.getDrawPos(targetY),
                        targetW, targetH
                    );

                }
                else {
                    sourceX = sourceX ? sourceX : 0;
                    sourceY = sourceY ? sourceY : 0;
                    width = width ? width : this.width;
                    height = height ? height : this.height;
                    targetW = targetW ? targetW : width;
                    targetH = targetH ? targetH : height;
                    ctx.drawImage(
                        this.data, sourceX, sourceY, width, height,
                        ig.system.getDrawPos(targetX),
                        ig.system.getDrawPos(targetY),
                        targetW, targetH
                    );
                }

                ig.Image.drawCount++;
            },

            drawImageCtx: function (ctx, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
                sx = sx ? sx : 0;
                sy = sy ? sy : 0;
                if (arguments.length <= 2) {//if pass 2 vars or fewer
                    this.drawCtx(ctx, sx, sy)
                } else if (arguments.length <= 5) { // pass 3/4 vars
                    sWidth = sWidth ? sWidth : this.width;
                    sHeight = sHeight ? sHeight : this.height;
                    this.drawCtx(ctx, sx, sy, 0, 0, this.width, this.height, sWidth, sHeight);
                } else {//more than 4 vars
                    dx = dx ? dx : 0;
                    dy = dy ? dy : 0;
                    sWidth = sWidth ? sWidth : this.width;
                    sHeight = sHeight ? sHeight : this.height;
                    dWidth = dWidth ? dWidth : this.width;
                    dHeight = dHeight ? dHeight : this.height;
                    this.drawCtx(ctx, dx, dy, sx, sy, sWidth, sHeight, dWidth, dHeight);
                }
            },

            drawTile: function (targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
                if (ig.packer.isImageInAtlas(this.path)) {
                    if (!this.atlasImage) {
                        this.atlasImage = ig.packer.getAtlasImage(this.path);
                        this.frameData = ig.packer.getFrameData(this.path);
                        this.width = this.frameData.frame.w;
                        this.height = this.frameData.frame.h;
                        if (!this.atlasImage) return;
                    }
                    tileHeight = tileHeight ? tileHeight : tileWidth;

                    var tileWidthScaled = Math.floor(tileWidth);
                    var tileHeightScaled = Math.floor(tileHeight);

                    var scaleX = flipX ? -1 : 1;
                    var scaleY = flipY ? -1 : 1;

                    if (flipX || flipY) {
                        ig.system.context.save();
                        ig.system.context.scale(scaleX, scaleY);
                    }
                    ig.system.context.drawImage(
                        this.atlasImage,
                        (Math.floor(tile * tileWidth) % this.width) + this.frameData.frame.x,
                        (Math.floor(tile * tileWidth / this.width) * tileHeight) + this.frameData.frame.y,
                        tileWidthScaled,
                        tileHeightScaled,
                        ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0),
                        ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
                        tileWidthScaled,
                        tileHeightScaled
                    );
                    if (flipX || flipY) {
                        ig.system.context.restore();
                    }
                    ig.Image.drawCount++;
                }
                else this.parent(targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY);
            },

            drawTileTint: function (tint, targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
                var tintedImageCanvas = this.getTintedImageCanvas(tint);
                if (tintedImageCanvas) {
                    tileHeight = tileHeight ? tileHeight : tileWidth;

                    if (!this.loaded || tileWidth > this.width || tileHeight > this.height) { return; }

                    var scale = ig.system.scale;
                    var tileWidthScaled = Math.floor(tileWidth * scale);
                    var tileHeightScaled = Math.floor(tileHeight * scale);

                    var scaleX = flipX ? -1 : 1;
                    var scaleY = flipY ? -1 : 1;

                    if (flipX || flipY) {
                        ig.system.context.save();
                        ig.system.context.scale(scaleX, scaleY);
                    }
                    ig.system.context.drawImage(
                        tintedImageCanvas,
                        (Math.floor(tile * tileWidth) % this.width) * scale,
                        (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale,
                        tileWidthScaled,
                        tileHeightScaled,
                        ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0),
                        ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
                        tileWidthScaled,
                        tileHeightScaled
                    );
                    if (flipX || flipY) {
                        ig.system.context.restore();
                    }

                    ig.Image.drawCount++;
                }
            },


            drawTint: function (tint, targetX, targetY, sourceX, sourceY, width, height, targetW, targetH) {
                var tintedImageCanvas = this.getTintedImageCanvas(tint);
                if (tintedImageCanvas) {
                    sourceX = sourceX ? sourceX : 0;
                    sourceY = sourceY ? sourceY : 0;
                    width = width ? width : this.width;
                    height = height ? height : this.height;
                    targetW = targetW ? targetW : width;
                    targetH = targetH ? targetH : height;
                    ig.system.context.drawImage(
                        tintedImageCanvas, sourceX, sourceY, width, height,
                        ig.system.getDrawPos(targetX),
                        ig.system.getDrawPos(targetY),
                        targetW, targetH
                    );
                    ig.Image.drawCount++;
                }
            },

            getTintedImageCanvas: function (tint) {
                if (this.tintCache[tint]) {
                    return this.tintCache[tint];
                } else {
                    if (ig.packer.isImageInAtlas(this.path)) {
                        if (!this.atlasImage) {
                            this.atlasImage = ig.packer.getAtlasImage(this.path);
                            this.frameData = ig.packer.getFrameData(this.path);
                            this.width = this.frameData.frame.w;
                            this.height = this.frameData.frame.h;
                            if (!this.atlasImage) return;
                        }
                    }

                    var canvas = ig.$new('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;

                    if (this.atlasImage) {
                        canvas.getContext('2d').drawImage(this.atlasImage, this.frameData.frame.x, this.frameData.frame.y, this.width, this.height, 0, 0, this.width, this.height);
                    } else {
                        canvas.getContext('2d').drawImage(this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
                    }


                    // Multiply algorithm based on https://github.com/Phrogz/context-blender

                    var ctx = canvas.getContext("2d");
                    var imgData = ctx.getImageData(0, 0, this.width, this.height);
                    var src = imgData.data;
                    var sA, dA = 1, len = src.length;
                    var sRA, sGA, sBA, dA2, demultiply;
                    var dRA = parseInt(tint.substr(1, 2), 16) / 255;
                    var dGA = parseInt(tint.substr(3, 2), 16) / 255;
                    var dBA = parseInt(tint.substr(5, 2), 16) / 255;

                    for (var px = 0; px < len; px += 4) {
                        sA = src[px + 3] / 255;
                        dA2 = (sA + dA - sA * dA);
                        sRA = src[px] / 255 * sA;
                        sGA = src[px + 1] / 255 * sA;
                        sBA = src[px + 2] / 255 * sA;

                        demultiply = 255 / dA2;

                        src[px] = (sRA * dRA + dRA * (1 - sA)) * demultiply;
                        src[px + 1] = (sGA * dGA + dGA * (1 - sA)) * demultiply;
                        src[px + 2] = (sBA * dBA + dBA * (1 - sA)) * demultiply;
                    }

                    ctx.putImageData(imgData, 0, 0);

                    this.tintCache[tint] = canvas;
                    return this.tintCache[tint];
                }
            }

        });

    });
