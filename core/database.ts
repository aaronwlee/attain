export class DatabaseError extends Error {
  constructor(message: string) {
    super(`Database Error: ${message}`);
  }
}

// the class to expand
export class AttainDatabase {
  static __type: string = "attain"
  async connect() {
    console.log('database connected')
  }
}

export interface NoParamConstructor<I> {
  new(): I
  __type: string;
}

/*
async function createDatabase<T extends AttainDatabase>(ctor: NoParamConstructor<T>): Promise<T> {
  const database = new ctor();
  await database.connect();
  return database;
}
*/