import {pathToRegExp} from "../path-to-regexp.ts";

const regexp = pathToRegExp("/api/post(.*)");

const result = regexp.exec("/api/post");

console.log("result: >>>> ", result)