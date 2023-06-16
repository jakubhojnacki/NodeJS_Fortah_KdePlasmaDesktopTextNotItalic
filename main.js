const FileSystem = require("fs");
const ReadLine = require("readline");
const OperatingSystem = require("os");

Number.prototype.pad = function(pLength) 
{
    const string = "0".repeat(pLength) + this.valueOf();
    return string.substr(string.length - pLength);
}

Date.prototype.format = function(pPattern) {
    let string = pPattern;
    string = string.replace("yyyy", this.getFullYear().pad(4));
    string = string.replace("yy", this.getFullYear().pad(4).substr(2));
    string = string.replace("MM", (this.getMonth() + 1).pad(2));
    string = string.replace("dd", this.getDate().pad(2));
    string = string.replace("hh", this.getHours().pad(2));
    string = string.replace("mm", this.getMinutes().pad(2));
    string = string.replace("ss", this.getSeconds().pad(2));
    string = string.replace("zzz", this.getMilliseconds().pad(3));
    return string;
}

Date.prototype.toFileTimeStamp = function() {
    return this.format(`yyyyMMddhhmmsszzz`);
}

class Script {
    static get filePath() { return "/usr/share/plasma/plasmoids/org.kde.desktopcontainment/contents/ui/FolderItemDelegate.qml"; }
    static get newFilePath() { return Script.filePath + ".new"; }
    static get regExpPattern() { return "(\\s*)(font\\.italic:.*)"; }

    constructor() {
        this.result = false;
        this.file = null;
        this.newFile = null;
        this.regExp = null;
        this.lineCounter = 0;
    }

    async run() {
        try {
            this.initialise();
            this.backupFile();
            this.openFiles();
            await this.processFileSync();
            this.closeFiles();
            this.swapFiles();
            this.result = true;
        } catch(error) {
            console.log(error.name);
            console.log(error.message);
            this.result = false;
        } finally {
            this.closeFiles();
            this.finalise();
        }
    }
    
    initialise() {
        this.regExp = new RegExp(Script.regExpPattern);

        console.log("Fortah - KDE Plasma Desktop Text not Italic");
        console.log("version 0.0.1 - jakubhojnacki@gmail.com - June 2023");
        console.log("-".repeat(79));
    }

    backupFile() {
        const backupFilePath = `${Script.filePath}.${(new Date()).toFileTimeStamp()}`;
        if (FileSystem.existsSync(backupFilePath))
            FileSystem.unlinkSync(backupFilePath);
        FileSystem.copyFileSync(Script.filePath, backupFilePath);
    }

    openFiles() {
        this.file = FileSystem.createReadStream(Script.filePath);
        console.log(`Opened "${Script.filePath}" for reading.`);
        this.newFile = FileSystem.createWriteStream(Script.newFilePath);
        console.log(`Opened "${Script.newFilePath}" for writing.`);
    }

    async processFileSync() {
        await this.processFile();
        console.log(`Processed ${this.lineCounter} lines.`);
    }

    async processFile() {
        const readLineInterface = ReadLine.createInterface({ 
            input: this.file, 
            crlfDelay: Infinity
        });
        for await (const line of readLineInterface) {
            const newLine = line.replace(this.regExp, "$1//$2");
            this.newFile.write(newLine + OperatingSystem.EOL);
            this.lineCounter++;
        }        
    }

    closeFiles() {
        if (this.newFile) {
            this.newFile.close();
            this.newFile = null;
            console.log(`Closed "${Script.newFilePath}".`);
        }
        if (this.file) {
            this.file.close();
            this.file = null;
            console.log(`Closed "${Script.filePath}".`);
        }
    }

    swapFiles() {
        FileSystem.unlinkSync(Script.filePath);
        FileSystem.renameSync(Script.newFilePath, Script.filePath);
    }

    finalise() {
        console.log("-".repeat(79));
        if (this.result)
            console.log("Completed successfully.");
        else
            console.log("Completed with error.");
    }
}

(() => {
    const script = new Script();
    script.run();
})();
