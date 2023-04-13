ig.module('plugins.addon.state-addon')

.requires(
	'impact.game',
	'plugins.addon.custom-storage',
	'plugins.addon.random-generator',
	'plugins.addon.math-collection',
	'plugins.addon.custom-debug',
  'plugins.addon.time-event',
	'plugins.addon.geometry',
	'plugins.addon.world',
	'plugins.addon.asset-reader',
	'plugins.addon.call-asset',
	'plugins.addon.sprite-animation',
	'plugins.addon.custom-splashloader',
	'plugins.addon.entity-debug',

	//add on sprite
	'game.entities.addon.custom-entity',
	'plugins.addon.custom-image',
	'plugins.addon.raw-image',
	'game.entities.addon.sprite',
	'game.entities.addon.group',
	'plugins.addon.add-image',
	'game.entities.addon.custom-text',
	'game.entities.addon.manual-draw-entity',
	// 'game.entities.addon.advanced-custom-text',

	//objects
	'game.entities.objects.click-btn',
	'game.entities.objects.options',

	//game data
	'plugins.addon.game-data',

	//add transition
	'plugins.addon.transition'
)

.defines(function(){
	ig.Game.inject({
		groups : [],
		addOnReady : false,
		useResponsive:false,
		anchorType:'default',

		lastSystemSize:{x:0, y:0},

		pluginVersion:'1.0.12',

		checkedOtherEntities:[],
		drawedOtherEntities:[],

		prepareGame:function(){
			this.addOnReady = false;

			this.gw = ig.system.width;
			this.gh = ig.system.height;

			if(ig.responsive){
				this.useResponsive = true;
				this.gw = ig.responsive.originalWidth;
				this.gh = ig.responsive.originalHeight;
			}

			this.lastSystemSize.x = 0;
			this.lastSystemSize.y = 0;
			
			this.centerX = this.gw/2;
			this.centerY = this.gh/2;

			this.rnd = new ig.RandomGenerator([(Date.now() * Math.random()).toString()]);
			this.math = new ig.MathCollection();

			this.customTime = new ig.CustomTime();

			this.transition = new ig.Transition();
			this.transition.create();

			this.geomDebug = new ig.CustomDebug();
			this.geom = new ig.Geometry();

			this.entityDebug = new ig.EntityDebug()

			// this.sat = new ig.SAT();
		},

		loadLevel:function(data){
			ig.game.addOnReady = false;

			this.parent(data)
		},

		disableBtns:function(){
			for(var a = 0; a < ig.game.entities.length; a++){
        		var obj = ig.game.entities[a];
        		obj.inputEnabled = false;
        	}

        	if(_SETTINGS['MoreGames']['Enabled']){
        		if(curState().moreBtn && curState().moreBtn.exists){
        			curState().moreBtn.hide();
        		}
        	}
		},

		updateGroups:function(){
			for(var a = 0; a < this.groups.length; a++){
				var group = this.groups[a];
				group.update();
			}
		},

		drawGroups:function(){
			// debugger;
			for(var a = 0; a < this.groups.length; a++){
				var group = this.groups[a];
				group.draw();
			}
		},

		update:function(){
			if(!ig.game.addOnReady){
				this.parent();
			} else {				
				if( this._levelToLoad ) {
					this.loadLevel( this._levelToLoad );
					this._levelToLoad = null;
				}
				
				// update entities
        if (this.customTime) this.customTime.update();

        this.checkedOtherEntities = [];

				this.updateGroups();

				//use marketjs plugins
				for(var a = 0; a < this.entities.length; a++){
					var ent = this.entities[a];
					var checkIdx = this.checkedOtherEntities.indexOf(ent)
					if(!ent.useCustomEntity && checkIdx < 0){
						ent.update()
						this.checkedOtherEntities.push(ent)
					}
				}

				if(this.transition) this.transition.update();

				this.checkEntities();
				
				// remove all killed entities
				for( var i = 0; i < this._deferredKill.length; i++ ) {
					this._deferredKill[i].erase();
					this.entities.erase( this._deferredKill[i] );
				}
				this._deferredKill = [];
				
				// sort entities?
				if( this._doSortEntities || this.autoSort ) {
					this.sortEntities();
					this._doSortEntities = false;
				}
				
				// update background animations
				for( var tileset in this.backgroundAnims ) {
					var anims = this.backgroundAnims[tileset];
					for( var a in anims ) {
						anims[a].update();
					}
				}
			}
			
			if(this.useResponsive){				
        if(this.lastSystemSize.x != ig.system.width || this.lastSystemSize.y != ig.system.height){
        	this.isPortrait = ig.system.width < ig.system.height;
        	this.lastSystemSize.x = ig.system.width;
        	this.lastSystemSize.y = ig.system.height
            for(var a = 0; a < this.entities.length; a++){
                var entity = this.entities[a];
                if(typeof(entity.updateOnOrientationChange) == 'function'){
                    entity.updateOnOrientationChange()
                }
            }
        }
			}
		},

		draw:function(){
			if(!ig.game.addOnReady){
				this.parent();
			} else {				
				if( this.clearColor ) {
					ig.system.clear( this.clearColor );
				}
				
				// This is a bit of a circle jerk. Entities reference game._rscreen 
				// instead of game.screen when drawing themselfs in order to be 
				// "synchronized" to the rounded(?) screen position
				this._rscreen.x = ig.system.getDrawPos(this.screen.x)/ig.system.scale;
				this._rscreen.y = ig.system.getDrawPos(this.screen.y)/ig.system.scale;
				
				
				var mapIndex;
				for( mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
					var map = this.backgroundMaps[mapIndex];
					if( map.foreground ) {
						// All foreground layers are drawn after the entities
						break;
					}
					map.setScreenPos( this.screen.x, this.screen.y );
					map.draw();
				}

				this.drawedOtherEntities = [];
				
				this.drawGroups();

				//use marketjs plugins
				for(var a = 0; a < this.entities.length; a++){
					var ent = this.entities[a];
					var checkIdx = this.drawedOtherEntities.indexOf(ent)
					if(!ent.useCustomEntity && checkIdx < 0){
						ent.draw()
						this.drawedOtherEntities.push(ent)
					}
				}

				if(this.transition) this.transition.draw();

				if(ig.Entity._debugEnableChecks && ig.Entity._debugShowBoxes){
					this.entityDebug.drawDebugBoxes()
				}
				
				for( mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
					var map = this.backgroundMaps[mapIndex];
					map.setScreenPos( this.screen.x, this.screen.y );
					map.draw();
				}
			}
		},

		parentPos:function(parent){
			var position = {x:0, y:0};
			var greatParent = false;
			while(!greatParent){
				position = this.countPos(parent, position);
				if(parent.groupParent){
					parent = parent.groupParent;
				} else {
					greatParent = true;
				}
			}
			
			return position;
		},

		countPos:function(parent, position){
			position.x += parent.x;
			position.y += parent.y;
			return position;
		},

		checkVisibility:function(object){
			var visible = true;
			if(!object.visible){
				if(!object.forseenVisible){
					visible = false;
				}
			} else {
				var greatParent = false;
				var parent = object;
				while(!greatParent){
					if(parent.groupParent){
						parent = parent.groupParent;
						if(!parent.visible){
							if(!parent.forseenVisible){
								visible = false;
							}
						}
					} else {
						greatParent = true;
					}
				}
			}

			return visible;
		},

		checkZIndexGroups:function(){
			this.tempZIndex = 0;
			for(var a = 0; a < this.groups.length; a++){
				var group = this.groups[a];
				group.zIndex = this.tempZIndex;
				this.tempZIndex++;
				// console.log(group.name);
				if(group.children && group.children.length > 0){
					this.checkZIndexChildren(group);
				}
			}

			this.sortEntitiesDeferred();
		},

		checkZIndexChildren:function(group){
			var children = group.children;
			for(var a = 0; a < children.length; a++){
				var child = children[a];
				child.zIndex = this.tempZIndex;
				this.tempZIndex++;
				if(child.children && child.children.length > 0){
					this.checkZIndexChildren(child);
				}
			}
		},

		generateFrameNames:function(min, max, exception){
			exception = exception ? exception : [];
			var array = [];
			for(var a = min; a <= max; a++){
				var checkException = exception.indexOf(a);
				if(checkException >= 0) continue;
				array.push(a);
			}

			return array;
		},

		addGroup:function(x, y, settings, className){
			className = className ? className : EntityGroup;
			return ig.game.spawnEntity(className, x, y, settings);
		},

		addText:function(x, y, text, fontSize, fontType, settings, className){
			className = className ? className : EntityCustomText;
			var showText = ig.game.spawnEntity(className, x, y, settings);
			showText.inputProperty(text, fontSize, fontType);
			// console.log(showText.size)
			return showText;
		},
		
		changePage:function(stageName){
			// ig.game.director.loadLevel(idx);
			ig.game.disableBtns();
			if(!isNaN(stageName)){
				var idx = stageName;
			} else {
				var idx = ig.game.director.levels.indexOf(stageName);
			}
			
			if(this.transition){
				ig.game.transition.close(idx);
			} else {
				ig.game.director.jumpTo(stageName)
			}
		},

		decideHHMMSS:function(time){
			time = this.countSec(time);

			var hour = parseInt(time / 3600);

			var remainTime = time - (hour * 3600);
			var minute = parseInt(remainTime / 60);

			remainTime = remainTime - (minute * 60);
			var sec = parseInt(remainTime);

			var hourTxt = hour + '';
			if(hour < 10) hourTxt = '0' + hour;

			var minTxt = minute + '';
			if(minute < 10) minTxt = '0' + minute;

			var secTxt = sec + '';
			if(sec < 10) secTxt = '0' + sec;

			return {h : hourTxt, m : minTxt, s : secTxt};
		},

		countMin:function(time){
			time = this.countSec(time);

			var minute = parseInt(time / 60);
			var sec = parseInt(time - (minute * 60));

			var minTxt = minute + '';
			if(minute < 10) minTxt = '0' + minute;

			var secTxt = sec + '';
			if(sec < 10) secTxt = '0' + sec;

			var showTime = minTxt + ':' + secTxt;
			return showTime;
		},

		countSec:function(time){
			var tempTime = Math.floor(time);
			var showTime = tempTime;

			if(tempTime > 0){
				var checkTime = time % tempTime;

				if(checkTime > 0){
					// console.log(checkTime)
					showTime = tempTime + 1;
				}
			} else {
				if(time > tempTime){
					showTime += 1;
				} else {
					showTime = 0;
				}
			}

			return showTime;
		},

		writeThousands:function(score){
			var showScore = score + '';

			if(score >= 1000){
				var count = 0;
				var countScore = showScore;
				showScore = '';
				for(var a = countScore.length - 1; a >= 0; a--){
					var toShow = countScore[a];
					if(count % 3 == 0 && a < countScore.length - 1){
						toShow += ',';
						count = 0;
					}

					var tempShow = toShow + showScore;
					showScore = tempShow;

					count++;
				}
			}

			return showScore;
		},

		upperCase:function(text){
			var word = text[0].toUpperCase() + text.slice(1);
			return word;
		},
	});
});

var fontReady = false;
var fonts = {
	font1 : 'rager',
};

var _t = function(string) {
	var r = string;

	for (var i = 1; i < arguments.length; i++) {
		var replaced = false;
		while(!replaced){
	    	var temp = r.replace('%'+i, arguments[i]);	    	
	    	if(temp != r){
	    		r = temp;
	    	} else {
	    		replaced = true
	    	}
		}
	}

	return r;
};

var curState = function(){
	return ig.game.controller;
};

var csound = {
	sfxPlay : function(name){
		try {
			return ig.soundHandler.sfxPlayer.play(name);
		} catch(e){}
	},

	sfxStop:function(name){
		return ig.soundHandler.sfxPlayer.soundList[name].stop();
	},

	sfxIsPlaying:function(name){
		return ig.soundHandler.sfxPlayer.soundList[name].playing();
	},

	sfxVol:function(name, volume){
		ig.soundHandler.sfxPlayer.soundList[name].volume(volume);
	},
};

var stringToFunction = function(str) {
  var arr = str.split(".");

  var fn = (window || this);
  for (var i = 0, len = arr.length; i < len; i++) {
    fn = fn[arr[i]];
  }

  if (typeof fn !== "function") {
    throw new Error("function not found");
  }

  return  fn;
};

var jsonCache = {};
var imgCache = {};
var spriterCache = {};
var hiddenCanvases = {};
var passSplash = false;

var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);