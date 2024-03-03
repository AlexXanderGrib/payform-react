import { type PropsWithChildren } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ClockIcon,
  DocumentTextIcon,
  ReceiptPercentIcon
} from "@heroicons/react/24/outline";

import { cn } from "../utils/cn";

import { Alert } from "./Alert";
import Countdown from "./Countdown";
import { Money } from "./Money";

type WrapperProps = PropsWithChildren<{
  deadline?: Date;
  billId?: string;
  amount: number;
  description?: string;
}>;

export function Wrapper({
  deadline,
  billId,
  amount,
  children,
  description
}: WrapperProps): JSX.Element {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-md pt-4 sm:max-w-2xl md:px-4">
        <div className="rounded-2xl bg-white px-4 py-6 shadow-smooth md:px-8 dark:bg-secondary-900">
          <Disclosure
            as="div"
            className="mb-8 flex flex-wrap justify-between gap-4"
          >
            <Disclosure.Button
              as="button"
              className="flex w-full items-center justify-between clickable"
            >
              {({ open }) => (
                <>
                  <ChevronDownIcon
                    className={cn(
                      "h-6 w-6 transform cursor-pointer rounded-full transition duration-150 dark:text-white",
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
                as="ul"
                className="mt-4 flex w-full flex-col gap-2 rounded-xl bg-secondary-100 p-6 dark:bg-secondary-800 forced-colors:border-2"
                unmount={false}
              >
                {!!billId && (
                  <li>
                    <Alert
                      title="Номер счёта"
                      description={billId}
                      icon={<ReceiptPercentIcon />}
                    />
                  </li>
                )}

                {!!deadline && (
                  <li>
                    <Alert
                      title="Время на оплату"
                      description={
                        <Countdown
                          to={deadline}
                          onEnded={() => {
                            alert("Время на оплату вышло");
                          }}
                        />
                      }
                      icon={<ClockIcon />}
                    />
                  </li>
                )}
                {!!description && (
                  <li>
                    <Alert
                      title="Описание"
                      description={description}
                      icon={<DocumentTextIcon />}
                    />
                  </li>
                )}
              </Disclosure.Panel>
            </Transition>
          </Disclosure>

          {children}
        </div>
      </div>
    </div>
  );
}
