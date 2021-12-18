import client from "../__mocks__/mockClient";
const resource = "/tasks";

export default {
  get() {
    return client.get(resource);
  },
  create(payload) {
    return client.post(resource, JSON.parse(JSON.stringify(payload)));
  },
  update(payload) {
    if (payload.id) {
      return client.put(`${resource}/:${payload.id}`, JSON.parse(JSON.stringify(payload)));
    }
    return client.put(`${resource}`, JSON.parse(JSON.stringify(payload)));
  },
  updateOrder(payload) {
    client.put(`${resource}`, JSON.parse(JSON.stringify(payload)));
  },
  delete(id) {
    return client.delete(`${resource}/:${id}`);
  },
};
