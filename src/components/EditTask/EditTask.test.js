import { shallowMount, config } from '@vue/test-utils';
import { createStore } from 'vuex';
import EditTask from './EditTask.vue';

import { SET_TASK_TO_EDIT } from '../../store/constants';

jest.mock('element-plus', () => ({
  ElMessage: jest.fn(),
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

describe('EditTask.vue', () => {
  it('renders correctly', async () => {
    // mock store
    const [store] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('closes dialog', async () => {
    const [store] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });
    store.state.taskToEdit = tasks[0];
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showDialog).toBe(true);
    wrapper.vm.handleClose();
    expect(wrapper.vm.showDialog).toBe(false);
  });
});


const createWrapper = (decorator = (n) => n) => {
  const dataToMount = {
    global: {
      stubs: {
        ElDialog: true,
        ElTabs: true,
        ElTabPane: true,
        EditTaskForm: true,
        Activity: true,
      },
    },
  };

  decorator(dataToMount);
  return shallowMount(EditTask, dataToMount);
};

function mockStore({ set_task_to_edit, taskToEdit } = {}) {
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
  }

  const store = createStore({
    state,
    actions,
  });

  return [store, { actions }];
}
