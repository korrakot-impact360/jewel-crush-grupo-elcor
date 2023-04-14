ig.module('plugins.splash-loader')
.requires(
    'impact.loader',
    'impact.animation'
)
.defines(function() {
    ig.SplashLoader = ig.Loader.extend({
        tapToStartDivId: "tap-to-start",         

        loadAssets:[
            {type:"json",name:"ingame"},
            {type:"json",name:"game"},
        ],
        
        customResources:[
            new ig.Image('media/graphics/backgrounds/bg-01.png'),
            new ig.Image('media/graphics/backgrounds/game-bg-01.png'),
            new ig.Image('media/graphics/sprites/ingame.png'),
            new ig.Image('media/graphics/sprites/game.png'),
        ],

        bg : new ig.Image('media/graphics/loading/loading-bg-01.png'),
        barBg : new ig.Image('media/graphics/loading/loading-bar-bg.png'),
        barLoad : new ig.Image('media/graphics/loading/loading-bar.png'),
        logo : new ig.Image('media/graphics/loading/title.png'),
        midLogo : new ig.Image('media/graphics/loading/loading-logo.png'),

        init:function(gameClass,resources){
            this.parent(gameClass,resources);
            
            // ADS
            ig.apiHandler.run("MJSPreroll");
        },

        end:function(){
            this._endParent = this.parent;
			this._drawStatus = 1;

            // return;
            
            if (_SETTINGS['TapToStartAudioUnlock']['Enabled']) {
                this.tapToStartDiv(function() {
                    /* play game */
                    this._endParent();
                    if (typeof (ig.game) === 'undefined' || ig.game == null) {
						ig.system.setGame( this.gameClass );
					}
                }.bind(this));
            }
            else {
                /* play game */
                this._endParent();
                if (typeof (ig.game) === 'undefined' || ig.game == null) {
                    ig.system.setGame( this.gameClass );
                }
            }

            // CLEAR CUSTOM ANIMATION TIMER
            // window.clearInterval(ig.loadingScreen.animationTimer);

            this.draw();
        },
        
        tapToStartDiv:function( onClickCallbackFunction ){
            this.desktopCoverDIV = document.getElementById(this.tapToStartDivId);
            
            // singleton pattern
            if ( this.desktopCoverDIV ) {
                return;
            }
            
            /* create DIV */
            this.desktopCoverDIV = document.createElement("div");
            this.desktopCoverDIV.id = this.tapToStartDivId;
            this.desktopCoverDIV.setAttribute("class", "play");
            this.desktopCoverDIV.setAttribute("style", "position: absolute; display: block; z-index: 999999; background-color: rgba(23, 32, 53, 0.7); visibility: visible; font-size: 10vmin; text-align: center; vertical-align: middle; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;");
            this.desktopCoverDIV.innerHTML = "<div style='color:white;background-color: rgba(255, 255, 255, 0.3); border: 2px solid #fff; font-size:20px; border-radius: 5px; position: relative; float: left; top: 50%; left: 50%; transform: translate(-50%, -50%);'><div style='padding:20px 50px; font-family: montserrat;'>" + _STRINGS["Splash"]["TapToStart"] + "</div></div>";
            
            
            /* inject DIV */
            var parentDIV = document.getElementById("play").parentNode || document.getElementById("ajaxbar");
            parentDIV.appendChild(this.desktopCoverDIV);
            
            /* reize DIV */
            try {
                if ( typeof (ig.sizeHandler) !== "undefined" ) {
                    if ( typeof (ig.sizeHandler.coreDivsToResize) !== "undefined" ) {
                        ig.sizeHandler.coreDivsToResize.push( ("#"+this.tapToStartDivId) );
                        if ( typeof (ig.sizeHandler.reorient) === "function" ) {
                            ig.sizeHandler.reorient();
                        }
                    }
                }
                else if ( typeof (coreDivsToResize) !== "undefined" ) {
                    coreDivsToResize.push(this.tapToStartDivId);
                    if ( typeof (sizeHandler) === "function" ) {
                        sizeHandler();
                    }
                }
            } catch (error) {
                console.log(error);
            }
            
            
            /* click DIV */
            this.desktopCoverDIV.addEventListener("click", function(){
                ig.soundHandler.unlockWebAudio();
            
                /* hide DIV */
                this.setAttribute("style", "visibility: hidden;");
            
                /* end function */
                if ( typeof (onClickCallbackFunction) === "function" ) {
                    onClickCallbackFunction();
                }
            });
        },

        setupCustomAnimation:function(){
            this.animHeight = this.customAnim.height;
            this.animWidth = this.customAnim.width;
            this.customAnim = new ig.Animation(this.customAnim, 0.025, [0,1,2,3,4,5,6,7]);
            // this.customAnim.currentFrame = 0;

            // // Assign this class instance an arbitrary name
            // ig.loadingScreen = this;

            // // Create an external timer variable
            // ig.loadingScreen.animationTimer = window.setInterval('ig.loadingScreen.animate()',100);
        },

        animate:function(){
            // Somehow the update() function doesn't work in Loader class. Resort to using external timer to increment
            // current frame in anim object

            // if(this.customAnim.currentFrame<this.customAnim.sequence.length){
            //     this.customAnim.currentFrame++;
            // }else{
            //     this.customAnim.currentFrame=0;
            // }
            // this.customAnim.gotoFrame(this.customAnim.currentFrame);
            ig.Timer.step();
			this.customAnim.update();
        },


        drawCheck: 0,
        draw: function() {
            this._drawStatus += (this.status - this._drawStatus)/5;
            
            //Check the game screen. see if the font are loaded first. Removing the two lines below is safe :)
            if(this.drawCheck === 1) console.log('Font should be loaded before loader draw loop');
            if(this.drawCheck < 2) this.drawCheck ++;
            

            // CLEAR RECTANGLE
            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect( 0, 0, ig.system.width, ig.system.height );

            var context = ig.system.context;
            context.save()

            this.gw = ig.system.width;
            this.gh = ig.system.height;
            this.centerX = this.gw/2;
            this.centerY = this.gh/2;

            context.save()
            var scaleX = this.gw / this.bg.width;
            var scaleY = this.gh / this.bg.height;
            var bgScale = Math.max(scaleX, scaleY)

            context.translate(this.centerX, this.centerY)
            context.scale(bgScale, bgScale)
            var bgX = -(this.bg.width/2)
            var bgY = -(this.bg.height/2)
            this.bg.draw(bgX, bgY);
            context.restore()

            var oriX = this.centerX;
            var oriY = this.gh * 0.88;

            this.logo.draw(oriX - (this.logo.width * 0.5), 5)
            this.midLogo.draw(oriX - (this.midLogo.width * 0.5), (this.gh * 0.55) - (this.midLogo.height * 0.5))

            var x = oriX;
            var y = oriY;
            if(this.barBg.width > 0){
                x -= (this.barBg.width * 0.5)
            }
            if(this.barBg.height > 0){
                y -= (this.barBg.height * 0.5)
            }
            this.barBg.draw(x, y)

            x = oriX;
            y = oriY;
            var sizeX = 0;
            var sizeY = 0;
            if(this.barLoad.width > 0){
                x -= this.barLoad.width * 0.5;
                sizeX = this.barLoad.width * this._drawStatus;
            }
            if(this.barLoad.height > 0){
                y -= (this.barLoad.height * 0.5) + 2;
                sizeY = this.barLoad.height;
            }

            this.barLoad.draw(x, y, 0, 0, sizeX, sizeY)

            context.restore()

            this.drawVersion();
        },

        drawVersion: function() {
			if (typeof(_SETTINGS.Versioning) !== "undefined" && _SETTINGS.Versioning !== null) {
                if (_SETTINGS.Versioning.DrawVersion) {
                    var ctx = ig.system.context;
					fontSize = _SETTINGS.Versioning.FontSize,
					fontFamily = _SETTINGS.Versioning.FontFamily,
					fillStyle = _SETTINGS.Versioning.FillStyle

					ctx.save();
					ctx.textBaseline="bottom";
					ctx.textAlign="left";
					ctx.font = fontSize + " " + fontFamily || "10px Arial";
					ctx.fillStyle = fillStyle || '#ffffff';
					ctx.fillText("v" + _SETTINGS.Versioning.Version + "+build." + _SETTINGS.Versioning.Build, 10, ig.system.height - 10);
					ctx.restore();
                }
			}
		}
    });
});
