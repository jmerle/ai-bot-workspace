const fs = require('fs');
const marked = require('marked');

fs.readFile('CHANGELOG.md', 'utf8', (err, data) => {
  if (!err) {
    document.getElementById('content').innerHTML = marked(data);
  }
});
