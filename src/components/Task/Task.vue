<template>
  <div class="task">
    <div>{{ task.name }}</div>
    <div v-if="task.estimate" class="task__estimate">
      {{ task.estimate }}
    </div>
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

<style lang="scss" scoped>
  .task {
    border-radius: 15px;
    background-color: #fff;
    padding: 20px;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.05) 0px 2px 8px 0px;
    display: flex;
    &__estimate {
      background-color: #eaeaea;
      border-radius: 5px;
      padding: 2px 5px;
      margin-left: auto;
      font-size: 12px;
    }
  }
</style>
