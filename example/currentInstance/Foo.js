import {
  h,
  renderSlots,
  getCurrentInstance,
} from "../../lib/guide-mini-vue.es.js";

export const Foo = {
  name: "Foo",
  setup() {
    const instance = getCurrentInstance();
    console.log("App", instance);
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
