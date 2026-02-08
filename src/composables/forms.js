"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useForm = useForm;
var vue_1 = require("vue");
var klona_1 = require("klona");
// credits: https://vueschool.io/articles/vuejs-tutorials/the-vue-form-component-pattern-robust-forms-without-the-fuss/
function useForm(defaultValue, modelValue) {
    var form = (0, vue_1.ref)((0, klona_1.klona)(modelValue === null || modelValue === void 0 ? void 0 : modelValue.value) || defaultValue);
    if (modelValue) {
        // still supporting data change coming DOWN from the parent
        (0, vue_1.watch)(modelValue, function () {
            form.value = (0, klona_1.klona)(modelValue.value);
        }, { deep: true });
    }
    function handleSubmit() {
        if (!modelValue)
            return; // also required if no v-model
        modelValue.value = (0, klona_1.klona)(form.value);
    }
    return {
        form: form,
        handleSubmit: handleSubmit,
    };
}
