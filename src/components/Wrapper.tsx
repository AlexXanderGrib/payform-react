import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { PropsWithChildren } from "react";
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
        <div className="bg-white rounded-2xl shadow-smooth py-6 px-4 md:px-8">
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
                      "w-6 h-6 cursor-pointer rounded-full transition transform duration-150",
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
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
              className="w-full"
              unmount={false}
            >
              <Disclosure.Panel
                as="dl"
                className="bg-secondary-700 text-white rounded-3xl p-6 mt-4 flex flex-col gap-2 w-full"
                unmount={false}
              >
                <If condition={!!billId}>
                  <dt>Номер счёта:</dt>
                  <dd className="font-mono pl-2">{billId}</dd>
                </If>
                <If condition={!!remaining}>
                  <div className="h-px bg-secondary-200 opacity-80" />

                  <dt>Время на оплату</dt>
                  <dd className="font-mono pl-2">
                    <Countdown
                      seconds={remaining}
                      onEnded={() => {
                        alert("Время на оплату вышло");
                      }}
                    />
                  </dd>
                </If>
                <If condition={!!description}>
                  <div className="h-px bg-secondary-200 opacity-80" />
                  <dt>Описание</dt>
                  <dd className="font-mono pl-2">{description}</dd>
                </If>
              </Disclosure.Panel>
            </Transition>
          </Disclosure>

          {children}
        </div>
      </div>
    </div>
  );
}
