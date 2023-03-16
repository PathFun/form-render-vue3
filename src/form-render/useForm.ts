import { set, sortedUniqBy, get, isEmpty, isFunction } from 'lodash-es';
import { processData, transformDataWithBind2 } from './processData';
import { FormParams, FormInstance, ResetParams, FieldParams, Error, Schema, BeforeFinish, Flatten } from './FRType';
import SmoothScroll from 'smooth-scroll';
import {
  clone,
  flattenSchema,
  generateDataSkeleton,
  parseAllExpression,
  schemaContainsExpression,
  getHiddenData,
} from './_util';
import { validateAll } from './validator';
import { reactive, watch, ref, nextTick } from 'vue';

interface SyncStuff {
  schema: Schema;
  locale: 'cn' | 'en';
  validateMessages: Record<string, string>;
  beforeFinish: BeforeFinish;
  removeHiddenData: boolean;
}

interface RowState {
  locale: 'cn' | 'en';
  renderCount: number;
  beforeFinish: BeforeFinish;
  validateMessages: Record<string, string>;
  removeHiddenData: boolean;
  validatingFields: string[];
}

type SetErrorsParam = Error[] | ((error: Error[]) => Error[]);

function useForm(
  props: FormParams = {
    initialValue: ref({}),
  }
): FormInstance {
  const logOnMount = props.logOnMount || (window.FR_LOGGER && window.FR_LOGGER.logOnMount);
  const logOnSubmit = props.logOnSubmit || (window.FR_LOGGER && window.FR_LOGGER.logOnSubmit);

  const flattenRef = ref<Flatten>({});
  const _outErrorFields = ref<Error[]>([]);
  const _errorFields = ref<Error[]>([]);

  // All form methods are down here ----------------------------------------------------------------
  const _setData = (data: Record<string, any>) => {
    setState({ formData: data });
    Object.assign(props.initialValue, data);
    if (typeof props.onChange === 'function') {
      props.onChange(data);
    }
  };

  // Allow function to get the old value
  const _setErrors = (errors: SetErrorsParam) => {
    if (typeof props.onValidate === 'function') {
      const oldFormatErrors = typeof errors !== 'function' ? errors.map(item => item.name) : [];
      props.onValidate(oldFormatErrors);
    }
    _errorFields.value = typeof errors === 'function' ? errors(_errorFields.value) : errors;
  };

  const setFirstMount = (value: boolean) => {
    setState({ firstMount: value });
  };

  const touchKey = (key: string) => {
    if (state.touchedKeys.indexOf(key) > -1) {
      return;
    }
    const newKeyList = [...state.touchedKeys, key];
    setState({ touchedKeys: newKeyList });
  };

  const removeTouched = (key: string) => {
    let newTouch = state.touchedKeys.filter(item => item.indexOf(key) === -1);
    setState({ touchedKeys: newTouch });
  };

  const changeTouchedKeys = (newTouchedKeys: string[]) => {
    setState({ touchedKeys: newTouchedKeys });
  };

  const setEditing = (isEditing: boolean) => {
    setState({ isEditing });
  };

  const onItemChange = (path: string, value: any) => {
    if (path === '#') {
      _setData({ ...value });
      return;
    }
    set(state.formData, path, value);
    _setData({ ...state.formData });
  };

  const syncStuff = ({ schema, locale, validateMessages, beforeFinish, removeHiddenData }: SyncStuff) => {
    setState({ schema });
    setRowState({
      locale,
      validateMessages,
      beforeFinish,
      removeHiddenData,
      renderCount: rowState.renderCount || 0 + 1,
    });
  };

  const setSchema = (settings: Record<string, any>) => {
    const newFlatten = clone(flattenRef.value);
    try {
      Object.keys(settings).forEach(path => {
        if (!flattenRef.value[path]) {
          console.error(`path：'${path}' 不存在(form.setSchemaByPath)`);
        } else {
          const newSchema = settings[path];
          const _newSchema = typeof newSchema === 'function' ? newSchema(newFlatten[path].schema) : newSchema;
          newFlatten[path].schema = {
            ...newFlatten[path].schema,
            ..._newSchema,
          };
        }
      });
      flattenRef.value = newFlatten;
    } catch (error) {
      console.error(error, 'setSchema');
    }
  };

  const setSchemaByPath = (path: string, newSchema: Schema | ((schema: Schema) => Schema)) => {
    if (!flattenRef.value[path]) {
      console.error(`path：'${path}' 不存在(form.setSchemaByPath)`);
      return;
    }
    const newFlatten = clone(flattenRef.value);

    try {
      const _newSchema = typeof newSchema === 'function' ? newSchema(newFlatten[path].schema) : newSchema;
      newFlatten[path].schema = { ...newFlatten[path].schema, ..._newSchema };
      flattenRef.value = newFlatten;
    } catch (error) {
      console.error(error, 'setSchemaByPath');
    }
  };

  const getSchemaByPath = (path: string) => {
    try {
      return flattenRef.value[path].schema;
    } catch (error) {
      console.log(error, 'getSchemaByPath');
      return {};
    }
  };

  // TODO: better implementation needed
  const setErrorFields = (error: Error | Error[]) => {
    let newErrorFields: Error[] = [];
    if (Array.isArray(error)) {
      newErrorFields = [...error, ..._outErrorFields.value];
    } else if (error && error.name) {
      newErrorFields = [error, ..._outErrorFields.value];
    } else {
      console.log('error format is wrong');
    }
    newErrorFields = sortedUniqBy(newErrorFields, item => item.name);
    _outErrorFields.value = newErrorFields;
  };

  const removeErrorField = (path: string) => {
    _outErrorFields.value = _errorFields.value.filter(item => {
      return item.name.indexOf(path) === -1;
    });

    _outErrorFields.value = _outErrorFields.value.filter(item => {
      return item.name.indexOf(path) === -1;
    });
  };

  /**
   * (nameList?: NamePath[], filterFunc?: (meta: { touched: boolean, validating: boolean }) => boolean) => any
   * 参考rc-field-form中的getFieldsValue
   * 如果第一个参数为数组类型,则获取nameList数据并且做filterFunc过滤
   * 如果第一个参数非数组类型,则获取所有数据并做filterFunc过滤
   *
   * @returns
   */
  const getValues = (
    nameList: string[] | true,
    filterFunc?: (meta: { touched: boolean; validating: boolean }) => boolean
  ) => {
    const { formData, flatten } = state;
    let _flatten = flatten;
    let data = formData;
    let currentData = {};
    let filterMetaKeys = []; // 当前符合filter条件的key

    if (Array.isArray(nameList)) {
      nameList.forEach(path => {
        set(currentData, path, get(data, path));
      });
    } else {
      currentData = data;
    }
    // 过滤出满足条件的path
    if (filterFunc && isFunction(filterFunc)) {
      if (Array.isArray(nameList)) {
        nameList.forEach(path => {
          _flatten[path] = get(flatten, path);
        });
      }
      _flatten = {};
      let metas: Record<string, any> = {};
      Object.keys(_flatten).forEach(key => {
        metas[key] = {
          touched: isFieldTouched(key),
          validating: isFieldValidating(key),
        };
      });
      filterMetaKeys = Object.keys(metas).filter(k => filterFunc(metas[k]));
      //  没有filter满足条件的就返回{}
      currentData = {};

      if (!isEmpty(filterMetaKeys)) {
        filterMetaKeys.forEach(key => {
          set(currentData, key, get(data, key));
        });
      }
    }

    return processData(currentData, flatten, rowState.removeHiddenData);
  };

  const setValues = (newFormData: Record<string, any>) => {
    const newData = transformDataWithBind2(newFormData, flattenRef.value);
    nextTick(function () {
      _setData(newData);
    });
  };

  const submit = () => {
    setState({ isValidating: true, allTouched: true, isSubmitting: false });
    const { locale, validateMessages, removeHiddenData, beforeFinish } = rowState;
    const { flatten, formData } = state;
    //  https://formik.org/docs/guides/form-submission
    return validateAll({
      formData: formData,
      flatten: flatten,
      options: {
        locale: locale,
        validateMessages,
      },
      formInstance: {
        setFieldValidating,
        removeFieldValidating,
      },
    })
      .then(errors => {
        if (!errors) return;
        setState({ errorFields: errors });
        const _errors = sortedUniqBy([...(errors || []), ..._outErrorFields.value], item => item.name);

        if (typeof beforeFinish === 'function') {
          return Promise.resolve(processData(formData, flatten, removeHiddenData)).then(res => {
            setState({
              isValidating: true,
              isSubmitting: false,
              outsideValidating: true,
              submitData: res,
            });
            return { data: res, errors: _errors };
          });
        }

        return Promise.resolve(processData(formData, flatten, removeHiddenData)).then(res => {
          setState({
            isValidating: false,
            isSubmitting: true,
            submitData: res,
          });
          return {
            data: res,
            errors: _errors,
          };
        });
      })
      .catch(err => {
        // 不应该走到这边的
        console.log('submit error:', err);
        return err;
      });
  };

  const resetFields = (options?: ResetParams) => {
    setState({
      formData: options?.formData || {},
      submitData: options?.submitData || {},
      errorFields: options?.errorFields || [],
      touchedKeys: options?.touchedKeys || [],
      allTouched: options?.allTouched || false,
    });
  };

  const endValidating = () =>
    setState({
      isValidating: false,
      outsideValidating: false,
      isSubmitting: true,
    });

  const endSubmitting = () =>
    setState({
      isSubmitting: false,
      isValidating: false,
      outsideValidating: false,
    });

  const setFieldValidating = (namePath: string) => {
    const { validatingFields } = rowState;
    if (validatingFields.indexOf(namePath) > -1) {
      return;
    }
    setRowState({ validatingFields: [...validatingFields, namePath] });
  };

  const removeFieldValidating = (namePath: string) => {
    setRowState({
      validatingFields: rowState.validatingFields.filter(item => {
        return item !== namePath;
      }),
    });
  };

  const isFieldValidating = (namePath: string) => {
    return rowState.validatingFields.indexOf(namePath) > -1;
  };
  /**
   * 参考rc-field-form 校验不包含外部设置的error
   * @param {*} nameList
   * @returns
   */
  const validateFields = (nameList?: string[]) => {
    const { flatten, formData } = state;
    let data: Record<string, any> = formData;
    if (Array.isArray(nameList)) {
      data = {};
      nameList.forEach(path => {
        set(data, path, get(formData, path));
      });
    }
    setState({ isValidating: true });
    const { locale, validateMessages, removeHiddenData, beforeFinish } = rowState;
    return validateAll({
      formData: data,
      flatten: flatten,
      options: {
        locale,
        validateMessages,
      },
      formInstance: {
        setFieldValidating,
        removeFieldValidating,
      },
    }).then(errors => {
      if (!errors) return;
      setState({ isValidating: false, errorFields: errors });
      if (!isEmpty(errors)) {
        return Promise.reject({
          errors: errors as Error[],
          data: processData(data, flatten, removeHiddenData),
        });
      } else {
        return Promise.resolve(processData(data, flatten, removeHiddenData));
      }
    }) as Promise<{ data: any; errors: Error[] }>;
  };

  /**
   * (nameList?: NamePath[], allTouched?: boolean) => boolean
   * 参照antd rc-field-form的处理逻辑
   * 如果入参为空，则返回 是否有表单被触碰过
   * 如果参数为一个
   *    当args0 === Array，则返回当前表单list是否 >= 1个表单被触碰过
   *    否则，args0 ? 返回 是否‘所有’表单被触碰过 ：是否有表单被触碰过
   * 如果参数为两个
   *    args1 ? args0中的’所有‘表单都被触碰过： args0中的表单 >= 1个被触碰过
   * @returns
   */
  const isFieldsTouched = (nameList?: string[], allTouched?: boolean) => {
    const argsLen = arguments.length;
    var namePathList = [];
    var isAllFieldsTouched = false;
    const allTouchedKeys = state.touchedKeys;
    if (argsLen === 0) {
      return state.touchedKeys.length > 0;
    } else if (argsLen === 1) {
      if (Array.isArray(nameList)) {
        namePathList = nameList;
      } else {
        return nameList ? state.allTouched : state.touchedKeys.length > 0;
      }
    } else {
      namePathList = Array.isArray(nameList) ? nameList : [];
      isAllFieldsTouched = !!allTouched;
    }
    try {
      const touchedFunc = (key: string) => {
        return allTouchedKeys.indexOf(key) !== -1;
      };
      return isAllFieldsTouched ? namePathList.every(touchedFunc) : namePathList.some(touchedFunc);
    } catch (e) {
      console.error('>>>> isFieldsTouched error, check your input arguments', e);
    }
  };

  const isFieldTouched = (namePath: string) => {
    return state.touchedKeys.indexOf(namePath) > -1;
  };

  const scrollToPath = (namePath: string) => {
    var scroll = new SmoothScroll();
    const node = document.querySelector(`[datapath="${namePath}"]`);
    if (node) {
      scroll.animateScroll(node);
    }
  };

  const getFieldError = (namePath: string) => {
    return (
      state.errorFields.find(error => {
        return error.name === namePath;
      })?.error || []
    );
  };

  const getFieldsError = (nameList?: string[]) => {
    if (!nameList || !Array.isArray(nameList)) {
      return state.errorFields;
    }
    return state.errorFields.filter(error => {
      return nameList.indexOf(error.name) > -1;
    });
  };
  /**
   * fields: {error?, name, touched?, validating?, value?}
   * 参照rc-field-form的实现逻辑
   * @param {*} fields
   * 设置一组字段状态
   */
  const setFields = (fields: FieldParams[]) => {
    // 设置error调用统一的函数，直接设置数组，省去forEach频繁操作
    const errors: Error[] = fields
      .filter(field => field.error)
      .map(field => {
        return {
          name: field.name,
          error: field.error,
        } as Error;
      });
    !isEmpty(errors) && setErrorFields(errors);
    // 对 value, touched, validating进行设置
    fields.forEach(field => {
      const { name, value, touched, validating } = field;
      if ('value' in field) {
        onItemChange(name, value);
      }
      if (typeof touched === 'boolean') {
        touched ? touchKey(name) : removeTouched(name);
      }
      if (typeof validating === 'boolean') {
        validating ? setFieldValidating(name) : removeFieldValidating(name);
      }
    });
  };

  const getHiddenValues = () => {
    return getHiddenData(state.formData, state.flatten);
  };

  const formInstance: FormInstance = {
    formData: props.initialValue || {},
    schema: {},
    flatten: {},
    touchedKeys: [],
    allTouched: false,
    // methods
    touchKey,
    removeTouched,
    changeTouchedKeys,
    onItemChange,
    setValueByPath: onItemChange, // 单个
    getSchemaByPath,
    setSchemaByPath,
    setSchema,
    setValues,
    getValues,
    getHiddenValues,
    resetFields,
    submit,
    init: submit, // 简版的迁移方案里用，正常用不到，换个名字迁移的时候大家更好接受点
    submitData: {},
    errorFields: [],
    isValidating: false,
    outsideValidating: false,
    isSubmitting: false,
    endValidating,
    endSubmitting,
    setErrorFields,
    removeErrorField,
    isEditing: false,
    setEditing,
    syncStuff,
    showValidate: props.showValidate || true,
    validateFields,
    isFieldTouched,
    isFieldsTouched,
    setFieldValidating,
    removeFieldValidating,
    isFieldValidating,
    scrollToPath,
    getFieldError,
    getFieldsError,
    setFields,
    firstMount: true,
    setFirstMount,
    logOnMount,
    logOnSubmit,
    // inner api, DON'T USE
    _setErrors,
  };

  const state = reactive(formInstance);

  const setState = (value: Partial<FormInstance>) => {
    Object.assign(state, value);
  };

  const rowState: RowState = {
    renderCount: 0,
    removeHiddenData: true,
    locale: 'cn',
    beforeFinish: (() => []) as BeforeFinish,
    validateMessages: {},
    validatingFields: [],
  };

  const setRowState = (value: Partial<RowState>) => {
    Object.assign(rowState, value);
  };

  watch(
    () => state.schema,
    newSchema => {
      setState({
        formData: newSchema ? generateDataSkeleton(newSchema, state.formData) : {},
      });
    }
  );

  watch([_errorFields, _outErrorFields], ([errorFields, outErrorFields]) => {
    if (outErrorFields.length) {
      setState({ errorFields: [...errorFields, ...outErrorFields] });
    } else {
      setState({ errorFields });
    }
  });

  watch([() => state.firstMount, () => state.schema], ([curFirstMount, schemaRef]) => {
    if (schemaRef && curFirstMount) {
      const flatten = flattenSchema(schemaRef);
      flattenRef.value = flatten;
      setState({ firstMount: false });
    }
  });

  // 统一的处理expression
  watch([flattenRef, () => state.firstMount], ([flatten, curFirstMount]) => {
    if (curFirstMount) {
      return;
    }
    let newFlatten = clone(flatten);
    Object.entries(flatten).forEach(([path, info]) => {
      if (schemaContainsExpression(info.schema)) {
        const arrayLikeIndex = path.indexOf(']');
        const isArrayItem = arrayLikeIndex > -1 && arrayLikeIndex < path.length - 1;
        const hasRootValue = JSON.stringify(info.schema).indexOf('rootValue') > -1;
        if (isArrayItem && hasRootValue) {
          // do nothing
        } else {
          newFlatten[path].schema = parseAllExpression(info.schema, state.formData, path);
        }
      }
    });
    setState({ flatten: newFlatten });
  });

  return state;
}

export default useForm;
