import { h } from "../../lib/guide-mini-vue.es.js";

import ArrayToArray from "./ArrayToArray.js";
import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";

export const App = {
  name: "App",
  setup() {},

  render() {
    return h("div", { tId: 1 }, [
      h("p", {}, "主页"),
      // 老的是array 新的也是array
      h(ArrayToArray),
      // 老的是array 新的是text
      // h(ArrayToText),
      // 老的是text 新的是text
      // h(TextToText),
      // 老的是text 新的是array
      // h(TextToArray),
    ]);
  },
};
