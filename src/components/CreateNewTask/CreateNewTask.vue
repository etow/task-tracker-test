<template>
  <div class="create-new-task">
    <ElInput
      v-show="editMode"
      ref="textInputRef"
      v-model="task.name"
      type="text"
      @blur="handleBlur"
      @keypress="handleKeyPress" />
    <div v-show="!editMode" style="text-align: center;">
      <ElButton round @click="enableEditMode">
        +
      </ElButton>
    </div>
  </div>
</template>

<script>
import { CREATE_TASK, ROLLBACK_STATE } from '../../store/constants';
import { ElMessage, ElInput, ElButton } from 'element-plus';

export default {
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  components: {
    ElInput,
    ElButton,
  },
  data() {
    return {
      editMode: false,
      task: { name: '', category: this.category },
      taskCreated: false,
    };
  },
  methods: {
    createNewTask() {
      this.editMode = false;
      // prevent creating task twice (enter + blur);
      if (this.taskCreated) return;
      // if name is empty, do not create task
      if (trimSpaces(this.task.name) !== '') {
        this.taskCreated = true;
        this.$store.dispatch(CREATE_TASK, this.task)
          .then(() => this.taskCreated = false)
          .catch((err) => {
            console.error(err.message);
            ElMessage({
              message: 'Something went wrong while trying to create a new task, please try again',
              type: 'error',
              duration: 5000,
            });
            this.$store.dispatch(ROLLBACK_STATE);
          })
          .finally(() => this.taskCreated = false);
      }
    },
     handleBlur() {
       this.createNewTask();
     },
     handleKeyPress(e) {
       if (e.key === 'Enter') this.createNewTask();
     },
     enableEditMode() {
      this.editMode = true;
      this.task = { name: '', category: this.category };
      this.$refs.textInputRef.focus();
     },
  },
};

const trimSpaces = (str) => {
  let trimmed = str.trim();
  trimmed.replace(new RegExp(String.fromCharCode(160), 'g'), '');
  trimmed = trimmed.replace(/\s+/g, ' ');
  return trimmed;
};
</script>
<style lang="scss" scoped>
  ::v-deep(.el-input__inner) {
    border-radius: 15px;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.05) 0px 2px 8px 0px;
    height: 58px;
    line-height: 58px;
  }
</style>
