<script lang="tsx">
import { defineComponent } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { Upload, message, Button } from 'ant-design-vue';
import type { UploadChangeParam } from 'ant-design-vue';
import { componentProps } from '../../FRType';
import { get } from 'lodash-es';
export default defineComponent({
  name: 'Upload',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    return () => {
      const { value, onChange, schema, componentProps = {}, ...rest } = props;
      const { buttonProps = {}, action = '', uploadProps = {} } = componentProps;

      const newProps = {
        ...componentProps,
        ...uploadProps,
        ...rest,
        name: 'file',
        type: 'file',
        action,
        onChange(info: UploadChangeParam) {
          if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`);
            const path = get(schema, 'props.path', '');
            const url = path ? get(info.file.response, path) : info.file.response.url;
            onChange && onChange(url);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`);
          }
        },
        onRemove() {
          onChange && onChange('');
        },
      };

      return (
        <div class="fr-upload-mod">
          <Upload {...newProps} class="fr-upload-file">
            <Button {...buttonProps}>
              <UploadOutlined />
              上传
            </Button>
          </Upload>
          {value && (
            <a href={value} target="_blank" rel="noopener noreferrer" class="fr-upload-preview">
              已上传地址
            </a>
          )}
        </div>
      );
    };
  },
});
</script>
