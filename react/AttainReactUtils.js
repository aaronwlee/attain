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
