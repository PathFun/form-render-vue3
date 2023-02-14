<script lang="ts" setup>
import 'ant-design-vue/dist/antd.css';
import { Button, Space, message } from 'ant-design-vue';
import FR, { useForm } from './form-render';
import { reactive, ref } from 'vue';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const fakeApi = (url = '', data = {}) => {
  console.group('request:', url);
  console.log('params:', data);
  console.groupEnd();
  return delay(200);
};

const disabled = ref(false);

const form = useForm();
const schema = reactive({
  type: 'object',
  properties: {
    table_eXrRIV: {
      title: '表格对象',
      type: 'object',
      widget: 'table',
      rows: [
        [
          {
            merged: false,
            colspan: 1,
            rowspan: 1,
            widgets: [],
          },
          {
            merged: false,
            colspan: 2,
            rowspan: 1,
            widgets: ['input3'],
          },
        ],
        [
          {
            merged: false,
            colspan: 1,
            rowspan: 1,
            widgets: ['input4'],
          },
          {
            merged: false,
            colspan: 1,
            rowspan: 1,
            widgets: [],
          },
          {
            merged: false,
            colspan: 1,
            rowspan: 2,
            widgets: ['select2'],
          },
        ],
        [
          {
            merged: false,
            colspan: 2,
            rowspan: 1,
            widgets: ['input2', 'input5'],
          },
          {
            merged: true,
            colspan: 1,
            rowspan: 1,
            widgets: [],
          },
        ],
      ],
      props: {
        border: true,
        customClass: '',
        hideTitle: true,
      },
      properties: {
        select2: {
          title: '单选',
          type: 'string',
          widget: 'select',
          enum: ['a', 'b', 'c'],
          enumNames: ['早上', '中午', '晚上'],
        },
        input2: {
          title: '输入框2',
          type: 'string',
          required: true,
        },
        input3: {
          title: '输入框3',
          type: 'string',
          required: true,
        },
        input4: {
          title: '输入框4',
          type: 'string',
          required: true,
        },
        input5: {
          title: '输入框5',
          type: 'string',
          required: true,
        },
      },
    },
  },
});

const getRemoteData = () => {
  fakeApi('xxx/getForm').then(_ => {
    form.setValues({ input1: 'hello world', select1: 'c' });
  });
};

// 异步加载表单
delay(3000).then(_ => {
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
      color: {
        title: '颜色展示',
        type: 'string',
        format: 'color',
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
        rows: [
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
        props: {
          size: 'small',
          centered: true,
          title: '<span style="padding-left: 16px">Tab布局组件</span>',
          style: 'width: 100%',
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
});

const onFinish = (data: any, errors: any[]) => {
  if (errors.length > 0) {
    setTimeout(function () {
      message.error('校验未通过：' + JSON.stringify(errors.map(item => item.name)));
    });
  } else {
    fakeApi('xxx/submit', data).then(_ => message.success('提交成功！'));
  }
};

const changeSchema = () => {
  Object.assign(schema, {
    type: 'object',
    properties: {
      inp1: {
        title: '输入框121',
        type: 'string',
        required: true,
      },
      sel1: {
        title: '单选121',
        type: 'string',
        enum: ['a', 'b', 'c'],
        enumNames: ['早', '中', '晚'],
      },
    },
  });
};

const changeDisabled = () => {
  disabled.value = !disabled.value;
};

const getFormDate = () => {
  console.log(form.formData);
};

const watchMap = {
  '#': {
    handler: (v: any) => console.log(v, 12121212),
    immediate: false,
  },
};
</script>

<template>
  <div style="width: 100%; padding: 30px">
    <FR
      :form="form"
      :schema="schema"
      display-type="row"
      label-align="right"
      :watch-map="watchMap"
      :on-finish="onFinish"
      :disabled="disabled"
    />
    <Space>
      <Button @click="getRemoteData">加载服务端数据</Button>
      <Button @click="changeSchema">点击修改Schema</Button>
      <Button @click="changeDisabled">点击修改Disabled</Button>
      <Button @click="getFormDate">获取FormData</Button>
      <Button type="primary" @click="() => form.submit()"> 提交（见console） </Button>
    </Space>
  </div>
</template>
