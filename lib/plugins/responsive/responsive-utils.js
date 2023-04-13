/**
 * Responsive plugin by Afif
 * 
 * dependency : size-handler
 * 
 * docs : http://bit.ly/responsive-plugin-doc
 */
ig.module('plugins.responsive.responsive-utils')
    .requires(
        'impact.system'
    ).defines(function () {

        ig.responsive = {
            width: 0,
            height: 0,
            halfWidth: 0,
            halfHeight: 0,
            originalWidth: 0,
            originalHeight: 0,

            fillScale: 1,
            scaleX: 1,
            scaleY: 1,

            toAnchor: function (x, y, type) {
                switch (type) {
                    case "top-left": case "left-top": return this.toAnchorTopLeft(x, y);
                    case "top-center": case "center-top": case "top": return this.toAnchorTopCenter(x, y);
                    case "top-right": case "right-top": return this.toAnchorTopRight(x, y);
                    case "left-middle": case "middle-left": case "left": return this.toAnchorLeftMiddle(x, y);
                    case "center-middle": case "middle-center": case "middle": case "center": return this.toAnchorCenterMiddle(x, y);
                    case "right-middle": case "middle-right": case "right": return this.toAnchorRightMiddle(x, y);
                    case "bottom-left": case "left-bottom": return this.toAnchorBottomLeft(x, y);
                    case "bottom-center": case "center-bottom": case "bottom": return this.toAnchorBottomCenter(x, y);
                    case "bottom-right": case "right-bottom": return this.toAnchorBottomRight(x, y);
                    default: return this.toAnchorDefault(x, y);
                }
            },

            toAnchorDefault: function (x, y) {
                return { x: x + (this.width - this.originalWidth) / 2, y: y + (this.height - this.originalHeight) / 2 };
            },

            toAnchorCenterMiddle: function (x, y) {
                return { x: x + this.halfWidth, y: y + this.halfHeight }
            },

            toAnchorLeftMiddle: function (x, y) {
                return { x: x, y: y + this.halfHeight };
            },

            toAnchorTopCenter: function (x, y) {
                return { x: x + this.halfWidth, y: y };
            },

            toAnchorRightMiddle: function (x, y) {
                return { x: x + this.width, y: y + this.halfHeight };
            },

            toAnchorBottomCenter: function (x, y) {
                return { x: x + this.halfWidth, y: y + this.height };
            },

            toAnchorTopLeft: function (x, y) {
                return { x: x, y: y };
            },

            toAnchorBottomLeft: function (x, y) {
                return { x: x, y: y + this.height };
            },

            toAnchorTopRight: function (x, y) {
                return { x: x + this.width, y: y };
            },

            toAnchorBottomRight: function (x, y) {
                return { x: x + this.width, y: y + this.height };
            },

            fromPos: function (x, y, anchorType) {

            },

            fromPosDefault: function (x, y) {

            },

            fromPosCenterMiddle: function (x, y) {

            },

            fromPosLeftMiddle: function (x, y) {

            },

            fromPosTopCenter: function (x, y) {

            },

            fromPosRightMiddle: function (x, y) {

            },

            fromPosBottomCenter: function (x, y) {

            },

            fromPosTopLeft: function (x, y) {

            },

            fromPosBottomLeft: function (x, y) {

            },

            fromPosTopRight: function (x, y) {

            },

            fromPosBottomRight: function (x, y) {

            },

            drawScaledImage: function (img, x, y, scaleX, scaleY, anchorX, anchorY) {
                if (!anchorX) anchorX = 0;
                if (!anchorY) anchorY = 0;
                var ctx = ig.system.context;
                ctx.save();
                ctx.translate(x, y);
                if (scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
                img.draw(-img.width * anchorX, -img.height * anchorY);
                ctx.restore();
            },

        }
    });