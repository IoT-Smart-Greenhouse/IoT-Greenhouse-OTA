const fs = require('fs');
const crypto = require('crypto');

function calculateMD5Hash(filepath) {
    const hash = crypto.createHash('md5');
    const fileData = fs.readFileSync(filepath);
    hash.update(fileData);
    return hash.digest('hex');
}

function replaceVersionNumberAndFiles(filename, newVersion, tagName) {
    try {
        const fileContents = fs.readFileSync(filename, 'utf8');
        const jsonData = JSON.parse(fileContents);

        jsonData['greenhouseArduinoFirmwareVersion'] = newVersion;
        jsonData['greenhouseArduinoFirmwareFileURL'] = 'https://raw.githubusercontent.com/IoT-Smart-Greenhouse/IoT-Greenhouse-OTA/' + tagName + '/arduino/firmware.hex';
        jsonData['greenhouseArduinoFirmwareFileMd5'] = calculateMD5Hash('./arduino/firmware.hex');

        const updatedContents = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(filename, updatedContents);

        console.log(`Version number replaced successfully with '${newVersion}' in file: ${filename}`);
    } catch (error) {
        throw new Error(`Error reading or writing file: ${error}`);
    }
}

function readVersionNumberFromPackageJson(packageJsonPath) {
    const fileContents = fs.readFileSync(packageJsonPath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    return jsonData.version;
}

const jsonVersionsFile = 'stable_versions.json';
const packageJsonPath = process.env.PACKAGE_JSON_PATH;
const tagName = process.env.GIT_TAG_NAME;

if (!tagName)
    throw new Error("Missing environment variable GIT_TAG_NAME to provide tag name for download file path");

if (!packageJsonPath)
    throw new Error("Missing environment variable PACKAGE_JSON_PATH to provide path to package.json file to read version number from");

const newVersion = readVersionNumberFromPackageJson(packageJsonPath);
replaceVersionNumberAndFiles(jsonVersionsFile, newVersion, tagName);
