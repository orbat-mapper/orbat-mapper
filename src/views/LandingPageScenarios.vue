<template>
  <div class="bg-gray-50 py-5 relative">
    <p class="absolute right-6 top-2 z-10"><WipBadge /></p>
    <section class="max-w-7xl mx-auto p-6">
      <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        <li
          v-for="scenario in scenarios"
          :key="scenario.name"
          class="
            col-span-1
            flex flex-col
            text-center
            bg-white
            rounded-lg
            shadow
            divide-y divide-gray-200
            hover:border-army
            border
            overflow-hidden
            focus-within:border-blue-800
          "
        >
          <router-link
            :to="getScenarioTo(scenario.id)"
            class="flex-1 flex flex-col"
          >
            <img
              class="
                w-full
                h-52
                flex-shrink-0
                mx-auto
                bg-black
                object-cover object-top
              "
              :src="scenario.imageUrl"
              alt=""
            />
            <h3 class="mt-6 text-gray-900 text-sm font-medium">
              {{ scenario.name }}
            </h3>
            <dl class="mt-1 flex-grow flex flex-col justify-between p-4">
              <dt class="sr-only">Summary</dt>
              <dd class="text-gray-500 text-sm">
                {{ scenario.summary }}
              </dd>
            </dl>
          </router-link>
        </li>
        <li class="col-span-1 flex">
          <button
            type="button"
            @click="newScenario"
            class="
              relative
              block
              w-full
              border-2 border-gray-300 border-dashed
              rounded-lg
              p-12
              text-center
              hover:border-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-indigo-500
            "
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
              />
            </svg>
            <span class="mt-2 block text-sm font-medium text-gray-900">
              Create new scenario
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { MailIcon, PhoneIcon } from "@heroicons/vue/solid";
import ProseSection from "../components/ProseSection.vue";
import { useRouter } from "vue-router";
import { SCENARIO_ROUTE } from "../routes";
import WipBadge from "../components/WipBadge.vue";

const scenarios = [
  {
    name: "Falklands war 1982",
    id: "falkland82",
    summary:
      "A 10-week undeclared war between Argentina and the United Kingdom in 1982 over two British dependent territories in the South Atlantic: the Falkland Islands and its territorial dependency, South Georgia and the South Sandwich Islands. ",
    role: "Admin",

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/HMS_Broadsword_and_Hermes%2C_1982_%28IWM%29.jpg",
  },

  {
    name: "Battles of Narvik 1940",
    id: "narvik40",
    summary:
      "Fought from 9 April to 8 June 1940 as a naval battle in the Ofotfjord and as a land battle in the mountains surrounding the north Norwegian town of Narvik as part of the Norwegian Campaign of the Second World War. ",
    role: "Admin",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Norwegian_Army_Colt_heavy_machine_gun_at_the_Narvik_front.jpg",
  },
  // More scenarios...
];

export default {
  components: {
    WipBadge,
    ProseSection,
    MailIcon,
    PhoneIcon,
  },
  setup() {
    const router = useRouter();
    const getScenarioTo = (scenarioId) => {
      return { name: SCENARIO_ROUTE, query: { load: scenarioId } };
    };

    const newScenario = () => {
      router.push({ name: SCENARIO_ROUTE });
    };
    return {
      scenarios,
      getScenarioTo,
      newScenario,
    };
  },
};
</script>
