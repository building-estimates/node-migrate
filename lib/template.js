'use strict'

import { MigrationScript } from '../types'

// eslint-disable-next-line import/no-default-export
export default class extends MigrationScript {
  description = '[AB#1234] short description of the migration'

  constructor() {
    super(__filename)
  }

  /**
   * uncommment this if you want to skip the migration in some conditions
   */
  // shouldSkip(): boolean {
  //   for instance on dev or staging
  //   return getEnvironment() !== 'prod'
  // }

  async apply(): Promise<void> {
    // do something here
  }

  /**
   * uncommment this to support migration rollback
   */
  // rollback(): Promise<void> {
  //   // do something here
  // }
}
