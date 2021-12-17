import { shallowMount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import BoardColumn from './BoardColumn.vue';
import { ElMessage } from 'element-plus'
import { SET_TASK_TO_EDIT, UPDATE_TASK, ROLLBACK_STATE } from '../../store/constants';

jest.mock('element-plus', () => ({
  ElMessage: jest.fn(),
}));

const tasks = [
  { name: 'test1', category: 'Planned', order: 1000, }, // 0
  { name: 'test2', category: 'Planned', order: 2000, }, // 1
  { name: 'test3', category: 'Planned', order: 3000 }, // 2
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
  })

  describe('calculates new order of item dragged', () => {
    test('item dragged does not trigger changes if event is different from moved or added', async () => {
      // mock store
      const [store, { actions }] = mockStore();

      const wrapper = createWrapper((dataToMount) => {
        dataToMount.global.plugins = [store];
        return dataToMount;
      });

      // call drag change with some event
      wrapper.vm.dragChange({ someEvent: {}});

      expect(actions[UPDATE_TASK]).toHaveBeenCalledTimes(0);
    });

    test('item dragged from first position to last position gets order updated correctly', async () => {
      const [store, { actions }] = mockStore();
      const wrapper = createWrapper((dataToMount) => {
        dataToMount.global.plugins = [store];
        return dataToMount;
      });

      const task = {...tasks[0]};
      const expectedTask = {...tasks[0]};
      expectedTask.order = tasks[2].order + 1;

      // call dragChange with moved event
      wrapper.vm.dragChange({
        moved: {
          element: task, // first position
          newIndex: 3, // last position
        }
      });

      expect(actions[UPDATE_TASK]).toHaveBeenCalledWith(expect.anything(), {task: expectedTask, prevCategory: 'Planned'});
    });

    test('item dragged from middle position to first position gets order updated correctly', async () => {
      const [store, { actions }] = mockStore();
      const wrapper = createWrapper((dataToMount) => {
        dataToMount.global.plugins = [store];
        return dataToMount;
      });

      const task = {...tasks[1]};
      const expectedTask = {...tasks[1]};
      expectedTask.order = tasks[1].order - 1;

      // call dragChange with moved event
      wrapper.vm.dragChange({
        moved: {
          element: task, // middle position
          newIndex: 0, // first position
        }
      });

      expect(actions[UPDATE_TASK]).toHaveBeenCalledWith(expect.anything(), {task: expectedTask, prevCategory: 'Planned'});
    });

    test('item dragged from last position to middle position gets order updated correctly', async () => {
      const [store, { actions }] = mockStore();
      const wrapper = createWrapper((dataToMount) => {
        dataToMount.global.plugins = [store];
        return dataToMount;
      });

      const task = {...tasks[2]};
      const expectedTask = {...tasks[2]};
      expectedTask.order = tasks[0].order + 1;

      wrapper.vm.dragChange({
        moved: {
          element: task, // last position
          newIndex: 1, // middle
        }
      });

      expect(actions[UPDATE_TASK]).toHaveBeenCalledWith(expect.anything(), { task: expectedTask, prevCategory: 'Planned' });
    });
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

  it('it handles error when updating a task', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const [store, { actions }] = mockStore({ update_task: jest.fn(() => Promise.reject('error'))});
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    // call change
    wrapper.vm.dragChange({
      moved: {
        element: tasks[0],
        newIndex: 1,
      }
    });

    expect(actions[UPDATE_TASK]).toHaveBeenCalled();
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
      tasks,
      category: 'Planned',
    },
    global: {},
  };

  decorator(dataToMount);
  return shallowMount(BoardColumn, dataToMount);
};

// mock store helper
function mockStore({ set_task_to_edit, update_task, rollback_state } = {}) {
  const state = {
    categories: {
      Planned: { color: 'red' },
    },
  };

  const actions = {
    [SET_TASK_TO_EDIT]: set_task_to_edit || jest.fn(() => Promise.resolve()),
    [UPDATE_TASK]: update_task || jest.fn(() => Promise.resolve()),
    [ROLLBACK_STATE]: rollback_state || jest.fn(() => Promise.resolve()),
  }

  const store = createStore({
    state,
    actions,
  });

  return [store, { actions }];
}
