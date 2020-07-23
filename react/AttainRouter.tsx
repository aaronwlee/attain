// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';

const RouterContext = React.createContext<any>({
  pathname: "/",
});


export const useRouter = () => (React as any).useContext(RouterContext);

export function AttainRouter({ children, pathname }: any) {
  const [routePath, serRoutePath] = (React as any).useState(pathname);

  (window as any).onpopstate = function (e: any) {
    if (e.state) {
      serRoutePath(e.state.value)
    }
  };

  return (
    <div>
      <RouterContext.Provider value={{
        pathname: routePath,
        push: (value: string) => {
          (window as any).history.pushState({ value }, "", value);
          serRoutePath(value)
        }
      }}>
        {children}
      </RouterContext.Provider>
    </div>
  );
}

export default RouterContext;