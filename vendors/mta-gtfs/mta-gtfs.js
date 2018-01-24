const mtaGTFS = require('mta-gtfs');
const mta = new mtaGTFS({ key: '3f2afc8d6b42c4ea0ba912d9abe5a28a', feed_id: 26});

/*
mta.stop().then(result => {
  console.log(JSON.stringify(result));
}).catch(err => {
  console.log(err);
});
*/

mta.status('subway').then(result => {
  console.log(result);
});

/*
mta.schedule("A28", 26).then(result => {
  console.log(JSON.stringify(result));
});
*/
