import AutoComplete from "primevue/autocomplete"
import Column from "primevue/column"
import PrimeVue from "primevue/config"
import DataTable from "primevue/datatable"
import Dropdown from "primevue/dropdown"
import InputMask from "primevue/inputmask"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"

import Tailwind from "primevue/passthrough/tailwind"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    unstyled: true,
    pt: Tailwind,
  })

  // Table
  nuxtApp.vueApp.component(`PvTable`, DataTable)
  nuxtApp.vueApp.component(`PvTableColumn`, Column)

  // Form
  nuxtApp.vueApp.component(`PvAutoComplete`, AutoComplete)
  nuxtApp.vueApp.component(`PvInputText`, InputText)
  nuxtApp.vueApp.component(`PvInputMask`, InputMask)
  nuxtApp.vueApp.component(`PvInputNumber`, InputNumber)
  nuxtApp.vueApp.component(`PvInputSelect`, Dropdown)
})
