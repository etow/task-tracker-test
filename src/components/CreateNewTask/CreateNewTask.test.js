import { flushPromises, shallowMount } from '@vue/test-utils'
import { ElMessage } from 'element-plus';
import CreateNewTask from './CreateNewTask.vue'
import { createStore } from 'vuex'
import { CREATE_TASK, ROLLBACK_STATE } from '../../store/constants';

jest.mock('element-plus', () => ({
  ElMessage: jest.fn(),
}));

describe('CreateNewTask.vue', () => {
  it('It renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  })

  it('It renders edit mode', async () => {
    // mock focus
    const inputFocus = jest.fn();

    // create wrapper
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.stubs.ElInput.methods.focus = inputFocus;
      return dataToMount;
    });

    // check click on button and focus on input.
    const button = await wrapper.find('button');
    const input = await wrapper.find('input');

    // check input is hidden
    expect(input.wrapperElement.style.display).toEqual('none');

    button.trigger('click');
    await wrapper.vm.$nextTick();

    // check input is visible after click
    expect(inputFocus).toHaveBeenCalled();
    expect(input.wrapperElement.style.display).toEqual('');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('It creates a new task on blur', async () => {
    // mock store
    const [store, { actions }] = mockStore();

    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // mock values
    wrapper.vm.task.name = 'Pass Test';
    const createTaskMethod = jest.spyOn(wrapper.vm, 'createNewTask');

    // check input blur
    const input = await wrapper.find('input');
    input.trigger('blur');

    expect(createTaskMethod).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.taskCreated).toBe(true);
    expect(actions[CREATE_TASK]).toHaveBeenCalledTimes(1);

    await flushPromises();

    // resets state
    expect(wrapper.vm.taskCreated).toBe(false);
    expect(wrapper.vm.editMode).toBe(false);
  });

  it('It creates a new task on keypress = ENTER', async () => {

    // mock store
    const [store, { actions }] = mockStore();

    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // mock values
    wrapper.vm.task.name = 'Pass Test';
    const createTaskMethod = jest.spyOn(wrapper.vm, 'createNewTask');


    // check input keypress
    const input = await wrapper.find('input');
    input.trigger('keypress', { key: 'Enter' });

    expect(createTaskMethod).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.taskCreated).toBe(true);
    expect(actions[CREATE_TASK]).toHaveBeenCalledTimes(1);

    await flushPromises();

    // resets state
    expect(wrapper.vm.taskCreated).toBe(false);
    expect(wrapper.vm.editMode).toBe(false);
  });

  it('It cancel create new task if method has already been executed', async () => {

    // mock store
    const [store, { actions }] = mockStore();

    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // mock values
    wrapper.vm.task.name = 'Pass Test';
    const createTaskMethod = jest.spyOn(wrapper.vm, 'createNewTask');

    // trigger consecutive events
    const input = await wrapper.find('input');
    input.trigger('blur');
    input.trigger('keypress', { key: 'Enter' });

    expect(createTaskMethod).toHaveBeenCalledTimes(2);
    expect(actions[CREATE_TASK]).toHaveBeenCalledTimes(1);

    await flushPromises();

    // resets state
    expect(wrapper.vm.taskCreated).toBe(false);
    expect(wrapper.vm.editMode).toBe(false);
  });

  it('It cancel create new task if task name is empty', async () => {

    // mock store
    const [store, { actions }] = mockStore();

    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // mock values
    const createTaskMethod = jest.spyOn(wrapper.vm, 'createNewTask');

    // trigger consecutive events
    const input = await wrapper.find('input');
    input.trigger('blur');

    expect(createTaskMethod).toHaveBeenCalledTimes(1);
    expect(actions[CREATE_TASK]).toHaveBeenCalledTimes(0);

    await flushPromises();

    // resets state
    expect(wrapper.vm.taskCreated).toBe(false);
    expect(wrapper.vm.editMode).toBe(false);
  });

  it('It reset states when switching modes', async () => {

    // mock store
    const [store] = mockStore();

    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // initial state
    expect(wrapper.vm.taskCreated).toBe(false);
    expect(wrapper.vm.task).toEqual({ name: '', category: 'Test' });

    // triger event
    const button = await wrapper.find('button');
    const input = await wrapper.find('input');

    button.trigger('click');
    await flushPromises();

    expect(wrapper.vm.editMode).toBe(true);
    expect(wrapper.vm.task).toEqual({ name: '', category: 'Test' });

    wrapper.vm.task.name = 'Pass test again';
    input.trigger('blur');

    await flushPromises();

    // resets state
    expect(wrapper.vm.taskCreated).toBe(false);
    expect(wrapper.vm.editMode).toBe(false);

    // enter edit mode again
    button.trigger('click');

    await flushPromises();

    expect(wrapper.vm.editMode).toBe(true);
    expect(wrapper.vm.task).toEqual({ name: '', category: 'Test' });
  });

  it('it handles error when creating a task', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const [store, { actions }] = mockStore({ create_new_task: jest.fn(() => Promise.reject('error'))});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // mock values
    wrapper.vm.task.name = 'Pass Test';
    wrapper.vm.createNewTask();

    expect(actions[CREATE_TASK]).toHaveBeenCalled();
    await flushPromises();

    expect(console.error).toHaveBeenCalled();
    expect(ElMessage).toHaveBeenCalledWith({
      message: 'Something went wrong while trying to create a new task, please try again',
      type: 'error',
      duration: 5000,
    });
    expect(actions[ROLLBACK_STATE]).toHaveBeenCalled();
    console.error.mockRestore();
  });

})

// create wrapper helper
const createWrapper = (decorator = (n) => n) => {
  const dataToMount = {
    propsData: {
      category: 'Test',
    },
    global: {
      stubs: {
        ElButton: {
          template: '<button />',
        },
        ElInput: {
          template: '<input />',
          methods: {
            focus: jest.fn(),
          },
        },
      },
    },
  }

  decorator(dataToMount);
  return shallowMount(CreateNewTask, dataToMount);
};

// mock store helper
function mockStore({create_new_task, rollback_state} = {}) {
  const actions = {
    [CREATE_TASK]: create_new_task || jest.fn(() => Promise.resolve()),
    [ROLLBACK_STATE]: rollback_state || jest.fn(() => Promise.resolve()),
  };
  const store = createStore({
    actions,
  });

  return [store, { actions }];
}
