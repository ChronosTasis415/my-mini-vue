import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //处理组件
  // 区分是组件还是element
  const { type, shapeFlag } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
  }
}
// 处理text文本节点
function processText(vnode, contianer) {
  // 调用createTextVnode后 text 变成了 h(Text, {}, text) 所以text文本就是children
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  contianer.append(textNode);
}
// 处理fragment
function processFragment(vnode, container) {
  mountChildren(vnode, container);
}
// 处理 element
function processElement(vnode, container) {
  // init
  // update
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type));
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }
  for (const key in props) {
    const val = props[key];
    const isEvent = (key: string) => /^on[A-Z]/.test(key);
    if (isEvent(key)) {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach(child => {
    patch(child, container);
  });
}

// 处理component
function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(initialVnode, container) {
  const instance = createComponentInstance(initialVnode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // initialVnode -> patch
  // initialVnode -> element -> mount

  patch(subTree, container);

  //  所有的element都已经渲染完成
  initialVnode.el = subTree.el;
}
