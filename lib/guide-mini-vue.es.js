const extend = Object.assign;
const isObject = val => {
    return val !== null && typeof val === "object";
};
const isArray = Array.isArray;
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const targetMap = new Map();
// 触发依赖
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    triggerEffects(deps);
}
function triggerEffects(deps) {
    for (const dep of deps) {
        if (dep.scheduler) {
            dep.scheduler();
        }
        else {
            dep.run();
        }
    }
}

/** @format */
// 只执行一次 后面创建响应式对象时用缓存值。
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 高阶函数 返回fn
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === "is_reactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "is_readonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        // 检查res是不是object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key}不可用被改变，因为${target}是只读的`);
        return true;
    },
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet,
});

function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`raw: ${raw} is not a project`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}
function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler);
}

function initProps(instance, rawProps) {
    instance.props = shallowReadonly(rawProps || {});
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
};
const PublicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicPropertiesGetter = publicPropertiesMap[key];
        if (publicPropertiesGetter) {
            return publicPropertiesGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: null,
    };
    return component;
}
function setupComponent(instance) {
    // initProps
    // initSlots
    initProps(instance, instance.vnode.props);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    // 设置proxy代理 this.something 而不用this.setupState.something
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(instance.props);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    //处理组件
    // 区分是组件还是element
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
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
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        const isEvent = (key) => /^on[A-Z]/.test(key);
        if (isEvent(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
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

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlags(type),
        el: null,
    };
    // children
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 转换vnode
            // 后续所有逻辑操作基于vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
