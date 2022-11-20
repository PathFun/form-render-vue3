<script lang="tsx">
import { defineComponent } from 'vue';
import { renderListProps } from '../../../FRType';
import { Card } from 'ant-design-vue';
import Core from '../../Core.vue';
export default defineComponent({
  props: renderListProps(),
  setup(props) {
    return () => {
      const attrs = props.schema.props || {};
      const { extra = '', cover = '', ...rest } = attrs;
      rest.title = rest.title ? rest.title : props.schema.title;
      return (
        <Card {...rest}>
          {{
            extra: () => {
              return typeof extra === 'string' && extra[0] === '<' ? <span innerHTML={extra}></span> : extra;
            },
            cover: () => {
              return typeof cover === 'string' && cover[0] === '<' ? <div innerHTML={cover}></div> : cover;
            },
            default: () =>
              props.children.map((child, index) => (
                <Core
                  id={child}
                  key={index}
                  data-index={props.dataIndex}
                  displayType={props.displayType}
                  labelAlign={props.labelAlign}
                  hideTitle={props.hideTitle}
                />
              )),
          }}
        </Card>
      );
    };
  },
});
</script>
