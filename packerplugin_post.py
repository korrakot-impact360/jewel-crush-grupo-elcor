import os
import shutil
import json
import re

def line_prepender(filename, line):
    with open(filename, 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write(line.rstrip('\r\n') + '\n' + content)

##################################### LOAD SETTINGS #####################################
settingsPath = os.path.join(os.getcwd(),"lib", "plugins", "packer","packer-settings.json")
settings = {
    "enabled":True,
    "textureSize":2048,
    "compression":"imagemin",
    "qualityMin":1,
    "qualityMax":1,
    "qualityJpg":80
}

def loadSetting():
    global settings
    if os.path.exists(settingsPath):
        with open(settingsPath) as data_file:    
            settings = json.load(data_file)

def processNumberString(str):
    if "." in str:
        return "."+str.split(".")[1]
    return str

def writeCompressionSettings():
    global settings
    rootDir = os.getcwd()
    compressionSettingsFileName = "imagemin.settings"
    compressionSettingsFilePath = os.path.join(rootDir,"tools", compressionSettingsFileName)

    if os.path.exists(compressionSettingsFilePath):
        os.remove(compressionSettingsFilePath)

    minstr = processNumberString(str(settings["qualityMin"]))
    maxstr = processNumberString(str(settings["qualityMax"]))
    jpg = processNumberString(str(settings["qualityJpg"]))

    compressionSetting = settings["compression"]+"|"+minstr+"|"+maxstr+"|"+jpg
    with open(compressionSettingsFilePath, 'w') as filehandle:
        filehandle.write('%s\n' % compressionSetting)
    
##################################### POST PACKER RUN CLEANUP #####################################
def cleanUpPacker():
    print ""
    print "Cleaning up packer..."

    rootDir = os.getcwd()
    ftppPath = os.path.join(rootDir,"packed.ftpp")

    if(os.path.exists(ftppPath)) :
        os.remove(ftppPath)

    print "Done!"

##################################### INJECT INFO TO GAME.JS #####################################
def injectInfo():
    print ""
    print "Finding texture files..."

    rootDir = os.getcwd()
    packedDir = os.path.join(rootDir,"media","graphics","packed")
    textureCount = 0
    textures = []

    if os.path.isdir(packedDir) :
        print "    directory found : " + packedDir
        for path, dir, files in os.walk(packedDir):
            for file in files:
                ext = os.path.splitext(file)[1]
                filename = os.path.splitext(file)[0]
                if(ext == '.json' and (filename.startswith('texture') or filename.startswith('big'))):
                    textureCount += 1
                    textures.append(filename)

    else :
        print "    ERROR : packed folder not found..."

    if textureCount > 0:
        print "    textures found : ", textureCount

        gameJsFilePath = os.path.join(rootDir,"game.js")
        if os.path.exists(gameJsFilePath):
            print "    game.js found."
            print "    injecting line..."

            added_line = "window.packerplugin={textures : ["

            for texture in textures:
                added_line+=('"'+ texture +'",')

            added_line +="]};"
            added_line+=" window.packerplugin.json={};";

            rootDir = os.getcwd()
            textureListFileName = "textures.list"
            textureListPath = os.path.join(rootDir,"tools", textureListFileName)
            if os.path.exists(textureListPath):
                os.remove(textureListPath)
            with open(textureListPath, 'w') as filehandle:
                for texture in textures:
                    filehandle.write('%s\n' % texture)


            for texture in textures:
                added_line+=" window.packerplugin.json['"+texture+"'] = '";
                texturePath = os.path.join(rootDir,"media","graphics","packed",texture+".json")
                pngPath = os.path.join(rootDir,"media","graphics","packed",texture+".png")
                # print texturePath
                f = open(texturePath)
                textureJson = json.load(f)
                f.close()
                # print textureJson
                added_line+=json.dumps(textureJson);
                added_line+="';"

                os.remove(texturePath)

            line_prepender(gameJsFilePath,added_line)
            print "Done!"
        else :
            print "    ERROR : game.js not found"

    print ""

def deleteJson():
    print ""
    print "Deleting json files..."
    print "Done!"

def compressImage():
    print ""
    print "Deleting json files..."
    print "Done!"
    
loadSetting()
if settings["enabled"]:
    writeCompressionSettings();
    cleanUpPacker()
    injectInfo();