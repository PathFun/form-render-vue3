import Validator from 'async-validator';
import { get, merge } from 'lodash-es';
import {
  allPromiseFinish,
  dataToKeys,
  destructDataPath,
  getDataPath,
  getDescriptorSimple,
  isExpression,
  isObject,
  parseSingleExpression,
  removeDups,
} from './_util';
import { defaultValidateMessages } from './validateMessage';
import { defaultValidateMessagesCN } from './validateMessageCN';
import { Schema, Flatten } from './FRType';

export const parseSchemaExpression = (schema: Schema, formData: Record<string, any>, path: string) => {
  if (!isObject(schema)) return schema;
  const result: Record<string, any> = {};
  Object.keys(schema).forEach(key => {
    const item = schema[key];
    if (isObject(item)) {
      result[key] = parseSchemaExpression(item, formData, path);
    } else if (isExpression(item)) {
      result[key] = parseSingleExpression(item, formData, path);
    } else {
      result[key] = item;
    }
  });
  return result;
};

const getRelatedPaths = (path: string, flatten: Flatten) => {
  const parentPaths = [];
  const pathArr = path.split('.');
  while (pathArr.length > 0) {
    parentPaths.push(pathArr.join('.'));
    pathArr.pop();
  }

  let result: string[] = [...parentPaths];

  parentPaths.forEach(path => {
    const { id, dataIndex } = destructDataPath(path);
    if (flatten[id] && flatten[id].schema) {
      const { dependencies = [] } = flatten[id].schema;
      const fullPathDeps = dependencies.map((dep: string) => getDataPath(dep, dataIndex));
      result = [...result, ...fullPathDeps];
    }
  });
  return removeDups(result).map(path => {
    if (path.slice(-1) === ']') {
      const pattern = /\[[0-9]+\]$/;
      return path.replace(pattern, '');
    } else {
      return path;
    }
  });
};

export const validateField = ({
  path,
  formData,
  flatten,
  options,
  formInstance = {},
}: {
  path: string;
  formData: Record<string, any>;
  flatten: Flatten;
  options: Record<string, any>;
  formInstance?: Record<string, any>;
}) => {
  const paths = getRelatedPaths(path, flatten);
  const promiseArray = paths.map(path => {
    const { id } = destructDataPath(path);
    if (flatten[id] || flatten[`${id}[]`]) {
      const item = flatten[id] || flatten[`${id}[]`];
      const singleData = get(formData, path);
      let schema = item.schema || {};
      const finalSchema = parseSchemaExpression(schema, formData, path);
      return validateSingle(singleData, finalSchema, path, options, formInstance); // is a promise
    } else {
      return Promise.resolve();
    }
  });
  return allPromiseFinish(promiseArray)
    .then(res => {
      if (Array.isArray(res)) {
        const errorFields = res
          .filter(item => Array.isArray(item) && item.length > 0)
          .map(item => {
            const name = item[0].field;
            const error = item.map((m: { message: any }) => m.message).filter((m: any) => !!m);
            return { name, error };
          });
        return errorFields;
      }
    })
    .catch(e => {
      console.log(e);
    });
};

// pathFromData => allPath
const getAllPaths = (paths: any, flatten: Flatten) => {
  if (!Array.isArray(paths)) return [];
  const result = [...paths]
    .filter(p => p.indexOf(']') > -1)
    .map(p1 => {
      const last = p1.lastIndexOf(']');
      return p1.substring(0, last + 1);
    });
  const uniqueResult = removeDups(result);

  const allFlattenPath: string[] = Object.keys(flatten);
  let res = [...paths];
  uniqueResult.forEach((result: string) => {
    const { id, dataIndex } = destructDataPath(result);
    if (flatten[id]) {
      const children = allFlattenPath.filter(f => f.indexOf(id) === 0 && f !== id);
      const childrenWithIndex = children
        .map(child => {
          const p = getDataPath(child, dataIndex);
          return p.split('[]')[0];
        })
        .filter(i => !!i);
      res = [...res, ...removeDups(childrenWithIndex)];
    }
  });
  return removeDups(res);
};

export const validateAll = ({
  formData,
  flatten,
  options, // {locale = 'cn', validateMessages = {}}
  formInstance = {},
}: {
  formData: Record<string, any>;
  flatten: Flatten;
  options: Record<string, any>;
  formInstance: Record<string, any>;
}) => {
  const paths = dataToKeys(formData);
  const allPaths = getAllPaths(paths, flatten);
  const promiseArray = allPaths.map(path => {
    const { id, dataIndex } = destructDataPath(path);
    if (flatten[id] || flatten[`${id}[]`]) {
      const item = flatten[id] || flatten[`${id}[]`];
      const singleData = get(formData, path);
      let schema = item.schema || {};

      // 若parent的hidden属性为true，则子项需继承 hidden
      const relatedPaths = getRelatedPaths(path, flatten);
      if (relatedPaths.length > 1) {
        const parentPath = relatedPaths[relatedPaths.length - 1];
        const parentSchema = flatten[parentPath] || {};
        if (get(parentSchema, 'schema.hidden', false)) {
          schema.hidden = true;
        }
      }

      const finalSchema = parseSchemaExpression(schema, formData, path);
      return validateSingle(singleData, finalSchema, path, options, formInstance); // is a promise
    } else {
      return Promise.resolve();
    }
  });

  return allPromiseFinish(promiseArray)
    .then(res => {
      if (Array.isArray(res)) {
        const errors = res.filter(item => Array.isArray(item) && item.length > 0 && item[0].message !== null) as {
          field: string;
          message: string;
        }[][];
        const errorFields = errors.map(item => {
          const name = item[0].field;
          const error = item.map(m => m.message).filter(m => !!m);
          return { name, error };
        });
        return errorFields;
      }
      return [];
    })
    .catch(e => {
      console.log(e);
    });
};

const validateSingle = (
  data: Record<string, any>,
  schema: Schema,
  path: string,
  options: Record<string, any> = {},
  formInstance?: Record<string, any>
) => {
  // 自定义区块不做rules校验
  if (schema.type === 'block') {
    return Promise.resolve();
  }
  if (schema.hidden) {
    return Promise.resolve();
  }

  const { validateMessages = {}, locale = 'cn' } = options;
  const cn = defaultValidateMessagesCN;
  const en = defaultValidateMessages;
  const descriptor = getDescriptorSimple(schema, path);
  let validator: Validator;
  try {
    validator = new Validator(descriptor);
  } catch (error) {
    return Promise.resolve();
  }
  formInstance?.setFieldValidating(path);
  let messageFeed = locale === 'en' ? en : cn;
  merge(messageFeed, validateMessages);
  validator.messages(messageFeed);
  return validator
    .validate({ [path]: data })
    .then(res => {
      return [{ field: path, message: null }];
    })
    .catch(({ errors }) => {
      return errors;
    })
    .finally(() => {
      formInstance?.removeFieldValidating(path);
    });
};
