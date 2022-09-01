const fs = require('fs');
const videosFolder = '../videos';

try {
    const names = {};
    const fileNames = [];
    fs.readdirSync(videosFolder).forEach(file => {
        const pieces = file.split('-');
        const name = pieces.slice(0, -1).join('-');
        if (!names.hasOwnProperty(name)) {
            names[name] = true;
            fileNames.push(name);
        }
    });
    const videos = [];
    const l = fileNames.length;
    for (let i = 0; i < l; i++) {
        const name = fileNames[i];
        const topPath = `${videosFolder}/${name}-top.json`;
        const bottomPath = `${videosFolder}/${name}-bottom.json`;
        const eventsPath = `${videosFolder}/${name}-events.json`;
        const topData = JSON.parse(fs.readFileSync(topPath));
        const bottomData = JSON.parse(fs.readFileSync(bottomPath));
        const eventsData = JSON.parse(fs.readFileSync(eventsPath));
        if(eventsData.length > 0) {
            videos.push({
                top: topData,
                bottom: bottomData,
                events: eventsData
            });
            console.log(i);
        }
    }

    fs.writeFileSync(`../data/videos.json`, JSON.stringify(videos));
    console.log('finished');
} catch (err) {
    console.error(err);
}