<script lang="tsx">
import { defineComponent } from 'vue';
import { Input as ImageInput, Popover } from 'ant-design-vue';
import { PictureOutlined } from '@ant-design/icons-vue';
const DEFAULT_IMG = 'https://img.alicdn.com/tfs/TB14tSiKhTpK1RjSZFKXXa2wXXa-354-330.png';
import { componentProps } from '../../FRType';

const PreviewNode = defineComponent({
  inheritAttrs: false,
  props: ['value'],
  setup(props) {
    return () => {
      return (
        <Popover
          class="fr-preview"
          placement="bottomRight"
          v-slots={{
            content: () => <img src={props.value} alt="图片地址错误" class="fr-preview-image" />,
            default: () => <PictureOutlined />,
          }}
        />
      );
    };
  },
});

export default defineComponent({
  name: 'ImageInput',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    return () => {
      const { componentProps = {}, globalProps = {}, ...rest } = props;
      return (
        <ImageInput
          {...globalProps}
          {...componentProps}
          {...rest}
          v-slots={{
            addonAfter: () => <PreviewNode value={props.value || DEFAULT_IMG} />,
          }}
        />
      );
    };
  },
});
</script>
