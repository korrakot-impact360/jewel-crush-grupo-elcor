/*
* To make handling of api's easier we are going to need a handler
* You have access to all globals and also additional stuff to define
*/
ig.module(
	'plugins.handlers.api-handler'
)
.requires(
)
.defines(function(){
	ig.ApiHandler = ig.Class.extend({
		
		apiAvailable:{
			MJSPreroll:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS 
							&& _SETTINGS['Ad']['Mobile']['Preroll']['Enabled'])
						{
							MobileAdInGamePreroll.Initialize();
						}
					}
				}
			},
			
			MJSHeader:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS['Ad']['Mobile']['Header']['Enabled'])
						{
							MobileAdInGameHeader.Initialize();
						}
					}
				}
			},
			
			MJSFooter:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS['Ad']['Mobile']['Footer']['Enabled'])
						{
							MobileAdInGameFooter.Initialize();
						}
					}
				}
			},
			
			MJSEnd:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS['Ad']['Mobile']['End']['Enabled'])
						{
							MobileAdInGameEnd.Initialize();
						}
					}
				}
			},
			
			/*
			* I do not know what the point of this when mjssettings.js
			* does not define the actual settings to use this.
			* Need feedback to correct
			*/
            /*
			MJSGameCenter:function(){
				if(_SETTINGS)
				{
					if(_SETTINGS['MarketJSGameCenter']){				
						if(_SETTINGS['MarketJSGameCenter']['Activator']['Enabled']){
							if(_SETTINGS['MarketJSGameCenter']['Activator']['Position']){
								console.log('MarketJSGameCenter activator settings present ....')
								$('.gamecenter-activator').css('top',_SETTINGS['MarketJSGameCenter']['Activator']['Position']['Top']);
								$('.gamecenter-activator').css('left',_SETTINGS['MarketJSGameCenter']['Activator']['Position']['Left']);
							}				
						}
						$('.gamecenter-activator').show();			
					}else{
						console.log('MarketJSGameCenter settings not defined in game settings')
					}
				}
			},
			*/
            
			/* 
			* Note this would not work without the api
			* E.g using Hola showing ad
			* ig.apiHandler.run("holaInit");
			*/
            /*
			holaShowFullAd:function(params)
			{
				if(Math.random() < 0.6)
				{
					Hola.GameJsAdSdk.showAd({
							placement_id: 'd31b4c592c9f4397ae5d238afb9f7c34_a',
							placement_type:1,
							impression_time: 8,
							closable: true,
							on_error: function (e) {
								console.log('showAd.on_error', e);
							}
					});
				}
				ig.game.spawnEntity(EntityShareButton,494,410);
				ig.game.spawnEntity(EntityCommentButton,568,410);
			},
			holaInit:function(params)
			{
				Hola.GameJsAdSdk.init({
			        	    debug: true,
			        	    app_id: 'd31b4c592c9f4397ae5d238afb9f7c34',
			        	    on_error: function (e) {
			        	    	console.log('init.on_error', e);
			        	    },
			        	});	
			}
            */
		},
		
		run:function(apiId,params)
		{
			if(this.apiAvailable[apiId])
			{
				this.apiAvailable[apiId](params);
			}
		},
		
	});	
});