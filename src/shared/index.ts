export const extend = Object.assign;

export const isObject = val => {
  return val !== null && typeof val === "object";
};

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal);
};

export const isArray = Array.isArray;

export const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const camelize = (event: string) => {
  return event.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
export const convertEventName = (event: string) => {
  return event.charAt(0).toUpperCase() + event.slice(1);
};

export const toHandlerKey = (event: string) => {
  return event ? "on" + convertEventName(event) : "";
};
