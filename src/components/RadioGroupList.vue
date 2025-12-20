<template>
  <FieldGroup>
    <RadioGroup v-model="selected">
      <FieldLabel v-for="item in items" :key="item.value" :for="item.value">
        <Field orientation="horizontal">
          <RadioGroupItem :id="item.value" :value="item.value" />
          <FieldContent>
            <FieldTitle>{{ item.name }}</FieldTitle>
            <FieldDescription>
              {{ item.description }}
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </RadioGroup>
  </FieldGroup>
</template>

<script setup lang="ts">
import { type RadioGroupItemData } from "@/components/types";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
defineProps<{
  items: RadioGroupItemData[];
  label?: string;
}>();

const selected = defineModel<string>();
</script>
