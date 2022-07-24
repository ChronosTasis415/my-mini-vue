import { createVNode } from "../vnode";

export function renderSlots(slots, name, props) {
  const slot = slots[name];

  if (slot) {
    console.log("renderslot", slot);
    if (typeof slot === "function") {
      return createVNode("div", {}, slot(props));
    }
  }
}
