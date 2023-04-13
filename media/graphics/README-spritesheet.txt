Software requirement : TEXTURE PACKER (free or paid mode)

============GENERAL===========
1. I store the raw images (before being compressed in to spritesheet) in PROJECT_PATH/_temp
2. (IMPORTANT) Name of the spritesheet based on folder name. For example:
	- I store the raw files in _temp/ingame
	- Drag 'ingame folder' in to Texture Packer
	- Make sure the .png name and .json name have same name as the folder: ingame
3. Build by Texture Packer with settings(advanced) :
	a. Data Format : JSON(Array) >> Keep as JSON(Array)
	b. Trim sprite names activated (checked)
	c. Prepend folder name activated (checked)
	d. Uncheck/deactivate Allow Rotation
	e. Trim Mode set to None
	f. You can save the .png file and .json file in separate place as long as it is under one project folder and have same name (e.g : ingame.json and ingame.png)
4. Click [Publish sprite sheet] button to create the spritesheet and the json file
5. Make sure there is spritesheet.js on PROJECT_PATH/media/texts, if not, make the empty one
6. After the sprite sheet is made and spritesheet.js available, run image-loader.py from PROJECT_PATH/media/graphics. There are 2 ways to run it:
	a. Using Git Bash : make sure you're in the same folder as the image-loader.py then run : python image-loader.py, or
	b. Double click the file to run it

SETTINGS GUIDE WITH PICTURE : http://bit.ly/tex-packer-settings

==FOR PROGRAMMER==
7. There are two ways of using spritesheet.js :
	a. Make sure the spritesheet.js path is registered in load.js and push.sh and push-production.sh (both placed after strings.js), if not, add it, or
	b. Copy paste the spritesheet.js content in to strings.js

=====IMPORTANT FOR PLAYAD FOR PROGRAMMER=====
1. Copy all the spritesheet.js content in to sprite-sheet.js. You can see the example in the sprite-sheet.js for var _SPRITESHEET
2. Search the content of _SPRITESHEET and delete "app" variable, and "smartupdate" variable.
3. Skip the no.7 step in GENERAL above

===========ADD SPRITESHEET TO GAME FOR PROGRAMMER===========
PLEASE CHECK THE SPLASH-LOADER.JS
1. (IMPORTANT) Make sure all the image and spritesheet data is preloaded at splash-screen.js
2. (IMPORTANT) Make sure there is no similar name of image from loaded ingame image. If there is, check step no.5 in this section
3. Prepare the variables :
    loadAssets:[],
    customResources:[],
    at splash-loader.js	and remove the above arrays at custom-splashloader.js. This is for next programmer who'll change this project for integration or reskin so they'll easily notice the arrays at splash-loader.js.
4. There are 2 ways of loading image via splash loader :
	a. Call new ig.Image at 'customResources' array like adding in 'resources' Array, this way it'll make sure to register the path at imgCache that'll be use later in my plugin 
	b. Add it in loadAssets array in this format :
		{
			type: "image",
			name: "image-name",
			path: "image-path ex. media/graphics/game/image-name.png"
		}
	(IMPORTANT) The second method MUST be applied in PLAYAD version, since the path will be changed by the encoded image
5. If there are similar name, make sure you use the second method at no.4 step to differentiate the variable name to use to call image in code. Usually its for MULTILANGUAGE INTEGRATION game. For example :
	- There are 2 types of image for english and other language
	- Use the 2nd method for differentiate it :
		{
			type: "image",
			name: "image-name-en",
			path: "image-path ex. media/graphics/translate/en/image-name.png"
		}
		{
			type: "image",
			name: "image-name-cn",
			path: "image-path ex. media/graphics/translate/cn/image-name.png"
		}
	- PLEASE notice the differentiation of object's name eventhough they have similar name placed at other folder
6. Then you should add the spritesheet data (if any for the image) in to loadAssets array in this format :	
		{
			type: "json",
			name: "image-name"
		}
	Remember the name of the json should be the same with the name of the image associated with it. 
	In this plugin version, just left the path blank

contact Qorry for assistance