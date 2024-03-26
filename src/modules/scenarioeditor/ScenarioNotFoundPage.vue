<template>
  <main class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
    <div class="text-center">
      <p class="text-base font-semibold text-indigo-600">404</p>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Scenario not found
      </h1>
      <p class="mt-6 max-w-md text-base leading-7 text-gray-600">
        Sorry, we could not find the scenario you were looking for. It may have been
        deleted or it does not exists in this browser.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-8">
        <router-link to="/" class="text-sm font-semibold text-indigo-600"
          ><span aria-hidden="true">&larr;</span> Back to home
        </router-link>
        <a
          href="https://docs.orbat-mapper.app/guide/storage"
          class="text-sm font-semibold text-gray-900"
          >Documentation <span aria-hidden="true">&rarr;</span></a
        >
      </div>
    </div>
  </main>
</template>
