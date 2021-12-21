import { shallowMount, flushPromises } from '@vue/test-utils';
import { ElMessage } from 'element-plus';
import Board from './Board.vue';
import { createStore } from 'vuex';
import { FETCH_TASKS_CATEGORIES, FETCH_TASKS } from '../../store/constants';

let loadingValue = true;

jest.mock('element-plus', () => ({
  ElMessage: jest.fn(),
  ElLoading: { service: jest.fn(() => ({ close: jest.fn(() => loadingValue = false) })) },
}));

describe('Board.vue', () => {
  it('renders correctly',  async () => {
    // mock store
    const [store] = mockStore();
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('fetch tasks and categories',  async () => {
    // mock store
    const [store, { actions }] = mockStore();

    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    await flushPromises();
    expect(actions[FETCH_TASKS_CATEGORIES]).toHaveBeenCalled();
    expect(actions[FETCH_TASKS]).toHaveBeenCalled();
    await flushPromises();
    expect(loadingValue).toBe(false);
  });

  it('handles error if fetch fails',  async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const [store, { actions }] = mockStore({ fetch_tasks_categories: jest.fn(() => Promise.reject('error'))});

    createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    expect(actions[FETCH_TASKS_CATEGORIES]).toHaveBeenCalled();
    await flushPromises();

    expect(console.error).toHaveBeenCalled();
    expect(ElMessage).toHaveBeenCalledWith({
      message: 'Something went wrong while fetching tasks, please try again',
      type: 'error',
      duration: 5000,
    });
    console.error.mockRestore();
  });
});

// create wrapper helper
const createWrapper = (decorator = (n) => n) => {
  const dataToMount = {
    global: {
      directives: {
        loading() {},
      },
    },
  };

  decorator(dataToMount);
  return shallowMount(Board, dataToMount);
};

// mock store helper
function mockStore({ fetch_tasks_categories, fetch_tasks } = {}) {
  const state = {
    tasks: {
      pending: [],
      inprogress: [],
      completed: [],
    }
  };

  const actions = {
    [FETCH_TASKS_CATEGORIES]: fetch_tasks_categories || jest.fn(() => Promise.resolve()),
    [FETCH_TASKS]: fetch_tasks || jest.fn(() => Promise.resolve()),
  }

  const store = createStore({
    state,
    actions,
  });

  return [store, { actions }];
}
