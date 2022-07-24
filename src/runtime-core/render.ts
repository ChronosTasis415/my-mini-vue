import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container, parentComponent) {
  patch(vnode, container, parentComponent);
}

function patch(vnode, container, parentComponent) {
  //处理组件
  // 区分是组件还是element
  const { type, shapeFlag } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
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
function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}
// 处理 element
function processElement(vnode, container, parentComponent) {
  // init
  // update
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode, container, parentComponent) {
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type));
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
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

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(child => {
    patch(child, container, parentComponent);
  });
}

// 处理component
function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVnode, container, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent);

  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // initialVnode -> patch
  // initialVnode -> element -> mount

  patch(subTree, container, instance);

  //  所有的element都已经渲染完成
  initialVnode.el = subTree.el;
}
