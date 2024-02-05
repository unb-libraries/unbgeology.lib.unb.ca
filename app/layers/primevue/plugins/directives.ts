export default defineNuxtPlugin(({ vueApp: vue }) => {
  vue.directive(`onWindow`, {
    mounted: (el, { value: handler }) => {
      window.addEventListener(`click`, handler, true)
    },
    beforeUnmount: (el, { value: handler }) => {
      window.removeEventListener(`click`, handler, true)
    },
  })
})
