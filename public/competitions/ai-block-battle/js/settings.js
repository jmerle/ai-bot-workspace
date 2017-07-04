const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const path = require('path');
const Config = require('./js/config.js');

const app = remote.app;
const currentWindow = remote.getCurrentWindow();

const updateValues = () => {
  const config = Config.getConfig();

  $('#bot1-name').val(config.bots[0].name);
  $('#bot1-command').val(config.bots[0].command);

  $('#bot2-name').val(config.bots[1].name);
  $('#bot2-command').val(config.bots[1].command);
};

$('#settings').on('submit', e => {
  e.preventDefault();

  Config.save({
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
  });

  ipcRenderer.send('settings-updated');
});

$('#cancel').on('click', () => {
  currentWindow.close();
});

updateValues();
