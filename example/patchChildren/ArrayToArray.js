import { ref, h } from "../../lib/guide-mini-vue.es.js";

// 1,左侧对比
// (a b) c
// (a b) de
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
// ];

// 2,右侧对比
// a (b c)
// d e (b c)
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];

// 3, 新的比老的长 也就是创建新的
// 左侧
// (a b)
// (a b) c
// i=2 e1=1 e2=2
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];

// 右侧
// (a b)
// c (a b)
// i=0 e1=-1 e2=0
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];

//4 老的比新的长
//  删除老的
// 左侧
// (a b) c
// (a b)
// i=2 e1=2 e2=1
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 右侧
// c (a b)
// (a b)
// i=2 e1=2 e2=1
const prevChildren = [
  h("p", { key: "C" }, "C"),
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
];
const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

export default {
  name: "ArrayToText",
  setup() {
    const isChange = ref(false);

    window.isChange = isChange;
    return {
      isChange,
    };
  },

  render() {
    const self = this;
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
