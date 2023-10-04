'use strict'

const path = require('path')
const fs = require('fs').promises
const Migration = require('./migration')

module.exports = function loadMigrationsFromFilesystem (options) {
  return async function (cb) {
    try {
      const opts = options || {}

      const migrationsDirectory = path.resolve(
        opts.migrationsDirectory || 'migrations'
      )
      const filterFn = opts.filterFunction || (() => true)

      // Read migrations directory
      let files = await fs.readdir(migrationsDirectory)

      // Filter out non-matching files
      files = files.filter(filterFn)

      // Create migrations, keep a lookup map for the next step
      const migrations = await Promise.all(
        files.map(async function (file) {
          // Try to load the migrations file
          const filepath = path.join(migrationsDirectory, file)

          let mod
          try {
            mod = require(filepath)
          } catch (e) {
            if (e.code === 'ERR_REQUIRE_ESM') {
              mod = await import(filepath)
            } else {
              return cb(e)
            }
          }

          const migration = new Migration(
            file,
            mod.up.bind(mod),
            mod.down.bind(mod),
            mod.description
          )

          return migration
        })
      )

      // Return the migrations loaded
      cb(null, migrations)
    } catch (err) {
      cb(err)
    }
  }
}
