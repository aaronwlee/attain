/**
 * required to use "lib": ["dom", "dom.iterable", "esnext", "deno.ns", "deno.unstable"]
 */
export const useDocument = () => {
  try {
    //@ts-ignore
    if(document) {
      return document;
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
};

const head = [];


export function addToHead(data) {
  const dom = useDocument();

  if(dom) {
    dom.head.innerHTML += data;
  } else {
    head.push(data)
  }
}

export function getHead() {
  return head.join("\n");
}