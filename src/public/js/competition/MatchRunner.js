const { remote } = require('electron');
const fs = require('fs');
const path = require('path');
const execa = require('execa');
const Config = require('./Config');

const { competition, resultFileDirectory } = remote.getCurrentWindow();

class MatchRunner {
  constructor() {
    this.runningProcesses = {};
  }

  runMatch({
    type = 'single',
    switchedSides = false,
    liveEngineStdout = false,
  } = {}) {
    return new Promise((resolve, reject) => {
      const config = switchedSides ? this.configSwitched : this.config;

      const resultFilePath = path.resolve(resultFileDirectory, `${competition.id}-${type}-resultfile.json`);
      config.wrapper.resultFile = resultFilePath;

      const proc = execa('java', ['-jar', competition.paths.matchWrapper, JSON.stringify(config)]);

      proc.then((result) => {
        delete this.runningProcesses[type];

        const resultFile = JSON.parse(fs.readFileSync(resultFilePath).toString());

        resultFile.game = JSON.parse(resultFile.game);
        resultFile.details = JSON.parse(resultFile.details);

        const output = {
          resultFile,
          stdout: result.stdout,
        };

        if (competition.hasSeed) {
          output.seed = result.stdout.match(/RANDOM SEED IS: ([0-9a-f-]+)/)[1];
        }

        resolve(output);
      })
      .catch((error) => {
        delete this.runningProcesses[type];

        reject({
          error: new Error(`The match wrapper exited with ${(error.code !== null ? `code ${error.code}` : `signal ${error.signal}`)}`),
          stdout: error.stdout
        });
      });

      this.runningProcesses[type] = proc;

      if (liveEngineStdout) {
        const $engineTab = $('.log.segment[data-tab="engine-stdout"]');
        const $engineDimmer = $engineTab.find('.dimmer');
        const $engineStdout = $engineTab.find('pre');

        proc.stdout.on('data', (data) => {
          data = data.toString().trim();

          if (data !== '') {
            $engineDimmer.removeClass('active');

            const text = $engineStdout.text();
            $engineStdout.text((text + '\n' + data).trim());

            $engineStdout.scrollTop($engineStdout[0].scrollHeight);
          }
        });
      }

      proc.stderr.on('data', (data) => {
        data = data.toString().trim();
        if (data !== '') {
          const $engineErrTab = $('.log.segment[data-tab="engine-stderr"]');
          const $engineStderr = $engineErrTab.find('pre');
          const text = $engineStderr.text();

          $engineStderr.text((text + '\n' + data).trim());
          $engineStderr.scrollTop($engineStderr[0].scrollHeight);
        }
      });
    });
  }

  cancel(type) {
    if (this.runningProcesses.hasOwnProperty(type)) {
      this.runningProcesses[type].kill();
    }
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
    Object.keys(this.runningProcesses).forEach(key => this.runningProcesses[key].kill());
  }
}

module.exports = MatchRunner;
