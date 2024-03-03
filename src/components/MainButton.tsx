import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export default function MainButton(
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
): JSX.Element {
  return (
    <button
      className="w-full select-none rounded-xl bg-primary-500 px-8 py-5 text-lg font-bold text-white transition-colors clickable hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-secondary-400 forced-colors:border-2"
      {...props}
    />
  );
}
