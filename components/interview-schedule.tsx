import { cn } from "@/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement>;

function CursorIcon(props: IconProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 470 545"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m466.383 137.073-206.469-119.2034c-6.63-3.8287-14.811-3.8287-21.441 0l-206.4586 119.2034c-5.5734 3.218-9.0144 9.169-9.0144 15.615v240.375c0 6.436 3.441 12.397 9.0144 15.615l206.4686 119.203c6.63 3.829 14.811 3.829 21.441 0l206.468-119.203c5.574-3.218 9.015-9.17 9.015-15.615v-240.375c0-6.436-3.441-12.397-9.015-15.615zm-12.969 25.25-199.316 345.223c-1.347 2.326-4.904 1.376-4.904-1.319v-226.048c0-4.517-2.414-8.695-6.33-10.963l-195.7577-113.019c-2.3263-1.347-1.3764-4.905 1.3182-4.905h398.6305c5.661 0 9.199 6.136 6.368 11.041h-.009z"
        fill="currentColor"
      />
    </svg>
  );
}

function OpenAIIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4043-.6885zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

type ColorVariant = "cyan" | "emerald" | "blue" | "purple" | "orange" | "pink";

const colorStyles: Record<ColorVariant, string> = {
  cyan: "bg-cyan-100 dark:bg-cyan-900/40 border-cyan-300 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100",
  emerald:
    "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100",
  blue: "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100",
  purple:
    "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100",
  orange:
    "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100",
  pink: "bg-pink-100 dark:bg-pink-900/40 border-pink-300 dark:border-pink-700 text-pink-900 dark:text-pink-100",
};

type IconType = "cursor" | "openai";

const iconComponents: Record<IconType, React.ComponentType<IconProps>> = {
  cursor: CursorIcon,
  openai: OpenAIIcon,
};

interface ScheduleEvent {
  title: string;
  color: ColorVariant;
  icon: IconType;
  day: number; // 0-6 (Tue-Mon)
  hour: number; // 0-6 (3PM-9PM)
  spanHours?: number;
  spanDays?: number;
}

function EventCard({
  title,
  color,
  icon,
  compact = true,
}: {
  title: string;
  color: ColorVariant;
  icon: IconType;
  compact?: boolean;
}) {
  const Icon = iconComponents[icon];

  return (
    <div
      className={cn(
        "border rounded flex flex-wrap gap-1.5 h-full",
        compact ? "px-1.5 py-1 items-center" : "px-2 py-1.5 gap-2",
        colorStyles[color]
      )}
    >
      <Icon className="size-4 my-1" />
      <div
        className={cn(
          "font-medium leading-tight",
          compact ? "text-[10px]" : "text-[11px] py-1"
        )}
      >
        {title}
      </div>
    </div>
  );
}

const DAYS = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const HOURS = ["3PM", "5PM", "6PM", "7PM", "8PM", "9PM"];
const WEEKEND_PATTERN =
  "repeating-linear-gradient(-45deg, transparent, transparent calc(3px * 1.414), rgba(0,0,0,0.03) calc(3px * 1.414), rgba(0,0,0,0.03) calc(4px * 1.414))";

const events: ScheduleEvent[] = [
  {
    title: "Open-ended Project",
    color: "cyan",
    icon: "cursor",
    day: 0,
    hour: 0,
    spanHours: 6,
    spanDays: 2,
  },
  { title: "Coding", color: "cyan", icon: "cursor", day: 2, hour: 0 },
  { title: "System Design", color: "emerald", icon: "openai", day: 6, hour: 1 },
  { title: "Coding", color: "blue", icon: "openai", day: 6, hour: 2 },
  { title: "Hiring Manager", color: "purple", icon: "openai", day: 6, hour: 3 },
  { title: "Refactoring", color: "orange", icon: "openai", day: 6, hour: 4 },
  { title: "Team Chat", color: "pink", icon: "openai", day: 6, hour: 5 },
];

export function InterviewSchedule() {
  // Find spanning events for positioning
  const spanningEvent = events.find((e) => e.spanHours && e.spanHours > 1);

  return (
    <div className="mt-8 mb-6 rounded-2xl border">
      <div className="relative overflow-x-auto">
        {/* Header row */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 min-w-[600px]">
          <div className="w-12 shrink-0" />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-medium text-neutral-400 py-3 pb-1 border-l border-neutral-200 dark:border-neutral-800",
                i < 4 ? "flex-[3]" : i < 6 ? "flex-1" : "flex-[3]",
                (i === 4 || i === 5) &&
                  "bg-neutral-100/80 dark:bg-neutral-800/50"
              )}
              style={
                i === 4 || i === 5
                  ? { backgroundImage: WEEKEND_PATTERN }
                  : undefined
              }
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="relative min-w-[600px]">
          {/* Spanning event overlay */}
          {spanningEvent && (
            <div
              className="absolute top-0 left-12 z-10 p-1"
              style={{
                width: `calc((100% - 48px) * ${
                  (spanningEvent.spanDays ?? 1) * 2.1
                } / 12)`,
                height: `calc(100%)`,
              }}
            >
              <EventCard
                title={spanningEvent.title}
                color={spanningEvent.color}
                icon={spanningEvent.icon}
                compact={false}
              />
            </div>
          )}

          {/* Hour rows */}
          {HOURS.map((hour, hourIndex) => (
            <div
              key={hour}
              className={cn(
                "flex min-h-[36px]",
                hourIndex < HOURS.length - 1 &&
                  "border-b border-neutral-100 dark:border-neutral-800/50"
              )}
            >
              <div className="w-12 shrink-0 flex items-center justify-end pr-2 text-[10px] text-neutral-400">
                {hour}
              </div>
              <div
                className="flex-1 grid"
                style={{ gridTemplateColumns: "3fr 3fr 3fr 3fr 1fr 1fr 3fr" }}
              >
                {DAYS.map((day, dayIndex) => {
                  const event = events.find(
                    (e) =>
                      e.day === dayIndex &&
                      e.hour === hourIndex &&
                      !(e.spanHours && e.spanHours > 1)
                  );
                  const isWeekend = dayIndex === 4 || dayIndex === 5;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={cn(
                        "border-l border-neutral-200 dark:border-neutral-800",
                        isWeekend && "bg-neutral-100/80 dark:bg-neutral-800/50",
                        event && "p-1"
                      )}
                      style={
                        isWeekend
                          ? { backgroundImage: WEEKEND_PATTERN }
                          : undefined
                      }
                    >
                      {event && (
                        <EventCard
                          title={event.title}
                          color={event.color}
                          icon={event.icon}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
