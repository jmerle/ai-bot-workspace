const { remote, ipcRenderer } = require('electron');
const dialog = remote.dialog;
const request = require('request');
const semver = require('semver');
const currentWindow = remote.getCurrentWindow();
const store = currentWindow.store;

const addCategory = category => {
  const html = `
    <div class="category" data-name="${category.name}">
      <div class="ui horizontal divider">
        ${category.name}
      </div>
      <div class="ui cards">
      </div>
    </div>
  `;

  $('.categories').append(html);

  category.competitions.forEach(competition => {
    const html = $(`
      <a class="ui ${category.color} competition card" data-name="${competition.name}">
        <div class="content">
          <div class="header">${competition.name}</div>
          <div class="meta">${category.name}</div>
          <div class="description">
            <p>${competition.description}</p>
          </div>
        </div>
      </a>
    `);

    $(`.category[data-name="${category.name}"] .cards`).append(html);
    $(html).attr('data-competition', JSON.stringify(competition));
  });
};

const categories = currentWindow.config.categories;
categories.forEach(addCategory);

$('#search').on('input', e => {
  const value = $(e.target).val().toLowerCase();

  let anyCompetitionsFound = false;

  if (value === '') {
    categories.forEach(category => {
      $(`.category[data-name="${category.name}"]`).show();

      category.competitions.forEach(competition => {
        $(`.competition[data-name="${competition.name}"]`).show();
      });
    });

    anyCompetitionsFound = true;
  } else {
    categories.forEach(category => {
      let show = false;

      category.competitions.forEach(competition => {
        if (competition.name.toLowerCase().includes(value) || category.name.toLowerCase().includes(value)) {
          $(`.competition[data-name="${competition.name}"]`).show();
          show = true;
          anyCompetitionsFound = true;
        } else {
          $(`.competition[data-name="${competition.name}"]`).hide();
        }
      });

      if (show) {
        $(`.category[data-name="${category.name}"]`).show();
      } else {
        $(`.category[data-name="${category.name}"]`).hide();
      }
    });
  }

  if (anyCompetitionsFound) {
    $('#search-failed').hide();
  } else {
    $('#search-failed').show();
  }
});

$('.competition').on('click', function(e) {
  e.preventDefault();

  const competition = JSON.parse($(this).attr('data-competition'));
  ipcRenderer.send('open-competition', competition);
});

const checkUpdate = () => {
  const currentVersion = currentWindow.packageJson.version;

  const noUpdate = () => {
    $('#check-update').text('You are running the latest version (click to check again)');
  };

  request('https://raw.githubusercontent.com/jmerle/ai-bot-workspace/master/package.json', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const newVersion = JSON.parse(body).version;

      if (semver.gt(newVersion, currentVersion)) {
        showUpdate(currentVersion, newVersion);
      } else {
        noUpdate();
      }
    } else {
      noUpdate();
    }
  });

  store.set('lastUpdateCheck', Math.floor(Date.now() / 1000));
};

const showUpdate = (currentVersion, newVersion) => {
  $('#check-update').text('An update is available (click to check again)');

  dialog.showMessageBox(currentWindow, {
    type: 'info',
    title: 'An update is available',
    message: `You are currently running v${currentVersion}, while the newest version is v${newVersion}. To update, run 'git pull' and 'npm install' in the folder you ran 'npm start' in.`
  });
};

$('#open-changelog').on('click', e => {
  e.preventDefault();

  ipcRenderer.send('open-changelog');
});

$('#check-update').on('click', e => {
  e.preventDefault();
  checkUpdate();
});

const yesterday = Math.floor(Date.now() / 1000) - (60 * 60 * 24);
const lastUpdateCheck = store.get('lastUpdateCheck', yesterday);
const now = Math.floor(Date.now() / 1000);

if (now - lastUpdateCheck >= (60 * 60 * 24)) {
  checkUpdate();
}

const currentVersion = currentWindow.packageJson.version;

if (semver.lt(store.get('lastRanVersion', '0.0.1'), currentVersion)) {
  ipcRenderer.send('open-changelog', 500);
}

store.set('lastRanVersion', currentVersion);
