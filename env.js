const fs = require("fs");

let unparsed_userless = fs.readFileSync("./env.json", "utf-8", (err, data) => {
  if (err) {
    throw new Error(err);
  }
  return data;
});

let unparsed_user = fs.readFileSync("./identity.json", "utf-8", (err, data) => {
  if (err) {
    throw new Error(err);
  }
  return data;
});

let fullBuild = JSON.parse(unparsed_userless);

let identity = JSON.parse(unparsed_user);
fullBuild.identity = identity;

module.exports = fullBuild;
