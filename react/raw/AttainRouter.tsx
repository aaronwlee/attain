// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
import { match } from "https://jspm.dev/path-to-regexp@6.1.0";

const RouterContext = React.createContext({
  pathname: "/"
});
export const useRouter = () => React.useContext(RouterContext);

export function getComponentAndQuery(pages: any, currentPath: string) {
  let targetPath: any = "/404";
  let query: any = undefined;
  Object.keys(pages).forEach((path: string) => {
    const matcher = match(path, { decode: decodeURIComponent });
    const isMatch: any = matcher(currentPath);
    if (isMatch.params) {
      const { 0: extra, ...result } = isMatch.params;
      query = result;
      targetPath = path;
    }
  })

  return { targetPath, query };
}

export function AttainRouter({
  pathname,
  _currentComponentPath,
  _query,
  pages,
  MainComponent,
  SSR,
}: any) {
  const [routePath, serRoutePath] = React.useState(pathname);
  const [currentComponentPath, setCurrentComponentPath] = React.useState(_currentComponentPath)
  const [query, setQuery] = React.useState(_query);

  (window as any).onpopstate = function (e: any) {
    if (e.state) {
      serRoutePath(e.state.value);
    }
  };

  React.useEffect(() => {
    const { targetPath, query: QueryResult } = getComponentAndQuery(pages, routePath);
    if (targetPath) {
      setCurrentComponentPath(targetPath);
    }
    if (QueryResult) {
      setQuery(QueryResult);
    }
  }, [routePath])

  return (
    <div>
      <RouterContext.Provider value={{
        pathname: routePath,
        query,
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