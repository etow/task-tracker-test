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
  SET_TASK,
  FETCH_TASKS_CATEGORIES,
  FETCH_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  ROLLBACK_STATE,
  BACKUP_STATE,
  UPDATE_TASKS,
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
jest.spyOn(mutations, UPDATE_TASKS);
jest.spyOn(mutations, SET_TASK);
jest.spyOn(mutations, ROLLBACK_STATE);
jest.spyOn(mutations, BACKUP_STATE);


const storeTasks = {
  Planned: [
    { id: 1, name: 'Task1', category: 'Planned', order: 0, activity: {}, estimate: 0 },
    { id: 2, name: 'Task2', category: 'Planned', order: 1, activity: {}, estimate: 0 },
    { id: 3, name: 'Task3', category: 'Planned', order: 2, activity: {}, estimate: 0 },
  ],
  'In Progress': [],
  Completed: [],
};

describe('Store Actions', () => {
  it('fetch tasks categories', async () => {
    const store = mockStore();
    const categories = [
      { name: 'Planned', color: '#F288B9' },
      { name: 'In progress', color: '#62B7D9' },
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
      { id: 1, name: 'Task1', category: 'Planned', order: 0, activity: {}, estimate: 0 },
      { id: 2, name: 'Task2', category: 'In Progress', order: 1, activity: {}, estimate: 0 },
      { id: 3, name: 'Task3', color: 'Completed', order: 2, activity: {}, estimate: 0 },
    ];
    taskRepository.get = jest.fn(() => Promise.resolve({ data: tasks }));
    store.dispatch(FETCH_TASKS);
    expect(taskRepository.get).toHaveBeenCalled();
    await flushPromises();
    expect(mutations[SET_TASKS]).toHaveBeenCalledWith(expect.anything(), tasks);
  });

  it('deletes a task', async () => {
    const store = mockStore();
    const task = storeTasks.Planned[0];
    store.dispatch(DELETE_TASK, { task, category: task.category });
    expect(mutations[DELETE_TASK]).toHaveBeenCalledWith(expect.anything(), { task, category: task.category });
    expect(store.state.tasks.Planned.length).toEqual(2);
    expect(taskRepository.delete).toHaveBeenCalledWith(task.id);
  });

  describe('Update', () => {
    test('if task category was changed, it deletes the task from  the old category and adds it to the new category', () => {
      const store = mockStore();
      const taskToDelete = storeTasks.Planned[0];
      const taskToUpdate = { ...storeTasks.Planned[0], category: 'In Progress' }

      store.dispatch(UPDATE_TASK, { task: taskToUpdate, prevCategory: taskToDelete.category });

      expect(mutations[DELETE_TASK]).toHaveBeenCalledWith(expect.anything(), { task: taskToUpdate, category: taskToDelete.category });
      expect(mutations[ADD_TASK]).toHaveBeenCalledWith(expect.anything(), taskToUpdate);
      expect(taskRepository.update).toHaveBeenCalledWith(taskToUpdate);
    });

    test('if task category still the same, update the task', () => {
      const store = mockStore({ tasks: storeTasks, taskToEdit: storeTasks.Planned[0] });
      const taskToUpdate = { ...storeTasks.Planned[0], name: 'new name' };
      store.dispatch(UPDATE_TASK, { task: taskToUpdate });
      expect(mutations[SET_TASK]).toHaveBeenCalledWith(expect.anything(), { task: taskToUpdate, targetIndex: 0 });
      expect(taskRepository.update).toHaveBeenCalledWith(taskToUpdate);
    });

    test('if tasks were changed, update tasks order', () => {
      const store = mockStore();
      const updatedTasks = [];
      updatedTasks[0] = storeTasks.Planned[2];
      updatedTasks[1] = storeTasks.Planned[1];
      updatedTasks[2] = storeTasks.Planned[0];

      const expectedOrder = [
        {...storeTasks.Planned[2], order: 0},
        {...storeTasks.Planned[1], order: 1},
        {...storeTasks.Planned[0], order: 2},
      ];

      store.dispatch(UPDATE_TASKS, { tasks: updatedTasks, category: 'Planned' });
      expect(mutations[UPDATE_TASKS]).toHaveBeenCalledWith(expect.anything(), { tasks: expectedOrder, category: 'Planned' });
      expect(taskRepository.update).toHaveBeenCalledWith(expectedOrder);
    })
  })

  it('creates a new task', async () => {
    const store = mockStore();
    const newTask = {
      name: 'new task',
      category: 'Planned',
      estimate: 0,
      activity: {},
    }
    store.dispatch(CREATE_TASK, newTask);
    const taskToBeCreated = { ...newTask, id: expect.anything(), order: 3 };
    expect(mutations[ADD_TASK]).toHaveBeenCalledWith(expect.anything(), taskToBeCreated);
    expect(taskRepository.create).toHaveBeenCalledWith(taskToBeCreated);
  });

  it('restores the state', async () => {
    const store = mockStore();
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

function mockStore({ tasks, categories = {}, taskToEdit = {}} = {}) {
  return createStore({
    state: {
      tasks: tasks || JSON.parse(JSON.stringify(storeTasks)),
      categories,
      taskToEdit,
    },
    mutations,
    actions,
  });
}
