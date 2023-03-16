<script lang="tsx">
import { defineComponent } from 'vue';
import { usePropsStore, useFormStore } from '../../hooks';
import { getValueByPath, isCheckBoxType, isObjType, isBlockType } from '../../_util';
import { renderFieldProps, Error } from '../../FRType';
import { debounce } from 'lodash-es';
import { validateField } from '../../validator';
import ErrorMessage from './ErrorMessage.vue';
import ExtendedWidget from './ExtendedWidget.vue';
import Extra from './Extra';
import FieldTitle from './Title.vue';

export default defineComponent({
  name: 'RenderField',
  props: renderFieldProps(),
  setup(props, { slots }) {
    const form = useFormStore();
    const useProps = usePropsStore();

    const debouncedSetEditing = debounce(function () {
      form.setEditing(false);
    }, 350);

    const removeDupErrors = (arr?: Error[]) => {
      if (!Array.isArray(arr)) {
        console.log('in removeDups: param is not an array');
        return;
      }
      var array: Error[] = [];
      for (var i = 0; i < arr.length; i++) {
        const sameNameIndex = array.findIndex(item => item.name === arr[i].name);
        if (sameNameIndex > -1) {
          const sameNameItem = array[sameNameIndex];
          const error1 = sameNameItem.error;
          const error2 = arr[i].error;
          array[sameNameIndex] = {
            name: sameNameItem.name,
            error: error1.length > 0 && error2.length > 0 ? error2 : [],
          };
        } else {
          array.push(arr[i]);
        }
      }
      return array.filter(item => Array.isArray(item.error) && item.error.length > 0);
    };

    const onChange = (value: any) => {
      const { onItemChange, setEditing, touchKey, _setErrors, formData, flatten } = form;
      const { locale, debounceInput, validateMessages } = useProps.value;
      const { dataPath } = props;
      // 动过的key，算被touch了, 这里之后要考虑动的来源
      touchKey(dataPath);
      // 开始编辑，节流
      if (debounceInput) {
        setEditing(true);
        debouncedSetEditing();
      }
      if (typeof dataPath === 'string') {
        onItemChange(dataPath, value);
      }
      validateField({
        path: dataPath,
        formData,
        flatten,
        options: {
          locale,
          validateMessages,
        },
        formInstance: {
          setFieldValidating: form.setFieldValidating,
          removeFieldValidating: form.removeFieldValidating,
        },
      }).then(res => {
        _setErrors && _setErrors((errors: Error[]) => removeDupErrors([...errors, ...(res as Error[])]));
      });
    };

    const _getValue = (path: string) => {
      return getValueByPath(form.formData, path);
    };

    return () => {
      const { onItemChange, showValidate, formData } = form;
      const { readOnly, disabled, renderTitle, requiredMark } = useProps.value;
      const _children = slots.default ? slots.default() : null;
      const {
        dataIndex,
        dataPath,
        _value,
        dependValues,
        _schema,
        labelClass,
        labelStyle,
        contentClass: _contentClass,
        errorFields = [],
        hideTitle,
        displayType,
      } = props;
      const errObj = errorFields.find((err: Error) => err.name === dataPath);
      const errorMessage = errObj && errObj.error; // 是一个list
      const hasError = Array.isArray(errorMessage) && errorMessage.length > 0;

      const contentClass = hasError && showValidate ? _contentClass + ' ant-form-item-has-error' : _contentClass;
      let contentStyle = {};

      const _readOnly = readOnly !== undefined ? readOnly : _schema.readOnly;
      const _disabled = disabled !== undefined ? disabled : _schema.disabled;

      const titleProps = {
        labelClass,
        labelStyle: labelStyle,
        schema: _schema,
        displayType,
        renderTitle,
        requiredMark,
      };
      const messageProps = {
        message: errorMessage,
        schema: _schema,
        displayType,
        softHidden: displayType === 'inline', // 这个是如果没有校验信息时，展示与否
        hardHidden: showValidate === false || _readOnly === true, // 这个是强制的展示与否
      };

      const placeholderTitleProps = {
        class: labelClass,
        style: labelStyle,
      };

      const _showTitle = !hideTitle && typeof _schema.title === 'string';
      // TODO: 这块最好能判断上一层是list1，
      if (hideTitle && _schema.title) {
        _schema.placeholder = _schema.placeholder || _schema.title;
      }

      const widgetProps = {
        schema: _schema,
        readOnly: _readOnly,
        disabled: _disabled,
        onChange,
        getValue: _getValue,
        formData,
        value: _value,
        dependValues,
        onItemChange,
        dataIndex,
        dataPath,
        hasError,
      };

      const displayBlock = () => !(hasError && !_schema.extra);

      if (isCheckBoxType(_schema, _readOnly)) {
        return (
          <>
            {_showTitle && <div {...placeholderTitleProps} />}
            <div class={contentClass} style={contentStyle}>
              <ExtendedWidget {...widgetProps}>{_children}</ExtendedWidget>
              <ErrorMessage {...messageProps} />
              <Extra {...widgetProps}>{_children}</Extra>
              {displayBlock() && <div class="field-block"></div>}
            </div>
          </>
        );
      }

      let titleElement = <FieldTitle {...titleProps} />;

      if (isObjType(_schema)) {
        titleElement = (
          <div style={{ display: 'flex' }}>
            {titleElement}
            <ErrorMessage {...messageProps} />
            {displayBlock() && <div class="field-block"></div>}
          </div>
        );
        return (
          <div class={contentClass} style={contentStyle}>
            <ExtendedWidget {...widgetProps}>{_children}</ExtendedWidget>
            <Extra {...widgetProps}>{_children}</Extra>
          </div>
        );
      } else if (isBlockType(_schema)) {
        return (
          <div>
            <ExtendedWidget {...widgetProps}>{_children}</ExtendedWidget>
          </div>
        );
      }

      return (
        <>
          {_showTitle && titleElement}
          <div class={`${contentClass} ${hideTitle ? 'fr-content-no-title' : ''}`} style={contentStyle}>
            <ExtendedWidget {...widgetProps}>{_children}</ExtendedWidget>
            <ErrorMessage {...messageProps} />
            <Extra {...widgetProps}>{_children}</Extra>
            {displayBlock() && <div class="field-block"></div>}
          </div>
        </>
      );
    };
  },
});
</script>
