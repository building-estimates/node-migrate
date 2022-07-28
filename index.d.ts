import type { EventEmitter } from "events";

type MigrationOptions = {
  set?: MigrationSet;
  stateStore?: string | FileStore;
  migrationsDirectory?: string;
  filterFunction?: (migration: string) => boolean;
  sortFunction?: (migration1: Migration, migration2: Migration) => boolean;
};

type NextFunction = () => void;
type CallbackError = (err: Error | null) => void;

export default function migrate(
  title: string,
  up: (next: NextFunction) => void,
  down: (next: NextFunction) => void
): void;

export function load(
  opts: MigrationOptions,
  cb: (err: any, set: MigrationSet) => void
): void;

declare class Migration {
  constructor(
    title: string,
    up: (next: NextFunction) => void,
    down: (next: NextFunction) => void,
    description: string
  );
  title: string;
  up: (next: NextFunction) => void;
  down: (next: NextFunction) => void;
  description: string;
  timestamp: number | null;
}

export interface StoreState {
  lastRun?: string | undefined
  migrations: Pick<Migration, 'title' | 'description' | 'timestamp'>[]
}

export declare interface BaseStore {
  save(set: MigrationSet, cb: CallbackError): void;

  load(
    cb: (
      err: Error | null,
      store?: StoreState
    ) => void
  ): void;
}

export class MigrationSet extends EventEmitter {
  constructor(store: BaseStore);
  addMigration(
    title: string,
    up: (next: NextFunction) => void,
    down: (next: NextFunction) => void
  ): void;
  addMigration(migration: Migration): void;
  save(cb: CallbackError): void;
  down(migrationName: string, cb: CallbackError): void;
  down(cb: CallbackError): void;
  up(migrationName: string, cb: CallbackError): void;
  up(cb: CallbackError): void;
  migrate(
    direction: "up" | "down",
    migrationName: string,
    cb: CallbackError
  ): void;
  migrate(direction: "up" | "down", cb: CallbackError): void;
  migrations: Migration[];
  map: { [title: string]: Migration };
  lastRun: string | null;
}

declare class FileStore implements BaseStore {
  constructor(path: string);
  save(set: MigrationSet, cb: CallbackError): void;
  load(
    cb: (
      err: Error | null,
      store?: StoreState
    ) => void
  ): void;
}

export function registerCompiler(packageName: string): void;
