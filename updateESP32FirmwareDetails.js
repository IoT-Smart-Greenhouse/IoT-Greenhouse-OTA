function replaceVersionNumberAndFiles(filename, newVersion) {
    try {
        const fileContents = fs.readFileSync(filename, 'utf8');
        const jsonData = JSON.parse(fileContents);

        jsonData['greenhouseESPFirmwareVersion'] = newVersion;

        const updatedContents = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(filename, updatedContents);

        console.log(`Version number replaced successfully with '${newVersion}' in file: ${filename}`);
    } catch (error) {
        throw new Error(`Error reading or writing file: ${error}`);
    }
}

function readVersionNumberFromPackageJson(packageJsonPath){
    const fileContents = fs.readFileSync(packageJsonPath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    return jsonData.version;
}

const jsonVersionsFile = 'stable_versions.json';
const packageJsonPath = process.env.PACKAGE_JSON_PATH;
console.log(packageJsonPath);
if(packageJsonPath){
    const newVersion = readVersionNumberFromPackageJson(packageJsonPath);
    replaceVersionNumberAndFiles(jsonVersionsFile, newVersion);
} else {
    throw new Error("Missing environment variable PACKAGE_JSON_PATH to provide path to package.json file to read version number from");
}