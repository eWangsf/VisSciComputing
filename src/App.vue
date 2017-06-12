<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import store from './store/index';
import actions from './store/actions';
import mutations from './store/mutations';

export default {
  name: 'app',
  store,
  actions,
  mutations,
};
</script>
