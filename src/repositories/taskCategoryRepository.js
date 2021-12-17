import client from "../__mocks__/mockClient";
const resource = "/categories";

export default {
  get() {
    return client.get(resource);
  },
}
