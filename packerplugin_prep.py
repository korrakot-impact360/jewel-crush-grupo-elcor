import os
import shutil
import json
import re
import packerplugin_get_image_size
import xml.etree.ElementTree as ET


print ""
print "Packer Plugin Script v1.1.6"

##################################### GLOBAL VARS #####################################
rootDir = os.getcwd()
pluginLibPath =os.path.join(rootDir,"lib", "plugins", "packer") 
templatePath = os.path.join(pluginLibPath,"template.ftpp")
settingsPath = os.path.join(pluginLibPath,"packer-settings.json")
mediaDir = os.path.join(rootDir,"media")
libDir = os.path.join(rootDir,"lib")
saveDir = os.path.join(rootDir,"media","graphics","packed")
ftppPath = os.path.join(rootDir,"packed.ftpp")
packedListFileName = "packed.list"
packedListFilePath = os.path.join(rootDir,"tools", packedListFileName)
bigImageListFileName = "big.list"
bigImageListFilePath = os.path.join(rootDir,"tools", bigImageListFileName)
emptyFolderListFileName = "packed-empty.list"
emptyFolderListFilePath = os.path.join(rootDir,"tools",emptyFolderListFileName)
imageList = []
bigImageList = []

##################################### LOAD SETTINGS #####################################
settings = {
    "enabled":True,
    "textureSize":2048,
    "compression":"imagemin",
    "qualityMin":1,
    "qualityMax":1,
    "qualityJpg":80
}

def loadSetting() :
    global settings
    if os.path.exists(settingsPath):
        with open(settingsPath) as data_file:    
            settings = json.load(data_file)

##################################### CREATE FTPP #####################################

def searchJsImageRefs():
    print ""
    print "    searching for media image references in javascripts..."

    global imageList

    for root, subdirs, files in os.walk(libDir):
        for filename in files:
            file_path = os.path.join(root, filename)
            if file_path.endswith(".js") :
                with open(file_path, 'rb') as f:
                    f_content = f.read()

                    doubleQuotes = re.findall(r'"([^"]*)"', f_content)
                    for doubleQuote in doubleQuotes :
                        if doubleQuote.startswith("media/") :
                            if doubleQuote.endswith(".jpg") or doubleQuote.endswith(".png"):
                                if not doubleQuote.endswith("invisible.png"):
                                    imageList.append(doubleQuote)
                    
                    singleQuotes = re.findall(r"'(.*?)'", f_content)
                    for singleQuote in singleQuotes :
                        if singleQuote.startswith("media/") :
                            if singleQuote.endswith(".jpg") or singleQuote.endswith(".png"):
                                if not singleQuote.endswith("invisible.png"):      
                                    imageList.append(singleQuote)

def searchScmlImageRefs():
    global imageList
    for root, subdirs, files in os.walk(mediaDir):
        for filename in files:
            file_path = os.path.join(root, filename)
            if  file_path.endswith(".scml") :
                xmltree = ET.parse(file_path)
                xmlroot = xmltree.getroot()
                for spriterFolder in xmlroot.findall("folder"):
                    spriterFolderName = spriterFolder.get("name")
                    # print "folder : "+spriterFolderName
                    for spriterFile in spriterFolder.findall("file"):
                        spriterFileName = spriterFile.get("name")
                        mediaRoot = "media" + file_path.split("media").pop()
                        mediaRoot = os.path.split(mediaRoot.replace("\\", "/"))[0]
                        imageFullPath = mediaRoot+"/"+spriterFileName
                        # print imageFullPath
                        imageList.append(imageFullPath)


def validateImageList():
    global imageList
    global bigImageList
    # remove duplicate entry
    imageList = list(dict.fromkeys(imageList))
    imageTempList = []
    maxSize = settings["textureSize"]
    hasShownWarning = 0

    print "    validating images, max size: "+str(maxSize)

    for img in imageList:
        # check if the image is actually exist
        if os.path.exists(img):
            # check if the image is less than Max Size
            width, height = packerplugin_get_image_size.get_image_size(img)
            if width < maxSize and height<maxSize :
                imageTempList.append(img)
            else :
                bigImageList.append(img)
                if hasShownWarning == 0:
                    print ""
                    print "    WARNING : excluding these images because from atlas exceeding max dimension (" + str(maxSize) +")"
                    print ""
                    hasShownWarning = 1
                print "    " + img + " ("+str(width)+", "+str(height)+")"

    if hasShownWarning == 1:
        print ""

    # set list back to original variable
    imageList = imageTempList;

def createFtpp():
    global imageList
    print ""
    print "Creating ftpp project file..."
    searchJsImageRefs()
    searchScmlImageRefs()
    validateImageList()

    if os.path.exists(templatePath):
        print "    reading template..."
        with open(templatePath) as data_file:    
            jsonData = json.load(data_file)
        
        print "    modifying info..."
        print ""
        jsonData["savePath"] = saveDir
        jsonData["images"] = []

        for img in imageList:
            print "    +" + img
            imgName = img
            imgPath = os.path.join(rootDir,os.path.normpath(img))
            jsonData["images"].append({"name":imgName, "path":imgPath, "folder":""})

        jsonData["packOptions"]["savePath"] = saveDir
        jsonData["packOptions"]["width"] = settings["textureSize"]
        jsonData["packOptions"]["height"] = settings["textureSize"]
        
        print ""
        if(os.path.exists(ftppPath)) :
            os.remove(ftppPath)
            print "    existing ftpp found, deleting..."

        print "    writing new ftpp file..."
        with open(ftppPath, 'w') as outfile:
            json.dump(jsonData, outfile, indent=4)
        print "Done!"
    else :
        print "    ERROR: ftpp template not found."

##################################### WRITING FILE LIST INTO packed.list #####################################
def writePackedList():
    global imageList
    global bigImageList
    print ""
    print "Writing "+packedListFileName+"..."

    with open(packedListFilePath, 'w') as filehandle:
        for listitem in imageList:
            filehandle.write('%s\n' % listitem)
        for biglistitem in bigImageList:
            filehandle.write('%s\n' % biglistitem)
            
    with open(bigImageListFilePath, 'w') as filehandle:
        for biglistitem in bigImageList:
            filehandle.write('%s\n' % biglistitem)
            
    print "Done!"

##################################### WRITING EMPTY FOLDER LIST #####################################
def countFolderContent(folderPath):
    if os.path.exists(folderPath):
        contents = os.listdir(folderPath);
        return len(contents)
    else :
        return 1000

def writeEmptyFolderList():
    global imageList
    print ""
    print "Writing "+emptyFolderListFileName+"..."

    folderList = []
    folderDict = {}
    emptyFolders = []
    for item in imageList:
        folderName = os.path.split(item)[0]
        folderList.append(folderName)
        
        if(folderName in folderDict):
            folderDict[folderName] += 1
        else:
            folderDict[folderName] = 1

    folderList = list(dict.fromkeys(folderList))

    for item in folderList:
        fileCount = countFolderContent(item)
        deletedCount = folderDict[item]
        
        if(fileCount == deletedCount):
            emptyFolders.append(item)
            print "    +" + item

    with open(emptyFolderListFilePath, 'w') as filehandle:
        for item in emptyFolders:
            filehandle.write('%s\n' % item)

    print "Done!"

##################################### CLEANUP #####################################
def cleanupFiles():
    if(os.path.exists(packedListFilePath)):
        os.remove(packedListFilePath)

    if(os.path.exists(bigImageListFilePath)):
        os.remove(bigImageListFilePath)

    if(os.path.exists(emptyFolderListFilePath)):
        os.remove(emptyFolderListFilePath)

    if(os.path.exists(ftppPath)):
        os.remove(ftppPath)
    
    if(os.path.isdir(saveDir)):
        shutil.rmtree(saveDir)
    os.mkdir(saveDir)

##################################### HANDLE BIG FILES #####################################
def handleBigFiles():
    global bigImageList
    if len(bigImageList):
        print ""
        print "Create individual textures for big images"

    filecount = 0
    for item in bigImageList:
        print "    "+item
        width, height = packerplugin_get_image_size.get_image_size(item)

        filename = ""
        imagename = ""
        jsonname = ""
        if(item.endswith("png")):
            filename = os.path.join(saveDir, "big-png-" + str(filecount))
            imagename=filename+".png"
        else :
            filename = os.path.join(saveDir, "big-jpg-" + str(filecount))
            imagename=filename+".jpg"
        shutil.copyfile(item, imagename)
        jsonname=filename+".json"

        data={}
        data["frames"]={}
        data["frames"][item]={
            "frame":{
                "x":0,
                "y":0,
                "w":width,
                "h":height,
            }
        }
        with open(jsonname, 'w') as outfile:
            json.dump(data, outfile)

        filecount += 1
    print "Done!"
##################################### EXECUTE #####################################
cleanupFiles()
loadSetting()
if(settings["enabled"]):
    createFtpp()
    writePackedList()
    writeEmptyFolderList()
    handleBigFiles()
else :
    print ""
    print "Plugin is disabled, aborting..."
    print ""