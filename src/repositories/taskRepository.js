import client from "../__mocks__/mockClient";
const resource = "/tasks";

export default {
  get(id) {
    if (id) {
      return client.get(`${resource}/:${id}`);
    }
    return client.get(resource);
  },
  create(payload) {
    return client.post(resource, payload);
  },
  update(payload) {
    return client.put(`${resource}/:${payload.id}`, payload);
  },
  delete(id) {
    return client.delete(`${resource}/:${id}`);
  },
}
