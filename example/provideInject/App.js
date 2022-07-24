import { h, provide, inject } from "../../lib/guide-mini-vue.es.js";
const Provide = {
  setup() {
    provide("foo", "fooval");
    provide("bar", "bar");
    return {};
  },
  render() {
    return h("div", {}, [h("p", {}, "provider"), h(Another)]);
  },
};
const Another = {
  setup() {},
  render() {
    return h("div", {}, [h(Consumer)]);
  },
};
const Consumer = {
  setup() {
    const foo = inject("foo");
    const bar = inject("bar", "injectDefaultValue");
    const baz = inject("baz", () => "injectDefaultValue");

    return {
      foo,
      bar,
      baz,
    };
  },

  render() {
    return h(
      "div",
      {},
      `consumer -- ${this.foo} -- ${this.bar} -- ${this.baz}`
    );
  },
};
export const App = {
  render() {
    return h("div", {}, [h(Provide)]);
  },

  setup() {
    return {};
  },
};
