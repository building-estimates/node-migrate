"use strict";

const path = require("path");
const fs = require("fs");
const Migration = require("./migration");
const loadMigrationsFromFilesystem = require("./load-migrations-from-fileystem");

module.exports = loadMigrationsIntoSet;

function loadMigrationsIntoSet(options, fn) {
  // Process options, set and store are required, rest optional
  const opts = options || {};

  if (!opts.set || !opts.store) {
    throw new TypeError(
      (opts.set ? "store" : "set") + " is required for loading migrations"
    );
  }

  const set = opts.set;
  const store = opts.store;
  const ignoreMissing = !!opts.ignoreMissing;
  const filterFn = opts.filterFunction || (() => true);
  const sortFn =
    opts.sortFunction ||
    function (m1, m2) {
      return m1.title > m2.title ? 1 : m1.title < m2.title ? -1 : 0;
    };
  const migrationsLoader =
    opts.migrationsLoader || loadMigrationsFromFilesystem(opts);

  // Load from migrations store first up
  store.load(function (err, state) {
    if (err) return fn(err);

    // Set last run date on the set
    set.lastRun = state.lastRun || null;

    migrationsLoader(function (err, migrations) {
      if (err) return fn(err);

      const migMap = {};
      migrations.forEach((migration) => {
        migMap[migration.title] = migration;
      });

      // Fill in timestamp from state, or error if missing
      state.migrations &&
        state.migrations.forEach(function (m) {
          if (m.timestamp !== null && !migMap[m.title]) {
            return ignoreMissing
              ? null
              : fn(new Error("Missing migration file: " + m.title));
          } else if (!migMap[m.title]) {
            // Migration existed in state file, but was not run and not loadable
            return;
          }

          migMap[m.title].timestamp = m.timestamp;
        });

      // Sort the migrations by their title
      migrations = migrations.sort(sortFn);

      // Add the migrations to the set
      migrations.forEach(set.addMigration.bind(set));

      // Successfully loaded
      fn();
    });
  });
}
