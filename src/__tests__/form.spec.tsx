import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, test } from 'vitest';
import Demo from './demo.vue';
// import FormDemo from './form-demo';

function sleep(ms: number): Promise<never> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('FormRender.vue', () => {
  test('render', async () => {
    const wrapper = mount(Demo);
    await nextTick();
    const btn = wrapper.find('button[data-testid="submit"]');
    btn.trigger('click');
    const btnTest = wrapper.find('button[data-testid="test"]');
    btnTest.trigger('click');
    // await nextTick();
    // expect(wrapper.find('button[data-testid="input"]').text()).toContain('简单输入框');
    // expect(wrapper.find('button[data-testid="select"]').text()).toContain('a');
  });
});
