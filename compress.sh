#! /bin/bash

if [ ! -f ../www.zip ]; 
	then
    	echo "File not found!"
	else
		echo "File exist. Removing"
		rm ../www.zip
fi

zip -r ./www.zip ./index.html ./game.js ./game.css ./media ./branding

bash packerplugin_zip_cleanup.sh www.zip

#git add --all
#git commit -m "updating"
#git push origin master