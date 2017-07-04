const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();

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
