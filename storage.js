module.exports = class Storage {
  #storage = {};
  constructor(serialized = {}) {
    this.#storage = serialized;
  }

  set(key, value) {
    if (typeof key !== "string") {
      throw new Error(
        `Could not assign key of ${typeof key}, string type is accepted`
      );
    }
    this.#storage[key] = value;
  }

  get(key) {
    let result = undefined;
    if (typeof this.#storage[key] !== "undefined") {
      result = this.#storage[key];
    }
    return result;
  }

  serialize() {
    return this.#storage;
  }
};
