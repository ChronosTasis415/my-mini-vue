import { isArray } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";

export const initSlots = (instance, children) => {
  const { vnode } = instance;

  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeSlotObject(children, instance.slots);
  }
};

function normalizeSlotObject(children, slots) {
  for (const key in children) {
    const slot = children[key];
    slots[key] = props => normalizeSlotValue(slot(props));
  }
}

function normalizeSlotValue(slot) {
  return isArray(slot) ? slot : [slot];
}
