export interface CopyButtonProps {
  text: string;
  onCopy?: (success: boolean) => void;
  className?: string;
  iconClassName?: string;
  copyTimeout?: number;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  clearButtonClassName?: string;
}

export interface CategoryFilterProps {
  categories: { id: string; label: string; count: number }[];
  selected: string | null;
  onChange: (id: string | null) => void;
  className?: string;
  pillClassName?: string;
  badgeClassName?: string;
}
