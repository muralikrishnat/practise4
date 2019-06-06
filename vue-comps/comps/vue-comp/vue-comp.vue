<template>
  <div>
    <div>Title: {{title}}</div>
  </div>
</template>
<script>
module.exports = {
  data: function() {
    return {
      title: "Vue Component"
    };
  },
  created(){
  }
};
</script>
<style lang="less">
.vue-comp {
  color: red;
}
</style>