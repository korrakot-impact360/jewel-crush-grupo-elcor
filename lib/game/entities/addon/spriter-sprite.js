ig.module('game.entities.addon.spriter-sprite')
.requires(
	'game.entities.addon.custom-entity'
)
.defines(function(){
	EntitySpriterSprite = EntityCustomEntity.extend({
		scml:null,
		spriterData:{
			x:0,
			y:0,
			w:0,
			h:0,
		},
		animationName:'',
		type : ig.Entity.TYPE.A,
		init:function(x, y, settings){
			this.parent(x, y, settings)

			this.x = x;
			this.y = y;

			this.onClick = new ig.AddSignal(this);
			this.onRelease = new ig.AddSignal(this);

			this.spriter = ig.game.spawnEntity(SpriterDisplay, 0, 0, {scml:this.scml, gravityFactor:0})

			this.resetStamps()
			
            this.onComplete = new ig.AddSignal(this)
            this.onLoop = new ig.AddSignal(this)
            this.onStart = new ig.AddSignal(this);
		},

		clicked:function(){
			// console.log('click')
			if(this.isClicked) return;
			this.isClicked = true;		
			this.onClick.dispatch(this);	
		},

		released:function(){
			if(!this.isClicked) return;
			this.isClicked = false;
			this.onRelease.dispatch(this);
		},		

		setProperty:function(){
			var box = this.setOnCanvasData()

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}

			this.pos.x = box.x - screenX
			this.pos.y = box.y - screenY

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(this.pos.x, this.pos.y, ig.game.anchorType)
				this.pos.x = anchorPos.x;
				this.pos.y = anchorPos.y;
			}
			
			this.size.x = box.width;
			this.size.y = box.height;

			var _tempScaleX = this.lastScale.x;
			var _tempScaleY = this.lastScale.y;
			var curScaleX = this.scale.x;
			var curScaleY = this.scale.y;

			if(curScaleX != _tempScaleX || curScaleY != _tempScaleY){
				this.scale.x = parseFloat(this.scale.x.toFixed(2));
				this.scale.y = parseFloat(this.scale.y.toFixed(2));
				this.setScale(this.scale.x, this.scale.y)
			}
			
			if(this.position.x != this.x || this.position.y != this.y){
				this.position.setTo(this.x, this.y);
			}

			if(this.angle != this._angle){
				this.setAngle(this.angle);
			}

			if(this.rotation != this._rotation){
				this.setRotation(this.rotation);
			}

			this.anchor.setTo(0);
		},

		setScale:function(x, y){
			this.scale.setTo(x, y);
			this.lastScale.setTo(x, y);
			this._scale.setTo(x, y);
		},

		resetStamps:function(){
			this.animationName = this.spriter.animation.name;
			this.loopCount = 0;
            this.onCompleteDispatched = false;
            this.onLoopDispatched = false;
            this.onStartDispatched = false;
		},

		updateAnimation:function(){
			if(this.spriter.finished){
                if(!this.onCompleteDispatched){
                    // console.log('anim complete')
                    this.onCompleteDispatched = true;
                    this.onComplete.dispatch()
                }
			} else {
				if(this.spriter.keyIndex === 0){
					if(!this.onStartDispatched){
						this.onStartDispatched = true;
						this.onStart.dispatch()
					} else {
						if(this.spriter.animation.loopType === SpriterAnimationLooping.LOOPING){
							if(!this.onLoopDispatched){
								this.onLoopDispatched = true;
								if(this.loopCount > 0){
									this.onLoop.dispatch()
								}

								this.loopCount++;
							}
						}
					}	
				} else {
					if(this.spriter.animation.loopType === SpriterAnimationLooping.LOOPING){
						this.onLoopDispatched = false;
					}
				}
			}
		},

		getSpriterDimension:function(){
			var objects = this.spriter.objects;
			var minX = null;
			var maxX = null;
			var minY = null;
			var maxY = null;
			for(var a = 0; a < objects.length; a++){
				var obj = objects[a];
				var objData = this.getObjTransformData(obj)
				var parent = objData.parent;
				var positions = objData.positions;

                var countedPos = [];
                for(var b = 0; b < positions.length; b++){
                	var oriPos = positions[b];                	
	                var position = ig.World.countPos(parent, oriPos)

	                if(minX == null){
	                	minX = position.x;
	                } else {
	                	if(position.x < minX){
	                		minX = position.x;
	                	}
	                }

	                if(minY == null){
	                	minY = position.y;
	                } else {
	                	if(position.y < minY){
	                		minY = position.y;
	                	}
	                }

	                if(maxX == null){
	                	maxX = position.x;
	                } else {
	                	if(position.x > maxX){
	                		maxX = position.x;
	                	}
	                }

	                if(maxY == null){
	                	maxY = position.y;
	                } else {
	                	if(position.y > maxY){
	                		maxY = position.y;
	                	}
	                }
                }
			}

			this.spriterData.x = minX;
			this.spriterData.y = minY;
			this.spriterData.w = maxX - minX;
			this.spriterData.h = maxY - minY;

			this.width = this.spriterData.w;
			this.height = this.spriterData.h;
		},

		getObjTransformData:function(obj){
			var t = obj.transformed;
			var img = obj.image;
            var w = img.width;
            var h = img.height;

            var parent = {
            	scale:{x:t.scaleX,y:t.scaleY},
            	x:t.x,
            	y:t.y,
            	_rotation:(t.angle).toRad()
            }

            var oriX = (-w * t.pivotX);
            var oriY = (-h * t.pivotY);
            var oriRight = oriX + w;
            var oriBottom = oriY + h;

            if(obj.attachedImages && obj.attachedImages[obj.imageKey]){
            	var attachData = obj.attachedImages[obj.imageKey]

                var sourceW = attachData.image.width;
                var sourceH = attachData.image.height;
                if(attachData.frameName){
                	var imgData = ig.CallAsset.searchSpriteData(attachData.frameName);
                	if(imgData){
                		sourceW = imgData.sourceSize.w;
                		sourceH = imgData.sourceSize.h;
                	}
                }

            	var attachX = oriX + attachData.x;
            	var attachY = oriY + attachData.y;
            	var attachW = sourceW;
            	var attachH = sourceH;
            	var attachRight = attachX + attachW;
            	var attachBottom = attachY + attachH;

            	if(attachX < oriX){
            		oriX = attachX
            	}

            	if(attachY < oriY){
            		oriY = attachY
            	}

            	if(attachRight > oriRight){
            		oriRight = attachRight
            	}

            	if(attachBottom > oriBottom){
            		oriBottom = attachBottom
            	}
            }

			var positions = [
            	{x:oriX,y:oriY},
            	{x:oriRight,y:oriY},
            	{x:oriRight,y:oriBottom},
            	{x:oriX, y:oriBottom}
            ]

            return {positions:positions, parent:parent};
		},

		setOnCanvasData:function(){
			var sizeX = this.width;
			var sizeY = this.height;

			var normalX = (this.spriterData.x);
			var normalY = (this.spriterData.y);

			var bound = ig.game.geom.rectangle(normalX, normalY, sizeX, sizeY);
			var points = [];
			points[0] = {x:bound.x, y:bound.y};
			points[1] = {x:bound.right,y:bound.y};
			points[2] = {x:bound.right,y:bound.bottom};
			points[3] = {x:bound.x,y:bound.bottom};

			for(var a = 0; a < points.length; a++){
				var pos = ig.World.parentPos(this, points[a].x, points[a].y);
				points[a] = {x:pos.x,y:pos.y};
			}

			var box = ig.World.getBounds(points)

			return box;
		},

		getBounds:function(){	
			var posX = this.pos.x;
			var posY = this.pos.y;
			var sizeX = this.size.x;
			var sizeY = this.size.y;

			var bound = ig.game.geom.rectangle(posX, posY, sizeX, sizeY)
			var minX = bound.x;
			var maxX = bound.right;
			var minY = bound.y;
			var maxY = bound.bottom;

			var bound = this.parent(minX, maxX, minY, maxY)
			return bound;
		},

		update:function(){
			this.updateOtherEntities()

			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}

			this.getSpriterDimension();
			// this.setLength();

			this.setProperty();

			this.spriter.update()

			if(this.animationName != this.spriter.animation.name){
				this.resetStamps()
			}

			this.updateAnimation()

			this.updateChildren();

			if(this.isClicked){
				if(!ig.input.state('click')){
					this.released();
				}
			}
		},

		draw:function(){
			this.drawOtherEntities()
			
			if(!this.exists) return;
			if(ig.game.addOnReady){
				if(this.zIndex < 0) return;
			}
			if(!this.visible) return;

			var screenX = ig.game.screen.x;
			var screenY = ig.game.screen.y;
			if(this.isCameraLock){
				screenX = 0
				screenY = 0
			}

			var parentPos = this.groupParent ? ig.game.parentPos(this.groupParent) : {x:0, y:0};
			var parentX = parentPos.x;
			var parentY = parentPos.y;
			var targetX = parentX + this.x - screenX;
			var targetY = parentY + this.y - screenY;

			if(ig.game.useResponsive && this.isResponsive){
				var anchorPos = ig.responsive.toAnchor(targetX, targetY, ig.game.anchorType)
				targetX = anchorPos.x;
				targetY = anchorPos.y;			
			}
			
			var flipX = 1;
			var flipY = 1;
			if(this.scale.x < 0) flipX = -1;
			if(this.scale.y < 0) flipY = -1;

			var context = ig.system.context;
			context.save();

			if( this.alpha != 1) {
				ig.system.context.globalAlpha *= this.alpha;
			}

			context.translate(
				ig.system.getDrawPos(targetX),
				ig.system.getDrawPos(targetY)
			);

			context.rotate(this.rotation);

			context.scale(this._scale.x, this._scale.y);

			if(flipX < 0 || flipY < 0){
				context.save();
				context.scale(flipX, flipY);
			}

			this.spriter.draw()

			context.translate(
				ig.system.getDrawPos(-targetX),
				ig.system.getDrawPos(-targetY)
			);

			this.drawChildren();
			
			if(flipX < 0 || flipY < 0){
				context.restore();
			}

			context.restore();
		}
	})
})