import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Activity from './Activity.vue';

import { SET_TASK_TO_EDIT } from '../../store/constants';

const tasks = [
  {
    name: 'test1',
    category: 'Planned',
    order: 0,
    estimate: 0,
    activity: {
      Planned: [{ started: 0, finished: 900000 }, { started: 0, finished: 9000000 }],
      'In Progress': [{ started: 0, finished: 600000 }],
      Completed: [{ started: 0, finished: 600000 }],
    },
  },
  {
    name: 'test2',
    category: 'Completed',
    order: 0,
    estimate: 0,
    activity: {
      Planned: [{ started: 0, finished: 900000 }, { started: 0, finished: 9000000 }],
      'In Progress': [{ started: 0, finished: 600000 }],
    },
  },
  {
    name: 'test3',
    category: 'Completed',
    order: 0,
    estimate: 0,
    activity: {
      Planned: [{ started: 0, finished: 900000 }, { started: 0, finished: 9000000 }],
      'In Progress': [{ started: 0 }],
    },
  },
];

describe('Activity.vue', () => {
  it('renders tasks Planned and In Progress', async () => {
    const [store] = mockStore({ taskToEdit: tasks[0] });
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders tasks Planned and In Progress and Completed', async () => {
    const [store] = mockStore({ taskToEdit: tasks[1] });
    const wrapper = createWrapper((dataToMount) => {
      dataToMount.global.plugins = [store];
      return dataToMount;
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('getTimeElapsed', () => {
    it('calculates a single activity', async () => {
      const result = Activity.methods.getTimeElapsed.call({
        activityData: {
          Planned: [{
            started: 0, finished: 900000,
          }],
        },
      }, 'Planned');

      expect(result).toEqual('15 minutes');
    });

    it('it calculates the sum of activity', async () => {
      const result = Activity.methods.getTimeElapsed.call({
        activityData: {
          Planned: [
            {
              started: 0, finished: 900000,
            },
            {
              started: 0, finished: 900000,
            },
          ],
        },
      }, 'Planned');

      expect(result).toEqual('30 minutes');
    });

    it('it completes the finished time it it is not finished yet', async () => {

      const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => 900000);

      const result = Activity.methods.getTimeElapsed.call({
        activityData: {
          Planned: [
            {
              started: 0,
            },
          ],
        },
      }, 'Planned');

      expect(result).toEqual('15 minutes');
      dateSpy.mockRestore();
    });

    it('it calculates hours and minutes', async () => {
      const result = Activity.methods.getTimeElapsed.call({
        activityData: {
          Planned: [
            {
              started: 0, finished: 8100000,
            },
          ],
        },
      }, 'Planned');

      expect(result).toEqual('2 hours, 15 minutes');
    });

    it('it shows hour and minute in singular', async () => {
      const result = Activity.methods.getTimeElapsed.call({
        activityData: {
          Planned: [
            {
              started: 0, finished: 3660000,
            },
          ],
        },
      }, 'Planned');

      expect(result).toEqual('1 hour, 1 minute');
    });
  });
});


const createWrapper = (decorator = (n) => n) => {
  const dataToMount = {
    global: {
      stubs: {
      },
    },
  };

  decorator(dataToMount);
  return shallowMount(Activity, dataToMount);
};

function mockStore({ set_task_to_edit, taskToEdit } = {}) {
  const state = {
    tasks: tasks,
    categories: {
      Planned: { name: 'Planned', color: 'red' },
      'In Progress': { name: 'In Progress', color: 'red' },
      Completed: { name: 'Completed', color: 'red', endOfWorkflow: true },
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
