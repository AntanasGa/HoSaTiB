const fs = require("fs");
const path = require("path");
const { Client } = require("tmi.js");
const pluggable = require("./pluggable.js");
const storage = require("./storage.js");

module.exports = class HotPlug {
  #basePath = null;
  #cache = {
    scripts: [],
    filters: [],
  };
  #storage = [];
  #defaultFilter = null;
  #client = null;
  #fileMatch = null;

  /**
   *
   * @param {string} basePath
   * @param {Client} client
   * @param {Function} defaultFilterAction
   */
  constructor(basePath, client, defaultFilterAction) {
    // path managment
    if (typeof basePath !== "string") {
      throw new Error(`basePath only accepts string, found ${typeof basePath}`);
    }
    if (!fs.existsSync(basePath)) {
      throw new Error(`${basePath} path does not exist`);
    }
    this.#basePath = basePath;
    // filter Action managment
    if (typeof defaultFilterAction !== "function") {
      throw new Error(
        `defaultFilterAction only accepts function, found ${typeof basePath}`
      );
    }
    this.#defaultFilter = defaultFilterAction;
    this.#client = client;
    this.#fileMatch = new RegExp("^[^_](.*)?.js");
  }

  /**
   * function passed to tmi
   * @param {string} channel
   * @param {object} tags
   * @param {string} message
   * @param {bool} self
   * @returns {void}
   */
  execute(channel, tags, message, self) {
    if (self) return; // if used by itself do nothing
    // refresh sequece
    this.#cleanup();
    this.#readFilter();
    this.#readScript();
    // filter variables
    let filterActionActivated = false;
    let filterActivated = false;
    // loop trough filters
    this.#cache.filters.forEach((filter) => {
      // stop checking after first filter triggered
      if (!filterActionActivated && !filterActivated) {
        // create storage if it doesn't exist
        if (typeof this.#storage[filter.path] === "undefined") {
          this.#storage[filter.path] = new storage();
        }
        // try running filter without crashing bot
        try {
          // filter execute, must return bool value
          let filterTrigger = filter.execute(
            channel,
            tags,
            message,
            self,
            this.#storage[filter.path]
          );
          if (filterTrigger) {
            // custom actions can be created
            // direct gives direct access to file functions
            if (typeof filter.direct.action === "function") {
              filterActionActivated = true;
              filter.direct.action(
                this.#client,
                channel,
                tags,
                message,
                self,
                this.#storage[filter.path]
              );
            } else {
              filterActivated = true;
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
    // make default action if custom was not triggered
    if (filterActivated && !filterActionActivated) {
      this.#defaultFilter(this.#client, channel, tags, message, self);
    }
    // filter job done, if any activate: terminate
    if (filterActivated || filterActionActivated) {
      return;
    }
    // start command parsing
    let construct = message.split(" ");
    let response = this.#cache.scripts[construct[0].toLowerCase()];
    if (typeof response !== "undefined") {
      if (typeof this.#storage[response.path] === "undefined") {
        this.#storage[response.path] = new storage();
      }
      try {
        response.execute(
          this.#client,
          channel,
          tags,
          message,
          self,
          this.#storage[response.path]
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * fetches filter path array
   * @returns array filter file name array
   */
  #filterPathArray() {
    let result = [];
    this.#cache.filters.forEach((entry) => {
      result.push(entry.path);
    });
    return result;
  }

  /**
   * Reads files in filter directory
   */
  #readFilter() {
    let filterPath = path.join(this.#basePath, "filters");
    let files = fs.readdirSync(filterPath);
    let existingFiles = this.#filterPathArray();
    files.forEach((file) => {
      if (this.#fileMatch.test(file)) {
        let tempPath = path.join(filterPath, file);
        if (!existingFiles.includes(tempPath)) {
          this.#cache.filters.push(new pluggable("filter", tempPath));
        }
      }
    });
  }

  /**
   * Reads files in script directory
   */
  #readScript() {
    let filterPath = path.join(this.#basePath, "scripts");
    let files = fs.readdirSync(filterPath);
    files.forEach((file) => {
      if (this.#fileMatch.test(file)) {
        let tempPath = path.join(filterPath, file);
        let tempPlug = new pluggable("script", tempPath);
        if (typeof this.#cache.scripts[tempPlug.command] === "undefined") {
          this.#cache.scripts[tempPlug.command] = tempPlug;
        }
      }
    });
  }

  #cleanup() {
    this.#cache.scripts.forEach((item, index) => {
      if (!item.pathExists) {
        this.#cache.scripts.splice(index, 1);
      }
    });
    this.#cache.filters.forEach((item, index) => {
      if (!item.pathExists) {
        this.#cache.filters.splice(index, 1);
      }
    });
  }
};
