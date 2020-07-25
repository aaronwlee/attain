// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
const RouterContext = React.createContext({
  pathname: "/"
});
export const useRouter = () => React.useContext(RouterContext);
export function AttainRouter({
  children,
  pathname
}) {
  const [routePath, serRoutePath] = React.useState(pathname);

  window.onpopstate = function (e) {
    if (e.state) {
      serRoutePath(e.state.value);
    }
  };

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RouterContext.Provider, {
    value: {
      pathname: routePath,
      push: value => {
        window.history.pushState({
          value
        }, "", value);
        serRoutePath(value);
      }
    }
  }, children));
}
export default RouterContext;