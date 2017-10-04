const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const path = require('path');
const Config = require('./js/config.js');

const app = remote.app;
const dialog = remote.dialog;
const currentWindow = remote.getCurrentWindow();

const updateValues = () => {
  const config = Config.getConfig();

  $('#max-timebank').val(config.wrapper.timebankMax);
  $('#time-per-move').val(config.wrapper.timePerMove);
  $('#max-timeouts').val(config.wrapper.maxTimeouts);

  $('#bot1-name').val(config.match.bots[0].name);
  $('#bot1-command').val(config.match.bots[0].command);

  $('#bot2-name').val(config.match.bots[1].name);
  $('#bot2-command').val(config.match.bots[1].command);

  if (typeof config.match.engine === 'object'
  && typeof config.match.engine.configuration === 'object'
  && typeof config.match.engine.configuration.seed === 'object') {
    $('#seed').val(config.match.engine.configuration.seed.value);
  }
};

$('#settings').on('submit', e => {
  e.preventDefault();

  const config = {
    wrapper: {
      timebankMax: parseInt($('#max-timebank').val()),
      timePerMove: parseInt($('#time-per-move').val()),
      maxTimeouts: parseInt($('#max-timeouts').val())
    },
    match: {
      bots: [
        {
          name: $('#bot1-name').val(),
          command: $('#bot1-command').val()
        },
        {
          name: $('#bot2-name').val(),
          command: $('#bot2-command').val()
        }
      ]
    }
  };

  const seed = $('#seed').val();
  if (seed !== '') {
    config.match.engine = {
      configuration: {
        seed: {
          value: seed,
          type: 'String'
        }
      }
    };
  }

  Config.import(config);

  ipcRenderer.send('settings-updated');
});

$('#cancel').on('click', () => {
  currentWindow.close();
});

$('#import').on('click', () => {
  const selected = dialog.showOpenDialog(currentWindow, {
    title: 'Import wrapper-commands.json',
    defaultPath: app.getPath('documents'),
    filters: [
      {name: 'JSON Files', extensions: ['json']},
      {name: 'All Files', extensions: ['*']}
    ],
    properties: ['openFile']
  });

  if (selected !== undefined) {
    fs.readFile(selected[0], 'utf8', (err, data) => {
      if (err || !Config.isValidWrapperCommands(data)) {
        dialog.showMessageBox(currentWindow, {
          type: 'error',
          title: 'Error',
          message: 'Could not import the selected file.'
        });
      } else {
        Config.import(JSON.parse(data));
        updateValues();
      }
    });
  }
});

$('#export').on('click', () => {
  const selected = dialog.showSaveDialog(currentWindow, {
    title: 'Export',
    defaultPath: path.join(app.getPath('documents'), 'wrapper-commands.json'),
    filters: [{name: 'JSON Files', extensions: ['json']}]
  });

  if (selected !== undefined) {
    const data = Config.getWrapperCommands();

    fs.writeFile(selected, JSON.stringify(data, null, 2), err => {
      if (err) {
        dialog.showMessageBox(currentWindow, {
          type: 'error',
          title: 'Error',
          message: 'Something went wrong while exporting.'
        });
      }
    });
  }
});

updateValues();
