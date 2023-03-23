<script lang="tsx">
import { Suspense, defineComponent } from 'vue';
import { useFormStore, usePropsStore } from '../../hooks';
import { extraSchemaList, getWidgetName } from '../../mapping';
import { isListType, isObject, isObjType, transformProps } from '../../_util';
import { Schema, extendedWidgetProps } from '../../FRType';
const ErrorSchema = (schema: Schema) => {
  return (
    <div>
      <div style={{ color: 'red' }}>schema未匹配到展示组件：</div>
      <div>{JSON.stringify(schema)}</div>
    </div>
  );
};
export default defineComponent({
  props: extendedWidgetProps(),
  setup(props, { slots }) {
    const propStore = usePropsStore();
    const formStore = useFormStore();

    return () => {
      const _children = slots.default ? slots.default() : null;
      const { globalProps, mapping = {}, widgets = {}, locale } = propStore.value;
      const {
        setSchemaByPath,
        setValueByPath,
        getSchemaByPath,
        setSchema,
        setValues,
        getValues,
        resetFields,
        setErrorFields,
        removeErrorField,
        validateFields,
        isFieldTouched,
        isFieldsTouched,
        isFieldValidating,
        scrollToPath,
        getFieldError,
        getFieldsError,
        setFields,
      } = formStore;
      const {
        schema,
        onChange,
        value,
        dependValues,
        onItemChange,
        formData,
        getValue,
        readOnly,
        dataPath,
        disabled,
        dataIndex,
        hasError,
      } = props;

      let widgetName = '';
      const customName = schema.widget;
      if (customName && widgets[customName]) {
        widgetName = customName;
      } else {
        widgetName = getWidgetName(schema, mapping);
      }
      const readOnlyName = schema.readOnlyWidget || 'html';
      if (readOnly && !isObjType(schema) && !isListType(schema)) {
        widgetName = readOnlyName;
      }
      if (!widgetName) {
        widgetName = 'input';
        return ErrorSchema(schema);
      }
      const Widget = widgets[widgetName] || widgets['html'];
      const extraSchema = extraSchemaList[widgetName];

      let widgetProps: Record<string, any> = {
        schema: { ...schema, ...extraSchema },
        onChange,
        value,
        locale,
        disabled,
        readOnly,
        class: hasError ? 'fr-item-status-error' : '',
        componentProps: schema.props,
        globalProps: globalProps,
      };

      if (schema.type === 'string' && typeof schema.max === 'number') {
        widgetProps.maxLength = schema.max;
      }

      ['title', 'placeholder', 'disabled', 'format'].forEach(key => {
        if (schema[key]) {
          widgetProps[key] = schema[key];
        }
      });

      if (schema.props) {
        widgetProps = { ...widgetProps, ...schema.props };
      }

      Object.keys(schema).forEach(key => {
        if (typeof key === 'string' && key.toLowerCase().indexOf('props') > -1 && key.length > 5) {
          widgetProps[key] = schema[key];
        }
      });

      // 支持 addonAfter 为自定义组件的情况
      if (isObject(widgetProps.addonAfter) && widgetProps.addonAfter.widget) {
        const AddonAfterWidget = widgets[widgetProps.addonAfter.widget];
        widgetProps.addonAfter = <AddonAfterWidget {...schema} />;
      }

      const hideSelf = (hidden = true) => {
        setSchemaByPath(schema._id, { hidden });
      };

      // 避免传组件不接受的props，按情况传多余的props
      widgetProps.addons = {
        dependValues,
        onItemChange,
        getValue,
        formData,
        dataPath,
        dataIndex,
        setValueByPath,
        setValue: setValueByPath,
        getSchemaByPath,
        setSchemaByPath,
        setSchema,
        setValues,
        getValues,
        resetFields,
        setErrorFields,
        removeErrorField,
        validateFields,
        isFieldTouched,
        isFieldsTouched,
        isFieldValidating,
        scrollToPath,
        getFieldError,
        getFieldsError,
        setFields,
        hideSelf,
      };

      const finalProps = transformProps(widgetProps);
      const suspenseSlots = {
        default: () => (
          <div class="fr-item-wrapper">
            <Widget {...finalProps}>{_children}</Widget>
          </div>
        ),
        fallback: () => <div></div>,
      };
      return <Suspense v-slots={suspenseSlots} />;
    };
  },
});
</script>
