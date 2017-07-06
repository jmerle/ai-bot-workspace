const { remote } = require('electron');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const os = require('os');
const Config = require('./config.js');

const MATCH_WRAPPER = 'match-wrapper-1.2.8.jar';
const ENGINE = 'engine-2.0.3.jar';

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
      config.wrapper.resultFile = resultFilePath;

      const matchWrapperPath = path.join(this.directory, '/engine', MATCH_WRAPPER);
      const wrapper = spawn('java', ['-jar', matchWrapperPath, JSON.stringify(config)]);
      
      this.runningProcesses.push(wrapper);
      const stdout = [];
      const stderr = [];

      wrapper.stdout.on('data', data => {
        data = data.toString().trim();
        if (data !== '') stdout.push(data);
      });

      wrapper.stderr.on('data', data => {
        data = data.toString().trim();
        if (data !== '') stderr.push(data);
      });

      wrapper.on('error', reject);

      wrapper.on('close', code => {
        if (code !== 0) {
          reject(new Error(`The match wrapper exited with code ${code}`));
        }

        this.runningProcesses.splice(this.runningProcesses.indexOf(wrapper), 1);

        const resultFile = JSON.parse(fs.readFileSync(resultFilePath).toString());
        resultFile.game = JSON.parse(resultFile.game);
        resultFile.details = JSON.parse(resultFile.details);

        resolve({
          resultFile,
          stdout: stdout.join('\n'),
          seed: stderr.join('\n').match(/RANDOM SEED IS: ([0-9a-f-]+)/)[1]
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
        name: this.config.match.bots[0].name,
        emailHash: ''
      }, {
        name: this.config.match.bots[1].name,
        emailHash: ''
      }];

      const page = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <!-- Made by the awesome people over at Riddles.io -->

            <meta charset="UTF-8">
            <meta name="robots" content="noindex, nofollow">

            <title>Hack Man Match Viewer</title>
            
            <link rel="stylesheet" href="../../css/font-awesome.min.css">
            <link rel="stylesheet" type="text/css" href="css/v8.min.css">
            <link rel="stylesheet" type="text/css" href="css/v8-override.min.css">
          </head>
          <body>
            <div id="player" style="width: 100%; height: 100%;"></div>
            <script id="gameData">
              (function(){
                window.__data__ = ${JSON.stringify(windowData)};
              }());
            </script>
            <script src="js/v8.min.js"></script>
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

    config.wrapper.debug = true;

    if (typeof config.match.engine !== 'object') {
      config.match.engine = {};
    }

    const quote = os.platform() === 'win32' ? '"' : '';
    config.match.engine.command = `java -jar ${quote}${path.join(this.directory, '/engine', ENGINE)}${quote}`;

    this.config = config;
    this.configSwitched = JSON.parse(JSON.stringify(config));
    this.configSwitched.match.bots = this.configSwitched.match.bots.reverse();
  }

  exit() {
    this.runningProcesses.forEach(p => p.kill());
  }
}

module.exports = MatchRunner;
