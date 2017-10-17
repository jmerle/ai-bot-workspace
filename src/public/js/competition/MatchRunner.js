const { remote } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Config = require('./Config');

const { competition, resultFileDirectory } = remote.getCurrentWindow();

class MatchRunner {
  constructor() {
    this.runningProcesses = [];
  }

  runMatch(isBatch = false, switchedSides = false) {
    return new Promise((resolve, reject) => {
      const config = switchedSides ? this.configSwitched : this.config;

      const resultFilePath = path.resolve(resultFileDirectory, `${competition.id}-${isBatch ? 'batch' : 'single'}-resultfile.json`);
      config.wrapper.resultFile = resultFilePath;

      const proc = spawn('java', ['-jar', competition.paths.matchWrapper, JSON.stringify(config)]);

      this.runningProcesses.push(proc);
      const stdout = [];

      proc.stdout.on('data', (data) => {
        data = data.toString().trim();
        if (data !== '') stdout.push(data);
      });

      proc.stderr.on('data', (data) => {
        data = data.toString().trim();
        if (data !== '') console.log(data);
      });

      proc.on('error', (err) => {
        reject({
          error: err,
          stdout: stdout.join('\n'),
        });
      });

      proc.on('close', (code) => {
        this.runningProcesses.splice(this.runningProcesses.indexOf(proc), 1);

        if (code !== 0) {
          reject({
            error: new Error(`The match wrapper exited with code ${code}`),
            stdout: stdout.join('\n'),
          });
        }

        const resultFile = JSON.parse(fs.readFileSync(resultFilePath).toString());

        resultFile.game = JSON.parse(resultFile.game);
        resultFile.details = JSON.parse(resultFile.details);

        const output = {
          resultFile,
          stdout: stdout.join('\n'),
        };

        if (competition.hasSeed) {
          output.seed = stdout.join('\n').match(/RANDOM SEED IS: ([0-9a-f-]+)/)[1];
        }

        resolve(output);
      });
    });
  }

  updateConfig() {
    const config = Config.getConfig(true);

    config.wrapper.debug = false;
    config.match.engine.command = ['java', '-jar', competition.paths.engine];

    this.config = config;

    this.configSwitched = JSON.parse(JSON.stringify(config));
    this.configSwitched.match.bots = this.configSwitched.match.bots.reverse();
  }

  exit() {
    this.runningProcesses.forEach(p => p.kill());
  }
}

module.exports = MatchRunner;
