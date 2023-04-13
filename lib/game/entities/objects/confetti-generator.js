/**
 *  Confettigenerator
 *
 *  Created by Justin Ng on 2014-02-20.
 *  Copyright (c) 2014 __MyCompanyName__. All rights reserved.
 */

ig.module('game.entities.objects.confetti-generator')
.requires(
    // 'impact.entity'
    'game.entities.addon.custom-entity'
)
.defines(function () {

    EntityConfettiGenerator = EntityCustomEntity.extend({
        size: { x: 20, y: 23 },
		colour1:{r:190,g:67,b:67},
		colour2:{r:186,g:205,b:5},
		colour3:{r:7,g:106,b:28},
		confettiArea:{x:960,y:540},
		particles:[],
		_MAXPARTICLES:25,
		
		tilt: Math.floor(Math.random() * 10) - 10,
		tiltAngleIncremental: (Math.random() * 0.07) + .05,
        tiltAngle: 0,
		angle:0,
		TiltChangeCountdown:5,
		exists : true,
		isStop : false,
		
        init: function (x, y, settings) 
		{
            this.parent(x, y, settings);
			
			if(settings._MAXPARTICLES){
				this._MAXPARTICLES = settings._MAXPARTICLES;
			}

			if(settings.isStop){
				this.isStop = settings.isStop;
			}
			
			
			for (var i = 0; i < this._MAXPARTICLES; i++) 
			{
				this.randomColour = Math.floor((Math.random()*3)+1); // 1-3
				switch(this.randomColour)
				{
					case 1:
						this.colour = this.colour1;
					break;

					case 2:
						this.colour = this.colour2;
					break;

					case 3:
						this.colour = this.colour3;
					break;
				}
				
				this.particles.push
				({
					x: Math.random() * this.confettiArea.x, //x-coordinate
			        y: Math.random() * -this.confettiArea.y, //y-coordinate
			        // y:-10,
			        r: this.randomFromTo(5, 30), //radius
			        d: (Math.random() * this._MAXPARTICLES) + 10, //density
			        color: "rgb("+ this.colour.r+","+this.colour.g+","+this.colour.b+")",
			        tilt: Math.floor(Math.random() * 10) - 10,
			        tiltAngleIncremental: (Math.random() * 0.07) + .05,
			        tiltAngle: 0
			    });
			}
			
			//this.confettiTimer = new ig.Timer();
        },

        kill:function(){
        	this.exists = false;
        	this.parent();
        },

		update:function()
		{
			this.updateOtherEntities()

			// debugger;
			this.angle += 0.01;
			this.tiltAngle += 0.1;
			this.TiltChangeCountdown--;
			var count = 0;
			for (var i = 0; i < this._MAXPARTICLES; i++) 
			{
				var p = this.particles[i];

			    //Sending flakes back from the top when it exits
			    //Lets make it a bit more organic and let flakes enter from the left and right also.
			    if (p.x > this.confettiArea.x + this.size.x || p.x < -this.size.x || p.y > this.confettiArea.y + this.size.y) 
				{

					if(this.isStop) continue;

					if (i % 5 > 0 || i % 2 == 0) //66.67% of the flakes
			        {
						this.particles[i] = { x: Math.random() * this.confettiArea.x, y: -10, r: p.r, d: p.d, color: p.color, tilt: Math.floor(Math.random() * 10) - 10, tiltAngle: p.tiltAngle, tiltAngleIncremental: p.tiltAngleIncremental };
			        }
			        else 
					{
						//If the flake is exitting from the right
			            if (Math.sin(this.angle) > 0) 
						{
							//Enter from the left
			                this.particles[i] = { x: -5, y: Math.random() * this.confettiArea.y, r: p.r, d: p.d, color: p.color, tilt: Math.floor(Math.random() * 10) - 10, tiltAngleIncremental: p.tiltAngleIncremental };
			            }
						else 
						{
							//Enter from the right
			                this.particles[i] = { x: this.confettiArea.x + 5, y: Math.random() * this.confettiArea.y, r: p.r, d: p.d, color: p.color, tilt: Math.floor(Math.random() * 10) - 10, tiltAngleIncremental: p.tiltAngleIncremental };
			            }
			        }
			    } else {
			    	count++;
				    p.tiltAngle += p.tiltAngleIncremental;
				    
					//Updating X and Y coordinates
				    //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
				    //Every particle has its own density which can be used to make the downward movement different for each flake
				    //Lets make it more random by adding in the radius
				    p.y += (Math.cos(this.angle + p.d) + 1 + p.r / 2) / 2;
				    p.x += Math.sin(this.angle);
				    
				   	//p.tilt = (Math.cos(p.tiltAngle - (i / 3))) * 15;
				    p.tilt = (Math.sin(p.tiltAngle - (i / 3))) * 15;
			    }
			}

			if(this.isStop && count == 0){
				this.kill();
			}
			
			this.parent();
		},

		draw:function()
		{
			this.drawOtherEntities()
			
			var ctx = ig.system.context;
			
			ctx.save();
				//ctx.clearRect(0, 0, 480, 640);
				for (var i = 0; i < this._MAXPARTICLES; i++) 
				{
					var p = this.particles[i];
				    ctx.beginPath();
				    ctx.lineWidth = p.r / 2;
				    ctx.strokeStyle = p.color;  // Green path
				    ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
				    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
				    ctx.stroke();  // Draw it
				}
				ctx.restore();
		
			this.parent();
		},
		
		randomFromTo:function(from, to) 
		{
		    return Math.floor(Math.random() * (to - from + 1) + from);
		}
    
    });

});