import { type ModelRef, ref, watch } from "vue";
import { klona } from "klona";

// credits: https://vueschool.io/articles/vuejs-tutorials/the-vue-form-component-pattern-robust-forms-without-the-fuss/
export function useForm<T>(defaultValue: T, modelValue?: ModelRef<T | null | undefined>) {
  const form = ref<T>(klona(modelValue?.value) || defaultValue);

  if (modelValue) {
    // still supporting data change coming DOWN from the parent
    watch(
      modelValue,
      () => {
        form.value = klona(modelValue.value);
      },
      { deep: true },
    );
  }

  function handleSubmit() {
    if (!modelValue) return; // also required if no v-model
    modelValue.value = klona(form.value);
  }

  return {
    form,
    handleSubmit,
  };
}
