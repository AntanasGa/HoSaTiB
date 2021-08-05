module.exports = {
  execute(channel, tags, message, self) {
    return message.includes("e");
  },
  action(client, channel, tags, message, self, storage) {
    client.say(channel, "/me this could be anything");
  },
};
