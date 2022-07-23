import { h } from "../../lib/guide-mini-vue.es.js";
import {Foo} from './Foo.js'
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      // `hi, ${this.msg}`
      [
        h('div', {}, `hi, ${this.msg}`),
        h(Foo, {
          count: 1
        })
      ]
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    );
  },

  setup() {
    return {
      msg: "mini-vue,hahah",
    };
  },
};
