import {
  ADD_TASK,
  SET_TASKS,
  SET_TASKS_CATEGORIES,
  SET_TASKS_CATEGORIES_DATA,
  SET_TASK,
  SET_TASK_TO_EDIT,
  DELETE_TASK,
  ROLLBACK_STATE,
  BACKUP_STATE,
  UPDATE_TASKS,
  UPDATE_TASK_ACTIVITY
} from './constants';

export default {
  [ADD_TASK]: (state, task) => {
    state.tasks[task.category].push(task);
  },
  [SET_TASKS]: (state, tasks) => {
    Object.keys(state.tasks)
      .forEach((category) => {
        const tasksByCategory = tasks.filter((task) => task.category === category);
        state.tasks[category] = tasksByCategory.sort((a, b) => a.order - b.order);
      });
  },
  [SET_TASKS_CATEGORIES]: (state, categories) => {
    categories.forEach((cat) => state.tasks[cat.name] = []);
  },
  [SET_TASKS_CATEGORIES_DATA]: (state, categories) => {
    categories.forEach((cat) => state.categories[cat.name] = cat);
  },
  [SET_TASK]: (state, { task, targetIndex }) => {
    const index = targetIndex || state.tasks[task.category].findIndex((aTask) => aTask.id === task.id);
    state.tasks[task.category][index] = task;
  },
  [SET_TASK_TO_EDIT]: (state, task) => {
    state.taskToEdit = task;
  },
  [DELETE_TASK]: (state, {task, category}) => {
    state.tasks[category] = state.tasks[category].filter((aTask) => aTask.id !== task.id);
  },
  [ROLLBACK_STATE]: (state) => {
    Object.assign(state, JSON.parse(JSON.stringify(state.prevState)));
  },
  [BACKUP_STATE]: (state, currentState) => {
    state.prevState = JSON.parse(JSON.stringify(currentState));
  },
  [UPDATE_TASKS]: (state, {tasks, category}) => {
    state.tasks[category] = tasks;
  },
  [UPDATE_TASK_ACTIVITY]: (state, tasks) => {
    if (!Array.isArray(tasks)) {
      tasks = [tasks];
    }
    tasks.forEach((task) => {
      const found = state.tasks[task.category].find((aTask) => aTask.id === task.id);
      found.activity = task.activity;
    });
  }
};
