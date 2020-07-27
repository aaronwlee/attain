// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
import { match } from "https://jspm.dev/path-to-regexp@6.1.0";

const RouterContext = React.createContext({
  pathname: "/"
});
export const useRouter = () => React.useContext(RouterContext);

export function getComponentAndQuery(pages: any, currentPath: string, url: { search: string }) {
  let targetPath: any = "/404";
  let query: any = undefined;
  let params: any = undefined;
  Object.keys(pages).forEach((path: string) => {
    const matcher = match(path, { decode: decodeURIComponent });
    const isMatch: any = matcher(currentPath);
    if (isMatch.params) {
      const { 0: extra, ...result } = isMatch.params;
      const queries = url.search && url.search.substring(1).split("&") || [];
      if (queries.length > 0 && queries[0] !== "") {
        queries.map((qs) => {
          const pair = qs.split("=");
          query[decodeURIComponent(pair[0])] = decodeURIComponent(
            pair[1] || "",
          );
        });
      }
      params = result;
      targetPath = path;
    }
  })

  return { targetPath, query, params };
}

export function AttainRouter({
  url,
  _currentComponentPath,
  _query,
  _params,
  pages,
  MainComponent,
  SSR,
}: any) {
  const [routePath, serRoutePath] = React.useState(url.pathname);
  const [currentComponentPath, setCurrentComponentPath] = React.useState(_currentComponentPath)
  const [query, setQuery] = React.useState(_query);
  const [params, setParams] = React.useState(_params);

  (window as any).onpopstate = function (e: any) {
    if (e.state) {
      serRoutePath(e.state.value);
    }
  };

  React.useEffect(() => {
    const { targetPath, query: Query, params: Params } = getComponentAndQuery(pages, routePath, (window as any).location ? (window as any).location : url);
    if (targetPath) {
      setCurrentComponentPath(targetPath);
    }
    if (Query) {
      setQuery(Query);
    }
    if (Params) {
      setParams(Params);
    }
  }, [routePath])

  return (
    <div>
      <RouterContext.Provider value={{
        pathname: routePath,
        query,
        params,
        push: (value: string) => {
          (window as any).history.pushState({
            value
          }, "", value);
          serRoutePath(value);
        }
      }}>
        <MainComponent SSR={SSR} Component={
          pages[currentComponentPath].Component
            ? pages[currentComponentPath].Component
            : pages[currentComponentPath]
        } />
      </RouterContext.Provider>
    </div>
  )
}
export default RouterContext;