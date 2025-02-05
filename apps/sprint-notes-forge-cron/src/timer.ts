const fs = require('fs');
const path = require('path');

export function getStartingTime() {
    const fileName = path.join(__dirname, 'lastRun.txt');
    if(fs.existsSync(fileName)) {
        const previousRun = fs.readFileSync(fileName, 'utf8');
        return new Date(previousRun);
    }
    else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 5);
        return now;
    }
}

export function saveRuntime(time: Date) {
    const fileName = path.join(__dirname, 'lastRun.txt');
    fs.writeFileSync(fileName, time.toISOString());
}