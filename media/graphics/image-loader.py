import os
import re
import json

print "Finding spritesheet.js inside project folder..."

rootDir = os.getcwd()
aboveDir = os.path.split(rootDir)[0]
projectDir = os.path.split(aboveDir)[0]

fileLocation = "spritesheet.js"

isFileFound = 0

for path, dir, files in os.walk(projectDir):
    for file in files:
        if file == fileLocation:
            fileLocation = os.path.join(path, file)
            print "File found : " + fileLocation
            isFileFound = 1
            break

if isFileFound == 0:
    print "File not found. create one on working directory..."

print "Begin walking..."

imageDetected = []

exclude = set(['packed'])
for path, dir, files in os.walk(rootDir, topdown=True):
    dir[:] = [d for d in dir if d not in exclude]
    for file in files:
        ext = os.path.splitext(file)[1];
        fileName = os.path.splitext(file)[0]
        if ext == '.png' or ext == '.PNG':
            imageDetected.append(fileName)

# print(imageDetected)

isAtlas = []
for path, dir, files in os.walk(projectDir, topdown=True):
    dir[:] = [d for d in dir if d not in exclude]
    for file in files:
        for img in imageDetected:
            ext = os.path.splitext(file)[1]
            imgName = img
            fileName = os.path.splitext(file)[0]
            if ext == '.json':
                if fileName == imgName:
                    isAtlas.append(fileName)
                    print(fileName)

fo = open(fileLocation, 'w')
print rootDir

fo.write('var _SPRITESHEET = {')

a = 0
for path, dir, files in os.walk(projectDir):
    for file in files:
        for img in isAtlas:
            ext = os.path.splitext(file)[1]
            fileName = os.path.splitext(file)[0]
            if fileName == img and ext == '.json':
                    a += 1
                    jsonLoc = os.path.join(path, file)
                    jsonFile = open(jsonLoc)
                    data = json.load(jsonFile)
                    strData = json.dumps(data)
                    content = "\n\t\"" + fileName + "\":{\"" #+ strData

                    b = 0
                    for dataName in data:
                        if(dataName != 'meta'):
                            if(b > 0):
                                content += ",\""

                            content += dataName + "\":" + json.dumps(data[dataName])

                        b += 1

                    content += '}'                        

                    if a < len(isAtlas):
                        content += ','
                    fo.write(content)
                    jsonFile.close()

fo.write('\n}')
fo.close()