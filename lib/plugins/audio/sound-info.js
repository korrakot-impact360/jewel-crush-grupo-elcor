/**
 *  SoundHandler
 *
 *  Created by Justin Ng on 2014-08-19.
 *  Copyright (c) 2014 __MyCompanyName__. All rights reserved.
 */

ig.module('plugins.audio.sound-info')
.requires(
)
.defines(function () {

    SoundInfo = ig.Class.extend({
		/* MP3 ONLY, root folder is media/audio/ */

		sfx: {
			logosplash1: { path: "opening/logosplash1" },
			logosplash2: { path: "opening/logosplash2" }

			,click:{path:"sfx/click"}
			,match1:{path:"sfx/match1"}
			,match2:{path:"sfx/match2"}
			,match3:{path:"sfx/match3"}
			,slide:{path:"sfx/slide"}
			,bomb:{path:"sfx/bomb"}
			,effect:{path:"sfx/effect"}
			,samecolor:{path:"sfx/samecolor"}
			,starpop:{path:"sfx/star-pop"}
		},
		
		bgm:{
			background: { path:'bgm/bgm', loop: true }
		}
    });

});
