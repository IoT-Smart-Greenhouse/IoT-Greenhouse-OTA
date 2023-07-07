const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function extractVersionNumber(filename) {
    try {
        const fileContents = fs.readFileSync(filename, 'utf8');
        const regex = /{APP_VERSION:"(\d+\.\d+\.\d+)"}/;
        const match = fileContents.match(regex);

        if (match && match[1]) {
            return match[1];
        } else {
            throw new Error('Version number not found in file.');
        }
    } catch (error) {
        throw new Error(`Error reading file: ${error}`);
    }
}

function replaceVersionNumberAndFiles(filename, newVersion, fileInfoArray) {
    try {
        const fileContents = fs.readFileSync(filename, 'utf8');
        const jsonData = JSON.parse(fileContents);

        jsonData['greenhouseFrontendVersion'] = newVersion;
        jsonData['greenhouseFrontendUiFileList'] = fileInfoArray;

        const updatedContents = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(filename, updatedContents);

        console.log(`Version number replaced successfully with '${newVersion}' in file: ${filename}`);
    } catch (error) {
        throw new Error(`Error reading or writing file: ${error}`);
    }
}

function calculateMD5Hash(filepath) {
    const hash = crypto.createHash('md5');
    const fileData = fs.readFileSync(filepath);
    hash.update(fileData);
    return hash.digest('hex');
}

function listFilesWithMD5Hashes(folderPath, verTag) {
    const filesWithHashes = [];
    function traverseFolder(currentPath) {
        const files = fs.readdirSync(currentPath);
        files.forEach((file) => {
            const filePath = path.join(currentPath, file);
            const fileStat = fs.statSync(filePath);
            if (fileStat.isFile()) {
                const hash = calculateMD5Hash(filePath);
                filesWithHashes.push({ 
                    fileUrl: 'https://raw.githubusercontent.com/IoT-Smart-Greenhouse/IoT-Greenhouse-OTA/'+ verTag + '/' + filePath, 
                    targetPath: filePath.replace("frontend/", "www/"), 
                    md5: hash,
                    size: fileStat.size
                });
            } else if (fileStat.isDirectory()) {
                traverseFolder(filePath);
            }
        });
    }
    traverseFolder(folderPath);
    return filesWithHashes;
}

const filenameToExtractVersionNumber = 'frontend/index.html';
const jsonVersionsFile = 'stable_versions.json';
const versionNumber = extractVersionNumber(filenameToExtractVersionNumber);
const tagName = process.env.GIT_TAG_NAME;
if(tagName){
    const filesWithHashes = listFilesWithMD5Hashes('frontend', tagName);
    console.log("Generated MD5 hashes for " + filesWithHashes.length + " frontend files");
    replaceVersionNumberAndFiles(jsonVersionsFile, versionNumber, filesWithHashes)
} else {
    throw new Error("Missing environment variable GIT_TAG_NAME to provide git tag name to create file list for");
}
