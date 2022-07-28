import { h, ref } from "../../lib/guide-mini-vue.es.js";

export const App = {
  setup() {
    const count = ref(0);
    const onClick = function () {
      count.value++;
    };
    return {
      count,
      onClick,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, "hello world: " + this.count),
      h(
        "button",
        {
          onClick: this.onClick,
        },
        "click"
      ),
    ]);
  },
};
