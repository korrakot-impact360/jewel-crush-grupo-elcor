bytesToHumanReadable() {
    local i=${1:-0} d="" s=0 S=("K" "M" "GB" "TB" "PB" "EB" "YB" "ZB")
    while ((i > 1024 && s < ${#S[@]}-1)); do
        printf -v d ".%02d" $((i % 1024 * 100 / 1024))
        i=$((i / 1024))
        s=$((s + 1))
    done
    echo "$i$d${S[$s]}"
}

textures="tools/textures.list"
settings="tools/imagemin.settings"

echo ""  
echo "Compressing images..."
echo ""

if test -f "$textures"; 
    then
        if test -f "$settings"; 
            then
                # echo "Texture list found : $textures"

                read -r firstline<$settings
                trimmedfirstline=${firstline%%[[:space:]]}
                arr=(${trimmedfirstline//|/ })
                method=${arr[0]}
                min=${arr[1]}
                max=${arr[2]}
                jpgquality=${arr[3]}
  
                echo "Compression settings "
                if [ $method == "pngquant" ];
                    then
                        echo "    PNG: pngquant quality $min to $max"
                    else
                        echo "    PNG: imagemin default"
                fi

                echo "    JPG: mozjpeg quality $jpgquality"

                echo ""

                totalOriginal=0
                totalCompressed=0
                while IFS="" read -r p || [ -n "$p" ]
                do
                    trimmedfilename=${p%%[[:space:]]}
                    
                    inputImage="media/graphics/packed/$trimmedfilename.png"
                    outputImage="media/graphics/packed/$trimmedfilename.compressed.png"
                    isjpg=0
                    if [[ $inputImage == *"big-jpg"* ]]; 
                        then
                            isjpg=1
                            inputImage="media/graphics/packed/$trimmedfilename.jpg"
                            outputImage="media/graphics/packed/$trimmedfilename.compressed.jpg"
                    fi
                    # echo "$inputImage"
                    # echo $inputImage
                    # echo $outputImage
                    # echo "imagemin $inputImage --plugin.pngquant.quality={$min,$max} > $outputImage"

                    if [ $isjpg == 1 ];
                        then
                            imagemin $inputImage --plugin.mozjpeg.quality=$jpgquality > $outputImage
                        else
                            if [ $method == "pngquant" ];
                                then
                                    imagemin $inputImage --plugin.pngquant.quality={$min,$max} > $outputImage
                                    
                                    originalsize=$(du -k $inputImage | awk '{print $1}')
                                    compressedsize=$(du -k $outputImage | awk '{print $1}')
                                    
                                    if [ "$originalsize" == "$compressedsize" ]
                                        then
                                            echo "$inputImage     bad quality, retry with imagemin"
                                            rm $outputImage
                                            imagemin $inputImage > $outputImage
                                    fi

                                else
                                    imagemin $inputImage > $outputImage
                            fi
                    fi

                    originalsize=$(du -k $inputImage | awk '{print $1}')
                    compressedsize=$(du -k $outputImage | awk '{print $1}')
                    originalsizeReadable=$(du -h $inputImage | awk '{print $1}')
                    compressedsizeReadable=$(du -h $outputImage | awk '{print $1}')
                    
                    totalOriginal=$(($totalOriginal+$originalsize))
                    totalCompressed=$(($totalCompressed+$compressedsize))

                    echo "$inputImage     $originalsizeReadable > $compressedsizeReadable"
                    

                    #delete original image
                    rm $inputImage
                    mv $outputImage $inputImage


                done < $textures

                echo ""
                ori="$(bytesToHumanReadable $totalOriginal)"
                comp="$(bytesToHumanReadable $totalCompressed)"
                percent=$((100-$totalCompressed*100/$totalOriginal))
                echo "Total Size Compressed $ori to $comp ($percent% smaller)"
            else
                echo "Settings file not found : $settings"
                echo ""      
                echo "Aborting..."        
                echo ""      
        fi
    else
        echo "Texture list not found : $textures"
        echo ""      
        echo "Aborting..."        
        echo ""      
fi

echo "Done!"