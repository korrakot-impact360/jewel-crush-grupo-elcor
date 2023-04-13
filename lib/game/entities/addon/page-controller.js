ig.module('game.entities.addon.page-controller')
.requires(
    'game.entities.addon.group',
	'game.entities.addon.custom-pointer'
)
.defines(function(){
	EntityPageController = EntityGroup.extend({
		name:"Controller",
        localState:{},
        isReady:false,
        init:function(x, y, settings){
            //Do something with construction
            this.parent(x, y, settings);
            if(!ig.global.wm){
                ig.game.tweens.removeAll();

                this.centerX = ig.game.centerX;
                this.centerY = ig.game.centerY;
                this.gw = ig.game.gw;
                this.gh = ig.game.gh;

                this.timeEvent = new ig.TimeEvent();
                
                ig.game.addOnReady = true;
                ig.game.groups = [];

                this.gBG = ig.game.addGroup(0, 0);
                this.gCont = ig.game.addGroup(0, 0);
                this.gFront = ig.game.addGroup(0, 0);
                this.gPointer = ig.game.addGroup(0, 0);

                ig.game.groups.push(this.gBG);
                ig.game.groups.push(this.gCont);
                ig.game.groups.push(this.gFront);
                ig.game.groups.push(this.gPointer);

                ig.game.checkZIndexGroups();
                
                this.gPointer.add(this);
                
                this.curtainBg = ig.game.spawnEntity(EntityManualDrawEntity, this.centerX, this.centerY)
                this.curtainBg.anchor.setTo(0.5);
                this.curtainBg.setShape(ig.system.width, ig.system.height)
                this.curtainBg.drawShape = function(){
                    var rect = ig.game.geom.rectangle(0, 0, this.width, this.height)
                    ig.game.geomDebug.rect(rect, 'black', this.alpha * ig.system.context.globalAlpha)
                }.bind(this.curtainBg)
                this.curtainBg.inputEnabled = true;
                this.curtainBg.alpha = 0;
                this.gPointer.add(this.curtainBg);
                
                ig.game.controller = this;

                var checkPointer = ig.game.getEntitiesByType(EntityPointer);
                // console.log(checkPointer)
                if(checkPointer.length > 0){
                    for(var a = 0; a < checkPointer.length; a++){
                        checkPointer[a].kill()
                    }
                }

                ig.game.pointer = ig.game.spawnEntity(EntityCustomPointer,ig.system.width/2, ig.system.height/2);
                // this.gPointer.add(ig.game.pointer);
                
                ig.game.sortEntitiesDeferred()

                if(ig.game.fps){
                    this.showFps = ig.game.addText(this.gw - 10, 10, '', 30, fonts.font1);
                    this.showFps.anchor.setTo(1, 0);
                    this.showFps.align = 'right'
                    this.showFps.fill = 'white';
                    this.gPointer.add(this.showFps)
                }
            }
        },

        createFSBtn:function(x, y){
            this.fsBtn = ig.game.spawnEntity(ig.FullscreenButton, x, y, { 
                enterImage: new ig.Image("media/graphics/misc/enter-fullscreen-transparent.png"), 
                exitImage: new ig.Image("media/graphics/misc/exit-fullscreen-transparent.png") 
            }); 
        },

        createSenteceTxt:function(text){
            var texts = text.split(' ');
            var returnTxt = [];
            for(var a = 0; a < texts.length; a++){
                var txt = texts[a];
                var t = [txt[0], txt.slice(1)];
                returnTxt.push(t);
            }

            return returnTxt;
        },

        groupTxts:function(texts, sizes, txtFill){
            var gTxts = ig.game.addGroup(0, 0);
            var tempTexts = [];
            for(var a = 0; a < texts.length; a++){
                for(var b = 0; b < texts[a].length; b++){
                    var t = texts[a][b];
                    var s = sizes[b];
                    var txt = ig.game.addText(0, 0, t, s, fonts.font1);
                    txt.anchor.setTo(0, 1);
                    txt.fill = txtFill;
                    gTxts.add(txt);

                    if(tempTexts.length > 0){
                        var prev = tempTexts[tempTexts.length - 1];
                        txt.x = prev.x + prev.size.x;
                    }

                    tempTexts.push(txt);
                }

                if(texts.length > 1){
                    var txt = ig.game.addText(0, 0, ' ', s, fonts.font1);
                    txt.anchor.setTo(0, 1);
                    txt.fill = txtFill;
                    gTxts.add(txt);

                    var prev = tempTexts[tempTexts.length - 1];
                    txt.x = prev.x + prev.size.x;
                    tempTexts.push(txt)
                }
            }

            return gTxts;
        },

        createGreyBg:function(){
            this.greyBg = ig.game.spawnEntity(EntityManualDrawEntity, this.centerX, this.centerY);
            this.greyBg.anchor.setTo(0.5);
            this.greyBg.setShape(ig.system.width, ig.system.height)
            this.greyBg.drawShape = function(){
                var rect = ig.game.geom.rectangle(0, 0, this.width, this.height)
                ig.game.geomDebug.rect(rect, 'black', ig.system.context.globalAlpha * 0.5)
            }.bind(this.greyBg)
            this.greyBg.inputEnabled = true;
            this.greyBg.visible = false;
            this.greyBg.alpha = 0
            this.gFront.add(this.greyBg);
        },

        updateOnOrientationChange:function(){
            if(!ig.game.useResponsive) return;
            if(this.greyBg) this.greyBg.setShape(ig.system.width, ig.system.height)
            if(this.curtainBg) this.curtainBg.setShape(ig.system.width, ig.system.height)
        },

        update:function(){
            this.parent();
            
            if(ig.game.fps){
                this.showFps.setText(ig.game.fps + ' FPS');
            } 
            
            // console.log(this.showFps.showText)
            this.timeEvent.update();
            
            if(!this.isReady){
                this.isReady = true;
                if(ig.game.transition) ig.game.transition.open();
                else {
                    if(this.curtainBg) this.curtainBg.visible = false; 
                }
            }
            
            if(this.fsBtn){
                this.fsBtn.update();
            }
        },

        draw:function(){
            this.parent();

            if(this.fsBtn){
                this.fsBtn.draw();
            }
        },

        kill:function(){
            ig.game.addOnReady = false;
            this.exists = false;
            this.parent();
        },
	})
})