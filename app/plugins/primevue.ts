import PrimeVue from 'primevue/config'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import InputText from 'primevue/inputtext'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue)

  nuxtApp.vueApp.component(`PvTable`, DataTable)
  nuxtApp.vueApp.component(`PvColumn`, Column)
  nuxtApp.vueApp.component(`PvInputText`, InputText)
})