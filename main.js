const FileSystem = require("fs");
const ReadLine = require("readline");

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
    //TODO >> Bring back 
    //static get newFilePath() { return Script.newFile + ".new"; }
    static get newFilePath() { return "/home/Temp/FolderItemDelegate.qml.new"; }
    //<<<

    constructor() {
        this.file = null;
        this.newFile = null;
        this.lineCounter = 0;
    }

    async run() {
        this.initialise();
        this.openFiles();
        await this.processFileSync();
        this.closeFiles();
        this.finalise();
    }
    
    initialise() {
        console.log("Fortah - KDE Plasma Desktop Text not Italic");
        console.log("version 0.0.1 - jakubhojnacki@gmail.com - June 2023");
        console.log("-".repeat(79));
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
            crlfDelay: Infinity });
        readLineInterface.on("line", (line) => { 
            this.newFile.write(line);
            this.lineCounter++;
        });
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

    finalise() {
        console.log("-".repeat(79));
        console.log("Completed.");
    }
}

(() => {
    const script = new Script();
    script.run();
})();
