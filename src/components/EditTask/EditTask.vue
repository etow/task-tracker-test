<template>
  <div class="create-new-task-form">
    <ElDialog
      :model-value="Object.keys(taskToEdit).length"
      :show-close="false"
      :before-close="handleCancel"
      width="30%"
      custom-class="form-dialog"
      center>
      <ElForm
        v-loading="loading"
        :model="form"
        ref="form"
        :rules="formValidation"
        label-width="120px"
        label-position="left">
        <ElFormItem label="Name" prop="name">
          <ElInput v-model="form.name" />
        </ElFormItem>
        <ElFormItem label="Description" prop="description">
          <ElInput v-model="form.description" type="textarea" />
        </ElFormItem>
        <ElFormItem label="Status" prop="category">
          <ElSelect v-model="form.category" style="width: 100%">
            <ElOption v-for="category in categories" :key="category.name" :value="category.name" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem style="margin-left: -120px; padding-top: 20px;">
          <div style="display: flex;width: 100%;">
            <ElPopconfirm
              title="Are you sure to delete this task?"
              hide-icon="true"
              confirm-button-type="danger"
              @confirm="handleDelete">
              <template #reference>
                <ElButton type="text" style="color: #f56c6c;">Delete</ElButton>
              </template>
            </ElPopconfirm>
            <div style="margin-left: auto;">
              <ElButton @click="handleCancel">Cancel</ElButton>
              <ElButton type="primary" @click="handleSave">Save</ElButton>
            </div>
          </div>
        </ElFormItem>
      </ElForm>
    </ElDialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import { UPDATE_TASK, DELETE_TASK, SET_TASK_TO_EDIT, ROLLBACK_STATE } from '../../store/constants';

export default {
  data() {
    return {
      loading: false,
      form: {
        name: '',
        description: '',
        category: '',
      },
      formValidation: {
        name: [
          {
            required: true,
            message: 'Name is required',
            trigger: 'blur',
          },
        ],
      }
    };
  },
  watch: {
    taskToEdit: {
      handler(task) { this.form = { ...task} },
      inmediate: true,
    },
  },
  computed: {
    categories() {
      return Object.values(this.$store.state.categories);
    },
    taskToEdit() {
      return this.$store.state.taskToEdit;
    },
  },
  methods: {
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store.dispatch(UPDATE_TASK, { task: this.form, prevCategory: this.taskToEdit.category })
          .catch((err) => {
            console.error(err.message);
            ElMessage({
              message: 'Something went wrong while trying to save the changes, please try again',
              type: 'error',
              duration: 5000,
            });
            this.$store.dispatch(ROLLBACK_STATE);
          })
          .finally(() => this.loading = false);
        }
      });
    },
    handleDelete() {
      this.loading = true;
      this.$store.dispatch(DELETE_TASK, { task: this.form, category: this.taskToEdit.category })
      .catch((err) => {
        console.error(err.message);
        ElMessage({
          message: 'Something went wrong while trying to delete the task, please try again',
          type: 'error',
          duration: 5000,
        });
        this.$store.dispatch(ROLLBACK_STATE);
      })
      .finally(() => this.loading = false);
    },
    handleCancel() {
      this.$store.dispatch(SET_TASK_TO_EDIT, {});
    },
  },
};
</script>
<style lang="scss" scoped>
  /deep/ .form-dialog {
    border-radius: 20px;
  }
</style>
