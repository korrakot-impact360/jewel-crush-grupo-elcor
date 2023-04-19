zipfile=$1
unsortedlistfile="tools/packed.list"
emptyfolderslistfile="tools/packed-empty.list"
listfile="tools/packed-unique.list"
pathprefix="$2"

echo ""  
echo "Starting zip media cleanup..."
echo ""
echo "zip internal prefix : $pathprefix"
echo ""

if test -f "$1"; 
    then
        echo "zip file found : $zipfile"
        
        if test -f "$unsortedlistfile"; 
            then
                echo ""  
                echo "list file found : $unsortedlistfile"
                echo ""         
                #remove duplicate lines
                awk '!seen[$0]++' $unsortedlistfile > $listfile

                while IFS="" read -r p || [ -n "$p" ]
                do
                    trimmedfilename=${p%%[[:space:]]}
                    zip -d "$1" "$pathprefix$trimmedfilename"
                done < $listfile

                rm "$listfile"

                if test -f "$emptyfolderslistfile"; 
                    then
                        echo ""  
                        echo "empty folder list file found : $emptyfolderslistfile"
                        echo ""         

                        while IFS="" read -r p || [ -n "$p" ]
                        do
                            trimmedfoldername=${p%%[[:space:]]}
                            zip -d "$1" "$pathprefix$trimmedfoldername"
                        done < $emptyfolderslistfile
                        
                    else 
                        echo "empty folder list file not found : $emptyfolderslistfile"        
                fi

            else 
                echo "List file not found : $unsortedlistfile"        
                echo ""      
                echo "Aborting..."        
                echo ""      
        fi
    else
        echo "Zipfile not found : $zipfile"
        echo ""      
        echo "Aborting..."        
        echo ""      
fi

echo "Done!"