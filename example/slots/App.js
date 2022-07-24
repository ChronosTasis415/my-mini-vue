import { h } from "../../lib/guide-mini-vue.es.js";
import { Foo } from "./Foo.js";
export const App = {
  render() {
    const app = h("div", {}, "App");
    const foo = h(
      Foo,
      {},
      // 定义的是slots
      {
        header: ({ age }) => h("p", {}, "header" + age),
        footer: () => h("p", {}, "footer"),
      }
    );
    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
