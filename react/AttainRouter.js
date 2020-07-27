// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
import { match } from "https://jspm.dev/path-to-regexp@6.1.0";
const RouterContext = React.createContext({
  pathname: "/"
});
export const useRouter = () => React.useContext(RouterContext);
export function getComponentAndQuery(pages, currentPath, url) {
  let targetPath = "/404";
  let query = undefined;
  let params = undefined;
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
      const queries = url.search && url.search.substring(1).split("&") || [];

      if (queries.length > 0 && queries[0] !== "") {
        if (!query) {
          query = {};
        }

        queries.map(qs => {
          const pair = qs.split("=");
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
        });
      }

      params = result;
      targetPath = path;
    }
  });
  return {
    targetPath,
    query,
    params
  };
}
export function AttainRouter({
  url,
  _currentComponentPath,
  _query,
  _params,
  pages,
  MainComponent,
  SSR
}) {
  const [routePath, serRoutePath] = React.useState(url.pathname);
  const [currentComponentPath, setCurrentComponentPath] = React.useState(_currentComponentPath);
  const [query, setQuery] = React.useState(_query);
  const [params, setParams] = React.useState(_params);

  window.onpopstate = function (e) {
    if (e.state) {
      serRoutePath(e.state.value);
    }
  };

  React.useEffect(() => {
    const {
      targetPath,
      query: Query,
      params: Params
    } = getComponentAndQuery(pages, routePath, window.location ? window.location : url);

    if (targetPath) {
      setCurrentComponentPath(targetPath);
    }

    if (Query) {
      setQuery(Query);
    }

    if (Params) {
      setParams(Params);
    }
  }, [routePath]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RouterContext.Provider, {
    value: {
      pathname: routePath,
      query,
      params,
      push: value => {
        const url = new URL(`${window.location.protocol}//${window.location.host}${value}`);
        window.history.pushState({
          value: url.pathname
        }, "", value);
        serRoutePath(url.pathname);
      }
    }
  }, /*#__PURE__*/React.createElement(MainComponent, {
    SSR: SSR,
    Component: pages[currentComponentPath].Component ? pages[currentComponentPath].Component : pages[currentComponentPath]
  })));
}
export default RouterContext;