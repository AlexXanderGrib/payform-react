import { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

export default function MainButton(
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
) {
  return (
    <button
      className="text-lg bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-400 disabled:cursor-not-allowed transition-colors rounded-xl select-none clickable text-white font-bold px-8 py-5 w-full"
      {...props}
    />
  );
}