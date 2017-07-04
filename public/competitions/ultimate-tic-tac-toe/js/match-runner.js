const { remote } = require('electron');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const Config = require('./config.js');

const ENGINE = 'engine-1.0.3.jar';

class MatchRunner {
  constructor(competitionID, directory) {
    this.competitionID = competitionID;
    this.directory = directory;
    this.runningProcesses = [];
  }

  runMatch(isBatch = false, switchedSides = false) {
    return new Promise((resolve, reject) => {
      const config = switchedSides ? this.configSwitched : this.config;

      const resultFilePath = path.join(remote.app.getPath('temp'), `/${this.competitionID}-${isBatch ? 'batch' : 'single'}-resultfile.json`);

      const enginePath = path.join(this.directory, '/engine', ENGINE);
      const engine = spawn('java', ['-jar', enginePath, config.bots[0].command, config.bots[1].command, resultFilePath]);
      
      this.runningProcesses.push(engine);
      const stdout = [];

      engine.stdout.on('data', data => {
        data = data.toString().trim();
        if (data !== '') stdout.push(data);
      });

      engine.on('error', reject);

      engine.on('close', code => {
        if (code !== 0) {
          reject(new Error(`The engine exited with code ${code}`));
        }

        this.runningProcesses.splice(this.runningProcesses.indexOf(engine), 1);

        const resultFile = JSON.parse(fs.readFileSync(resultFilePath).toString());

        resolve({
          resultFile,
          stdout: stdout.join('\n')
        });
      });
    });
  }

  writeToMatchViewer(resultFile) {
    return new Promise((resolve, reject) => {
      const windowData = {};

      try {
        windowData.matchData = resultFile.game;
      } catch (error) {
        reject(error);
      }

      windowData.playerData = [{
        name: this.config.bots[0].name,
        emailHash: ''
      }, {
        name: this.config.bots[1].name,
        emailHash: ''
      }];

      const page = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <!-- Made by the awesome people over at Riddles.io -->

            <meta charset="UTF-8">
            <meta name="robots" content="noindex, nofollow">

            <title>Ultimate Tic Tac Toe Match Viewer</title>

            <link rel="stylesheet" href="../../css/font-awesome.min.css">
            <link rel="stylesheet" href="css/v5.min.css">
            <link rel="stylesheet" href="css/v5-override.min.css">
          </head>
          <body>
            <div id="player" style="width: 100%; height: 100%;"></div>
              <script id="gameData">
                (function(){
                  window.__data__ = ${JSON.stringify(windowData)};
                }());
              </script>
            <script src="js/v5.min.js"></script>
          </body>
        </html>
      `;

      fs.writeFile(path.join(this.directory, '/matchviewer.html'), page, error => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  updateConfig() {
    const config = Config.getConfig();

    this.config = config;
    this.configSwitched = JSON.parse(JSON.stringify(config));
    this.configSwitched.bots = this.configSwitched.bots.reverse();
  }

  exit() {
    this.runningProcesses.forEach(p => p.kill());
  }
}

module.exports = MatchRunner;
