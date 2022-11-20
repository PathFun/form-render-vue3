<script lang="tsx">
import { ConfigProvider } from 'ant-design-vue';
import { defineComponent } from 'vue';
import { frProps } from './FRType';
import zhCN from 'ant-design-vue/lib/locale/zh_CN';
import enUS from 'ant-design-vue/lib/locale/en_US';
import { FRCore } from './core';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { FormCtx } from './hooks';
import { widgets as defaultWidgets } from './widgets/antd';
const FR = defineComponent({
  name: 'FR',
  components: {},
  inheritAttrs: false,
  props: frProps(),
  setup(props) {
    FormCtx(props.form);
    return () => {
      const { widgets, configProvider, locale, ...rest } = props;
      dayjs.locale(locale);
      return (
        <ConfigProvider locale={locale === 'en' ? enUS : zhCN} {...ConfigProvider}>
          <FRCore locale={locale} widgets={{ ...defaultWidgets, ...widgets }} {...rest} />
        </ConfigProvider>
      );
    };
  },
});

export default FR;
</script>
