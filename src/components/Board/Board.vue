<template>
  <div class="board" v-loading="loading">
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
import { ElMessage } from 'element-plus';

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
    this.loading = true;
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
      .finally(() => this.loading = false);
  },
};
</script>

<style lang="scss" scoped>
.board {
  display: flex;
  height: 100%;
  background: linear-gradient(-45deg, rgb(245, 247, 248), rgb(237, 241, 242) 100%);
}
</style>
