import { shallowMount, flushPromises, config } from '@vue/test-utils';
import { ElMessage } from 'element-plus';
import { createStore } from 'vuex';
import EditTaskForm from './EditTaskForm.vue';

import { UPDATE_TASK, DELETE_TASK, SET_TASK_TO_EDIT, ROLLBACK_STATE } from '../../store/constants';


jest.mock('element-plus', () => ({
  ElMessage: jest.fn(),
  ElLoading: { service: jest.fn(() => ({ close: jest.fn() })) },
}));

const tasks = [
  { name: 'test1', category: 'Planned', order: 0, estimate: 0, activity: {} },
  { name: 'test2', category: 'Planned', order: 1, estimate: 0, activity: {} },
  { name: 'test3', category: 'Planned', order: 2, estimate: 0, activity: {} },
];

beforeAll(() => {
  config.renderStubDefaultSlot = true;
});

afterAll(() => {
  config.renderStubDefaultSlot = false;
});

describe('EditTaskForm.vue', () => {
  it('renders correctly', async () => {
    // mock store
    const [store] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  test('form pass validation and save the changes', async () => {
    // mock store
    const formValidation = jest.fn(cb => cb(true));

    const [store, { actions }] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      dataToMount.global.stubs.ElForm = { template: '<form><slot /></form>', methods: { validate: formValidation }};
      return dataToMount;
    });

    wrapper.vm.form = { name: 'Test Save', category: 'Planned', order: 1000 };
    wrapper.vm.handleSave();
    expect(formValidation).toHaveBeenCalled();
    await wrapper.vm.$nextTick()
    expect(actions[UPDATE_TASK]).toHaveBeenCalledWith(expect.anything(), { task: wrapper.vm.form, prevCategory: store.state.taskToEdit.category });
  });

  test('form fails validation and save is not tiggered', async () => {
    const formValidation = jest.fn(cb => cb(false));

    const [store, { actions }] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      dataToMount.global.stubs.ElForm = { template: '<form><slot /></form>', methods: { validate: formValidation }};
      return dataToMount;
    });

    wrapper.vm.handleSave();
    expect(formValidation).toHaveBeenCalled();
    await wrapper.vm.$nextTick()
    expect(actions[UPDATE_TASK]).toHaveBeenCalledTimes(0);
  });

  test('handle delete', async () => {
    const [store, { actions }] = mockStore({ taskToEdit: tasks[0]});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });
    wrapper.vm.handleDelete();
    await wrapper.vm.$nextTick()
    expect(actions[DELETE_TASK]).toHaveBeenCalledWith(expect.anything(), { task: wrapper.vm.form, category: tasks[0].category });
    await flushPromises();
  });

  test('handle cancel', async () => {
    const [store] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    wrapper.vm.handleCancel();
    await wrapper.vm.$nextTick()
  });

  it('it handles error when updating a task', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const formValidation = jest.fn(cb => cb(true));
    const [store, { actions }] = mockStore({ update_task: jest.fn(() => Promise.reject('error'))});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      dataToMount.global.stubs.ElForm = { template: '<form><slot /></form>', methods: { validate: formValidation }};
      return dataToMount;
    });

    wrapper.vm.form = { name: 'Test Save', category: 'Planned', order: 1000 };
    wrapper.vm.handleSave();
    expect(formValidation).toHaveBeenCalled();
    await wrapper.vm.$nextTick()
    expect(actions[UPDATE_TASK]).toHaveBeenCalled();
    await flushPromises();
    expect(console.error).toHaveBeenCalled();
    expect(ElMessage).toHaveBeenCalledWith({
      message: 'Something went wrong while trying to save the changes, please try again',
      type: 'error',
      duration: 5000,
    });
    expect(actions[ROLLBACK_STATE]).toHaveBeenCalled();
    console.error.mockRestore();
  });

  it('it handles error when deleting a task', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const [store, { actions }] = mockStore({ delete_task: jest.fn(() => Promise.reject('error'))});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      dataToMount.global.stubs.ElForm = { template: '<form><slot /></form>' };
      return dataToMount;
    });

    wrapper.vm.form = { name: 'Test Save', category: 'Planned', order: 1000 };
    wrapper.vm.handleDelete();
    await wrapper.vm.$nextTick()
    expect(actions[DELETE_TASK]).toHaveBeenCalled();
    await flushPromises();
    expect(console.error).toHaveBeenCalled();
    expect(ElMessage).toHaveBeenCalledWith({
      message: 'Something went wrong while trying to delete the task, please try again',
      type: 'error',
      duration: 5000,
    });
    expect(actions[ROLLBACK_STATE]).toHaveBeenCalled();
    console.error.mockRestore();
  });
});


const createWrapper = (decorator = (n) => n) => {
  const dataToMount = {
    global: {
      directives: {
        loading: () => {},
      },
      stubs: {
        ElDialog: true,
        ElOption: true,
        ElForm: true,
        ElButton: true,
        ElSelect: true,
        ElFormItem: true,
        ElInput: true,
        ElPopconfirm: true,
        ElInputNumber: true,
      },
    },
  };

  decorator(dataToMount);
  return shallowMount(EditTaskForm, dataToMount);
};

function mockStore({ set_task_to_edit, delete_task, update_task, rollback_state, taskToEdit } = {}) {
  const state = {
    tasks: tasks,
    categories: {
      Planned: { name: 'Planned', color: 'red' },
      'In Progress': { name: 'In Progress', color: 'red' },
      Completed: { name: 'Completed', color: 'red' },
    },
    taskToEdit: taskToEdit || {},
  };

  const actions = {
    [SET_TASK_TO_EDIT]: set_task_to_edit || jest.fn(() => Promise.resolve()),
    [DELETE_TASK]: delete_task || jest.fn(() => Promise.resolve()),
    [UPDATE_TASK]: update_task || jest.fn(() => Promise.resolve()),
    [ROLLBACK_STATE]: rollback_state || jest.fn(() => Promise.resolve()),
  }

  const store = createStore({
    state,
    actions,
  });

  return [store, { actions }];
}
