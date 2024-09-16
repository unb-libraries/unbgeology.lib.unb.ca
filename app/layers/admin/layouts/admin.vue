<template>
  <div class="flex h-dvh flex-col">
    <header class="site-header">
      <div class="space-x-100 text-125 inline-flex flex-none items-start">
        <UNBLibrariesLogo class="unbliblogo" />
        <div>Earth Science Collections</div>
      </div>
      <div class="space-x-100 text-75 text-base-light-400 flex grow flex-row items-center justify-end">
        <div class="space-x-50">
          <span>Hello {{ username }}</span><span>👋</span>
        </div>
        <IconHSpace class="stroke-base-light-100 h-100 w-px fill-none stroke-1" />
        <NuxtLink to="/admin/specimens/add" class="text-accent space-x-25 inline-flex items-center uppercase">
          <span class="hover:underline">Add New</span>
          <IconPlus class="size-100 stroke-accent stroke-1.5" />
        </NuxtLink>
        <NuxtLink to="/" class="space-x-25 group inline-flex items-center uppercase">
          <span class="group-hover:underline">View Site</span>
          <IconLaptop class="size-100 stroke-base-light-400 stroke-1" />
        </NuxtLink>
        <div class="space-x-25 group inline-flex items-center uppercase">
          <span class="group-hover:underline">Logout</span>
          <IconArrowR class="size-100 stroke-base-light-100 stroke-1.5" />
        </div>
      </div>
    </header>
    <main class="flex grow flex-row overflow-y-hidden">
      <div :class="[`text-base-light-500 bg-base-dark-500 flex h-full min-w-fit flex-col`]">
        <nav :class="[`w-full grow overflow-y-scroll`]">
          <MenuLink v-for="{ name, to, icon } in menu" :key="to" :to="to" :label="name" :collapsed="collapsed">
            <template #icon>
              <Icon :name="icon" />
            </template>
          </MenuLink>
        </nav>
        <SidebarItem label="Collapse" collapsed-label="Expand" :collapsed="collapsed" class="cursor-pointer"
          @click.prevent="onClickCollapse">
          <template #icon>
            <div
              :class="[`-space-x-25 inline-flex size-fit transition-transform duration-500`, { 'rotate-180': collapsed }]">
              <IconAngleL class="h-100 stroke-base-light-500 group-hover:stroke-accent stroke-1.5 fill-none" />
              <IconAngleL class="h-100 stroke-base-light-500 group-hover:stroke-accent stroke-1.5 fill-none" />
            </div>
          </template>
        </SidebarItem>
      </div>
      <div class="bg-base-dark-300 grow">
        <slot />
      </div>
    </main>
    <footer class="p-75 bg-base-dark-500 flex flex-none flex-row items-center justify-between">
      <UNBLibrariesLogo class="h-[20px]" icon-class="fill-base-light-100" unb-class="fill-base-light-100"
        spacer-class="fill-base-light-100" libraries-class="fill-base-light-100" />
      <div class="text-base-light-100 text-75">
        Built and maintained by UNB Libraries<br>
        University of New Brunswick &copy; {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>

<script lang="tsx" setup>
import '~/assets/css/theme.admin.css'
import { IconDashboard, IconFossil, IconShapes, IconClover, IconClockArrowCCW, IconArrowsLR, IconUserAndAHalf, IconBookCheck } from '#components'

const menu = [
  { name: `Dashboard`, icon: `dashboard`, to: `/admin/dashboard` },
  { name: `Specimens`, icon: `fossil`, to: `/admin/specimens` },
  { name: `Classifications`, icon: `shapes`, to: `/admin/classifications` },
  { name: `Collections`, icon: `clover`, to: `/admin/collections` },
  { name: `Geochronology`, icon: `clock-arrow-ccw`, to: `/admin/geochronology` },
  { name: `Loans`, icon: `arrows-lr`, to: `/admin/loans` },
  { name: `Contributors`, icon: `user-and-a-half`, to: `/admin/contributors` },
  { name: `Storage Locations`, icon: `book-check`, to: `/admin/locations` },
  { name: `Migrations`, icon: `migrations`, to: `/admin/migrations` },
  { name: `Users`, icon: `users`, to: `/admin/users` },
]

type IconProps = { name: string }
const Icon = ({ name }: IconProps) => {
  switch (name) {
    case `dashboard`: return <IconDashboard class="size-125 fill-base-light-500 group-hover:fill-accent" />
    case `fossil`: return <IconFossil class="size-125 stroke-base-light-500 group-hover:stroke-accent stroke-2" />
    case `shapes`: return <IconShapes class="size-125 fill-base-light-500 group-hover:fill-accent" />
    case `clover`: return <IconClover class="size-125 fill-base-light-500 group-hover:fill-accent" />
    case `clock-arrow-ccw`: return <IconClockArrowCCW class="size-125 fill-base-light-500 group-hover:fill-accent" />
    case `arrows-lr`: return <IconArrowsLR class="size-125 fill-base-light-500 group-hover:fill-accent" />
    case `user-and-a-half`: return <IconUserAndAHalf class="size-125 fill-base-light-500 group-hover:fill-accent" />
    case `book-check`: return <IconBookCheck class="size-125 fill-base-light-500 group-hover:fill-accent" />
    default:
      return <div class="size-100" />
  }
}

const username = computed(() => {
  const user = useCurrentUser()
  return user.profile.value?.firstName || user.username.value
})

const collapsed = ref(false)
function onClickCollapse() {
  collapsed.value = !collapsed.value
}
</script>
