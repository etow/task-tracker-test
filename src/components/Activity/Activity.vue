<template>
  <div class="activity">
    <div v-for="[name] in activity" :key="name" class="activity__item">
      <div class="activity__key">{{name}}</div>
      <div class="activity__time">{{ getTimeElapsed(name) }}</div>
    </div>
    <div v-if="isDone" class="activity__item is-done">
      {{ taskToEdit.category }} ✓
    </div>
  </div>
</template>
<script>
export default {
  computed: {
    isDone() {
      return this.categories[this.taskToEdit.category]?.endOfWorkflow;
    },
    taskToEdit() {
      return this.$store.state.taskToEdit;
    },
    activityData() {
      return this.taskToEdit.activity || {};
    },
    activity() {
      return Object.entries(this.activityData)
        .filter(([key]) => this.categories[key].endOfWorkflow !== true);
    },
    categories() {
      return this.$store.state.categories;
    },
  },
  methods: {
    getTimeElapsed(categoryName) {
      // collect records
      const time = this.activityData[categoryName].reduce((acc, entry) => {
        const started = entry.started;
        const finished = entry.finished || Date.now();
        acc += (finished - started);
        return acc;
      }, 0);

      // conver time to hours and minutes
      const minutes = Math.floor((time / (1000 * 60)) % 60);
      const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

      let output = '';
      if (hours > 0) output += `${hours} ${(hours > 1 || hours === 0) ? 'hours' : 'hour'}, `;
      output += `${minutes} ${(minutes > 1 || minutes === 0) ? 'minutes' : 'minute'}`;

      return output;
    },
  }
};
</script>
<style lang="scss" scoped>
.activity {
  &__item {
    display: flex;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid rgb(228, 231, 237);
    &.is-done {
      text-align: center;
      display: block;
      border-bottom: 0;
    }
  }

  &__key {
    min-width: 100px;
  }
  &__time {
    padding: 0 20px;
  }
}
</style>
