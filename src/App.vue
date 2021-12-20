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
@import "//unpkg.com/element-plus/dist/index.css";
html, body {
  height: 100%;
  padding: 0;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
}

html {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

body {
  background: rgb(245,247,248);
  background: linear-gradient(45deg, rgba(245,247,248,1) 0%, rgba(237,241,242,1) 100%);
  overflow-x: auto;
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
