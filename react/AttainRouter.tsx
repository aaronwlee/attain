// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';

const RouterContext = React.createContext<any>({
  pathname: "/",
});

export const useRouter = () => React.useContext(RouterContext);

export function AttainRouter({
  children,
  pathname
}: any) {
  const [routePath, setRoutePath] = React.useState(pathname);

  console.log(pathname, routePath);

  (window as any).onpopstate = function (e: any) {
    if (e.state) {
      setRoutePath(e.state.value);
    }
  };

  return (
    <RouterContext.Provider value={{
      pathname: routePath,
      push: (value: any) => {
        (window as any).history.pushState({
          value
        }, "", value);
        setRoutePath(value);
      }
    }}>
      {children}
    </RouterContext.Provider>
  )
}
export default RouterContext;