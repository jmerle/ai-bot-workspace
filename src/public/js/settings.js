const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const Config = require('./js/competition/Config');

const { dialog } = remote;

const currentWindow = remote.getCurrentWindow();
const { competition, store, importExportDirectory } = currentWindow;

const updateValues = () => {
  const config = Config.getConfig(false);

  $('#max-timebank').val(config.wrapper.timebankMax);
  $('#time-per-move').val(config.wrapper.timePerMove);
  $('#max-timeouts').val(config.wrapper.maxTimeouts);

  $('#bot1-name').val(config.match.bots[0].name);
  $('#bot1-command').val(config.match.bots[0].command);

  $('#bot2-name').val(config.match.bots[1].name);
  $('#bot2-command').val(config.match.bots[1].command);

  if (config.match.engine && config.match.engine.configuration) {
    Object.keys(config.match.engine.configuration).forEach((key) => {
      $(`#${key}`).val(config.match.engine.configuration[key].value);
    });
  }
};

const configurationItemToField = (item) => {
  let inputType;

  switch (item.type) {
    case 'integer':
      inputType = 'type="number" min="0" max="2147483647"';
      break;
    case 'double':
      inputType = 'type="number" min="0" step="0.01"';
      break;
    default:
      inputType = 'type="text"';
  }

  return `
    <div class="field">
      <label for="${item.key}">${item.name} (${item.info})</label>
      <input ${inputType} id="${item.key}" placeholder="${item.name}">
    </div>
  `;
};

const loadConfigurationFields = () => {
  const items = competition.configurationItems;

  if (items.length > 0) {
    $('.ui.grid').after(`
      <h4 class="ui dividing header">Engine settings</h4>

      ${items.map(configurationItemToField).join('\n')}
    `);
  }
};

const parseConfigurationItemValue = (item, val) => {
  switch (item.type) {
    case 'integer':
      return parseInt(val);
    case 'double':
      return parseFloat(val);
    default:
      return val;
  }
};

const resizeToFit = () => {
  const width = $(window).width();
  const $lastElement = $(':visible:last');
  const height = Math.ceil($lastElement.position().top + $lastElement.height() + 14 + 30);

  currentWindow.setContentSize(width, height);
  currentWindow.center();
};

$('#settings').on('submit', (e) => {
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
      ],
      engine: {
        configuration: {}
      },
    },
  };

  competition.configurationItems.forEach((item) => {
    const val = $(`#${item.key}`).val();

    if (val !== '') {
      config.match.engine.configuration[item.key] = {
        value: parseConfigurationItemValue(item, val),
        type: item.type,
      };
    }
  });

  Config.import(config);
  ipcRenderer.send('settings-updated');
});

$('#cancel').on('click', () => currentWindow.close());

$('#import').on('click', () => {
  const selected = dialog.showOpenDialog(currentWindow, {
    title: 'Import wrapper-commands.json',
    defaultPath: importExportDirectory,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
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
    })
  }
});

$('#export').on('click', () => {
  const selected = dialog.showSaveDialog(currentWindow, {
    title: 'Export',
    defaultPath: path.resolve(importExportDirectory, 'wrapper-commands.json'),
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });

  if (selected !== undefined) {
    const data = Config.getWrapperCommands();

    fs.writeFile(selected, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        dialog.showMessageBox(currentWindow, {
          type: 'error',
          title: 'Error',
          message: 'Something went wrong while exporting',
        });
      }
    });
  }
});

loadConfigurationFields();
updateValues();
resizeToFit();
