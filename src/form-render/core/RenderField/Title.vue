<script lang="tsx">
import { defineComponent } from 'vue';
import { Tooltip } from 'ant-design-vue';
import { usePropsStore } from '../../hooks';
import { isCheckBoxType } from '../../_util';
import { titleProps, DisplayType, FlattenSchema } from '../../FRType';

const Description = ({
  displayType,
  schema,
  widgets,
}: {
  schema: FlattenSchema;
  displayType: DisplayType;
  widgets: Record<string, any>;
}) => {
  const { description, descType, descWidget } = schema;
  if (!description && !descWidget) return null;
  const _description =
    typeof description === 'string' && /(^<|\/>)/.test(description) ? <div innerHTML={description} /> : description;
  const RenderDesc = () => {
    const Widget = schema.descWidget ? widgets[schema.descWidget] : null;
    if (Widget) {
      return <Widget schema={schema} />;
    }
    return null;
  };

  switch (displayType) {
    case 'row':
      if (descType === 'widget') {
        return <RenderDesc />;
      }
      return (
        <Tooltip title={_description}>
          <i class="fr-tooltip-icon" />
        </Tooltip>
      );
    case 'inline':
      return null;
    default:
      if (descType === 'widget') {
        return <RenderDesc />;
      }
      if (descType === 'icon') {
        return (
          <Tooltip title={_description}>
            <i class="fr-tooltip-icon" />
          </Tooltip>
        );
      }

      return <span class="fr-desc ml2">{`( ${description} )`}</span>;
  }
};

const Title = defineComponent({
  props: titleProps(),
  setup(props) {
    const propsStore = usePropsStore();
    return () => {
      const { labelClass, labelStyle, schema, displayType, renderTitle, requiredMark: globalRequiredMark } = props;
      const { displayType: globalDisplayType, readOnly, colon, widgets = {} } = propsStore.value;
      const { title, required, type, requiredMark: schemaRequiredMark } = schema;
      const isObjType = type === 'object';

      let _displayType = schema.displayType || displayType || globalDisplayType || 'column';
      if (renderTitle) {
        return renderTitle({
          labelClass,
          labelStyle,
          schema,
          displayType: _displayType,
          readOnly,
          colon,
        });
      }

      const requiredMark = typeof schemaRequiredMark === 'undefined' ? globalRequiredMark : schemaRequiredMark;

      // 左侧的的 * 号提示
      let TitleRequiredMark = null;
      // 左侧的 option 提示
      let TitleTextMark = null;

      if (required) {
        /**
         * ant-design requiredMark 实现
         * https://ant.design/components/form-cn/
         */
        if (requiredMark !== false && requiredMark !== 'optional') {
          TitleRequiredMark = <span class="fr-label-required"> *</span>;
          TitleTextMark = null;
        }
      } else {
        if (requiredMark === 'optional') {
          TitleRequiredMark = null;
          TitleTextMark = <span class="fr-label-required-text">（可选）</span>;
        }
      }

      // requiredMark 为 false 不展示必填符号
      if (requiredMark === false) {
        TitleRequiredMark = null;
        TitleTextMark = null;
      }

      return (
        <div class={labelClass} style={labelStyle}>
          {title ? (
            <label
              class={`fr-label-title ${
                isCheckBoxType(schema, readOnly) || _displayType === 'column' || !colon ? 'no-colon' : ''
              }`} // checkbox不带冒号
              title={title}
            >
              {TitleRequiredMark}
              <span class={`${isObjType ? 'b' : ''} ${_displayType === 'column' ? 'flex-none' : ''}`}>
                <span innerHTML={title} />
              </span>
              {TitleTextMark}
              {Description({
                schema,
                displayType: _displayType,
                widgets,
              })}
            </label>
          ) : null}
        </div>
      );
    };
  },
});

export default Title;
</script>
