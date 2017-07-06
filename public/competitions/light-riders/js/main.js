const { ipcRenderer, remote } = require('electron');
const Config = require('./js/config.js');
const MatchRunner = require('./js/match-runner.js');

const currentWindow = remote.getCurrentWindow();
const runner = new MatchRunner(currentWindow.competition.id, currentWindow.directory);
const dialog = remote.dialog;

$('.ui.menu .item').tab();
$('.ui.progress').progress();
$('.ui.checkbox').checkbox();

let matchRunning = false;
let batchRunning = false;
let updateRunner = false;
let matchData = null;
let closing = false;

const setMatchRunning = state => {
  matchRunning = state;

  if (state) {
    $('.log.segment > pre').html('&nbsp;');
    $('.log.segment > .dimmer, #viewer > .dimmer').addClass('active');
    $('#viewer iframe').addClass('hidden');
    $('#run-match').addClass('disabled loading');
  } else {
    $('.log.segment > .dimmer, #viewer > .dimmer').removeClass('active');
    $('#viewer iframe').removeClass('hidden');
    $('#run-match').removeClass('disabled loading');

    if (updateRunner && !batchRunning) {
      runner.updateConfig();
      updateRunner = false;
    }
  }
};

const setBatchRunning = state => {
  batchRunning = state;

  if (state) {
    $('#run-batch').addClass('disabled loading');
  } else {
    $('#run-batch').removeClass('disabled loading');

    if (updateRunner && !matchRunning) {
      runner.updateConfig();
      updateRunner = false;
    }
  }
};

const updateSettings = () => {
  const bots = Config.getConfig().match.bots;
  bots.forEach((bot, id) => {
    $(`#batch-table > tbody > tr:eq(${id}) > td:first-child`).html(bot.name);
  });

  if (matchRunning || batchRunning) {
    updateRunner = true;
  } else {
    runner.updateConfig();
  }
};

$('#run-match').on('click', async () => {
  setMatchRunning(true);
  $('#viewer iframe').attr('src', '');
  $('#viewer iframe').addClass('hidden');
  
  try {
    matchData = await runner.runMatch();
    await runner.writeToMatchViewer(matchData.resultFile);
  } catch (err) {
    if (!closing) {
      dialog.showErrorBox('Error', 'The match failed to run. Make sure the paths to the bot are set correctly (File -> Settings) and try again.');
    }

    console.error(err);
  }

  $('#viewer iframe').attr('src', 'matchviewer.html');
});

$('#viewer iframe')[0].onload = () => {
  if ($('#viewer iframe').attr('src') !== '') {
    setMatchRunning(false);
    $('.log.segment[data-tab="bot1-stderr"] > pre').html(matchData.resultFile.players[0].errors);
    $('.log.segment[data-tab="bot2-stderr"] > pre').html(matchData.resultFile.players[1].errors);
    $('.log.segment[data-tab="engine-stdout"] > pre').html(matchData.stdout);
    $('.log.segment[data-tab="resultfile"] > pre').html(JSON.stringify(matchData.resultFile, null, 2));
  }
};

$('#batch-settings').on('submit', async e => {
  e.preventDefault();

  setBatchRunning(true);

  $(`#batch-table > tbody > tr`).each((i, elem) => {
    $(elem).find('td:eq(1)').html('0');
    $(elem).find('td:eq(2)').html('0.00%');
  });

  const amount = parseInt($('#batch-amount').val());
  const switchSides = $('#batch-switch-sides').is(':checked');

  $('#batch-progress').progress('set percent', 0);
  $('#batch-progress').progress('set label', `Running match 1 of ${amount} (0 draws and 0 failed matches)`);

  let bots = Config.getConfig().match.bots;
  bots.forEach(bot => bot.wins = 0);

  let draws = 0;
  let failedMatches = 0;

  let sidesSwitched = false;
  for (let i = 1; i <= amount; i++) {
    try {
      const matchData = await runner.runMatch(true, sidesSwitched);

      let winnerID = matchData.resultFile.details.winner;
      winnerID = winnerID === 'null' ? null : parseInt(winnerID);
      if (winnerID !== null) {
        if (sidesSwitched) winnerID = +!winnerID;
        bots[winnerID].wins++;
      } else {
        draws++;
      }
    } catch (error) {
      console.error(error);
      failedMatches++;
    }

    bots.forEach((bot, id) => {
      const $row = $(`#batch-table > tbody > tr:eq(${id})`);
      $row.find('td:eq(1)').html(bot.wins);
      $row.find('td:eq(2)').html(((bot.wins / (i - failedMatches) * 100) || 0).toFixed(2) + '%');
    });

    $('#batch-progress').progress('set percent', i / amount * 100);

    if (i === amount) {
      setBatchRunning(false);
      $('#batch-progress').progress('set label', `Finished with ${draws} draws and ${failedMatches} failed matches`);
    } else {
      $('#batch-progress').progress('set label', `Running match ${i + 1} of ${amount} (${draws} draws and ${failedMatches} failed matches)`);
    }

    if (switchSides) sidesSwitched = !sidesSwitched;
  }
});

ipcRenderer.on('update-settings', () => {
  updateSettings();
});

ipcRenderer.on('close', () => {
  closing = true;
  runner.exit();
  ipcRenderer.send('ready-to-close');
});

if (Config.isFirstRun()) {
  Config.storeDefaults();
}

updateSettings();
$('#run-match').trigger('click');
