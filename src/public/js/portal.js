const { remote, ipcMain, ipcRenderer, shell } = require('electron');

const { competitions, version } = remote.getCurrentWindow();

$('#version').text(version);

competitions.forEach((competition) => {
  const html = `
    <a class="ui competition card" data-competition-id="${competition.id}">
      <div class="content">
        <div class="header">${competition.name}</div>
        <div class="description"><p>${competition.description}</p></div>
      </div>
    </a>
  `;

  $('#competitions').append(html);
});

$('#search').on('input', function (e) {
  const value = $(this).val().toLowerCase();

  const matches = competitions.filter(c => c.name.toLowerCase().includes(value));

  $('.competition').hide();

  if (matches.length > 0) {
    $('#search-failed').hide();
    matches.forEach(c => $(`.competition[data-competition-id="${c.id}"]`).show());
  } else {
    $('#search-failed').show();
  }
});

$('#open-changelog').on('click', e => ipcRenderer.send('open-changelog'));
$('#open-about').on('click', e => ipcRenderer.send('open-about'));

$('.competition').on('click', function (e) {
  ipcRenderer.send('open-competition', $(this).attr('data-competition-id'));
});

const update = (version) => {
  if (process.platform !== 'darwin') {
    ipcRenderer.send('update');
    $('#update-text').html('The update is being downloaded (<span id="update-progress">0</span>%), the application will quit and install when it\'s done.');
  } else {
    shell.openExternal(`https://github.com/jmerle/ai-bot-workspace/releases/tag/v${version}`);
  }
};

const resetUpdate = () => {
  $('#update-text').html('<a href="javascript:void(0)" id="check-again">No updates available. Click here to check again.</a>');

  $('#check-again').on('click', () => ipcRenderer.send('check-for-updates'));
};

resetUpdate();

ipcRenderer.on('new-version', (e, version) => {
  $('#update-text').html(`<a href="javascript:void(0)" id="update">A new version (${version}) is available. Click here to update.`);
  $('#update').on('click', () => update(version));
});

ipcRenderer.on('checking-for-updates', () => $('#update-text').html('Checking for updates...'));
ipcRenderer.on('download-progress', (e, info) => $('#update-progress').text(info.percent.toFixed(0)));
ipcRenderer.on('no-new-version', () => resetUpdate());
