<script lang="tsx">
import { defineComponent } from 'vue';
import { translateMessage } from '../../_util';
import './ErrorMessage.less';
import { messagesProps } from '../../FRType';

const ErrorMessage = defineComponent({
  props: messagesProps(),
  setup(props) {
    return () => {
      const { message, schema, softHidden, hardHidden } = props;
      let msg = '';
      if (typeof message === 'string') msg = message;
      if (Array.isArray(message)) {
        msg = message[0] || '';
      }

      msg = translateMessage(msg, schema);

      // 无错误信息不渲染 msg 元素占位，表单之间的间隔通过 field-block 元素分隔
      if (!msg) return null;

      if (hardHidden) return <div class="error-message"></div>;

      return !msg && softHidden ? null : <div class="error-message">{msg}</div>;
    };
  },
});

export default ErrorMessage;
</script>
