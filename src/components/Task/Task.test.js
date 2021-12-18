import { mount } from '@vue/test-utils'
import Task from './Task.vue'

describe('Project.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(Task, {
      propsData: {
        task: { name: 'TASK NAME' }
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
