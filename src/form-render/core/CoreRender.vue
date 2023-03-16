<script lang="tsx">
import { defineComponent, CSSProperties } from 'vue';
import { coreRenderProps } from '../FRType';
import {
  isCheckBoxType,
  isCssLength,
  isListType,
  isLooselyNumber,
  isObjType,
  isTableType,
  isLayoutType,
  isLayout as isLayoutFn,
} from '../_util';
import RenderList from './RenderChildren/RenderList/index.vue';
import RenderLayoutForm from './RenderChildren/layoutForm/index.vue';
import RenderObject from './RenderChildren/RenderObject/RenderObject.vue';
import RenderTableObject from './RenderChildren/RenderObject/RenderTableObject.vue';
import RenderField from './RenderField/RenderField.vue';
import RenderLayout from './RenderField/RenderLayout.vue';
interface Row {
  merged: boolean;
  colspan?: number;
  rowspan?: number;
  widgets: string[];
}
export default defineComponent({
  name: 'CoreRender',
  props: coreRenderProps(),
  setup(props) {
    return () => {
      const {
        schema,
        displayType,
        labelAlign,
        readOnly,
        effectiveLabelWidth,
        dataIndex,
        item,
        errorFields,
        hideTitle,
        id,
        debugCss,
        dataPath,
        _value,
        dependValues,
        hideValidation,
        column,
      } = props;
      if (schema.hidden) {
        return null;
      }
      // 样式的逻辑全放在这层
      // displayType 一层层网上找值
      const _displayType = schema.displayType || displayType || 'column';
      const _labelAlign = schema.labelAlign || labelAlign || 'right';
      const isList = isListType(schema);
      const isObj = isObjType(schema);
      const isTable = isTableType(schema);
      const isLayoutForm = isLayoutType(schema);
      const isLayout = isLayoutFn(schema);
      const isComplex = isObj || isList;
      const isCheckBox = isCheckBoxType(schema, readOnly);
      const width = schema.width;
      let containerClass = `fr-field ${_displayType === 'inline' ? '' : 'w-100'} flex`;
      let labelClass = `fr-label`;
      let contentClass = `fr-content`;

      if (typeof schema.className === 'string') {
        containerClass += ' ' + schema.className;
      }

      // common classNames dispite row or column
      switch (schema.type) {
        case 'object':
          if (isObj) {
            if (schema.title) {
              labelClass += ' fr-label-object';
            }
            containerClass += ' fr-field-object';
          }
          break;
        case 'array':
          // list 有两种展示形式！
          if (isList) {
            if (schema.title) {
              labelClass += ' fr-label-list';
            }
            containerClass += ' fr-field-column';
          }
          break;
        case 'boolean':
          if (isCheckBox) {
            contentClass += ' fr-content-column'; // checkbox高度短，需要居中对齐
            containerClass += ` flex ${_displayType === 'column' ? 'flex-column' : ''}`;
          }
          break;
        default:
      }
      // column specific className
      if (!isComplex && !isCheckBox) {
        if (_displayType === 'column') {
          containerClass += ' flex-column';
          labelClass += ' fr-label-column';
          contentClass += ' fr-content-column';
          switch (schema.type) {
            case 'object':
              break;
            case 'array':
              if (schema.title && !schema.enum) {
                // labelClass += ' b mb2';
              }
              break;
            case 'boolean':
              break;
            default:
          }
        } else if (_displayType === 'row') {
          // row specific className
          containerClass += '';
          labelClass += ` fr-label-row ${_labelAlign === 'right' ? 'fr-label-align-right' : 'fr-label-align-left'}`;
          contentClass += ' fr-content-row';
          if (!isObj && !isCheckBox) {
            labelClass += ' flex-shrink-0 fr-label-row';
            contentClass += ' flex-grow-1 relative';
          }
        }
      }
      // style part
      let columnStyle: CSSProperties = {};
      if (schema.hidden) {
        columnStyle.display = 'none';
      }

      if (!isObj) {
        if (width) {
          columnStyle.width = width;
          columnStyle.paddingRight = '8px';
        } else if (column > 1) {
          columnStyle.width = `calc(100% /${column})`;
          columnStyle.paddingRight = '8px';
        }
      }

      const _labelWidth = isLooselyNumber(effectiveLabelWidth)
        ? Number(effectiveLabelWidth)
        : isCssLength(effectiveLabelWidth)
        ? effectiveLabelWidth
        : 120; // 默认是 120px 的长度

      let labelStyle: CSSProperties = { width: typeof _labelWidth === 'number' ? `${_labelWidth}px` : _labelWidth };
      if (isComplex || _displayType === 'column') {
        labelStyle = { flexGrow: 1 };
      }

      if (_displayType === 'inline') {
        labelStyle = { marginTop: '5px', paddingLeft: '12px' };
        labelClass = '';
        contentClass += ' fr-content-inline';
        if (containerClass.indexOf('fr-field-object') === -1) {
          containerClass += ' fr-field-inline';
        }
      }

      const hasChildren = item.children && item.children.length > 0;
      const fieldProps = {
        dataIndex,
        dataPath,
        _value,
        dependValues,
        _schema: schema,
        labelClass,
        labelStyle,
        contentClass,
        errorFields,
        // 层级间可使用的字段
        displayType: _displayType,
        hideTitle,
        hideValidation,
      };

      const objChildren = (
        <div class={`flex flex-wrap`}>
          <RenderObject
            dataIndex={dataIndex}
            displayType={_displayType}
            labelAlign={_labelAlign}
            hideTitle={hideTitle}
            children={item.children}
          />
        </div>
      );

      const listChildren = (
        <RenderList
          parentId={id}
          schema={schema}
          dataIndex={dataIndex}
          errorFields={errorFields}
          displayType={_displayType}
          hideTitle={hideTitle}
          children={item.children}
        />
      );

      const TableObjectChildren = (
        <RenderTableObject
          parentId={id}
          dataIndex={dataIndex}
          displayType={_displayType}
          hideTitle={schema.props?.hideTitle}
          customClass={schema.props?.customClass}
          border={parseInt(schema.props?.border) || 0}
          rows={schema.rows as Row[][]}
          children={item.children}
        />
      );
      // 布局嵌套表单组件
      if (isLayoutForm) {
        return (
          <div class="fr-field-layout">
            <RenderLayoutForm
              parentId={id}
              schema={schema}
              dataIndex={dataIndex}
              errorFields={errorFields}
              displayType={_displayType}
              hideTitle={hideTitle}
              children={item.children}
            />
          </div>
        );
      }
      // 简单布局、不含表单组件
      if (isLayout) {
        return (
          <RenderLayout
            parentId={id}
            schema={schema}
            dataIndex={dataIndex}
            errorFields={errorFields}
            displayType={_displayType}
            hideTitle={hideTitle}
          />
        );
      }
      // 计算 children
      let _children = null;
      if (hasChildren) {
        if (isObj) {
          _children = objChildren;
        } else if (isTable) {
          _children = TableObjectChildren;
        }
        if (isList) {
          _children = listChildren;
        }
      } else if (isCheckBox) {
        _children = schema.title;
      }

      return (
        <div style={columnStyle} class={`${containerClass} ${debugCss ? 'debug' : ''}`}>
          <RenderField {...fieldProps}>{_children}</RenderField>
        </div>
      );
    };
  },
});
</script>
