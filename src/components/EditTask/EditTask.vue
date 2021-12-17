<template>
  <div class="create-new-task-form">
    Edit Task
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      form: {
        name: '',
        description: '',
        category: '',
      },
    };
  },
}
</script>
<style lang="scss" scoped>
  /deep/ .form-dialog {
    border-radius: 20px;
  }
</style>
