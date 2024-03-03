import { type ReactNode } from "react";

type AlertProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
};

export function Alert({ title, description, icon }: AlertProps) {
  return (
    <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all dark:text-white print:break-inside-avoid">
      {!!icon && <div className="h-5 w-5">{icon}</div>}

      <div className="space-y-1">
        <h5 className="text-sm font-medium leading-none">{title}</h5>
        <p className="text-sm text-gray-700 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
