<template>
  <div class="board__column">
    <div class="board__column__header" :style="{ backgroundColor: getCategoryColor(category) }">
      {{ category }}
    </div>
    <div class="board__column__body">
      <Draggable
        :list="list"
        group="tasks"
        item-key="id"
        @change="dragChange">
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
import { SET_TASK_TO_EDIT, UPDATE_TASK, ROLLBACK_STATE } from '../../store/constants';


export default {
  data() {
    return {
      list: [],
    };
  },
  props: {
    category: {
      type: String,
      required: true,
    },
    tasks: {
      type: Array,
      required: true,
    },
  },
  components: {
    Task,
    CreateNewTask,
    Draggable,
  },
  watch: {
    tasks: {
      handler(tasks) {
        this.list = JSON.parse(JSON.stringify(tasks));
      },
      deep: true,
      inmediate: true,
    }
  },
  computed: {
    categories() {
      return this.$store.state.categories;
    },
  },
  methods: {
    getCategoryColor(category) {
      return this.categories[category].color;
    },
    dragChange(evt) {
      const action = evt.moved || evt.added;
      if (action) {
        const { element: task, newIndex } = action;
        const prevTask = this.tasks[newIndex - 1];
        const nextTask = this.tasks[newIndex + 1];
        if (prevTask) {
          task.order = prevTask.order + 1;
        } else if (nextTask) {
          task.order = nextTask.order - 1;
        }
        // update task category
        const prevCategory = task.category;
        const taskUpdated = {
          ...task,
          category: this.category,
        }

        this.$store.dispatch(UPDATE_TASK, {task: taskUpdated, prevCategory }).catch((err) => {
          console.error(err.message);
          ElMessage({
            message: 'Something went wrong while trying to update the task, please try again',
            type: 'error',
            duration: 5000,
          });
          this.$store.dispatch(ROLLBACK_STATE);
        });
      }
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
    }
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
