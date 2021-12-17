import { flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import taskRepository from '../repositories/taskRepository';
import taskCategoryRepository from '../repositories/taskCategoryRepository';
import actions from './actions';
import mutations from './mutations';

import {
  SET_TASKS_CATEGORIES,
  SET_TASKS_CATEGORIES_DATA,
  SET_TASKS,
  ADD_TASK,
  DELETE_TASK,
  SET_TASK_TO_EDIT,
  SET_TASK,
  FETCH_TASKS_CATEGORIES,
  FETCH_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  ROLLBACK_STATE,
  BACKUP_STATE,
} from './constants';


taskRepository.get = jest.fn(() => Promise.resolve());
taskRepository.create = jest.fn(() => Promise.resolve());
taskRepository.update = jest.fn(() => Promise.resolve());
taskRepository.delete = jest.fn(() => Promise.resolve());

jest.spyOn(mutations, SET_TASKS_CATEGORIES);
jest.spyOn(mutations, SET_TASKS_CATEGORIES_DATA);
jest.spyOn(mutations, SET_TASKS);
jest.spyOn(mutations, ADD_TASK);
jest.spyOn(mutations, DELETE_TASK);
jest.spyOn(mutations, SET_TASK_TO_EDIT);
jest.spyOn(mutations, SET_TASK);
jest.spyOn(mutations, ROLLBACK_STATE);
jest.spyOn(mutations, BACKUP_STATE);


function mockStore({ tasks = {}, categories = {}, taskToEdit = {}} = {}) {
  return createStore({
    state: {
      tasks,
      categories,
      taskToEdit,
    },
    mutations,
    actions,
  });
}

describe('Store Actions', () => {
  it('fetch tasks categories', async () => {
    const store = mockStore();
    const categories = [
      { name: 'Planned', color: '#F288B9' },
      { name: 'In progress', color: '#62B7D9'},
      { name:'Completed', color: '#58A664' }
    ];
    taskCategoryRepository.get = jest.fn(() => Promise.resolve({ data: categories }));
    store.dispatch(FETCH_TASKS_CATEGORIES);
    expect(taskCategoryRepository.get).toHaveBeenCalled();
    await flushPromises();
    expect(mutations[SET_TASKS_CATEGORIES]).toHaveBeenCalledWith(expect.anything(), categories);
    expect(mutations[SET_TASKS_CATEGORIES_DATA]).toHaveBeenCalledWith(expect.anything(), categories);
  });

  it('fetch tasks', async () => {
    const store = mockStore();
    const tasks = [
      { id: 1, name: 'Task1', category: 'Planned', order: 1000 },
      { id: 2, name: 'Task2', category: 'In Progress', order: 2000 },
      { id: 3, name: 'Task3', color: 'Completed', order: 3000 }
    ];
    taskRepository.get = jest.fn(() => Promise.resolve({ data: tasks }));
    store.dispatch(FETCH_TASKS);
    expect(taskRepository.get).toHaveBeenCalled();
    await flushPromises();
    expect(mutations[SET_TASKS]).toHaveBeenCalledWith(expect.anything(), tasks);
  });

  it('deletes a task', async () => {
    const storeTasks = {
      Planned: [
        { id: 1, name: 'Task1', category: 'Planned', order: 1000 },
        { id: 2, name: 'Task2', category: 'Planned', order: 2000 },
        { id: 3, name: 'Task3', category: 'Planned', order: 3000 }
      ],
    };

    const storeD = mockStore({ tasks: storeTasks });
    const task = storeTasks.Planned[0];

    storeD.dispatch(DELETE_TASK, { task, category: task.category });
    expect(mutations[DELETE_TASK]).toHaveBeenCalledWith(expect.anything(), { task, category: task.category });
    expect(mutations[SET_TASK_TO_EDIT]).toHaveBeenCalledWith(expect.anything(), {});
    expect(storeTasks.Planned.length).toEqual(2);
    expect(taskRepository.delete).toHaveBeenCalledWith(task.id);
  });

  describe('Update', () => {
    test('if task category was changed, it deletes the task from  the old category and adds it to the new category', () => {
      const storeTasks = {
        Planned: [
          { id: 1, name: 'Task1', category: 'Planned', order: 1000 },
          { id: 2, name: 'Task2', category: 'Planned', order: 2000 },
          { id: 3, name: 'Task3', category: 'Planned', order: 3000 }
        ],
        'In Progress': [],
        Completed: [],
      };
      const storeU = mockStore({ tasks: storeTasks, taskToEdit: storeTasks.Planned[0] });
      const taskToDelete = storeTasks.Planned[0];
      const taskToUpdate = { ...storeTasks.Planned[0], category: 'In Progress' }

      storeU.dispatch(UPDATE_TASK, { task: taskToUpdate, prevCategory: taskToDelete.category });
      expect(mutations[DELETE_TASK]).toHaveBeenCalledWith(expect.anything(), { task: taskToDelete, category: taskToDelete.category });
      expect(mutations[ADD_TASK]).toHaveBeenCalledWith(expect.anything(), taskToUpdate);
      expect(mutations[SET_TASK_TO_EDIT]).toHaveBeenCalledWith(expect.anything(), {});
      expect(taskRepository.update).toHaveBeenCalledWith(taskToUpdate);
    });

    test('if task category still the same, update the task', () => {
      const storeTasks = {
        Planned: [
          { id: 1, name: 'Task1', category: 'Planned', order: 1000 },
          { id: 2, name: 'Task2', category: 'Planned', order: 2000 },
          { id: 3, name: 'Task3', category: 'Planned', order: 3000 }
        ],
      };
      const storeU = mockStore({ tasks: storeTasks, taskToEdit: storeTasks.Planned[0] });
      const taskToUpdate = { ...storeTasks.Planned[0], name: 'new name' };
      storeU.dispatch(UPDATE_TASK, { task: taskToUpdate });
      expect(mutations[SET_TASK]).toHaveBeenCalledWith(expect.anything(), { task: taskToUpdate, targetIndex: 0 });
      expect(mutations[SET_TASK_TO_EDIT]).toHaveBeenCalledWith(expect.anything(), {});
      expect(taskRepository.update).toHaveBeenCalledWith(taskToUpdate);
    });
  })

  it('creates a new task', async () => {
    const storeTasks = {
      Planned: [
        { id: 1, name: 'Task1', category: 'Planned', order: 1000 },
        { id: 2, name: 'Task2', category: 'Planned', order: 2000 },
        { id: 3, name: 'Task3', category: 'Planned', order: 3000 }
      ],
    };
    const store = mockStore({ tasks: storeTasks });
    const newTask = {
      name: 'new task',
      category: 'Planned',
    }
    store.dispatch(CREATE_TASK, newTask);
    const taskToBeCreated = { ...newTask, id: expect.anything(), order: 4000 };
    expect(mutations[ADD_TASK]).toHaveBeenCalledWith(expect.anything(), taskToBeCreated);
    expect(taskRepository.create).toHaveBeenCalledWith(taskToBeCreated);
  });

  it('restores the state', async () => {
    const storeTasks = {
      Planned: [
        { id: 1, name: 'Task1', category: 'Planned', order: 1000 },
        { id: 2, name: 'Task2', category: 'Planned', order: 2000 },
        { id: 3, name: 'Task3', category: 'Planned', order: 3000 }
      ],
    };
    const store = mockStore({ tasks: storeTasks });
    const newTask = {
      name: 'new task',
      category: 'Planned',
    }
    store.dispatch(CREATE_TASK, newTask);

    expect(store.state.tasks.Planned.length).toBe(4);
    expect(mutations[BACKUP_STATE]).toHaveBeenCalled();
    store.commit(ROLLBACK_STATE);
    expect(store.state.tasks.Planned.length).toBe(3);
  });
});
