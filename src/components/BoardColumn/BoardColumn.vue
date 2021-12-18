<template>
  <div class="board__column">
    <div class="board__column__header" :style="{ backgroundColor: getCategoryColor(category) }">
      {{ category }}
    </div>
    <div class="board__column__body">
      <Draggable
        v-model="tasks"
        group="tasks"
        item-key="id">
        <template #item="{ element }">
          <Task
            :key="element.id"
            :task="element"
            @click="setTaskToEdit(element)" />
        </template>
        <template #footer>
          <div class="board__column__footer">
            <CreateNewTask :category="category" />
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';
import { ElMessage } from 'element-plus'
import Task from '../Task/Task.vue';
import CreateNewTask from '../CreateNewTask/CreateNewTask.vue';
import { SET_TASK_TO_EDIT, UPDATE_TASKS, ROLLBACK_STATE } from '../../store/constants';


export default {
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  components: {
    Task,
    CreateNewTask,
    Draggable,
  },
  computed: {
    categories() {
      return this.$store.state.categories;
    },
    tasks: {
      get() {
        return this.$store.state.tasks[this.category];
      },
      set(tasks) {
        this.$store.dispatch(UPDATE_TASKS, { tasks, category: this.category })
          .catch((err) => {
            console.error(err.message);
            ElMessage({
              message: 'Something went wrong while trying to update the task, please try again',
              type: 'error',
              duration: 5000,
            });
            this.$store.dispatch(ROLLBACK_STATE);
          });
      },
    },
  },
  methods: {
    getCategoryColor(category) {
      return this.categories[category].color;
    },
    setTaskToEdit(task) {
      this.$store.dispatch(SET_TASK_TO_EDIT, task)
        .catch((err) => {
          console.error(err.message);
          ElMessage({
            message: 'Something went wrong while trying to edit the task, please try again',
            type: 'error',
            duration: 5000,
          });
          this.$store.dispatch(ROLLBACK_STATE);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.board__column {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 200px;

  &:nth-child(2n+1) {
    background-color: rgba(0, 0, 0, 0.02);
  }
  &__header {
    padding: 20px;
    color: white;
    background-color: #000;
  }

  &__body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    padding: 20px;
    > div { // draggable area
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
  }

  .sortable-ghost {
    cursor: grabbing;
  }

  .task {
    margin-bottom: 20px;
  }
}
</style>
