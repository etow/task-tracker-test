<template>
  <div>
    <ElDialog
      :model-value="showDialog"
      :before-close="handleClose"
      :show-close="false"
      width="30%"
      custom-class="form-dialog"
      center>
      <ElTabs v-model="activeTab">
        <ElTabPane label="Edit task" name="edit">
          <EditTaskForm
            @save="handleClose"
            @cancel="handleClose"
            @delete="handleClose" />
        </ElTabPane>
        <ElTabPane label="Activity" name="activity">
          <Activity />
        </ElTabPane>
      </ElTabs>
    </ElDialog>
  </div>
</template>

<script>
import {
  ElDialog,
  ElTabs,
  ElTabPane,
} from 'element-plus';
import Activity from '../Activity/Activity.vue';
import EditTaskForm from '../EditTaskForm/EditTaskForm.vue';
import { SET_TASK_TO_EDIT } from '../../store/constants';

export default {
  data() {
    return {
      activeTab: 'edit',
      showDialog: false,
    };
  },
  components: {
    ElDialog,
    ElTabs,
    ElTabPane,
    Activity,
    EditTaskForm,
  },
  watch: {
    taskToEdit: {
      handler(task) {
        if (Object.keys(task).length) {
          this.showDialog = true;
          this.activeTab = 'edit';
        }
      },
      inmediate: true,
    },
  },
  computed: {
    taskToEdit() {
      return this.$store.state.taskToEdit;
    },
  },
  methods: {
    handleClose() {
      this.showDialog = false;
      this.$nextTick(() => {
        this.$store.dispatch(SET_TASK_TO_EDIT, {});
      });
    },
  },
};
</script>
<style lang="scss" scoped>
  ::v-deep(.el-dialog__header) {
    display: none;
  }
  ::v-deep(.form-dialog) {
    border-radius: 20px;
  }
  ::v-deep(.el-tabs__content) {
    padding-top: 20px;
  }
</style>
