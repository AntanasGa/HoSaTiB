# HoSaTiB
Hotswapable twitch messaging bot

## What its this for?
This component is intended for rapid command and/or filter development, as well as being an easy way to share your twitch bot ideas

## Requirements:
* node

## Installation:
after downloading package use:
```
$ node install
```
to install the dependancies ([tmi.js](https://github.com/tmijs/tmi.js))

## Usage:
note: non shared storage session is passed to command handling by default;

### Scripts/Commands
Use `scripts` directory to create commands. system ignores non `.js` extension files and files that start with `_`.
Use `default.js` as a template for your next big command.

#### Required file variables
* `command` {`string`} command name with call prefix like `!`;
* `execute` {`function`} script/command handling.

`execute` gets passed: `client`, `channel`, `tags`, `message`, `self`, `storage`

Empty template:
```js
module.exports = {
  command: "!your_command",
  execute(client, channel, tags, message, self, storage) {
  },
};

```

### Filters/Listeners
note: `defaultFilter.js` ***does not*** get updated on change.

* `execute` {`function`} filter/listener handling. ***Must*** return `boolean`
* `action` {`function`} not required function to handle actions in other way than default

`execute` gets passed: `channel`, `tags`, `message`, `self`, `storage`
`action` gets passed: `client`, `channel`, `tags`, `message`, `self`, `storage`

Empty template:
```js
module.exports = {
  execute(channel, tags, message, self) {
      return false;
  },
  action(client, channel, tags, message, self, storage) {
  },
};

```
