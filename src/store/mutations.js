import * as types from './mutation_types';

export default {
  [types.ADD_TREE](state, data) {
    console.log(state, data);
  },
};
