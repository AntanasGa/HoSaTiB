module.exports = {
  command: "!b",
  execute(client, channel, tags, message, self, storage) {
    let count = 0;
    if (typeof storage.get("count") !== "undefined") {
      count = storage.get("count");
    }
    count++;
    storage.set("count", count);
    console.log(tags);
    client.say(channel, `Hello world ${count}`);
  },
};
