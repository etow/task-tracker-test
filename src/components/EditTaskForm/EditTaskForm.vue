<template>
  <div>
    <ElForm
      :model="form"
      class="edit-task-form"
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
          <ElOption v-for="(category) in categories" :key="category.name" :value="category.name" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="Estimate" prop="estimate">
        <ElInputNumber v-model="form.estimate" controls-position="right" :min="0" />
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
  </div>
</template>

<script>
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElPopconfirm,
  ElButton,
  ElInputNumber,
  ElLoading,
} from 'element-plus';
import { UPDATE_TASK, DELETE_TASK, SET_TASK_TO_EDIT, ROLLBACK_STATE } from '../../store/constants';

export default {
  data() {
    return {
      form: {
        name: '',
        description: '',
        category: '',
        estimate: 1,
        activity: {},
      },
      formValidation: {
        name: [
          {
            required: true,
            message: 'Name is required',
            trigger: 'blur',
          },
        ],
      },
      loading: false,
    };
  },
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElPopconfirm,
    ElButton,
    ElInputNumber,
  },
  watch: {
    taskToEdit: {
      handler(task) {
        this.form = { ...task};
      },
    },
  },
  mounted() {
    this.form = { ...this.taskToEdit};
  },
  computed: {
    categories() {
      return this.$store.state.categories;
    },
    taskToEdit() {
      return this.$store.state.taskToEdit;
    },
  },
  methods: {
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = ElLoading.service({ target: 'form' });
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
          .finally(() => {
            this.loading.close();
            this.$store.dispatch(SET_TASK_TO_EDIT, {});
            this.$emit('save');
          })
        }
      });
    },
    handleDelete() {
      this.loading = ElLoading.service({ target: 'form' });
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
      .finally(() => {
        this.$store.dispatch(SET_TASK_TO_EDIT, {});
        this.$emit('delete');
        this.loading.close();
      });
    },
    handleCancel() {
      this.$store.dispatch(SET_TASK_TO_EDIT, {});
      this.$emit('cancel');
    },
  },
};
</script>
<style scoped>
.edit-task-form {
  position: relative;
}
</style>
