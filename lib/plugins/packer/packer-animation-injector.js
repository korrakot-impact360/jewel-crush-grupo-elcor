/**
 * Packer plugin by Afif
 * Improved draw function by Tiyo (1.0.5)
 * Fix draw function injection where it doesn't behave like the original impact image draw on certain cases by Duc Le (1.0.7)
 * 
 * docs : https://bit.ly/mjs-packer-plugin
 */
ig.module('plugins.packer.packer-animation-injector')
    .requires(
        'impact.image',
        'impact.animation'
    ).defines(function () {

        ig.Animation.inject({
            tint: null,
            draw: function (targetX, targetY) {

                if (this.tint) {
                    var bbsize = Math.max(this.sheet.width, this.sheet.height);

                    // On screen?
                    if (
                        targetX > ig.system.width || targetY > ig.system.height ||
                        targetX + bbsize < 0 || targetY + bbsize < 0
                    ) {
                        return;
                    }

                    if (this.alpha != 1) {
                        ig.system.context.globalAlpha = this.alpha;
                    }

                    if (this.angle == 0) {
                        this.sheet.image.drawTileTint(
                            this.tint,
                            targetX, targetY,
                            this.tile, this.sheet.width, this.sheet.height,
                            this.flip.x, this.flip.y
                        );
                    } else {
                        ig.system.context.save();
                        ig.system.context.translate(
                            ig.system.getDrawPos(targetX + this.pivot.x),
                            ig.system.getDrawPos(targetY + this.pivot.y)
                        );
                        ig.system.context.rotate(this.angle);
                        this.sheet.image.drawTileTint(
                            this.tint,
                            -this.pivot.x, -this.pivot.y,
                            this.tile, this.sheet.width, this.sheet.height,
                            this.flip.x, this.flip.y
                        );
                        ig.system.context.restore();
                    }

                    if (this.alpha != 1) {
                        ig.system.context.globalAlpha = 1;
                    }
                } else {
                    this.parent(targetX, targetY);
                }

            }
        });

    });