import { provide, inject, reactive, ComputedRef, ref } from 'vue';
import { PROPS_PROVIDE_KEY, FORM_PROVIDE_KEY } from './symbols';
import { FormInstance, FRPropsCtx } from './FRType';

type PropsCtxInstance = Partial<FRPropsCtx>;

export const PropsCtx = function (defaultValue: ComputedRef<PropsCtxInstance>) {
  provide(PROPS_PROVIDE_KEY, defaultValue);
};

export const FormCtx = function (defaultValue: FormInstance) {
  provide(FORM_PROVIDE_KEY, defaultValue);
};

export const usePropsStore = (): ComputedRef<PropsCtxInstance> =>
  inject(PROPS_PROVIDE_KEY, ref({}) as ComputedRef<PropsCtxInstance>);

export const useFormStore = (): FormInstance => inject(FORM_PROVIDE_KEY, reactive<FormInstance>({} as FormInstance));
