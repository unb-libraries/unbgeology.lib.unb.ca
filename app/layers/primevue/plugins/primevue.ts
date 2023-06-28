import AutoComplete from "primevue/autocomplete"
import Column from "primevue/column"
import PrimeVue from "primevue/config"
import DataTable from "primevue/datatable"
import InputText from "primevue/inputtext"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue)

  // Table
  nuxtApp.vueApp.component(`PvTable`, DataTable)
  nuxtApp.vueApp.component(`PvTableColumn`, Column)

  // Form
  nuxtApp.vueApp.component(`PvAutoComplete`, AutoComplete)
  nuxtApp.vueApp.component(`PvTextInput`, InputText)
})
