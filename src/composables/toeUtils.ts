import { ref } from "vue";

export function useToeEditableItems<T>() {
  const editMode = ref(false);
  const editedId = ref<string | null>();
  const showAddForm = ref(false);
  const rerender = ref(true);
  const selectedItems = ref<T[]>([]);

  return { editMode, editedId, showAddForm, rerender, selectedItems };
}
