python packerplugin_prep.py

if test -f packed.ftpp; 
    then
        echo ""
        echo "Running packer command..."
        echo ""
        free-tex-packer-cli --project packed.ftpp --output media/graphics/packed

        python packerplugin_post.py

        bash packerplugin_compress.sh

        dirpath=${PWD}/
        rootname="${dirpath%"${dirpath##*[!/]}"}" 
        rootname="${rootname##*/}"
        bash packerplugin_zip_cleanup.sh _factory/localization/$1/media.zip "../$rootname/"
fi

