"use strict";

const path = require("path");
const fs = require("fs");

module.exports = function loadMigrationsFromFilesystem(options) {
  return function (fn) {
    const opts = options || {};

    const migrationsDirectory = path.resolve(
      opts.migrationsDirectory || "migrations"
    );
    const filterFn = opts.filterFunction || (() => true);

    fs.readdir(migrationsDirectory, function (err, files) {
      if (err) return fn(err);

      // Filter out non-matching files
      files = files.filter(filterFn);

      // Create migrations, keep a lookup map for the next step
      let migrations = files.map(function (file) {
        let mod;

        // Try to load the migrations file
        try {
          const BaseClass = require(path.join(
            migrationsDirectory,
            file
          )).default;
          mod = new BaseClass();
        } catch (e) {
          return fn(e);
        }

        const migration = new Migration(
          file,
          mod.up.bind(mod),
          mod.down.bind(mod),
          mod.description
        );

        return migration;
      });

      // Return the migrations loaded
      fn(null, migrations);
    });
  };
};
