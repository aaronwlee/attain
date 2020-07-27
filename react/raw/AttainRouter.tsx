// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
import { match } from "https://jspm.dev/path-to-regexp@6.1.0";

const RouterContext = React.createContext({
  pathname: "/"
});
export const useRouter = () => React.useContext(RouterContext);

export function getComponentAndQuery(pages: any, currentPath: string) {
  let Component: any = pages["/404"] ? pages["/404"] : undefined;
  let query: any = undefined;
  Object.keys(pages).forEach((path: string) => {
    const matcher = match(path, { decode: decodeURIComponent });
    const isMatch: any = matcher(currentPath);
    if (isMatch.params) {
      const { 0: extra, ...result } = isMatch.params;
      query = result;
      Component = pages[path];
    }
  })

  return { Component, query };
}

export function AttainRouter({
  pathname,
  Component,
  query,
  pages,
  MainComponent,
  SSR,
}: any) {
  const [routePath, serRoutePath] = React.useState(pathname);
  const [ComponentValue, setComponentValue] = React.useState(Component ? Component : undefined)
  const [queryValue, setQueryValue] = React.useState(query);

  (window as any).onpopstate = function (e: any) {
    if (e.state) {
      serRoutePath(e.state.value);
    }
  };

  React.useEffect(() => {
    const { Component: ComponentResult, query: QueryResult } = getComponentAndQuery(pages, routePath);
    if (ComponentResult) {
      setComponentValue(ComponentResult);
    }
    if (QueryResult) {
      setQueryValue(QueryResult);
    }
  }, [routePath])

  return (
    <div>
      <RouterContext.Provider value={{
        pathname: routePath,
        query: queryValue,
        push: (value: string) => {
          (window as any).history.pushState({
            value
          }, "", value);
          serRoutePath(value);
        }
      }}>
        <MainComponent SSR={SSR} Component={ComponentValue} />
      </RouterContext.Provider>
    </div>
  )
}
export default RouterContext;