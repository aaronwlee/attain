export class DatabaseError extends Error {
    constructor(message: string) {
        super(`Database Error: ${message}`);
    }
}

// the class to expand
export class AttainDatabase {
    async connect() {
        console.log('database connected')
    }
}

export interface NoParamConstructor<I> {
    new(): I
}

/*
async function createDatabase<T extends AttainDatabase>(ctor: NoParamConstructor<T>): Promise<T> {
    const database = new ctor();
    await database.connect();
    return database;
}
*/