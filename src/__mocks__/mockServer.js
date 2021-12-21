/* THIS FILE EMULATES A BACKEND SERVER */
import { merge } from 'lodash';
/**
 * INITIALIZE DB
 **/
const DB_KEY = 'task-tracker';
const DB = {
  categories: [
    { name: 'Planned', color: '#F288B9' },
    { name: 'In progress', color: '#62B7D9'},
    { name: 'Completed', color: '#58A664', endOfWorkflow: true, }
  ],
  tasks: [],
}

if (!localStorage.getItem(DB_KEY)) {
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
}

/**
 * HELPERS
 **/
const getCollection = (collection) => {
  const state = JSON.parse(localStorage.getItem(DB_KEY));
  return [state[collection], state];
};

const getPathArray = (path) => {
  const pathArray = path.split('/');
  return pathArray.map((path) => path.replace(':','')).slice(1);
};

const save = (state) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

const asPromise = (response) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(response), 500);
  });
};

/**
 * RESPONSES
 */
 const successResponse = (data) => {
  return asPromise({ data, status: 'success' });
};

const failResponse = (message) => {
  return asPromise({ data: {title: message}, status: 'fail' })
};

const errorResponse = (err) => {
  return asPromise({ message: err.message, status: 'error'});
};

/**
 * METHODS
 */
export const GET = (resourcePath) => {
  try {
    const [resource, id] = getPathArray(resourcePath);
    const [collection] = getCollection(resource) || [];

    if (!id) {
      return successResponse(collection);
    }

    const item = collection.find((anItem) => anItem.id === id);
    if (!item) {
      return failResponse('Item not found');
    }
    return successResponse(item);
  } catch (err) {
    return errorResponse(err);
  }
};

export const POST = (resourcePath, payload) => {
  try {
    const [resource] = getPathArray(resourcePath);
    const [collection, state] = getCollection(resource);
    if (!collection) {
      return failResponse('Collection not found');
    }
    logTime(payload);
    collection.push(payload);
    save(state);
    return successResponse(payload);
  } catch (err) {
    return errorResponse(err);
  }
};

export const DELETE = (resourcePath) => {
  try {
    const [resource, id] = getPathArray(resourcePath);
    let [collection, state] = getCollection(resource);
    if (!collection) {
      return failResponse('Collection not found');
    }
    const taskIndex = collection.findIndex((aTask) => aTask.id === id);
    collection.splice(taskIndex, 1);
    save(state);
    return successResponse(null);
  } catch (err) {
    return errorResponse(err);
  }
};

export const PUT = (resourcePath, payload) => {
  try {
    const [resource, id] = getPathArray(resourcePath);
    const [collection, state] = getCollection(resource);
    if (!collection) {
      return failResponse('Collection not found');
    }
    if (id) {
      const itemIndex = collection.findIndex((anItem) => anItem.id === id);
      if (itemIndex == -1) return failResponse('Task not found');
      const prevState = collection[itemIndex];
      logTime(payload, prevState);
      collection[itemIndex] = merge({}, prevState, payload);
      save(state);
      return successResponse(collection[itemIndex]);
    } else {
      // collect ids to modify
      const ids = payload.map((anItem) => anItem.id);

      // filter tasks that matches with ids and get their collection index
      const tasks = collection.reduce((tasks, task, collectionIndex) => {
        if (ids.includes(task.id)) tasks.push({ task, collectionIndex });
        return tasks;
      }, []);

      // uupdate tasks
      tasks.forEach(({ task, collectionIndex }, taskIndex) => {
        const prevState = task;
        const newState = payload.find((aTask) => aTask.id === task.id);
        logTime(newState, prevState);
        tasks[taskIndex] = merge({}, prevState, newState);
        collection[collectionIndex] = tasks[taskIndex];
      });

      save(state);
      return successResponse(tasks);
    }
  } catch (err) {
    return errorResponse(err);
  }
};

const logTime  = (newState, prevState) => {
  if (!prevState) {
    // initialize time
    newState.activity[newState.category] = [{ started: Date.now() }];
  } else if (prevState && prevState.category !== newState.category) {
    // end record when changing category
    const length = prevState.activity[prevState.category].length;
    prevState.activity[prevState.category][length - 1].finished = Date.now();

    // add newState data
    const activity = merge({}, prevState.activity, newState.activity);

    // initialize activity
    if (!Array.isArray(activity[newState.category])) {
      activity[newState.category] = [];
    }
    // initialize new category
    activity[newState.category].push({ started: Date.now() });

    // update activity
    newState.activity = activity;
  }
}
