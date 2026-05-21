import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "../ui/AppIcons";
import type { CalendarDayData, DeadlineItem } from "../../lib/types";

type CalendarCardProps = {
  eventsByDate: Record<string, CalendarDayData>;
};

type CalendarCell = {
  dateKey: string;
  day: number;
  inMonth: boolean;
};

const dayHeaders = ["M", "T", "W", "T", "F", "S", "S"];
const monthLabel = "April 2026";
const defaultSelectedDate = "2026-04-21";

const itemVariants = {
  hidden: { opacity: 0 },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: index * 0.04,
      ease: [0.22, 1, 0.36, 1] as const
    }
  })
};

function ScheduleColumnHeader({ label }: { label: string }) {
  return <p className="section-label mb-6">{label}</p>;
}

function buildCalendarCells(): CalendarCell[] {
  const cells: CalendarCell[] = [];

  for (const day of [30, 31]) {
    cells.push({
      dateKey: `2026-03-${String(day).padStart(2, "0")}`,
      day,
      inMonth: false
    });
  }

  for (let day = 1; day <= 30; day += 1) {
    cells.push({
      dateKey: `2026-04-${String(day).padStart(2, "0")}`,
      day,
      inMonth: true
    });
  }

  for (const day of [1, 2, 3]) {
    cells.push({
      dateKey: `2026-05-${String(day).padStart(2, "0")}`,
      day,
      inMonth: false
    });
  }

  return cells;
}

export function CalendarCard({ eventsByDate }: CalendarCardProps) {
  const [selectedDate, setSelectedDate] = useState<string>(defaultSelectedDate);

  const calendarCells = useMemo(() => buildCalendarCells(), []);
  const selectedDay = eventsByDate[selectedDate];
  const selectedEvents = selectedDay?.meetings ?? [];
  const selectedDeadlines = selectedDay?.deadlines ?? [];
  const fallbackDeadlines = useMemo(() => {
    const deadlineMap = new Map<string, DeadlineItem>();

    Object.values(eventsByDate).forEach((day) => {
      day.deadlines.forEach((deadline) => {
        deadlineMap.set(deadline.id, deadline);
      });
    });

    return Array.from(deadlineMap.values()).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [eventsByDate]);
  const displayedDeadlines = (selectedDeadlines.length > 0 ? selectedDeadlines : fallbackDeadlines).slice(0, 3);

  return (
    <section className="border-t border-[rgba(26,22,18,0.06)] pt-10">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <button type="button" className="text-[#78716C] transition-opacity hover:opacity-50" aria-label="Previous month">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
            </button>
            <p className="font-sans text-[13px] font-normal tracking-wide text-[#1A1612]">{monthLabel}</p>
            <button type="button" className="text-[#78716C] transition-opacity hover:opacity-50" aria-label="Next month">
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {dayHeaders.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="py-1 text-center font-sans text-[10px] text-[rgba(120,113,108,0.5)]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarCells.map((cell) => {
              const isToday = cell.dateKey === defaultSelectedDate;
              const isSelected = selectedDate === cell.dateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateKey)}
                  className={[
                    "flex h-9 items-center justify-center font-sans text-[12px] transition-colors",
                    isSelected ? "font-medium text-[#B8543D]" : "",
                    !isSelected && isToday ? "font-medium text-[#1A1612]" : "",
                    !isSelected && !isToday ? "text-[#1A1612] hover:text-[#78716C]" : "",
                    !cell.inMonth ? "text-[rgba(120,113,108,0.35)]" : ""
                  ].join(" ")}
                >
                  {isSelected ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#B8543D]">
                      {cell.day}
                    </span>
                  ) : (
                    cell.day
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <ScheduleColumnHeader label="Deadlines" />

            {displayedDeadlines.length === 0 ? (
              <p className="font-sans text-[13px] text-[#78716C]">Nothing scheduled.</p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedDate}-deadlines-${displayedDeadlines.length}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {displayedDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      className="flex items-baseline justify-between gap-6 border-b border-[rgba(26,22,18,0.06)] py-5 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-[10px] text-[#78716C]">{deadline.project}</p>
                        <p className="mt-1 font-sans text-[14px] font-normal text-[#1A1612]">{deadline.task}</p>
                      </div>

                      <span className="flex-shrink-0 font-mono text-[11px] tracking-wide text-[#78716C]">
                        {deadline.daysLeft}d
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <div className="min-w-0 lg:border-l lg:border-[rgba(26,22,18,0.06)] lg:pl-16">
            <ScheduleColumnHeader label="Meetings" />

            {selectedEvents.length === 0 ? (
              <p className="font-sans text-[13px] text-[#78716C]">Nothing scheduled.</p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedDate}-meetings-${selectedEvents.length}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {selectedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      className="border-b border-[rgba(26,22,18,0.06)] py-5 last:border-0"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="w-16 flex-shrink-0 font-mono text-[11px] text-[#78716C]">{event.time}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-[14px] font-normal text-[#1A1612]">{event.title}</p>
                          <p className="mt-0.5 font-sans text-[11px] text-[#78716C]">
                            {event.project}
                            <span className="mx-2 text-[rgba(26,22,18,0.15)]">·</span>
                            {event.duration}
                            <span className="mx-2 text-[rgba(26,22,18,0.15)]">·</span>
                            {event.type}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
