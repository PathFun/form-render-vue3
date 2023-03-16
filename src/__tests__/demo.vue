<template>
  <div>
    <FR :form="form" :schema="schema" :onFinish="onFinish" :onMount="onMount" />
    <div data-testid="fr-value">
      <div data-testid="input">{{ state?.inp1 }}</div>
      <div data-testid="select">{{ state?.sel1 }}</div>
    </div>
    <button data-testid="submit" @click="form.submit">提交</button>
    <button data-testid="test" @click="onClick">setValueByPath</button>
    <button data-testid="changeSchema" @click="changeSchema">修改Schema</button>
  </div>
</template>

<script lang="ts">
import FR, { useForm } from '../form-render';
import { reactive, defineComponent } from 'vue';

const FillDemo = defineComponent({
  components: {
    FR,
  },
  setup() {
    const state = reactive({
      inp1: '',
      sel1: '',
    });

    const form = useForm();
    const schema = reactive({
      type: 'object',
      properties: {
        inp1: {
          title: '输入框121',
          type: 'string',
          default: '简单输入框',
        },
        sel1: {
          title: '单选121',
          type: 'string',
          enum: ['a', 'b', 'c'],
          enumNames: ['早', '中', '晚'],
          default: 'a',
        },
      },
    });

    const changeSchema = () => {
      Object.assign(schema, {
        type: 'object',
        properties: {
          html: {
            title: 'html',
            type: 'string',
            widget: 'html',
          },
          inputName: {
            title: 'url输入框',
            type: 'string',
            format: 'url',
          },
          imageName: {
            title: '图片展示',
            type: 'string',
            format: 'image',
          },
          testChild: {
            type: 'object',
            title: '对象内部',
            properties: {
              objectName: {
                title: '图片展示',
                type: 'string',
              },
              objectName2: {
                title: 'email输入框',
                type: 'string',
              },
              subLayout: {
                title: '布局组件',
                type: 'layout',
                props: {
                  style: {
                    width: '100%',
                  },
                  size: 'small',
                  extra: '<a href="#">更多</a>',
                  cover:
                    '<img alt="example" style="width: 100%;" src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F0109975ed61679a801215aa003eb61.jpg%403000w_1l_2o_100sh.jpg&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1670908474&t=31add1fd2a1e3dd7741aa697f8392c1b"/>',
                },
                properties: {
                  layoutInnerInput: {
                    title: '图片展示',
                    type: 'string',
                  },
                  listName2: {
                    title: '对象数组',
                    description: '对象数组嵌套功能',
                    type: 'array',
                    min: 1,
                    max: 3,
                    items: {
                      type: 'object',
                      properties: {
                        input1: {
                          title: '简单输入框',
                          type: 'string',
                        },
                        select1: {
                          title: '单选',
                          type: 'string',
                          enum: ['a', 'b', 'c'],
                          enumNames: ['早', '中', '晚'],
                        },
                      },
                    },
                  },
                  innerObject: {
                    type: 'object',
                    properties: {
                      innerObjectName: {
                        title: '图片展示',
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          layoutData: {
            title: '布局组件',
            type: 'layout',
            widget: 'tab',
            props: {
              size: 'small',
              centered: true,
              title: '<span style="padding-left: 16px">Tab布局组件</span>',
              style: 'width: 100%',
              panes: [
                {
                  key: '1',
                  tab: 'pane 1',
                  widgets: ['layoutInput'],
                },
                {
                  key: '2',
                  tab: 'pane 2',
                  widgets: ['listName3'],
                },
              ],
            },
            properties: {
              layoutInput: {
                title: '图片展示',
                type: 'string',
              },
              listName3: {
                title: '对象数组',
                description: '对象数组嵌套功能',
                type: 'array',
                min: 1,
                max: 3,
                items: {
                  type: 'object',
                  properties: {
                    input1: {
                      title: '简单输入框',
                      type: 'string',
                    },
                    select1: {
                      title: '单选',
                      type: 'string',
                      enum: ['a', 'b', 'c'],
                      enumNames: ['早', '中', '晚'],
                    },
                  },
                },
              },
            },
          },
        },
      });
    };

    const onFinish = (data: any, errors: any[]) => {
      Object.assign(state, data);
    };

    const onMount = () => {
      form.setValueByPath('link', 'www.baidu.com');
    };

    const onClick = () => {
      form.setValueByPath('link', 'www.baidu.com');
    };

    return {
      form,
      onClick,
      changeSchema,
      state,
      onFinish,
      schema,
      onMount,
    };
  },
});
export default FillDemo;
</script>
