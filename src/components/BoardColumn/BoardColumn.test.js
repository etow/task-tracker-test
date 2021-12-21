import { shallowMount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import BoardColumn from './BoardColumn.vue';
import { ElMessage } from 'element-plus'
import { SET_TASK_TO_EDIT, ROLLBACK_STATE, UPDATE_TASKS } from '../../store/constants';

jest.mock('element-plus', () => ({
  ElMessage: jest.fn(),
}));

const tasks = [
  { name: 'test1', category: 'Planned', order: 0, },
  { name: 'test2', category: 'Planned', order: 1, },
  { name: 'test3', category: 'Planned', order: 2 },
];

describe('BoardColumn.vue', () => {
  it('renders correctly', async () => {
    // mock store
    const [store] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calculates new order of item after drag', async () => {
    const [store, { actions }] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // change order
    const tasksUpdaded = [];
    tasksUpdaded[0] = tasks[2];
    tasksUpdaded[2] = tasks[0];

    wrapper.vm.tasks = tasksUpdaded;
    expect(actions[UPDATE_TASKS]).toHaveBeenCalledWith(expect.anything(), { tasks: tasksUpdaded, category: 'Planned' });
  });

  it('triggers set task to edit', async () => {
    const [store, { actions }] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    wrapper.vm.setTaskToEdit(tasks[0]);
    expect(actions[SET_TASK_TO_EDIT]).toHaveBeenCalledWith(expect.anything(), tasks[0]);
  });

  it('handless error when setting a task to edit', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const [store, { actions }] = mockStore({ set_task_to_edit: jest.fn(() => Promise.reject('error'))});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    wrapper.vm.setTaskToEdit(tasks[0]);

    expect(actions[SET_TASK_TO_EDIT]).toHaveBeenCalledWith(expect.anything(), tasks[0]);
    await flushPromises();

    expect(console.error).toHaveBeenCalled();
    expect(ElMessage).toHaveBeenCalledWith({
      message: 'Something went wrong while trying to edit the task, please try again',
      type: 'error',
      duration: 5000,
    });
    expect(actions[ROLLBACK_STATE]).toHaveBeenCalled();
    console.error.mockRestore();
  });

  it('it handles error when updating a task', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const [store, { actions }] = mockStore({ update_tasks: jest.fn(() => Promise.reject('error'))});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // change order
    const tasksUpdaded = [];
    tasksUpdaded[0] = tasks[2];
    tasksUpdaded[2] = tasks[0];

    wrapper.vm.tasks = tasksUpdaded;

    expect(actions[UPDATE_TASKS]).toHaveBeenCalled();
    await flushPromises();

    expect(console.error).toHaveBeenCalled();
    expect(ElMessage).toHaveBeenCalledWith({
      message: 'Something went wrong while trying to update the task, please try again',
      type: 'error',
      duration: 5000,
    });
    expect(actions[ROLLBACK_STATE]).toHaveBeenCalled();
    console.error.mockRestore();
  });
});

// create wrapper helper
const createWrapper = (decorator = (n) => n) => {
  const dataToMount = {
    propsData: {
      category: 'Planned',
    },
    global: {},
  };

  decorator(dataToMount);
  return shallowMount(BoardColumn, dataToMount);
};

// mock store helper
function mockStore({ set_task_to_edit, update_tasks, rollback_state } = {}) {
  const state = {
    categories: {
      Planned: { color: 'red' },
    },
    tasks,
  };

  const actions = {
    [SET_TASK_TO_EDIT]: set_task_to_edit || jest.fn(() => Promise.resolve()),
    [UPDATE_TASKS]: update_tasks || jest.fn(() => Promise.resolve()),
    [ROLLBACK_STATE]: rollback_state || jest.fn(() => Promise.resolve()),
  }

  const store = createStore({
    state,
    actions,
  });

  return [store, { actions }];
}
