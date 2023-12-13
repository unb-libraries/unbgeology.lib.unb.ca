<template>
  <div class="bg-primary flex h-screen flex-col">
    <header class="bg-primary-60/10 border-primary-40/10 mb-4 w-full flex-none border-b px-6 py-4">
      <div class="flex flex-row justify-between">
        <h1 class="text-4xl">
          Dashboard
        </h1>
        <a href="/">
          <div class="border-primary-80/40 hover:border-primary-80 inline-flex rounded-lg border px-4 py-2">
            <span>Return to site</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="ml-2 h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>
        </a>
      </div>
    </header>
    <div id="content" class="flex h-full grow overflow-y-hidden">
      <div class="flex w-full flex-row">
        <PvPane class="twa-column min-w-min list-none text-right" header-class="bg-primary-80/40 flex justify-end p-2" :collapsible="true">
          <template #header>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </template>
          <nav>
            <section class="twa-nav-group">
              <h2 class="twa-nav-group-heading">
                <span class="mr-2">Specimens</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                </svg>
              </h2>
              <NuxtLink :to="`/dashboard/specimens`" class="twa-nav-item" active-class="twa-nav-item-active">
                View all
              </NuxtLink>
              <NuxtLink :to="`/dashboard/specimens/create`" class="twa-nav-item" active-class="twa-nav-item-active">
                New specimen
              </NuxtLink>
            </section>
            <section class="twa-nav-group">
              <h2 class="twa-nav-group-heading">
                <span class="mr-2">Affiliates</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </h2>
              <NuxtLink :to="`/dashboard/affiliates/people`" class="twa-nav-item" active-class="twa-nav-item-active">
                People
              </NuxtLink>
              <NuxtLink :to="`/dashboard/affiliates/organizations`" class="twa-nav-item" active-class="twa-nav-item-active">
                Organizations
              </NuxtLink>
            </section>
            <section class="twa-nav-group">
              <h2 class="twa-nav-group-heading">
                <span class="mr-2">Terms</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </h2>
              <NuxtLink to="/dashboard/terms" class="twa-nav-item" active-class="twa-nav-item-active">
                View all
              </NuxtLink>
              <NuxtLink :to="`/dashboard/terms/fossil`" class="twa-nav-item" active-class="twa-nav-item-active">
                Fossil
              </NuxtLink>
              <NuxtLink :to="`/dashboard/terms/geochronology`" class="twa-nav-item" active-class="twa-nav-item-active">
                Geochronology
              </NuxtLink>
              <NuxtLink :to="`/dashboard/terms/location`" class="twa-nav-item" active-class="twa-nav-item-active">
                Location
              </NuxtLink>
              <NuxtLink :to="`/dashboard/terms/mineral`" class="twa-nav-item" active-class="twa-nav-item-active">
                Mineral
              </NuxtLink>
              <NuxtLink :to="`/dashboard/terms/rock`" class="twa-nav-item" active-class="twa-nav-item-active">
                Rock
              </NuxtLink>
            </section>
            <section class="twa-nav-group">
              <h2 class="twa-nav-group-heading">
                <span class="mr-2">Files</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </h2>
              <NuxtLink :to="`/dashboard/files/images`" class="twa-nav-item" active-class="twa-nav-item-active">
                Images
              </NuxtLink>
            </section>
            <section class="twa-nav-group">
              <h2 class="twa-nav-group-heading">
                <span class="mr-2">Users</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </h2>
              <NuxtLink :to="`/dashboard/users`" class="twa-nav-item" active-class="twa-nav-item-active">
                View all
              </NuxtLink>
            </section>
          </nav>
        </PvPane>
        <PvPane class="twa-column grow" header-class="bg-primary-80/40 px-4 py-2 flex">
          <template #header>
            <slot name="page-title" />
          </template>
          <div class="p-6">
            <slot />
          </div>
        </PvPane>
        <PvPane class="twa-column flex-none" expanded-class="w-1/5" header-class="bg-primary-80/40 p-2" :collapsible="true">
          <template #header>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </template>
          <div class="h-full p-6">
            <slot name="sidebar">
              Nothing selected.
            </slot>
          </div>
        </PvPane>
      </div>
    </div>
    <footer class="bg-primary-60/10 border-primary-40/10 mt-4 flex w-full flex-none border-t px-6 py-4">
      <div class="flex flex-col justify-between md:flex-row">
        <div class="flex flex-col items-center md:flex-row md:space-x-4">
          <span>&copy;{{ new Date().getFullYear() }} University of New Brunswick</span>
        </div>
        <nav class="flex flex-col items-center md:flex-row md:space-x-4">
        <!-- Footer menu items here -->
        </nav>
      </div>
    </footer>

    <PvModal />
  </div>
</template>

<style scoped>
  .twa-column {
    @apply flex flex-col mx-2 first:ml-0 last:mr-0 overflow-y-scroll rounded-xl first:rounded-l-none last:rounded-r-none bg-primary-60/10 first:border-l-0 last:border-r-0 border border-primary-40/10
  }
  .twa-nav-group {
    @apply flex flex-col my-6 last:mb-0
  }

  .twa-nav-group-heading {
    @apply text-sm uppercase border-b border-primary-60/20 pr-3 pb-1 text-primary-60 inline-flex w-full justify-end
  }

  .twa-nav-item {
    @apply hover:bg-accent-light py-1.5 px-6 text-sm pl-12
  }

  .twa-nav-item-active {
    @apply bg-accent-mid
  }
</style>
