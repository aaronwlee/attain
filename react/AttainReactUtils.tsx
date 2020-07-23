declare let document: any;

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

export const useWindow = () => {
  return window as any;
};