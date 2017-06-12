import * as types from './mutation_types';

export default {
  addTree: ({ commit }) => {
    const constraint = {
      name: 'cons1',
      children: [],
    };
    commit(types.ADD_TREE, constraint);
  },
};

