import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { PropsWithChildren, ReactNode } from "react";
import Countdown from "./Countdown";
import If from "./If";
import { Money } from "./Money";

type WrapperProps = PropsWithChildren<{
  remaining?: number;
  billId?: string;
  amount: number;
  description?: string;
}>;

export function Wrapper({
  remaining,
  billId,
  amount,
  children,
  description
}: WrapperProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto md:px-4 max-w-md sm:max-w-2xl w-full pt-4">
        <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-smooth py-6 px-4 md:px-8">
          <Disclosure
            as="div"
            className="flex flex-wrap justify-between gap-4 mb-8"
          >
            <Disclosure.Button
              as="button"
              className="flex justify-between items-center clickable w-full"
            >
              {({ open }) => (
                <>
                  <ChevronDownIcon
                    className={classNames(
                      "w-6 h-6 cursor-pointer rounded-full transition transform duration-150 dark:text-white",
                      {
                        "-rotate-180": open
                      }
                    )}
                  />
                  <div className="text-4xl font-bold">
                    <Money amount={amount} />
                  </div>
                </>
              )}
            </Disclosure.Button>

            <Transition
              enter="transition duration-100 ease-out motion-reduce:duration-[0]"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out motion-reduce:duration-[0]"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
              className="w-full"
              unmount={false}
            >
              <Disclosure.Panel
                as="dl"
                className="bg-secondary-100 dark:bg-secondary-800 rounded-xl forced-colors:border-2 p-6 mt-4 flex flex-col gap-2 w-full"
                unmount={false}
              >
                <PropertyView
                  values={{
                    "Номер счёта": () => billId,
                    "Время на оплату": () => (
                      <Countdown
                        seconds={remaining}
                        onEnded={() => {
                          alert("Время на оплату вышло");
                        }}
                      />
                    ),

                    Описание: () => description
                  }}
                />
              </Disclosure.Panel>
            </Transition>
          </Disclosure>

          {children}
        </div>
      </div>
    </div>
  );
}

function PropertyView({ values = {} as Record<string, () => ReactNode> } = {}) {
  const elements: JSX.Element[] = [];

  for (const [key, render] of Object.entries(values)) {
    const content = render();

    if (content === null || content === undefined) {
      continue;
    }

    const keyElement = (
      <dt className="text-sm text-secondary-700 dark:text-secondary-100" key={`${key}-key`}>
        {key}
      </dt>
    );
    const valueElement = (
      <dd className="font-mono pl-2 text-secondary-800 dark:text-white" key={`${key}-content`}>
        {content}
      </dd>
    );

    if (elements.length > 0) {
      elements.push(
        <div
          className="h-px bg-secondary-300 dark:bg-secondary-500 opacity-80"
          key={`${key}-separator`}
        />
      );
    }

    elements.push(keyElement, valueElement);
  }

  return <>{elements}</>;
}
