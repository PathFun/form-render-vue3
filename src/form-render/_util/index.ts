import { cloneDeep, get, isEmpty, set } from 'lodash-es';
import { Schema, Flatten } from '../FRType';

export function getParamByName(name: string, url = window.location.href) {
  // eslint-disable-next-line no-useless-escape
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function isCheckBoxType(schema: Schema, readOnly: any) {
  if (readOnly) return false;
  if (schema.widget === 'checkbox') return true;
  if (schema && schema.type === 'boolean') {
    if (schema.enum) return false;
    if (schema.widget === undefined) return true;
    return false;
  }
}

// a[].b.c => a.b.c
function removeBrackets(string: string) {
  return string.replace(/\[\]/g, '');
}

export function getParentPath(path: any) {
  if (typeof path === 'string') {
    const pathArr = path.split('.');
    if (pathArr.length === 1) {
      return '#';
    }
    pathArr.pop();
    return pathArr.join('.');
  }
  return '#';
}

export function getValueByPath(formData: Record<string, any>, path?: string) {
  if (path === '#' || !path) {
    return formData || {};
  } else if (typeof path === 'string') {
    return get(formData, path);
  } else {
    console.error('path has to be a string');
  }
}

//  path: 'a.b[1].c[0]' => { id: 'a.b[].c[]'  dataIndex: [1,0] }
export function destructDataPath(path: string) {
  let id;
  let dataIndex: number[] = [];
  if (path === '#') {
    return { id: '#', dataIndex: [] };
  }
  const pattern = /\[[0-9]+\]/g;
  const matchList = path.match(pattern);
  if (!matchList) {
    id = path;
  } else {
    id = path.replace(pattern, '[]');
    // 这个是match下来的结果，可安全处理
    dataIndex = matchList.map(item => Number(item.substring(1, item.length - 1)));
  }
  return { id, dataIndex };
}

// id: 'a.b[].c[]'  dataIndex: [1,0] =>  'a.b[1].c[0]'
export function getDataPath(id: string, dataIndex: any[]) {
  if (id === '#') {
    return id;
  }
  let _id = id;
  if (Array.isArray(dataIndex)) {
    // const matches = id.match(/\[\]/g) || [];
    // const count = matches.length;
    dataIndex.forEach(item => {
      _id = _id.replace(/\[\]/, `[${item}]`);
    });
  }
  return removeBrackets(_id);
}

export function isObjType(schema: Schema) {
  return schema && schema.type === 'object' && schema.properties && !schema.widget;
}

export function isTableType(schema: Schema) {
  return schema && schema.type === 'object' && schema.properties && schema.widget === 'table';
}

export function isLayout(schema: Schema) {
  return schema && schema.type === 'layout';
}

export function isLayoutType(schema: Schema) {
  return isLayout(schema) && schema.properties;
}

export function isBlockType(schema: Schema) {
  return schema && schema.type === 'block' && schema.widget;
}

// TODO: to support case that item is not an object
export function isListType(schema: Record<string, any>) {
  return (
    schema && schema.type === 'array' && (isObjType(schema.items) || isTableType(schema)) && schema.enum === undefined
  );
}

export function orderProperties(properties: any[][], orderKey = 'order') {
  const orderHash = new Map();
  // order不为数字的数据
  const unsortedList: any[] = [];
  const insert = (item: any[]) => {
    const [, value] = item;
    if (typeof value[orderKey] !== 'number') {
      unsortedList.push(item);
      return;
    }
    if (orderHash.has(value[orderKey])) {
      orderHash.get(value[orderKey]).push(item);
    } else {
      orderHash.set(value[orderKey], [item]);
    }
  };

  properties.forEach(item => insert(item));
  const sortedList = Array.from(orderHash.entries())
    .sort(([order1], [order2]) => order1 - order2) // order值越小越靠前
    .flatMap(([, items]) => items);
  return sortedList.concat(unsortedList);
}

// TODO: more tests to make sure weird & wrong schema won't crush
export function flattenSchema(_schema: Schema, name = '#', parent?: string, result: Record<string, any> = {}) {
  const schema: Record<string, any> = clone(_schema);
  let _name = name;
  schema._id = _name;
  const children: string[] = [];
  if (isObjType(schema) || isTableType(schema)) {
    orderProperties(Object.entries(schema.properties)).forEach(([key, value]) => {
      const _key = isListType(value) ? key + '[]' : key;
      const uniqueName = _name === '#' ? _key : _name + '.' + _key;
      children.push(uniqueName);

      flattenSchema(value, uniqueName, _name, result);
    });

    schema.properties = {};
  }
  if (isListType(schema)) {
    orderProperties(Object.entries(schema.items.properties)).forEach(([key, value]) => {
      const _key = isListType(value) ? key + '[]' : key;
      const uniqueName = _name === '#' ? _key : _name + '.' + _key;
      children.push(uniqueName);
      flattenSchema(value, uniqueName, _name, result);
    });
    schema.items.properties = {};
  }

  if (isLayoutType(schema)) {
    orderProperties(Object.entries(schema.properties)).forEach(([key, value]) => {
      const _key = isListType(value) ? key + '[]' : key;
      const uniqueName = parent === '#' ? _key : parent + '.' + _key;
      children.push(uniqueName);
      flattenSchema(value, uniqueName, parent, result);
    });
    schema.properties = {};
    result[_name] = { parent, schema, children };
  } else if (schema.type) {
    result[_name] = { parent, schema, children };
  }
  return result;
}

export function getSchemaFromFlatten(flatten: Flatten, path = '#') {
  let schema: Record<string, any> = {};
  const item = clone(flatten[path]);
  if (item) {
    schema = item.schema;
    if (item.children.length > 0) {
      item.children.forEach((child: string) => {
        if (!flatten[child]) return;
        const key = getKeyFromPath(child);
        if (isObjType(schema) || isTableType(schema)) {
          schema.properties[key] = getSchemaFromFlatten(flatten, child);
        }
        if (isListType(schema)) {
          schema.items.properties[key] = getSchemaFromFlatten(flatten, child);
        }
      });
    }
  }
  return schema;
}

function stringContains(str: string, text: string): boolean {
  return str.indexOf(text) > -1;
}

export const isObject = (a: any) => stringContains(Object.prototype.toString.call(a), 'Object');

export const clone = cloneDeep;

// '3' => true, 3 => true, undefined => false
export function isLooselyNumber(num?: string | number) {
  if (typeof num === 'number') return true;
  if (typeof num === 'string') {
    return !Number.isNaN(Number(num));
  }
  return false;
}

export function isCssLength(str: any) {
  if (typeof str !== 'string') return false;
  return str.match(/^([0-9])*(%|px|rem|em)$/i);
}

export function isDeepEqual(param1: any, param2: any) {
  if (param1 === undefined && param2 === undefined) return true;
  else if (param1 === undefined || param2 === undefined) return false;
  if (param1 === null && param2 === null) return true;
  else if (param1 === null || param2 === null) return false;
  else if (param1.constructor !== param2.constructor) return false;

  if (param1.constructor === Array) {
    if (param1.length !== param2.length) return false;
    for (let i = 0; i < param1.length; i++) {
      if (param1[i].constructor === Array || param1[i].constructor === Object) {
        if (!isDeepEqual(param1[i], param2[i])) return false;
      } else if (param1[i] !== param2[i]) return false;
    }
  } else if (param1.constructor === Object) {
    if (Object.keys(param1).length !== Object.keys(param2).length) return false;
    for (let i = 0; i < Object.keys(param1).length; i++) {
      const key = Object.keys(param1)[i];
      if (
        param1[key] &&
        typeof param1[key] !== 'number' &&
        (param1[key].constructor === Array || param1[key].constructor === Object)
      ) {
        if (!isDeepEqual(param1[key], param2[key])) return false;
      } else if (param1[key] !== param2[key]) return false;
    }
  } else if (param1.constructor === String || param1.constructor === Number) {
    return param1 === param2;
  }
  return true;
}

export function hasRepeat(list: any[]) {
  return list.find((x, i, self) => i !== self.findIndex(y => JSON.stringify(x) === JSON.stringify(y)));
}

export function combineSchema(propsSchema = {}, uiSchema = {}) {
  const propList = getChildren(propsSchema);
  const newList = propList.map(p => {
    const { name } = p;
    const { type, enum: options, properties, items } = p.schema;
    const isObj = type === 'object' && properties;
    const isArr = type === 'array' && items && !options; // enum + array 代表的多选框，没有sub
    const ui = name && uiSchema[p.name];
    if (!ui) {
      return p;
    }
    // 如果是list，递归合并items
    if (isArr) {
      const newItems = combineSchema(items, ui.items || {});
      return { ...p, schema: { ...p.schema, ...ui, items: newItems } };
    }
    // object递归合并整个schema
    if (isObj) {
      const newSchema = combineSchema(p.schema, ui);
      return { ...p, schema: newSchema };
    }
    return { ...p, schema: { ...p.schema, ...ui } };
  });

  const newObj: Record<string, any> = {};
  newList.forEach(s => {
    newObj[s.name] = s.schema;
  });

  const topLevelUi = {};
  Object.keys(uiSchema).forEach(key => {
    if (typeof key === 'string' && key.substring(0, 3) === 'ui:') {
      topLevelUi[key] = uiSchema[key];
    }
  });
  if (isEmpty(newObj)) {
    return { ...propsSchema, ...topLevelUi };
  }
  return { ...propsSchema, ...topLevelUi, properties: newObj };
}

// export function isEmpty(obj) {
//   return Object.keys(obj).length === 0;
// }

function getChildren(schema: Record<string, any>) {
  if (!schema) return [];
  const {
    // object
    properties,
    // array
    items,
    type,
  } = schema;
  if (!properties && !items) {
    return [];
  }
  let schemaSubs = {};
  if (type === 'object') {
    schemaSubs = properties;
  }
  if (type === 'array') {
    schemaSubs = items;
  }
  return Object.keys(schemaSubs).map(name => ({
    schema: schemaSubs[name],
    name,
  }));
}

export const parseString = (string: string) => Function('"use strict";return (' + string + ')')();

export const evaluateString = (string: string, formData: Record<string, any>, rootValue: Record<string, any>) =>
  Function(`"use strict";
    const rootValue = ${JSON.stringify(rootValue)};
    const formData = ${JSON.stringify(formData)};
    return (${string})`)();

export function isExpression(func: any) {
  if (typeof func !== 'string') return false;
  const pattern = /^{{(.+)}}$/;
  const reg1 = /^{{function\(.+}}$/;
  // const reg2 = /^{{(.+=>.+)}}$/;
  if (typeof func === 'string' && func.match(pattern) && !func.match(reg1)) {
    return true;
  }
  return false;
}

export const parseRootValueInSchema = (schema: any, rootValue: any) => {
  const result = clone(schema);
  if (isObject(schema)) {
    Object.keys(schema).forEach(key => {
      const item = schema[key];
      if (isObject(item)) {
        result[key] = parseRootValueInSchema(item, rootValue);
      } else if (typeof item === 'string') {
        result[key] = parseSingleRootValue(item, rootValue);
      }
    });
  } else {
    console.error('schema is not an object', schema);
  }
  return result;
};

// handle rootValue inside List
export const parseSingleRootValue = (expression: string, rootValue = {}) => {
  if (typeof expression === 'string' && expression.indexOf('rootValue') > 0) {
    const funcBody = expression.substring(2, expression.length - 2);
    const str = `
    return ${funcBody.replace(/rootValue/g, JSON.stringify(rootValue))}`;

    try {
      return Function(str)();
    } catch (error) {
      console.error(error, 'expression:', expression, 'rootValue:', rootValue);
      return null; // 如果计算有错误，return null 最合适
    }
  } else {
    return expression;
  }
};

export function parseSingleExpression(func: any, formData = {}, dataPath: string) {
  const parentPath = getParentPath(dataPath);
  const parent = getValueByPath(formData, parentPath) || {};
  if (typeof func === 'string') {
    const funcBody = func.substring(2, func.length - 2);
    const str = `
    return ${funcBody.replace(/formData/g, JSON.stringify(formData)).replace(/rootValue/g, JSON.stringify(parent))}`;

    try {
      return Function(str)();
    } catch (error) {
      console.log(error, func, dataPath);
      return null;
    }
  } else return func;
}

export const schemaContainsExpression = (schema: Record<string, any>): boolean => {
  if (isObject(schema)) {
    return Object.keys(schema).some(key => {
      const value = schema[key];
      if (typeof value === 'string') {
        return isExpression(value);
      } else if (isObject(value)) {
        return schemaContainsExpression(value);
      } else {
        return false;
      }
    });
  }
  return false;
};

export const parseAllExpression = (_schema: any, formData: {} | undefined, dataPath: string) => {
  const schema = clone(_schema);
  Object.keys(schema).forEach(key => {
    const value = schema[key];
    if (isObject(value)) {
      schema[key] = parseAllExpression(value, formData, dataPath);
    } else if (isExpression(value)) {
      schema[key] = parseSingleExpression(value, formData, dataPath);
    } else if (typeof key === 'string' && key.toLowerCase().indexOf('props') > -1) {
      // 有可能叫 xxxProps
      const propsObj = schema[key];
      if (isObject(propsObj)) {
        Object.keys(propsObj).forEach(k => {
          schema[key][k] = parseSingleExpression(propsObj[k], formData, dataPath);
        });
      }
    }
  });
  return schema;
};

export const getParentProps = (propName: string, id: string, flatten: Flatten): any => {
  try {
    const item = flatten[id];
    if (item.schema[propName] !== undefined) return item.schema[propName];
    if (item && item.parent) {
      const parentSchema = flatten[item.parent].schema;
      if (parentSchema[propName] !== undefined) {
        return parentSchema[propName];
      } else {
        return getParentProps(propName, item.parent, flatten);
      }
    }
  } catch (error) {
    return undefined;
  }
};

export const getSaveNumber = () => {
  const searchStr = localStorage.getItem('SAVES');
  if (searchStr) {
    try {
      const saves = JSON.parse(searchStr);
      const length = saves.length;
      if (length) return length + 1;
    } catch (error) {
      return 1;
    }
  } else {
    return 1;
  }
};

export function looseJsonParse(obj: string) {
  return Function('"use strict";return (' + obj + ')')();
}

export const isFunctionString = (fString: string) => {
  return fString.indexOf('function(') === 0;
};

export function parseFunction(fString: string) {
  if (isFunctionString(fString)) {
    return Function('return ' + fString)();
  }
  return fString;
}

export const getEnum = (schema?: Schema) => {
  if (!schema) return undefined;
  const itemEnum = schema && schema.items && schema.items.enum;
  const schemaEnum = schema && schema.enum;
  return itemEnum ? itemEnum : schemaEnum;
};

export const isEmail = (value: string) => {
  const regex = '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$';
  if (value && new RegExp(regex).test(value)) {
    return true;
  }
  return false;
};

export function defaultGetValueFromEvent(valuePropName: string, ...args: any[]): any {
  const event = args[0];
  if (event && event.target && valuePropName in event.target) {
    return event.target[valuePropName];
  }
  return event;
}

export const getKeyFromPath = (path = '#') => {
  try {
    const arr = path.split('.');
    const last = arr.slice(-1)[0];
    const result = last.replace('[]', '');
    return result;
  } catch (error) {
    console.error(error, 'getKeyFromPath');
    return '';
  }
};

// 更多的值获取
export const getDisplayValue = (value: any, schema: Schema) => {
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  if (isObjType(schema) || isTableType(schema) || isListType(schema)) {
    return '-';
  }
  if (Array.isArray(schema.enum) && Array.isArray(schema.enumNames)) {
    try {
      return schema.enumNames[schema.enum.indexOf(value)];
    } catch (error) {
      return value;
    }
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
};

// 去掉数组里的空元素 {a: [null, {x:1}]} => {a: [{x:1}]}
export const removeEmptyItemFromList = (formData: Record<string, any>) => {
  let result = {};
  if (isObject(formData)) {
    Object.keys(formData).forEach(key => {
      result[key] = removeEmptyItemFromList(formData[key]);
    });
  } else if (Array.isArray(formData)) {
    result = formData.filter(item => {
      if ([false, 0, ''].indexOf(item) > -1) return true;
      if (item && JSON.stringify(item) !== '{}') {
        return true;
      }
      return false;
    });
  } else {
    result = formData;
  }
  return result;
};

export const getDescriptorSimple = (schema: Schema, path: string) => {
  let result: any = {};
  if (isObject(schema)) {
    if (schema.type) {
      switch (schema.type) {
        case 'range':
          result.type = 'array';
          break;
        case 'html':
          result.type = 'string';
          break;
        default:
          result.type = schema.type;
          break;
      }
    }
    ['pattern', 'min', 'max', 'len', 'required'].forEach(key => {
      if (Object.keys(schema).indexOf(key) > -1) {
        result[key] = schema[key];
      }
    });

    switch (schema.format) {
      case 'email':
      case 'url':
        result.type = schema.format;
        break;
      default:
        break;
    }

    const handleRegx = (desc: Record<string, any>) => {
      if (desc.pattern && typeof desc.pattern === 'string') {
        desc.pattern = new RegExp(desc.pattern);
      }
      return desc;
    };
    // result be array
    if (schema.rules) {
      if (Array.isArray(schema.rules)) {
        const requiredRule = schema.rules.find(rule => rule.required === true);
        if (requiredRule) {
          result = { ...result, ...requiredRule };
        }
        result = [result, ...schema.rules];
        result = result.map((r: Record<string, any>) => handleRegx(r));
      } else if (isObject(schema.rules)) {
        result = [result, schema.rules];
        result = result.map((r: Record<string, any>) => handleRegx(r));
      }
    } else {
      result = [result];
    }
  }
  return { [path]: result };
};

// _path 只供内部递归使用
export const generateDataSkeleton = (schema: Record<string, any>, formData?: any) => {
  let _formData = clone(formData);
  let result = _formData;
  if (isObjType(schema) || isTableType(schema)) {
    if (_formData === undefined || typeof _formData !== 'object') {
      _formData = {};
      result = {};
    }
    Object.keys(schema.properties).forEach(key => {
      const childSchema = schema.properties[key];
      if (isLayout(childSchema)) {
        if (isLayoutType(childSchema)) {
          const childResult = generateDataSkeleton(childSchema, _formData);
          Object.assign(result, childResult);
        }
        return;
      }
      const childData = _formData[key];
      const childResult = generateDataSkeleton(childSchema, childData);
      result[key] = childResult;
    });
  } else if (isLayout(schema)) {
    if (schema.properties) {
      let layoutData = {};
      Object.keys(schema.properties).forEach(key => {
        const layoutSchema = schema.properties[key];
        layoutData[key] = generateDataSkeleton(layoutSchema, _formData ? _formData[key] : undefined);
      });
      result = layoutData;
    }
  } else if (_formData !== undefined) {
    // result = _formData;
  } else if (schema.default !== undefined) {
    result = clone(schema.default);
  } else if (isListType(schema)) {
    result = [generateDataSkeleton(schema.items)];
  } else if (schema.type === 'boolean' && !schema.widget) {
    result = undefined;
  } else {
    result = undefined;
  }
  return result;
};

export const translateMessage = (msg: string, schema: Schema): string => {
  if (!schema) return msg;
  msg = msg.replace('${title}', schema.title || '');
  msg = msg.replace('${type}', schema.format || schema.type || '');
  if (typeof schema.min === 'number') {
    msg = msg.replace('${min}', schema.min.toString());
  }
  if (typeof schema.max === 'number') {
    msg = msg.replace('${max}', schema.max.toString());
  }
  if (schema.rules && Array.isArray(schema.rules)) {
    const minRule = schema.rules.find(r => r.min !== undefined);
    if (minRule && typeof minRule.min === 'number') {
      msg = msg.replace('${min}', minRule.min.toString());
    }
    const maxRule = schema.rules.find(r => r.max !== undefined);
    if (maxRule && typeof maxRule.max === 'number') {
      msg = msg.replace('${max}', maxRule.max.toString());
    }
    const lenRule = schema.rules.find(r => r.len !== undefined);
    if (lenRule && typeof lenRule.len === 'number') {
      msg = msg.replace('${len}', lenRule.len.toString());
    }
    const patternRule = schema.rules.find(r => r.pattern !== undefined);
    if (patternRule) {
      msg = msg.replace('${pattern}', (patternRule.pattern || '').toString());
    }
  }
  return msg;
};

// 检验一个string是 function（传统活箭头函数）
export const parseFunctionString = (string: string) => {
  const reg1 = /^{{(function.+)}}$/;
  const reg2 = /^{{(.+=>.+)}}$/;
  const match1 = string.match(reg1);
  if (match1) {
    return match1[1];
  }
  const match2 = string.match(reg2);
  if (match2) {
    return match2[1];
  }
  return false;
};

export const completeSchemaWithTheme = (schema: Record<string, any>, theme: Record<string, any>) => {
  let result = {};
  if (isObject(schema)) {
    if (schema.theme && theme[schema.theme]) {
      result = { ...schema, ...theme[schema.theme] };
    }
    Object.keys(schema).forEach(key => {
      result[key] = completeSchemaWithTheme(schema[key], theme);
    });
  } else {
    result = schema;
  }
  return result;
};

export const cleanEmpty = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v: any) => (v && isObject(v) ? cleanEmpty(v) : v)).filter(v => !(v == undefined));
  } else if (isObject(obj)) {
    return Object.entries(obj)
      .map(([k, v]) => [k, v && isObject(v) ? cleanEmpty(v) : v])
      .reduce((a, [k, v]) => (v == undefined ? a : ((a[k] = v), a)), {});
  } else {
    return obj;
  }
};

// const x = { a: 1, b: { c: 2 }, d: [{ e: 3, f: [{ g: 5 }] }, { e: 4 }] };
// ['a', 'b.c', 'd[0].e', 'd[0].f[0].g', 'd[1].e']

export const dataToKeys = (data: Record<string, any>, rootKey = '') => {
  let result: any[] = [];
  if (rootKey && rootKey.slice(-1) !== ']') {
    result.push(rootKey);
  }

  const isComplex = (data: any) => isObject(data) || Array.isArray(data);
  if (isObject(data)) {
    Object.keys(data).forEach(key => {
      const item = data[key];
      const itemRootKey = rootKey ? rootKey + '.' + key : key;
      if (isComplex(item)) {
        const itemKeys = dataToKeys(item, itemRootKey);
        result = [...result, ...itemKeys];
      } else {
        result.push(itemRootKey);
      }
    });
  } else if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      const itemRootKey = rootKey ? `${rootKey}[${idx}]` : `[${idx}]`;
      if (isComplex(item)) {
        const itemKeys = dataToKeys(item, itemRootKey);
        result = [...result, ...itemKeys];
      } else {
        result.push(itemRootKey);
      }
    });
  }
  return result;
};

export const removeHiddenFromResult = (data: Record<string, any>, flatten: Flatten) => {
  let result = clone(data);

  const keys = dataToKeys(result);

  keys.forEach(key => {
    const { id } = destructDataPath(key);
    if (flatten[id]) {
      let { hidden } = flatten[id].schema || {};
      if (isExpression(hidden)) {
        hidden = parseSingleExpression(hidden, result, key);
      }
      if (get(result, key) !== undefined && hidden) {
        set(result, key, undefined);
      }
    }
  });
  return result;
};

export const getHiddenData = (data: Record<string, any>, flatten: Flatten) => {
  let result = clone(data);
  let hiddenData: Record<string, any> = {};

  const keys = dataToKeys(result);

  keys.forEach(key => {
    const { id } = destructDataPath(key);
    if (flatten[id]) {
      let { hidden } = flatten[id].schema || {};
      if (isExpression(hidden)) {
        hidden = parseSingleExpression(hidden, result, key);
      }
      if (hidden) {
        hiddenData[key] = result[key];
      }
    }
  });
  return hiddenData;
};

export function msToTime(duration: number) {
  let seconds: number | string = Math.floor((duration / 1000) % 60);
  let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60);
  let hours: number | string = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return hours + ':' + minutes + ':' + seconds;
}

export function yymmdd(timeStamp: number | string) {
  const date_ob = new Date(Number(timeStamp));
  const adjustZero = (num: number) => ('0' + num).slice(-2);
  let day = adjustZero(date_ob.getDate());
  let month = adjustZero(date_ob.getMonth());
  let year = date_ob.getFullYear();
  let hours = adjustZero(date_ob.getHours());
  let minutes = adjustZero(date_ob.getMinutes());
  let seconds = adjustZero(date_ob.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function allPromiseFinish(promiseList: any[]) {
  let hasError = false;
  let count = promiseList.length;
  const results: any[] = [];

  if (!promiseList.length) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    promiseList.forEach((promise, index) => {
      promise
        .catch((e: any) => {
          hasError = true;
          return e;
        })
        .then((result: any) => {
          count -= 1;
          results[index] = result;

          if (count > 0) {
            return;
          }

          if (hasError) {
            reject(results);
          }
          resolve(results);
        });
    });
  });
}

export const removeDups = (arr: any[]) => {
  const array = [];
  for (let i = 0; i < arr.length; i++) {
    if (array.indexOf(arr[i]) === -1) {
      array.push(arr[i]);
    }
  }
  return array;
};

export const transformProps = (props: Record<string, any>) => {
  const { onChange, value, defaultValue, schema: ownSchema, readOnly, ...rest } = props;
  const schema = { ...ownSchema };
  const { trigger, valuePropName } = schema || {};
  const controlProps: { [key: string]: any } = {};
  let _valuePropName = 'value';
  const _value = value === undefined ? defaultValue : value;
  if (valuePropName && typeof valuePropName === 'string') {
    _valuePropName = valuePropName;
    controlProps[valuePropName] = _value;
  } else {
    controlProps.value = _value;
  }
  const _onChange = (...args: any[]) => {
    const newValue = defaultGetValueFromEvent(_valuePropName, ...args);
    onChange(newValue);
  };
  if (trigger && typeof trigger === 'string') {
    controlProps.onChange = _onChange;
    controlProps[trigger] = _onChange;
  } else {
    controlProps.onChange = _onChange;
  }

  const usefulPropsFromSchema = {
    disabled: schema.disabled,
    readOnly: schema.readOnly || readOnly,
    hidden: schema.hidden,
  };

  const _props = {
    ...controlProps,
    schema,
    ...usefulPropsFromSchema,
    ...rest,
  };

  return _props;
};
