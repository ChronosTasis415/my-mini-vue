import { h, renderSlots } from "../../lib/guide-mini-vue.es.js";

export const Foo = {
  setup() {
    return {};
  },

  render() {
    const foo = h("p", {}, "foo");
    const age = 20;
    return h("div", {}, [
      renderSlots(this.$slots, "header", { age }),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
