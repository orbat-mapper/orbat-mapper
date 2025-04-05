<template>
  <button
    type="button"
    class="inline-flex items-center border shadow-xs"
    :class="classes"
  >
    <slot />
  </button>
</template>

<script>
const sizeClasses = {
  small: "px-2.5 py-1.5 text-xs font-medium rounded",
  large: "px-4 py-2 text-base font-medium rounded-md",
  huge: "px-6 py-3 border border-transparent text-base font-medium rounded-md",
  default: "px-3 py-2 text-sm leading-4 font-medium rounded-md",
};

const colorClasses = {
  default:
    "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700",
  primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700",
  secondary: "border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200",
};

const focusClasses =
  "focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50";
export default {
  name: "BaseButton",
  props: {
    primary: { type: Boolean, default: false },
    secondary: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    huge: { type: Boolean, default: false },
  },
  setup(props) {
    const sizeKey =
      (props.small && "small") ||
      (props.large && "large") ||
      (props.huge && "huge") ||
      "default";
    const colorKey =
      (props.primary && "primary") || (props.secondary && "secondary") || "default";
    const classes = [
      sizeClasses[sizeKey] || "",
      colorClasses[colorKey] || "",
      focusClasses,
    ];
    return { classes: classes.join(" ") };
  },
};
</script>
