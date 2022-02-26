export interface ButtonGroupItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SelectItem {
  label: string;
  value: string | number;
}
