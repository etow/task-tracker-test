<template>
  <div class="board" v-loading="loading">
    Body
  </div>
</template>

<script>
export default {
  name: "Board",
  data() {
    return {
      loading: false,
    };
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
