import AutoComplete from 'primevue/autocomplete'
import ColorPicker from 'primevue/colorpicker'
import Column from 'primevue/column'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import { usePassThrough } from 'primevue/passthrough'
import Tailwind from 'primevue/passthrough/tailwind'
import ProgressSpinner from 'primevue/progressspinner'
import InputTreeSelect from 'primevue/treeselect'
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
            `border-b-0`,
            `border-0`,
            `border-b-0`,
            `p-4`,
            `text-base`,
          ],
        },
        headercell: {
          class: [
            `bg-transparent`,
            `bg-transparent`,
            `text-left`,
            `border-0`,
            `border-0`,
            `font-bold`,
            `transition`,
            `duration-200`,
            `p-4`,
            `bg-primary`,
            `text-primary`,
            `text-base`,
            `first:rounded-tl-md last:rounded-tr-md`,
          ],
        },
      },
      datatable: {
        tbody: {
          class: [
            `border-b`,
            `border-primary-60/75`,
          ],
        },
        bodyrow: {
          class: [
            `hover:bg-accent-dark/20`,
            `even:bg-primary-80/20`,
            `even:hover:bg-accent-dark/20`,
            `transition`,
            `duration-200`,
            `text-white`,
            `focus:bg-accent-dark/40`,
            `even:focus:bg-accent-dark/40`,
          ],
        },
        headerrow: {
          class: [
            `bg-accent-dark/10`,
            `border-b-2`,
            `border-accent-dark`,
          ],
        },
        footer: {
          class: [
            `border-0 px-4 py-2 empty:invisible text-primary-40`,
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
            `focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]`,
          ],
        },
        list: {
          class: [
            `bg-primary`,
            `border-accent-light`,
          ],
        },
        item: ({ context }: { context: DropdownContext }) => ({
          class: [
            context.selected ? `bg-accent-dark` : ``,
            `hover:bg-accent-mid`,
            `text-base`,

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
            `focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]`,
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
            `bg-primary/30`,
            `border-primary-20`,
            `text-white`,
          ],
        },
        label: {
          class: [
            `block`,
            `overflow-hidden`,
            `whitespace-nowrap`,
            `cursor-pointer`,
            `text-ellipsis text-primary text-base`,
            `transition`,
            `duration-200`,
          ],
        },
        list: {
          class: [
            `bg-primary`,
            `border-accent-light`,
          ],
        },
        item: ({ context }: { context: DropdownContext }) => ({
          class: [
            context.selected ? `bg-accent-dark` : ``,
            `hover:bg-accent-mid`,
            `text-base`,
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
      treeselect: {
        root: {
          class: [
            'input',
            'input-text-lg',
          ],
        },
        labelcontainer: {
          class: [
            'grow',
          ],
        },
        label: {
          class: [],
        },
        trigger: {
          class: [
            'text-white',
          ],
        },
        wrapper: {
          class: [
            'max-h-[200px]',
            'overflow-auto',
            'shadow-lg',
          ],
        },
      },
      tree: {
        root: {
          class: [
            'w-full',
            'border',
            'border-solid',
            'border-gray-300',
            'bg-primary',
            'text-white',
            'rounded-md',
          ],
        },
        node: {
          class: [
            'p-0',
          ],
        },
        content: {
          class: [
            'flex',
            'items-center',
            'p-2',
            'hover:text-accent-mid',
            'focus:bg-accent-mid',
            // 'text-white',
            'cursor-pointer',
            'select-none',
          ],
        },
        label: {
          class: [
            'inline-flex',
          ],
        },
        subgroup: {
          class: [
            'pl-2',
            'focus-visible:outline-none',
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
  nuxtApp.vueApp.component(`PvInputTreeSelect`, InputTreeSelect)

  // Misc
  nuxtApp.vueApp.component(`PvProgressSpinner`, ProgressSpinner)
})
