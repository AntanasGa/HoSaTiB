const tmi = require('tmi.js');

const envr = require('./env.js');
const HotPlug = require('./hotplug.js');
const defaultFilter = require('./defaultFilter.js');

const client = new tmi.Client(envr);

client.connect();

let response = new HotPlug(
  __dirname,
  client,
  defaultFilter
);

client.on('message', (channel, tags, message, self) => {
  response.execute(channel, tags, message, self);
});
