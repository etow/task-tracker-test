<template>
  <Project />
</template>
<script>
import Project from './views/Project.vue';

export default {
  components: { Project },
};
</script>

<style>
.html, body {
  height: 100%;
  padding: 0;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

#app {
  height: 100vh;
}

/* common modifiers */
.is-justified-right {
  margin-left: auto;
}
.has-text-centered {
  text-align: center;
}

/* force z-index of message element */
.el-message {
  z-index: 99999!important;
}
</style>
