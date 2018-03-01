const { remote } = require('electron');
const fs = require('fs');
const path = require('path');
const Config = require('./Config');

const { competition, matchViewerPath } = remote.getCurrentWindow();

const generateMatchViewer = (resultFile) => {
  return new Promise((resolve, reject) => {
    const config = Config.getConfig(true);

    const windowData = {};

    windowData.matchData = resultFile.game;
    windowData.playerData = [...Array(competition.playerCount)].map((p, i) => ({
      name: config.match.bots[i].name,
      emailHash: '',
    }));

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <!-- Made by the awesome people at Riddles.io -->

          <title>${competition.name} Match Viewer</title>

          <link rel="stylesheet" href="${path.resolve(__dirname, '../../css/font-awesome.min.css')}">
          <link rel="stylesheet" href="${competition.paths.cssMain}">
          <link rel="stylesheet" href="${competition.paths.cssOverride}">
        </head>
        <body>
          <div id="player" style="width: 100%; height: 100%;"></div>

          <script id="gameData">
            (function(){
              window.__data__ = ${JSON.stringify(windowData)};
            }());
          </script>

          <script src="${competition.paths.js}"></script>
        </body>
      </html>
    `;

    fs.writeFile(matchViewerPath, html, (error) => {
      if (error) {
        reject({ error });
      } else {
        resolve();
      }
    });
  });
};

module.exports = generateMatchViewer;
