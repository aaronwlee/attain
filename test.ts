const app = (...fn: any) => {
  console.log(fn);
}

// first
app(() => {}, () => {});

// second
app("hello", () => {});

// third
app("hello", () => {} , () => {});

// 4
app("hello");

// 5
app(() => {});