<template>
  <div v-bind="{ ...rootProps }">
    <div v-if="debug" class="mv2 bg-black-05 pa2 br2">
      <div
        style="
           {
            display: flex;
          }
        "
      >
        <span>formData:</span>
        <span
          style="
             {
              display: inline-block;
              word-wrap: break-all;
              white-space: pre-wrap;
              max-width: 600px;
            }
          "
        >
          {{ JSON.stringify(form.formData, null, 4) }}
        </span>
      </div>
      <div>{{ 'errorFields:' + JSON.stringify(form.errorFields) }}</div>
      <div>{{ 'touchedKeys:' + JSON.stringify(form.touchedKeys) }}</div>
      <div>{{ 'allTouched:' + JSON.stringify(form.allTouched) }}</div>
      <div>{{ 'descriptor:' + JSON.stringify(descriptor) }}</div>
    </div>
    <Core :debug-css="debugCss" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, computed, watch, reactive, ref, nextTick } from 'vue';
import Core from './Core.vue';
import { frProps, ValidateParams, Schema } from '../FRType';
import { useFormStore, PropsCtx } from '../hooks';
import { yymmdd, msToTime } from '../_util';
import { mapping as defaultMapping } from '../mapping';

export default defineComponent({
  name: 'FRCore',
  components: {
    Core,
  },
  inheritAttrs: false,
  props: frProps(),
  setup(props, { expose }) {
    const form = useFormStore();
    const handleSubmit = async () => await form.submit();

    const loaded = ref<boolean>(false);

    const reload = ref<boolean>(false);

    PropsCtx(
      reactive(
        computed(() => ({
          globalProps: props.globalProps,
          displayType: props.displayType,
          labelAlign: props.labelAlign,
          colon: props.colon || true,
          theme: props.theme || '',
          column: props.column,
          debounceInput: props.debounceInput,
          debug: props.debug,
          labelWidth: props.labelWidth,
          validateMessages: props.validateMessages,
          locale: props.locale,
          readOnly: props.readOnly,
          disabled: props.disabled,
          allCollapsed: props.allCollapsed,
          widgets: props.widgets,
          mapping: { ...defaultMapping, ...props.mapping },
          methods: props.methods,
          renderTitle: props.renderTitle,
          requiredMark: props.requiredMark,
        }))
      )
    );

    const init = (schema: Schema) => {
      if (schema && schema.type) {
        const { locale, validateMessages, removeHiddenData } = props;
        form.setFirstMount(true);
        form.syncStuff({
          schema: schema,
          locale,
          validateMessages,
          beforeFinish: props.beforeFinish,
          onMount: props.onMount,
          removeHiddenData,
        });
        loaded.value = true;
        reload.value = true;
        nextTick(function () {
          reload.value = false;
        });
      }
    };

    watch(props.schema, newSchema => {
      init(newSchema);
    });

    init(props.schema);

    watch([props.schema, () => form.firstMount], ([schema, firstMount]) => {
      if (!firstMount && schema && schema.type) {
        if (typeof props.onMount === 'function') {
          setTimeout(() => props.onMount && props.onMount(), 0);
        }
        setTimeout(onMountLogger, 0);
      }
    });

    const onMountLogger = () => {
      const start = new Date().getTime();
      const { logOnMount, logOnSubmit } = form;
      if (typeof logOnMount === 'function' || typeof logOnSubmit === 'function') {
        sessionStorage.setItem('FORM_MOUNT_TIME', start.toString());
        sessionStorage.setItem('FORM_START', start.toString());
      }
      if (typeof logOnMount === 'function') {
        const logParams: Record<string, any> = {
          schema: props.schema,
          url: location.href,
          formData: JSON.stringify(form.getValues(true)),
          formMount: yymmdd(start),
        };
        if (props.id) {
          logParams.id = props.id;
        }
        logOnMount(logParams);
      }
      // 如果是要计算时间，在 onMount 时存一个时间戳
      if (typeof logOnSubmit === 'function') {
        sessionStorage.setItem('NUMBER_OF_SUBMITS', '0');
        sessionStorage.setItem('FAILED_ATTEMPTS', '0');
      }
    };

    watch(
      [() => form.isValidating, () => form.isSubmitting, () => form.outsideValidating],
      ([isValidating, isSubmitting, outsideValidating]) => {
        // 需要外部校验的情况，此时 submitting 还是 false
        const { submitData, errorFields, setErrorFields, endValidating, endSubmitting, logOnSubmit } = form;
        const { schema, config, onFinish, id } = props;
        if (outsideValidating === true && props.beforeFinish) {
          Promise.resolve(
            props.beforeFinish({
              data: submitData,
              schema: schema,
              errors: errorFields,
              ...config,
            } as unknown as ValidateParams)
          ).then(error => {
            if (error) {
              setErrorFields(error);
            }
            endValidating();
          });
          return;
        }
        // 如果validation结束，submitting开始
        if (isValidating === false && isSubmitting === true) {
          endSubmitting();
          onFinish && onFinish(submitData, errorFields);
          if (typeof logOnSubmit === 'function') {
            const start = Number(sessionStorage.getItem('FORM_START'));
            const mount = sessionStorage.getItem('FORM_MOUNT_TIME') || '';
            const numberOfSubmits = Number(sessionStorage.getItem('NUMBER_OF_SUBMITS')) + 1;
            const end = new Date().getTime();
            let failedAttempts = Number(sessionStorage.getItem('FAILED_ATTEMPTS'));
            if (errorFields.length > 0) {
              failedAttempts = failedAttempts + 1;
            }
            const logParams: Record<string, any> = {
              formMount: yymmdd(mount),
              ms: end - start,
              duration: msToTime(end - start),
              numberOfSubmits: numberOfSubmits,
              failedAttempts: failedAttempts,
              url: location.href,
              formData: JSON.stringify(submitData),
              errors: JSON.stringify(errorFields),
              schema: JSON.stringify(schema),
            };
            if (id) {
              logParams.id = id;
            }
            logOnSubmit(logParams);
            sessionStorage.setItem('FORM_START', end.toString());
            sessionStorage.setItem('NUMBER_OF_SUBMITS', numberOfSubmits.toString());
            sessionStorage.setItem('FAILED_ATTEMPTS', failedAttempts.toString());
          }
        }
      }
    );

    onUnmounted(function () {
      form.resetFields();
    });

    expose({ handleSubmit });

    return {
      loaded,
      reload,
      formData: computed<any>(() => form.formData),
      form,
      rootProps: computed<Record<string, any>>(() => {
        let className = 'fr-container';
        if (props.size === 'small') {
          className += ' fr-form-small';
        } else if (props.size === 'large') {
          className += ' fr-form-large';
        }
        if (props.className) className += ` ${props.className}`;
        const propsObj: Record<string, any> = {
          class: className,
        };
        if (props.id && ['number', 'string'].indexOf(typeof props.id) > -1) {
          propsObj.id = props.id;
        }
        return propsObj;
      }),
      descriptor: computed<any>(() => window.descriptor),
    };
  },
});
</script>
