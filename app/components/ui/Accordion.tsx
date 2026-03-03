"use client";

import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import Card from "@/app/components/ui/Card";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

export default function Accordion({ items, defaultOpenId }: AccordionProps) {
  const rootId = useId();
  const [openId, setOpenId] = useState(defaultOpenId ?? items[0]?.id ?? "");

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const expanded = openId === item.id;
        const buttonId = `${rootId}-button-${item.id}`;
        const panelId = `${rootId}-panel-${item.id}`;

        return (
          <Card key={item.id} variant="default" className="overflow-hidden">
            <h3>
              <button
                id={buttonId}
                type="button"
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-frost-blue"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenId(expanded ? "" : item.id)}
              >
                <span className="text-base md:text-lg font-medium text-off-white">{item.title}</span>
                <ChevronDown
                  size={18}
                  className={`text-accent-frost-blue transition-transform duration-300 motion-reduce:transition-none ${expanded ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-all duration-300 motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden px-5 pb-5 text-neutral-300 leading-relaxed">
                {item.content}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
