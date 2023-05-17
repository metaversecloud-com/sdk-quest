export const findObjectKeyPath = (object, key) => {
  const path = [];
  const keyExists = (object) => {
    if (!object || (typeof object !== "object" && !Array.isArray(object))) {
      return false;
    } else if (object.hasOwnProperty(key)) {
      return true;
    } else if (Array.isArray(object)) {
      let parentKey = path.length ? path.pop() : "";

      for (let i = 0; i < object.length; i++) {
        path.push(`${parentKey}[${i}]`);
        const result = keyExists(object[i], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    } else {
      for (const k in object) {
        path.push(k);
        const result = keyExists(object[k], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    }
    return false;
  };
  keyExists(object);
  return path.join(".");
};
