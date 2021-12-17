import { shallowMount } from '@vue/test-utils'
import Project from './Project.vue'

describe('Project.vue', () => {
  it('It renders correctly', () => {
    const wrapper = shallowMount(Project)
    expect(wrapper.html()).toMatchSnapshot();
  })
})
