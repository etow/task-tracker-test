<template>
  <div class="board">
    <BoardColumn
      v-for="category in Object.keys(tasks)"
      :key="category"
      :category="category"
      :tasks="tasks[category]" />
  </div>
</template>

<script>
import BoardColumn from '../BoardColumn/BoardColumn.vue';
import { FETCH_TASKS_CATEGORIES, FETCH_TASKS, ROLLBACK_STATE } from '../../store/constants';
import { ElMessage, ElLoading } from 'element-plus';

export default {
  name: "Board",
  data() {
    return {
      loading: false,
    }
  },
  components: {
    BoardColumn,
  },
  computed: {
    tasks() {
      return this.$store.state.tasks;
    }
  },
  created() {
    this.loading = ElLoading.service();
    this.$store.dispatch(FETCH_TASKS_CATEGORIES)
      .then(() => this.$store.dispatch(FETCH_TASKS))
      .catch((err) => {
        console.error(err.message);
        ElMessage({
          message: 'Something went wrong while fetching tasks, please try again',
          type: 'error',
          duration: 5000,
        });
        this.$store.dispatch(ROLLBACK_STATE);
      })
      .finally(() => this.loading.close());
  },
};
</script>

<style lang="scss" scoped>
.board {
  display: flex;
  height: 100%;
}
</style>
