export default {
  namespaced: true,
  state: {
    commoncodes: null
  },
  getters: {
    commoncodes: (state) => {
      if (!state.commoncodes) {
        try {
          console.log('state.commoncodes===',state.commoncodes)
          state.commoncodes = state.commoncodes ? state.commoncodes : [];
        } catch (e) {
          console.error(e.message);
        }
      }
      return state.commoncodes;
    },
  },
  mutations: {
    setCommoncodes(state, commoncodes) {
      console.log('commoncodes@@@@@@@@@@@@',commoncodes)
      localStorage.setItem('commoncodes', JSON.stringify(commoncodes));
      state.commoncodes = commoncodes;
    },
  },
};
