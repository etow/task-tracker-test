<template>
  <Board />
  <EditTask />
</template>
<script>
import Board from '../components/Board/Board.vue';
import EditTask from '../components/EditTask/EditTask.vue';

export default {
  components: {
    Board,
    EditTask,
  },
}
</script>
