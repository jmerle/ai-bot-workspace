const { remote, ipcRenderer, clipboard } = require('electron');
const Config = require('./js/competition/Config');
const MatchRunner = require('./js/competition/MatchRunner');
const generateMatchViewer = require('./js/competition/generate-match-viewer');

const { dialog } = remote;
const currentWindow = remote.getCurrentWindow();
const { competition, matchViewerPath } = currentWindow;

$('.ui.menu .item').tab();
$('.ui.progress').progress();
$('.ui.checkbox').checkbox();

const runner = new MatchRunner();

let matchRunning = false;
let batchRunning = false;
let updateRunner = false;

let matchCancelled = false;
let cancelBatch = false;

let matchData = null;
let closing = false;

const setOverlay = (name) => {
  $('.match-viewer-overlay').hide();
  if (name !== null) {
    $(`.match-viewer-overlay.match-viewer-${name}`).show();
  }
};

const setMatchRunning = (state) => {
  matchRunning = state;

  if (state) {
    $('.log.segment > pre').html('&nbsp;');
    $('.log.segment > .dimmer').addClass('active');
    $('#match-viewer iframe').addClass('hidden');
    $('#run-match, #copy-seed').addClass('disabled loading');
    setOverlay('running');
  } else {
    $('.log.segment > .dimmer').removeClass('active');
    $('#match-viewer iframe').removeClass('hidden');
    $('#run-match, #copy-seed').removeClass('disabled loading');
    setOverlay(null);

    if (updateRunner && !batchRunning) {
      runner.updateConfig();
      updateRunner = false;
    }
  }
};

const setBatchRunning = (state) => {
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
  const config = Config.getConfig(false);

  config.match.bots.forEach((bot, id) => {
    $(`#batch-table > tbody > tr:eq(${id}) > td:first-child`).text(bot.name || '-');
  });

  if (matchRunning || batchRunning) {
    updateRunner = true;
  } else {
    runner.updateConfig();
  }
};

const loadCompetition = () => {
  $('title').text(competition.name);

  const $viewer = $('#match-viewer');

  if (competition.hasSeed) {
    $viewer.after(`
      <div class="ui two bottom attached buttons">
        <div class="ui big bottom attached primary button" id="run-match">Run match</div>
        <div class="ui big bottom attached primary button" id="copy-seed">Copy seed</div>
      </div>
    `);
  } else {
    $viewer.after(`
      <div class="ui big fluid bottom attached primary button" id="run-match">Run match</div>
    `);
  }

  $('head').append(`
    <style>
      #match-viewer::before {
        padding-top: ${competition.matchViewerPercentage}%;
      }
    </style>
  `);
};

const runMatch = async () => {
  setMatchRunning(true);
  $('#run-match').removeClass('disabled loading').addClass('negative').text('Cancel');

  $('#match-viewer iframe').attr('src', '');

  try {
    matchData = await runner.runMatch({ liveEngineStdout: true });
    await generateMatchViewer(matchData.resultFile);
    $('#match-viewer iframe').attr('src', matchViewerPath);
  } catch (err) {
    if (!closing) {
      if (!matchCancelled) {
        dialog.showErrorBox('Error', 'The match failed to run. Make sure the paths to the bot are correctly set (File -> Settings) and try again.');
      }

      matchData = null;
      matchCancelled = false;

      setMatchRunning(false);
      $('#run-match').removeClass('negative').text('Run match');
      $('#copy-seed').addClass('disabled');

      $('#match-viewer-error-message').text(err.error.message);
      setOverlay('error');

      $('.log.segment[data-tab="engine-stdout"] > pre').text(err.stdout);
      $('.log.segment[data-tab="engine-stderr"] > pre').text(err.stderr);

      console.error(err.error);
    }
  }
};

$('#match-viewer iframe')[0].onload = () => {
  if ($('#match-viewer iframe').attr('src') !== '') {
    setMatchRunning(false);
    $('#run-match').removeClass('negative').text('Run match');

    matchData.resultFile.players.forEach((player, index) => {
      $(`.log.segment[data-tab="bot${index + 1}-stderr"] > pre`).text(player.errors);
      $(`.log.segment[data-tab="bot${index + 1}-log"] > pre`).text(player.log);
    });
  }
};

const runBatch = async (amountOfRuns, switchSides) => {
  setBatchRunning(true);
  $('#run-batch').removeClass('disabled loading').addClass('negative').text('Cancel');

  const $progress = $('#batch-progress');

  $('#batch-table > tbody > tr').each((i, row) => {
    $(row).find('td:eq(1)').text('0');
    $(row).find('td:eq(2)').text('0.00%');

    $progress.progress('set percent', 0);
    $progress.progress('set label', `Running match 1 of ${amountOfRuns} (0 draws and 0 failed matches)`);
  });

  const bots = Config.getConfig(true).match.bots;
  bots.forEach(b => b.wins = 0);

  let draws = 0;
  let failedMatches = 0;

  let switchedSides = false;

  for (let i = 1; i <= amountOfRuns && !cancelBatch; i++) {
    try {
      const matchData = await runner.runMatch({ type: 'batch', switchedSides });

      let winnerId = matchData.resultFile.details.winner;
      winnerId = winnerId === 'null' ? null : parseInt(winnerId);

      if (winnerId !== null) {
        if (switchedSides) {
          winnerId = +!winnerId;
        }

        bots[winnerId].wins++;
      } else {
        draws++;
      }
    } catch (err) {
      failedMatches++;
    }

    bots.forEach((bot, id) => {
      const $row = $(`#batch-table > tbody > tr:eq(${id})`);
      $row.find('td:eq(1)').text(bot.wins);
      $row.find('td:eq(2)').text(((bot.wins / (i - failedMatches) * 100) || 0).toFixed(2) + '%');
    });

    $progress.progress('set percent', i / amountOfRuns * 100);

    if (i === amountOfRuns) {
      setBatchRunning(false);
      $('#run-batch').removeClass('negative').text('Run batch');

      $progress.progress('set label', `Finished with ${draws} draw${draws !== 1 ? 's' : ''} and ${failedMatches} failed match${failedMatches !== 1 ? 'es' : ''}`);
    } else {
      $progress.progress('set label', `Running match ${i + 1} of ${amountOfRuns} (${draws} draw${draws !== 1 ? 's' : ''} and ${failedMatches} failed match${failedMatches !== 1 ? 'es' : ''})`);
    }

    if (switchSides) switchedSides = !switchedSides;
  }

  if (cancelBatch) {
    setBatchRunning(false);
    $('#run-batch').removeClass('negative').text('Run batch');

    const totalMatches = draws + failedMatches + bots.map(b => b.wins).reduce((a, b) => a + b, 0);

    $progress.progress('set percent', 100);
    $progress.progress('set label', `Successfully ran ${totalMatches} match${totalMatches !== 1 ? 'es' : ''} with ${draws} draw${draws !== 1 ? 's' : ''} and ${failedMatches} failed match${failedMatches !== 1 ? 'es' : ''}`);

    cancelBatch = false;
  }
};

let changeCopyButton = null;
const copySeed = () => {
  clipboard.writeText(matchData.seed);

  $('#copy-seed').text('Copied!');

  if (changeCopyButton !== null) {
    clearTimeout(changeCopyButton);
    changeCopyButton = null;
  }

  changeCopyButton = setTimeout(() => {
    $('#copy-seed').text('Copy seed');
    changeCopyButton = null;
  }, 1500);
};

const close = () => {
  closing = true;
  runner.exit();
  ipcRenderer.send('ready-to-close');
};

loadCompetition();

if (Config.shouldReset()) {
  Config.reset();
  ipcRenderer.send('open-settings', competition);

  updateSettings();
  setOverlay('error');
  $('#match-viewer-error-message').text('Make sure the settings are correct and run the match.');
} else {
  updateSettings();
  setOverlay(null);
  runMatch();
}

ipcRenderer.on('update-settings', () => updateSettings());
ipcRenderer.on('close', () => close());

$('#run-match').on('click', () => {
  if (matchRunning) {
    matchCancelled = true;
    runner.cancel('single');
  } else {
    runMatch();
  }
});
$('#copy-seed').on('click', () => copySeed());
$('#run-batch').on('click', (e) => {
  e.preventDefault();

  if (batchRunning) {
    cancelBatch = true;
    runner.cancel('batch');
  } else {
    const amountOfRuns = parseInt($('#batch-amount').val());
    const switchSides = $('#batch-switch-sides').is(':checked');

    runBatch(amountOfRuns, switchSides);
  }
});

if (competition.playerCount <= 1) {
  $('#batch-runner').css('display', 'none');
}
