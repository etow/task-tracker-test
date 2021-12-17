import { GET, POST, PUT, DELETE } from './mockServer';

const handleResponse = async (cb) => {
  const response = await cb();

  if (response.status == 'success') {
    return Promise.resolve(response);
  }

  if (response.status == 'fail') {
    throw new Error(response.data.title);
  }

  if ( response.status == 'error') {
    throw new Error(response.message);
  }
}

export default {
  get(resourcePath) {
    return handleResponse(() => GET(resourcePath));
  },
  post(resourcePath, payload) {
    return handleResponse(() => POST(resourcePath, payload));
  },
  delete(resourcePath) {
    return handleResponse(() => DELETE(resourcePath));
  },
  put(resourcePath, payload) {
    return handleResponse(() => PUT(resourcePath, payload));
  }
}
