<template>
  <div class="task">
    <div>{{ task.name }}</div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
  .task {
    border-radius: 15px;
    background-color: #fff;
    padding: 20px;
    cursor: pointer;
    box-shadow: rgb(0 0 0 / 2%) 0px 0px 0px 1px, rgb(0 0 0 / 5%) 0px 1px 2px 0px, rgb(0 0 0 / 5%) 0px 2px 8px 0px;
  }
</style>
