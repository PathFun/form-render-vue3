import { removeEmptyItemFromList, cleanEmpty, removeHiddenFromResult, isObject, clone } from './_util';
import { unset, get, set } from 'lodash-es';
import { Error } from './FRType';
// 提交前需要先处理formData的逻辑
export const processData = (data: Record<string, any>, flatten: Record<string, any>, removeHiddenData: boolean) => {
  // 1. 去掉 hidden = true 的元素
  let _data = clone(data);
  if (removeHiddenData) {
    _data = removeHiddenFromResult(data, flatten);
  }
  // 2. bind 的处理
  _data = transformDataWithBind(_data, flatten);

  // 3. 去掉list里面所有的空值
  _data = removeEmptyItemFromList(_data);

  // 4. 去掉所有的 undefined
  _data = cleanEmpty(_data);

  return _data as { data: any; errors: Error[] };
};

export const transformDataWithBind = (data: Record<string, any>, flatten: Record<string, any>) => {
  let _data = data;
  const unbindKeys: any[] = [];
  const bindKeys: any[] = [];
  const bindArrKeys: any[] = [];

  const isMultiBind = (bind: any) => Array.isArray(bind) && bind.every(item => typeof item === 'string');

  Object.keys(flatten).forEach(key => {
    const bind = flatten[key] && flatten[key].schema && flatten[key].schema.bind;
    const _key = key.replace('[]', '');
    if (bind === false) {
      unbindKeys.push(_key);
    } else if (typeof bind === 'string') {
      bindKeys.push({ key: _key, bind });
    } else if (isMultiBind(bind)) {
      bindArrKeys.push({ key: _key, bind });
    }
  });

  const handleBindData = (formData: Record<string, any>) => {
    unbindKeys.forEach(key => {
      unset(formData, key); // TODO: maybe removing upper structure
    });
    bindKeys.forEach(item => {
      const { key, bind } = item;
      let temp = get(formData, key);
      const oldVal = get(formData, bind);
      if (isObject(oldVal)) {
        temp = { ...oldVal, ...temp };
      }
      set(formData, bind, temp);
      unset(formData, key);
    });
    bindArrKeys.forEach(item => {
      const { key, bind } = item;
      const temp = get(formData, key);
      unset(formData, key);
      if (Array.isArray(temp)) {
        temp.forEach((t, i) => {
          if (bind[i]) {
            set(formData, bind[i], t);
          }
        });
      }
    });
  };
  handleBindData(_data);
  return _data;
};

export const transformDataWithBind2 = (data: Record<string, any>, flatten: Record<string, any>) => {
  let _data = clone(data);

  const bindKeys: any[] = [];
  const bindArrKeys: any[] = [];

  const isMultiBind = (bind: any) => Array.isArray(bind) && bind.every(item => typeof item === 'string');

  Object.keys(flatten).forEach(key => {
    const bind = flatten[key] && flatten[key].schema && flatten[key].schema.bind;
    const _key = key.replace('[]', '');
    if (typeof bind === 'string') {
      bindKeys.push({ key: _key, bind });
    } else if (isMultiBind(bind)) {
      bindArrKeys.push({ key: _key, bind });
    }
  });

  const handleBindData2 = (newData: Record<string, any>) => {
    bindKeys.forEach(item => {
      const { key, bind } = item;
      let temp = get(newData, bind);
      // 如果已经有值了，要和原来的值合并，而不是覆盖
      const oldVal = get(newData, key);
      if (isObject(oldVal)) {
        temp = { ...oldVal, ...temp };
      }
      set(newData, key, temp);
      unset(newData, bind);
    });
    bindArrKeys.forEach(item => {
      const { key, bind } = item;
      const temp: any[] = [];
      bind.forEach((b: any) => {
        const bindValue = get(newData, b);
        if (bindValue !== undefined) {
          temp.push(bindValue);
        }
        unset(newData, b);
      });
      if (temp.length > 0) {
        set(newData, key, temp);
      }
    });
  };
  handleBindData2(_data);
  return _data;
};
