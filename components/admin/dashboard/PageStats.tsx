"use client";

import { Globe, Calendar, Ticket, DollarSign, Users } from "lucide-react";

interface StatMeta {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  valueColor: string;
}

const STAT_META: Record<string, StatMeta> = {
  totalPages: {
    label: "Total Pages",
    icon: Globe,
    iconColor: "text-blue-600",
    valueColor: "text-blue-400 dark:text-blue-300",
  },
  totalEvents: {
    label: "Active Events", 
    icon: Calendar,
    iconColor: "text-green-600",
    valueColor: "text-blue-400 dark:text-blue-300",
  },
  totalTicketsSold: {
    label: "Tickets Sold",
    icon: Ticket,
    iconColor: "text-purple-600", 
    valueColor: "text-blue-400 dark:text-blue-300",
  },
  totalRevenue: {
    label: "Revenue",
    icon: DollarSign,
    iconColor: "text-orange-600",
    valueColor: "text-blue-400 dark:text-blue-300",
  },
  activeUsers: {
    label: "Active Users",
    icon: Users,
    iconColor: "text-pink-600",
    valueColor: "text-blue-400 dark:text-blue-300",
  },
};

export function PagesStats({
  stats,
}: {
  stats: Record<string, number | string>;
}) {
  const entries = Object.entries(stats).filter(
    ([, v]) => typeof v === "number" || (typeof v === "string" && v !== "")
  );

  if (!entries.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {entries.map(([key, rawVal]) => {
        const meta: StatMeta =
          STAT_META[key] || {
            label: key
              .replace(/([A-Z])/g, " $1")
              .replace(/^\w/, (c) => c.toUpperCase()),
            icon: Globe,
            iconColor: "text-gray-600",
            valueColor: "text-blue-400 dark:text-blue-300",
          };

        let value: string;
        let displayValue: number | string = rawVal;
        
        if (typeof rawVal === "number") {
          displayValue = rawVal;
          if (key === "totalRevenue") {
            value = "$" + rawVal.toLocaleString();
          } else {
            value = rawVal.toLocaleString();
          }
        } else {
          value = String(rawVal);
          // Try to extract number from string for display
          const numMatch = String(rawVal).match(/\d+/);
          displayValue = numMatch ? parseInt(numMatch[0]) : rawVal;
        }

        const Icon = meta.icon;
        
        return (
          <div
            key={key}
            className=" dark:bg-gray-800 rounded-2xl p-6 border border-gray-800 dark:border-gray-700 hover:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider">
                {meta.label}
              </h3>
              <div className="w-12 h-12 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center shadow-md">
                <Icon className={`w-6 h-6 ${meta.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center">
              <span className={`text-4xl font-bold ${meta.valueColor}`}>
                {key === 'totalRevenue' && typeof displayValue === 'number' ? '$' : ''}
                {typeof displayValue === 'number' ? displayValue : value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
