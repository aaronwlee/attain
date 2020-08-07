import { HttpError } from "./httpError.ts";

// Error class to throw, with a 500 status code
export class DatabaseError extends HttpError {
    constructor(message: string) {
        super(`Database Error: ${message}`);
        // set status code
        super.status = 500;
    }
}

// the interface to use
export interface AttainDatabase {
    connect(): Promise<void>;
}

// list of databases, may be useful in the future
export enum DatabaseService {
    MongoDB,
    PostgreSQL,
    MySQL,
    Redis,
    Cassandra,
    MSSQL,
    Oracle
}

export enum DatabaseType {
    SQL,
    NOSQL
}