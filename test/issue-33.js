/* eslint-env mocha */
'use strict'
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const migrate = require('../')
const db = require('./util/db')

const BASE = path.join(__dirname, 'fixtures', 'issue-33')
const STATE = path.join(BASE, '.migrate')

const A1 = ['1-up', '2-up', '3-up']
const A2 = A1.concat(['3-down'])
const A3 = A2.concat(['2-down'])
const A4 = A3.concat(['1-down'])

describe('issue #33', function () {
  let set

  beforeEach(function (done) {
    migrate.load({
      stateStore: STATE,
      migrationsDirectory: BASE
    }, function (err, s) {
      set = s
      done(err)
    })
  })

  it('should run migrations in the correct order', function (done) {
    set.up(function (err) {
      assert.ifError(err)
      assert.deepStrictEqual(db.issue33, A1)

      set.up(function (err) {
        assert.ifError(err)
        assert.deepStrictEqual(db.issue33, A1)

        set.down(function (err) {
          assert.ifError(err)
          assert.deepStrictEqual(db.issue33, A2)

          set.down(function (err) {
            assert.ifError(err)
            assert.deepStrictEqual(db.issue33, A3)

            set.down(function (err) {
              assert.ifError(err)
              assert.deepStrictEqual(db.issue33, A4)

              done()
            })
          })
        })
      })
    })
  })

  afterEach(function (done) {
    db.nuke()
    fs.unlink(STATE, done)
  })
})
