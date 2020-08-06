// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/master/react/v16.13.1/react.d.ts"
import React from "https://jspm.dev/react@16.13.1";

/**
 * required to use "lib": ["dom", "dom.iterable", "esnext", "deno.ns", "deno.unstable"]
 */
export const useDocument = () => {
  try {
    //@ts-ignore
    if (document) {
      return document;
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
};

let header = [];
const dom = useDocument();


/**
 * 
 * @param {string} name 
 * @param {object} attr 
 */
export const addMeta = (name, attr) => {
  if (dom) {
    const meta = dom.querySelector(`meta[name="${name}"]`);

    if (meta) {
      Object.keys(attr).forEach(key => {
        meta[key] = attr[key];
      });
    } else {
      const newMeta = dom.createElement("meta");
      Object.keys(attr).forEach(key => {
        newMeta[key] = attr[key];
      });
      dom.getElementsByTagName("head")[0].appendChild(meta);
    }
  } else {
    header.push( /*#__PURE__*/React.createElement("meta", attr));
  }
};


/**
 * 
 * @param {object} attr 
 * @param {string} text 
 */
export const addScript = (attr, text = "") => {
  if (dom) {
    const newScript = dom.createElement("script");
    Object.keys(attr).forEach(key => {
      newScript[key] = attr[key];
    });
    newScript["text"] = text;
    dom.getElementsByTagName("head")[0].appendChild(newScript);
  } else {
    header.push( /*#__PURE__*/React.createElement("script", _extends({}, attr, {
      dangerouslySetInnerHTML: {
        __html: text
      }
    })));
  }
};


/**
 * 
 * @param {string} text 
 */
export const setTitle = text => {
  if (dom) {
    const title = dom.querySelector("title");

    if (title) {
      title["text"] = text;
    } else {
      const newTitle = dom.createElement("title");
      newTitle["text"] = text;
      dom.getElementsByTagName("head")[0].appendChild(newTitle);
    }
  } else {
    header.push( /*#__PURE__*/React.createElement("title", {
      dangerouslySetInnerHTML: {
        __html: text
      }
    }));
  }
};

export function getHead() {
  try {
    return header;
  } finally {
    header = [];
  }
}


/**
 * Helper hooks to make working with react easier
 */

export function useWindowSize() {
  try {
    if (window) {
      const [size, setSize] = React.useState([window.innerWidth, window.innerHeight]);
      React.useLayoutEffect(() => {
        function updateSize() {
          setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
      }, []);
      return size;
    } else return [0, 0]
  } catch(err) {
    return [0, 0]
  }
}

/**
 * 
 * @param {string} url 
 * @param {object} options 
 */
export function useAsyncFetch(url, options) {
  const [data, setData] = React.useState(null);
  const [status, setStatus] = React.useState(200);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(url, options);
        setStatus(res.status);
        const data = await res.json();
        setData(data);
      } catch(err) {
        setError(err);
      }
    })();
  });

  return { data, status, error }
}
