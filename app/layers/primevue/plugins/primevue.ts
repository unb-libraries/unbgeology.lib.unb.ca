import AutoComplete from "primevue/autocomplete"
import ColorPicker from "primevue/colorpicker"
import Column from "primevue/column"
import PrimeVue from "primevue/config"
import DataTable from "primevue/datatable"
import Dropdown from "primevue/dropdown"
import InputMask from "primevue/inputmask"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import MultiSelect from "primevue/multiselect"
import { usePassThrough } from "primevue/passthrough"
import Tailwind from "primevue/passthrough/tailwind"
import ProgressSpinner from "primevue/progressspinner"
import { type DropdownContext } from "primevue/dropdown"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    unstyled: true,
    pt: usePassThrough(Tailwind, {
      colorpicker: {
        root: {
          class: [
            `w-full h-full`,
            `p-0`,
          ],
        },
        input: {
          class: [
            `w-full h-full`,
            `border-0`,
          ],
        },
      },
      column: {
        bodycell: {
          class: [
            `text-left`,
            `border-0`,
            `border-b`,
            `border-solid`,
            `border-primary-80`,
            `p-4`,
            `dark:text-base`,
            `dark:border-primary-40`,
          ],
        },
        headercell: {
          class: [
            `text-left`,
            `border-0`,
            `border-b-2`,
            `border-solid`,
            `border-primary-80`,
            `dark:border-primary-40`,
            `font-bold`,
            `transition`,
            `duration-200`,
            `p-4`,
            `bg-primary`,
            `text-primary`,
            `dark:text-base`,
            `dark:bg-primary-80`,
            `first:rounded-tl-md last:rounded-tr-md`,
          ],
        },
      },
      datatable: {
        bodyrow: {
          class: [
            `bg-transparent`,
            `text-primary`,
            `transition`,
            `duration-200`,
            `focus:outline`,
            `focus:outline-[0.15rem]`,
            `focus:outline-blue-200`,
            `focus:outline-offset-[-0.15rem]`,
            `dark:text-white`,
            `dark:focus:outline`,
            `dark:focus:outline-[0.15rem]`,
            `dark:focus:outline-blue-300`,
            `dark:focus:outline-offset-[-0.15rem]`,
          ],
        },
      },
      dropdown: {
        root: {
          class: [
            `md:w-full`,
            `cursor-pointer`,
            `inline-flex`,
            `relative`,
            `select-none`,
            `transition-colors`,
            `duration-200`,
            `ease-in-out`,
            `w-full`,
            `p-0`,
            `focus:outline-none`,
            `focus:outline-offset-0`,
            `focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]`,
            `dark:focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]`,
          ],
        },
        list: {
          class: [
            `dark:bg-primary`,
            `dark:border-accent-light`,
          ],
        },
        item: ({ context }: { context: DropdownContext }) => ({
          class: [
            context.selected ? `dark:bg-accent-dark` : ``,
            `dark:hover:bg-accent-mid`,
            `dark:text-base`,

            // defaults
            `cursor-pointer`,
            `font-normal`,
            `overflow-hidden`,
            `relative`,
            `whitespace-nowrap`,
            `m-0`,
            `p-3`,
            `border-0`,
            `transition-shadow`,
            `duration-200`,
            `rounded-none`,
          ],
        }),
        trigger: {
          class: [
            `flex`,
            `items-center`,
            `justify-center`,
            `shrink-0`,
            `bg-transparent`,
            `text-gray-500`,
            `w-12`,
          ],
        },
      },
      inputmask: {
        root: { class: [] },
      },
      inputnumber: {
        root: { class: [] },
        input: { class: [] },
      },
      inputtext: {
        root: { class: [] },
      },
      multiselect: {
        root: {
          class: [
            `md:w-full`,
            `cursor-pointer`,
            `inline-flex`,
            `relative`,
            `select-none`,
            `transition-colors`,
            `duration-200`,
            `ease-in-out`,
            `w-full`,
            `focus:outline-none`,
            `focus:outline-offset-0`,
            `focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]`,
            `dark:focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]`,
          ],
        },
        header: {
          class: [
            `bg-white`,
            `border-b`,
            `border-primary-20`,
            `flex`,
            `items-center`,
            `justify-between`,
            `p-3`,
            `rounded-t-lg`,
            `text-base`,
            `dark:bg-primary/30`,
            `dark:border-primary-20`,
            `dark:text-white`,
          ],
        },
        label: {
          class: [
            `block`,
            `overflow-hidden`,
            `whitespace-nowrap`,
            `cursor-pointer`,
            `text-ellipsis text-primary dark:text-base`,
            `transition`,
            `duration-200`,
          ],
        },
        list: {
          class: [
            `dark:bg-primary`,
            `dark:border-accent-light`,
          ],
        },
        item: ({ context }: { context: DropdownContext }) => ({
          class: [
            context.selected ? `dark:bg-accent-dark` : ``,
            `dark:hover:bg-accent-mid`,
            `dark:text-base`,
            `cursor-pointer`,
            `font-normal`,
            `overflow-hidden`,
            `relative`,
            `whitespace-nowrap`,
            `m-0`,
            `p-3`,
            `border-0`,
            `transition-shadow`,
            `duration-200`,
            `rounded-none`,
          ],
        }),
        token: {
          class: [
            `py-1`,
            `px-2`,
            `mr-2`,
            `bg-accent-mid`,
            `text-gray-700`,
            `text-white`,
            `rounded-md`,
            `cursor-default`,
            `inline-flex`,
            `items-center`,
          ],
        },
        removetokenicon: {
          class: [
            `p-icon`,
            `ml-2`,
            `cursor-pointer`,
            `hover:text-red`,
          ],
        },
      },
    }),
  })

  // Table
  nuxtApp.vueApp.component(`PvTable`, DataTable)
  nuxtApp.vueApp.component(`PvTableColumn`, Column)

  // Form
  nuxtApp.vueApp.component(`PvAutoComplete`, AutoComplete)
  nuxtApp.vueApp.component(`PvColorPicker`, ColorPicker)
  nuxtApp.vueApp.component(`PvInputText`, InputText)
  nuxtApp.vueApp.component(`PvInputMask`, InputMask)
  nuxtApp.vueApp.component(`PvInputNumber`, InputNumber)
  nuxtApp.vueApp.component(`PvMultiSelect`, MultiSelect)
  nuxtApp.vueApp.component(`PvSelect`, Dropdown)

  // Misc
  nuxtApp.vueApp.component(`PvProgressSpinner`, ProgressSpinner)
})
