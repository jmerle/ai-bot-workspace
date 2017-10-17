const fs = require('fs');
const path = require('path');
const marked = require('marked');

fs.readFile(path.resolve(__dirname, '../../CHANGELOG.md'), 'utf8', (err, data) => {
  document.getElementById('content').innerHTML = err || marked(data);
});
