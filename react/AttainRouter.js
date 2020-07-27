// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
import { match } from "https://jspm.dev/path-to-regexp@6.1.0";
const RouterContext = React.createContext({
  pathname: "/"
});
export const useRouter = () => React.useContext(RouterContext);
export function getComponentAndQuery(pages, currentPath) {
  let Component = undefined;
  let query = undefined;
  Object.keys(pages).forEach(path => {
    const matcher = match(path, {
      decode: decodeURIComponent
    });
    const isMatch = matcher(currentPath);

    if (isMatch.params) {
      const {
        0: extra,
        ...result
      } = isMatch.params;
      query = result;
      Component = pages[path];
    }
  });
  return {
    Component,
    query
  };
}
export function AttainRouter({
  children,
  pathname,
  Component,
  query,
  pages
}) {
  const [routePath, serRoutePath] = React.useState(pathname);
  const [ComponentValue, setComponentValue] = React.useState(Component ? Component : pages["404"] ? pages["404"] : undefined);
  const [queryValue, setQueryValue] = React.useState(query);

  window.onpopstate = function (e) {
    if (e.state) {
      serRoutePath(e.state.value);
    }
  };

  React.useEffect(() => {
    const {
      Component: ComponentResult,
      query: QueryResult
    } = getComponentAndQuery(pages, routePath);

    if (ComponentResult) {
      setComponentValue(ComponentResult);
    }

    if (QueryResult) {
      setQueryValue(QueryResult);
    }
  }, [routePath]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RouterContext.Provider, {
    value: {
      pathname: routePath,
      query: queryValue,
      push: value => {
        window.history.pushState({
          value
        }, "", value);
        serRoutePath(value);
      }
    }
  }, React.cloneElement(children, {
    Component: ComponentValue
  })));
}
export default RouterContext;