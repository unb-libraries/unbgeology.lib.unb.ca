import AutoComplete from "primevue/autocomplete"
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
import { type DropdownContext } from "primevue/dropdown"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    unstyled: true,
    pt: usePassThrough(Tailwind, {
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
            `border-primary-20`,
            `dark:border-primary-60/75`,
            `rounded-lg`,
            `dark:hover:border-accent-light`,
            `dark:bg-primary`,

            // defaults
            `cursor-pointer`,
            `inline-flex`,
            `relative`,
            `select-none`,
            `bg-white`,
            `border`,
            // `border-gray-400`,
            `transition-colors`,
            `duration-200`,
            `ease-in-out`,
            // `rounded-md`,
            // md:w-56
            // dark:bg-gray-900
            // dark:border-blue-900/40
            // dark:hover:border-blue-300
            `w-full`,
            `hover:border-blue-500`,
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
            // `dark:text-white/80`,
            // `dark:hover:bg-gray-800`,
            // `hover:text-gray-700`,
            // `hover:bg-gray-200`,
            // `text-gray-700`,
          ],
        }),
      },
      inputmask: {
        root: {
          class: [
            `dark:bg-primary`,
            `text-primary`,
            `dark:text-base`,
            `border-primary-20`,
            `dark:border-primary-60/75`,
            `hover:border-accent-mid`,
            `dark:hover:border-accent-light`,
            `focus:ring-2`,
            `focus:ring-accent-light`,
            `dark:focus:ring-accent-dark`,
            `dark:placeholder-text-primary-20`,

            // defaults
            // `font-sans`,
            `text-base`,
            `text-gray-700`,
            // `dark:text-white/80`,
            `bg-white`,
            // `dark:bg-gray-900`,
            `py-3`,
            `px-3`,
            `border`,
            `border-gray-300`,
            // `dark:border-blue-900/40`,
            `hover:border-blue-500`,
            `focus:outline-none`,
            `focus:outline-offset-0`,
            `focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]`,
            `dark:focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]`,
            `transition duration-200 ease-in-out`,
            `appearance-none`,
            `rounded-md`,
          ],
        },
      },
      inputnumber: {
        input: {
          class: [
            `w-full`,
            `border`,
            `border-primary-20`,
            `dark:border-primary-60/75`,
            `bg:white`,
            `dark:bg-primary`,
            `hover:border-accent-mid`,
            `dark:hover:border-accent-light`,
            `focus:ring-2`,
            `fous:ring-accent-mid`,
            `dark:focus:shadow-accent-dark`,
          ],
        },
      },
      inputtext: {
        root: {
          class: [
            `dark:bg-primary`,
            `text-primary`,
            `dark:text-base`,
            `border-primary-20`,
            `dark:border-primary-60/75`,
            `hover:border-accent-mid`,
            `dark:hover:border-accent-light`,
            `focus:ring-2`,
            `focus:ring-accent-light`,
            `dark:focus:ring-accent-mid`,
            `placeholder:text-primary`,
            `dark:placeholder-text-primary-20`,

            // defaults
            `m-0`,
            // `font-sans`,
            // `text-gray-600`,
            // `dark:text-white/80`,
            `bg-white`,
            // `dark:bg-gray-900`,
            `border`,
            // `border-gray-300`,
            // `dark:border-blue-900/40`,
            // `transition-colors`,
            `duration-200`,
            `appearance-none`,
            `rounded-lg`,
            // `hover:border-blue-500`,
            // `focus:outline-none`,
            // `focus:outline-offset-0`,
            // `focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]`,
            // `dark:focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]`,
            `p-3`,
            // `text-base`,
          ],
        },
      },
      multiselect: {
        root: {
          class: [
            `md:w-full`,
            `border-primary-20`,
            `dark:border-primary-60/75`,
            `rounded-lg`,
            `dark:hover:border-accent-light`,
            `dark:bg-primary`,
            `cursor-pointer`,
            `inline-flex`,
            `relative`,
            `select-none`,
            `bg-white`,
            `border`,
            `transition-colors`,
            `duration-200`,
            `ease-in-out`,
            `w-full`,
            `hover:border-blue-500`,
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
  nuxtApp.vueApp.component(`PvInputText`, InputText)
  nuxtApp.vueApp.component(`PvInputMask`, InputMask)
  nuxtApp.vueApp.component(`PvInputNumber`, InputNumber)
  nuxtApp.vueApp.component(`PvMultiSelect`, MultiSelect)
  nuxtApp.vueApp.component(`PvSelect`, Dropdown)
})
