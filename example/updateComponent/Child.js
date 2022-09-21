import { h, ref } from "../../lib/guide-mini-vue.es.js";

export const Child = {
  name: "Child",

  setup() {},

  render() {
    return h("div", {}, `child - props - msg: ${this.$props.msg}`);
  },
};
