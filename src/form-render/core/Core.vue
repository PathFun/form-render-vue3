<script lang="tsx">
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import CoreRender from './CoreRender.vue';
import { useFormStore, usePropsStore } from '../hooks';
import { getParentProps, getParentPath, getValueByPath, getDataPath, parseRootValueInSchema, clone } from '../_util';
import { coreProps, FlattenSchema, FlattenValue } from '../FRType';

export default defineComponent({
  name: 'Core',
  components: {
    CoreRender,
  },
  inheritAttrs: false,
  props: coreProps(),
  setup(props) {
    const form = useFormStore();
    const propsStore = usePropsStore();

    let snapShot: any;

    const allTouched = computed<boolean>(() => form.allTouched);

    const newItem = computed<FlattenValue | undefined>(() => (props._item ? props._item : form.flatten[props.id]));

    const schema = ref<FlattenSchema | undefined>();

    watch(
      newItem,
      newValue => {
        if (newValue !== undefined) {
          schema.value = clone(newValue.schema);
        }
      },
      {
        immediate: true,
      }
    );

    const dataPath = computed<string>(() => getDataPath(props.id, props.dataIndex));

    const parentPath = computed<string>(() => getParentPath(dataPath.value));

    const effectiveLabelWidth = computed<string | number>(() => {
      const width = getParentProps('labelWidth', props.id, form.flatten);
      return width ? width : propsStore.value.labelWidth;
    });

    const _value: any = computed(() => getValueByPath(form.formData, dataPath.value));

    const dependValues = ref<any[]>([]);

    let rootValue: any;

    watchEffect(() => {
      if (!schema.value) return;
      const { dependencies } = schema.value;
      try {
        if (Array.isArray(dependencies)) {
          dependValues.value.splice(0);

          dependencies.forEach(d => {
            const itemPath = getDataPath(d, props.dataIndex);
            const result = getValueByPath(form.formData, itemPath);
            dependValues.value.push(result);
          });
        }
      } catch (error) {
        console.error(`dependencies 计算报错，${dependencies}`);
      }

      try {
        rootValue = getValueByPath(form.formData, parentPath.value);
      } catch (error) {
        console.error(`rootValue 计算报错`);
      }
    });

    return () => {
      const { displayType, column, labelWidth, readOnly, labelAlign } = propsStore.value;
      const { errorFields, isEditing } = form;
      const { hideTitle, dataIndex, id, debugCss, hideValidation } = props;
      if (isEditing && snapShot) {
        schema.value = snapShot;
      } else {
        if (schema.value && JSON.stringify(schema.value).indexOf('rootValue') > -1) {
          schema.value = parseRootValueInSchema(schema.value, rootValue) as FlattenSchema;
        }
        snapShot = { ...schema.value };
      }
      return (
        <coreRender
          id={id}
          dataIndex={dataIndex}
          item={newItem.value}
          dataPath={dataPath.value}
          _value={_value.value}
          dependValues={dependValues.value}
          hideTitle={hideTitle}
          hideValidation={hideValidation}
          debug-css={debugCss}
          schema={schema.value}
          displayType={props.displayType || displayType}
          column={column}
          labelWidth={labelWidth}
          readOnly={readOnly}
          errorFields={errorFields}
          effectiveLabelWidth={effectiveLabelWidth.value}
          allTouched={allTouched.value}
          labelAlign={labelAlign}
        />
      );
    };
  },
});
</script>
