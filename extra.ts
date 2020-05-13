// for await (const middleware of current) {
//   // let res: AttainResponse | void;
//   /**
//    * @USE handle use middlewares
//    */
//   if (middleware.method === "ALL") {
//     const splitedCurrentUrl = currentUrl.split("/");
//     console.log(middleware.method, splitedCurrentUrl, middleware.url, `/${splitedCurrentUrl[1]}`)

//     if (middleware.callBack) {
//       return middleware.callBack(request, response);
//     } else if (middleware.next) {
//       if (middleware.url) {
//         if (middleware.url === currentUrl) {
//           console.log("1", middleware.url, currentUrl, "/");
//           return this.handleRequest(request, response, middleware.next, "/");
//         } else if (splitedCurrentUrl.length > 0) {
//           if (`/${splitedCurrentUrl[1]}` === middleware.url) {
//             console.log("2", middleware.url, currentUrl, `/${splitedCurrentUrl.slice(2).join("/")}`);
//             return this.handleRequest(request, response, middleware.next, `/${splitedCurrentUrl.slice(2).join("/")}`);
//           } else {
//             return this.handleRequest(request, response, middleware.next, currentUrl);
//           }
//         }
//       } else if (!middleware.url) {
//         return this.handleRequest(request, response, middleware.next);
//       }
//     }
//   }
//   /**
//    * @METHOD handle methods middlewares
//    */
//   else if (middleware.method === currentMethod) {
//     const splitedCurrentUrl = currentUrl.split("/");
//     console.log(middleware.method, splitedCurrentUrl, middleware.url, `/${splitedCurrentUrl[1]}`)

//     if (middleware.url) {
//       if (middleware.url === currentUrl) {
//         if (middleware.callBack) {
//           return middleware.callBack(request, response);
//         } else if (middleware.next) {
//           return this.handleRequest(request, response, middleware.next, "/");
//         }
//       } else if (middleware.next) {
//         if (splitedCurrentUrl.length > 0) {
//           if (`/${splitedCurrentUrl[1]}` === middleware.url) {
//             console.log("2", middleware.url, currentUrl, `/${splitedCurrentUrl.slice(2).join("/")}`);
//             return this.handleRequest(request, response, middleware.next, `/${splitedCurrentUrl.slice(2).join("/")}`);
//           } else {
//             return this.handleRequest(request, response, middleware.next, currentUrl);
//           }
//         }
//       }
//     } else if (!middleware.url) {
//       if (middleware.callBack) {
//         return middleware.callBack(request, response);
//       } else if (middleware.next) {
//         return this.handleRequest(request, response, middleware.next);
//       }
//     }
//   }

//   // if (response.end) {
//   //   const { end, ...denoResponseProps } = response;
//   //   console.log("here i've done")
//   //   // await request.serverRequest.respond(denoResponseProps);
//   // }

// }
// /**
//  * @NOT_FOUND
//  */
// // console.log("hereadsasdasdddddddddddddddddddddddddddddddddddddddddd")










// const pending = current.map(async middleware => {
//   /**
//   * @USE handle use middlewares
//   */
//   if (middleware.method === "ALL") {
//     const splitedCurrentUrl = currentUrl.split("/");
//     console.log(middleware.method, splitedCurrentUrl, middleware.url, `/${splitedCurrentUrl[1]}`)

//     if (middleware.callBack) {
//       await middleware.callBack(request, response);
//     } else if (middleware.next) {
//       if (middleware.url) {
//         if (middleware.url === currentUrl) {
//           console.log("1", middleware.url, currentUrl, "/");
//           await this.handleRequest(request, response, middleware.next, "/");
//         } else if (splitedCurrentUrl.length > 0) {
//           if (`/${splitedCurrentUrl[1]}` === middleware.url) {
//             console.log("2", middleware.url, currentUrl, `/${splitedCurrentUrl.slice(2).join("/")}`);
//             await this.handleRequest(request, response, middleware.next, `/${splitedCurrentUrl.slice(2).join("/")}`);
//           } else {
//             await this.handleRequest(request, response, middleware.next, currentUrl);
//           }
//         }
//       } else if (!middleware.url) {
//         await this.handleRequest(request, response, middleware.next);
//       }
//     }
//   }
//   /**
//    * @METHOD handle methods middlewares
//    */
//   else if (middleware.method === currentMethod) {
//     const splitedCurrentUrl = currentUrl.split("/");
//     console.log(middleware.method, splitedCurrentUrl, middleware.url, `/${splitedCurrentUrl[1]}`)

//     if (middleware.url) {
//       if (middleware.url === currentUrl) {
//         if (middleware.callBack) {
//           await middleware.callBack(request, response);
//         } else if (middleware.next) {
//           await this.handleRequest(request, response, middleware.next, "/");
//         }
//       } else if (middleware.next) {
//         if (splitedCurrentUrl.length > 0) {
//           if (`/${splitedCurrentUrl[1]}` === middleware.url) {
//             console.log("2", middleware.url, currentUrl, `/${splitedCurrentUrl.slice(2).join("/")}`);
//             await this.handleRequest(request, response, middleware.next, `/${splitedCurrentUrl.slice(2).join("/")}`);
//           } else {
//             await this.handleRequest(request, response, middleware.next, currentUrl);
//           }
//         }
//       }
//     } else if (!middleware.url) {
//       if (middleware.callBack) {
//         await middleware.callBack(request, response);
//       } else if (middleware.next) {
//         await this.handleRequest(request, response, middleware.next);
//       }
//     }
//   }
// })

// await Promise.all(pending);
