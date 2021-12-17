
/**
 * INITIALIZE DB
 **/
const DB_KEY = 'task-tracker';
const DB = {
  categories: [
    { name: 'Planned', color: '#F288B9' },
    { name: 'In progress', color: '#62B7D9'},
    { name:'Completed', color: '#58A664' }
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
}

const getPathArray = (path) => {
  const pathArray = path.split('/');
  return pathArray.map((path) => path.replace(':','')).slice(1);
};

const save = (state) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

const asPromise = (response) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(response), 500);
  })
}

/**
 * RESPONSES
 */
 const successResponse = (data) => {
  return asPromise({ data, status: 'success' });
}

const failResponse = (message) => {
  return asPromise({ data: {title: message}, status: 'fail' })
}

const errorResponse = (err) => {
  return asPromise({ message: err.message, status: 'error'});
}

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
}

export const POST = (resourcePath, payload) => {
  try {
    const [resource] = getPathArray(resourcePath);
    const [collection, state] = getCollection(resource);
    if (!collection) {
      return failResponse('Collection not found');
    }

    collection.push(payload);
    save(state);
    return successResponse(payload);
  } catch (err) {
    return errorResponse(err);
  }
}

export const DELETE = (resourcePath) => {
  try {
    const [resource, id] = getPathArray(resourcePath);
    let [collection, state] = getCollection(resource)
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
}

export const PUT = (resourcePath, payload) => {
  try {
    const [resource, id] = getPathArray(resourcePath);
    if (id) {
      const [collection, state] = getCollection(resource)
      if (!collection) {
        return failResponse('Collection not found');
      }
      const itemIndex = collection.findIndex((anItem) => anItem.id === id);
      if (itemIndex >= 0) collection[itemIndex] = payload;
      save(state)
      return successResponse(payload);
    } else {
      return failResponse('Id is required');
    }
  } catch (err) {
    return errorResponse(err);
  }
}
