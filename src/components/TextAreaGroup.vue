<template>
  <div>
    <Label :for="id || computedId" class="">
      <slot name="label">{{ label }}</slot>
    </Label>
    <div class="mt-1">
      <Textarea v-model="localValue" :id="id || computedId" v-bind="$attrs" />
    </div>
    <p
      v-if="description || $slots.description"
      class="text-muted-foreground mt-2 text-sm"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { nanoid } from "nanoid";
import { Textarea } from "@/components/ui/textarea/index.js";
import { Label } from "@/components/ui/label/index.js";

export default defineComponent({
  name: "TextAreaGroup",
  components: { Label, Textarea },
  props: {
    id: [String],
    label: String,
    description: String,
    modelValue: [String, Number],
  },
  emits: ["update:modelValue"],
  inheritAttrs: false,
  setup(props, { emit }) {
    const computedId = nanoid();
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });
    return {
      localValue,
      computedId,
    };
  },
});
</script>
