import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProps(el, key, prevProp, nextProp) {
  const isEvent = (key: string) => /^on[A-Z]/.test(key);
  if (isEvent(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextProp);
  } else {
    if (nextProp === undefined || nextProp === null) {
      el.removeAttribute(key, nextProp);
    } else {
      el.setAttribute(key, nextProp);
    }
  }
}

function insert(el, container) {
  container.append(el);
}

function setElementText(el, text) {
  el.textContent = text;
}

function remove(el) {
  const parent = el.parentNode;

  if (parent) {
    parent.removeChild(el);
  }
}

// createRenderer 返回的是一个 包含createAppAPI(args)的对象
const renderer: any = createRenderer({
  createElement,
  patchProps,
  insert,
  remove,
  setElementText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
