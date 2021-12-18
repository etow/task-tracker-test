import taskRepository from '../repositories/taskRepository';
import taskCategoryRepository from '../repositories/taskCategoryRepository';
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
  UPDATE_TASKS,
} from './constants';

export default {
  [FETCH_TASKS_CATEGORIES]: ({ commit }) => {
    return taskCategoryRepository.get()
      .then((response) => {
        commit(SET_TASKS_CATEGORIES, response.data);
        commit(SET_TASKS_CATEGORIES_DATA, response.data);
      });
  },
  [FETCH_TASKS]: ({ commit }) => {
    return taskRepository.get()
      .then((response) => commit(SET_TASKS, response.data));
  },
  [CREATE_TASK]: ({ commit, state }, newTask) => {
    commit(BACKUP_STATE, state);
    const task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 6),
      order: state.tasks[newTask.category].length,
    };
    commit(ADD_TASK, task);
    return taskRepository.create(task);
  },
  [DELETE_TASK]: ({ commit, state }, {task, category}) => {
    commit(BACKUP_STATE, state);
    commit(DELETE_TASK, {task, category});
    commit(SET_TASK_TO_EDIT, {});
    return taskRepository.delete(task.id);
  },
  [UPDATE_TASK]: ({ commit, state }, {task, prevCategory}) => {
    commit(BACKUP_STATE, state);
    if (prevCategory && task.category !== prevCategory) {
      commit(DELETE_TASK, { task, category: prevCategory });
    }
    const targetIndex = state.tasks[task.category].findIndex((aTask) => aTask.id === task.id);
    if (targetIndex >= 0) {
      commit(SET_TASK, { task, targetIndex });
    } else {
      const order = state.tasks[task.category].length;
      commit(ADD_TASK, { ...task, order });
    }
    commit(SET_TASK_TO_EDIT, {})
    return taskRepository.update(task);
  },
  [UPDATE_TASKS]: ({ commit, state }, { tasks, category }) => {
    commit(BACKUP_STATE, state);
    tasks.forEach((task, index) => {
      task.category = category;
      task.order = index;
    });
    commit(UPDATE_TASKS, { tasks, category });

    return taskRepository.update(tasks);
  },
  [SET_TASK_TO_EDIT]: ({ commit, state}, task) => {
    commit(BACKUP_STATE, state);
    commit(SET_TASK_TO_EDIT, task);
  },
  [ROLLBACK_STATE]: ({ commit }) => {
    commit(ROLLBACK_STATE);
  },
};
