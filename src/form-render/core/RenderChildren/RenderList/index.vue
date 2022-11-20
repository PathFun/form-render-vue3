<script lang="tsx">
import { defineComponent, computed } from 'vue';
import { get, isFunction } from 'lodash-es';
import { useFormStore, usePropsStore } from '../../../hooks';
import { generateDataSkeleton, getDataPath, getSchemaFromFlatten } from '../../../_util';
import CardList from './CardList.vue';
import DrawerList from './DrawerList.vue';
import './list.less';
import SimpleList from './SimpleList.vue';
import TableList from './TableList.vue';
import TabList from './TabList.vue';
// import VirtualList from './VirtualList..vue';
import { renderListProps, FlattenValue } from '../../../FRType';

const RenderList = defineComponent({
  name: 'RenderList',
  props: renderListProps(),
  setup(renderProps) {
    const form = useFormStore();
    const propsStore = usePropsStore();
    const dataPath = computed<string>(() => getDataPath(renderProps.parentId, renderProps.dataIndex));

    //TODO: listData会有不少“窟窿”，submit 的时候，listData 需要补齐 or filter
    const listData = computed<any>(() =>
      typeof dataPath.value === 'string' ? get(form.formData, dataPath.value) : null
    );

    const displayList = computed(() => (Array.isArray(listData.value) ? listData.value : [{}]));

    const changeList = (newList: any) => {
      form.onItemChange(dataPath.value, newList);
    };

    const addItem = () => {
      const _schema = getSchemaFromFlatten(form.flatten, renderProps.parentId);
      const newItem = generateDataSkeleton(_schema.items) || {};
      const newList = [...displayList.value, newItem];
      const newIndex = newList.length - 1;
      form.onItemChange(dataPath.value, newList);
      return newIndex;
    };

    const copyItem = (idx: number) => {
      const newItem = displayList.value[idx];
      const newList = [...displayList.value.slice(0, idx), newItem, ...displayList.value.slice(idx)];
      form.onItemChange(dataPath.value, JSON.parse(JSON.stringify(newList)));
    };

    const deleteItem = (idx: number) => {
      // TODO: 删除元素的时候，也需要delete相对于的校验信息（errorFields）
      // remark: 删除时，不存在的item需要补齐，用null
      const newList = displayList.value.filter((item, kdx) => kdx !== idx);
      form.onItemChange(dataPath.value, newList);
      form.removeTouched(`${dataPath.value}[${idx}]`);
    };

    const handleMoving = () => {
      const { schema } = renderProps;
      const { methods = {} } = propsStore.value;
      if (schema.props?.onMove && typeof schema.props.onMove === 'string') {
        const cb = methods[schema.props.onMove];
        if (typeof cb === 'function') {
          cb();
        }
      }
    };

    //TODO1: 上线翻页要正确！！现在是错的
    const moveItemUp = (idx: number) => {
      handleMoving();
      if (idx === 0) return;
      const currentItem = displayList.value[idx];
      const itemAbove = displayList.value[idx - 1];
      const newList = displayList.value;
      newList[idx] = itemAbove;
      newList[idx - 1] = currentItem;
      form.onItemChange(dataPath.value, newList);
      // TODO: 这块懒了，之后要处理一下
      form.removeTouched(`${dataPath.value}[${idx}]`);
    };

    const moveItemDown = (idx: number) => {
      handleMoving();
      if (idx >= displayList.value.length - 1) return;
      const currentItem = displayList.value[idx];
      const itemBelow = displayList.value[idx + 1];
      const newList = displayList.value;
      newList[idx] = itemBelow;
      newList[idx + 1] = currentItem;
      form.onItemChange(dataPath.value, newList);
      // TODO: 这块懒了，之后要处理一下
      form.removeTouched(`${dataPath.value}[${idx}]`);
    };

    const getFieldsProps = (idx: number, extraProps?: Record<string, any>) => {
      const { schema, children, dataIndex } = renderProps;
      let itemSchema = {
        type: 'object',
        properties: {},
        props: schema.props || {},
        _id: schema._id,
      };

      const itemFlatten: FlattenValue = {
        schema: itemSchema,
        children,
      };
      return {
        _item: itemFlatten,
        dataIndex: [...dataIndex, idx],
        ...extraProps,
      };
    };

    return () => {
      const { schema, children, dataIndex, errorFields, displayType } = renderProps;
      const { methods = {} } = propsStore.value;
      const { flatten } = form;

      let renderWidget: string | undefined = 'list';
      try {
        renderWidget = schema.widget;
      } catch (error) {
        console.log(error);
      }

      let displayProps = {
        displayList: displayList.value,
        changeList,
        schema,
        dataPath: dataPath.value,
        dataIndex,
        children,
        deleteItem,
        addItem,
        copyItem,
        moveItemDown,
        moveItemUp,
        listData: dataPath.value,
        flatten,
        errorFields,
        displayType,
        getFieldsProps,
      };

      // 外部定义：添加按钮事件
      const onAdd = methods[schema.props?.onAdd];
      if (isFunction(onAdd)) {
        displayProps.addItem = () => onAdd(addItem, { schema });
      }

      // 外部定义：删除按钮事件
      const onRemove = methods[schema.props?.onRemove];
      if (isFunction(onRemove)) {
        displayProps.deleteItem = idx => onRemove(() => deleteItem(idx), { schema });
      }

      switch (renderWidget) {
        case 'list1':
        case 'simpleList':
          return <SimpleList {...displayProps} />;
        case 'list2':
        case 'tableList':
          return <TableList {...displayProps} />;
        case 'list3':
        case 'drawerList':
          return <DrawerList {...displayProps} />;
        // case 'list4':
        // case 'virtualList':
        //   return <VirtualList {...displayProps} />;
        case 'tabList':
          return <TabList {...displayProps} />;
        case 'list0':
        case 'cardList':
        default:
          return <CardList {...displayProps} />;
      }
    };
  },
});

export default RenderList;
</script>
