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

function VercelIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}

function CognitionIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      {...props}
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ElevenLabsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="7" y="4" width="3" height="16" rx="1" />
      <rect x="14" y="4" width="3" height="16" rx="1" />
    </svg>
  );
}

function MidjourneyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm4 3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
    </svg>
  );
}

type ColorVariant =
  | "cyan"
  | "emerald"
  | "purple"
  | "orange"
  | "rose"
  | "indigo"
  | "amber";

const colorStyles: Record<ColorVariant, string> = {
  cyan: "bg-cyan-100 dark:bg-cyan-900/40 border-cyan-300 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100",
  emerald:
    "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100",
  purple:
    "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100",
  orange:
    "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100",
  rose: "bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100",
  indigo:
    "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100",
  amber:
    "bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100",
};

const offerStyles: Record<ColorVariant, string> = {
  cyan: "bg-cyan-500 dark:bg-cyan-600 border-cyan-600 dark:border-cyan-500 text-white",
  emerald:
    "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white",
  purple:
    "bg-purple-500 dark:bg-purple-600 border-purple-600 dark:border-purple-500 text-white",
  orange:
    "bg-orange-500 dark:bg-orange-600 border-orange-600 dark:border-orange-500 text-white",
  rose: "bg-rose-500 dark:bg-rose-600 border-rose-600 dark:border-rose-500 text-white",
  indigo:
    "bg-indigo-500 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-500 text-white",
  amber:
    "bg-amber-500 dark:bg-amber-600 border-amber-600 dark:border-amber-500 text-white",
};

type IconType =
  | "cursor"
  | "openai"
  | "vercel"
  | "cognition"
  | "x"
  | "elevenlabs"
  | "midjourney";

const iconComponents: Record<IconType, React.ComponentType<IconProps>> = {
  cursor: CursorIcon,
  openai: OpenAIIcon,
  vercel: VercelIcon,
  cognition: CognitionIcon,
  x: XIcon,
  elevenlabs: ElevenLabsIcon,
  midjourney: MidjourneyIcon,
};

interface EventCardProps {
  title: string;
  color: ColorVariant;
  icon: IconType;
  isOffer?: boolean;
  isSigned?: boolean;
}

function EventCard({
  title,
  color,
  icon,
  isOffer = false,
  isSigned = false,
}: EventCardProps) {
  const Icon = iconComponents[icon];

  return (
    <div
      className={cn(
        "border rounded flex items-center gap-1.5 h-full px-2 py-1.5 min-h-[32px]",
        isSigned
          ? "bg-gradient-to-r from-cyan-500 to-emerald-500 dark:from-cyan-600 dark:to-emerald-600 border-cyan-400 dark:border-cyan-500 text-white ring-2 ring-cyan-400/50 dark:ring-cyan-500/50"
          : isOffer
          ? offerStyles[color]
          : colorStyles[color]
      )}
    >
      <Icon className="size-4 shrink-0" />
      <div className="font-medium leading-tight text-[11px]">{title}</div>
      {isSigned && <CheckIcon className="size-3.5 shrink-0 ml-auto" />}
    </div>
  );
}

const WEEKEND_PATTERN =
  "repeating-linear-gradient(-45deg, transparent, transparent calc(3px * 1.414), rgba(0,0,0,0.03) calc(3px * 1.414), rgba(0,0,0,0.03) calc(4px * 1.414))";

// Timeline - 14 days like a calendar:
// Week 1: Thu Fri Sat Sun Mon Tue Wed
// Week 2: Thu Fri Sat Sun Mon Tue Wed Thu

const DAYS_WEEK1 = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
const DAYS_WEEK2 = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];

export function FinalInterviews() {
  const thClass =
    "text-center text-xs font-medium text-neutral-400 py-2 border-l border-neutral-200 dark:border-neutral-800";
  const tdClass =
    "border-l border-neutral-200 dark:border-neutral-800 p-1 align-top h-12";
  const weekendClass = "bg-neutral-100/80 dark:bg-neutral-800/50";

  const isWeekend = (day: string) => day === "Sat" || day === "Sun";

  return (
    <div className="mt-8 mb-6 rounded-2xl border overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          {/* Week labels */}
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th
              colSpan={7}
              className="text-center text-[10px] font-medium text-neutral-400 py-1"
            >
              Week 1
            </th>
            <th
              colSpan={8}
              className="text-center text-[10px] font-medium text-neutral-400 py-1 border-l border-neutral-200 dark:border-neutral-800"
            >
              Week 2
            </th>
          </tr>
          {/* Day headers */}
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {DAYS_WEEK1.map((day, i) => (
              <th
                key={`w1-${i}`}
                className={cn(
                  thClass,
                  i === 0 && "border-l-0",
                  isWeekend(day) && weekendClass
                )}
                style={
                  isWeekend(day)
                    ? { backgroundImage: WEEKEND_PATTERN }
                    : undefined
                }
              >
                {day}
              </th>
            ))}
            {DAYS_WEEK2.map((day, i) => (
              <th
                key={`w2-${i}`}
                className={cn(thClass, isWeekend(day) && weekendClass)}
                style={
                  isWeekend(day)
                    ? { backgroundImage: WEEKEND_PATTERN }
                    : undefined
                }
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Row 1: Cursor process */}
          <tr>
            {/* Week 1: Thu Fri Sat Sun Mon Tue Wed */}
            <td className={cn(tdClass, "border-l-0")}>
              <EventCard title="Viral Post" color="rose" icon="x" />
            </td>
            <td className={tdClass}></td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>
            <td className={tdClass}></td>
            {/* Tue-Wed: Cursor Trial */}
            <td colSpan={2} className={tdClass}>
              <EventCard title="Cursor Trial" color="cyan" icon="cursor" />
            </td>
            {/* Week 2: Thu Fri Sat Sun Mon Tue Wed Thu */}
            {/* Thu: Coding */}
            <td className={tdClass}>
              <EventCard title="Coding" color="cyan" icon="cursor" />
            </td>
            <td className={tdClass}>
              <EventCard
                title="ElevenLabs offer"
                color="indigo"
                icon="elevenlabs"
                isOffer
              />
            </td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>
            {/* Mon: Cursor Offer */}
            <td className={tdClass}>
              <EventCard
                title="Cursor Offer"
                color="cyan"
                icon="cursor"
                isOffer
              />
            </td>
            <td className={tdClass}></td>
            <td className={tdClass}></td>
            {/* Thu: Signed */}
            <td className={tdClass}>
              <EventCard title="Signed!" color="cyan" icon="cursor" isSigned />
            </td>
          </tr>
          {/* Row 2: Cognition + OpenAI */}
          <tr>
            {/* Week 1: Thu Fri Sat Sun Mon Tue Wed */}
            <td className={cn(tdClass, "border-l-0")}></td>
            <td className={tdClass}></td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>

            {/* Sun-Mon: Cognition */}
            <td colSpan={2} className={tdClass}>
              <EventCard title="Cognition" color="orange" icon="cognition" />
            </td>
            <td className={tdClass}></td>
            <td className={tdClass}></td>
            {/* Week 2: Thu Fri Sat Sun Mon Tue Wed Thu */}
            <td className={tdClass}>
              <EventCard
                title="Vercel Offer"
                color="purple"
                icon="vercel"
                isOffer
              />
            </td>
            <td className={tdClass}>
              <EventCard
                title="Midjourney offer"
                color="amber"
                icon="midjourney"
                isOffer
              />
            </td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>
            <td
              className={cn(tdClass, weekendClass)}
              style={{ backgroundImage: WEEKEND_PATTERN }}
            ></td>
            {/* Mon-Tue: OpenAI */}
            <td colSpan={2} className={tdClass}>
              <EventCard title="OpenAI" color="emerald" icon="openai" />
            </td>
            {/* Wed: OpenAI Offer */}
            <td className={tdClass}>
              <EventCard
                title="OpenAI Offer"
                color="emerald"
                icon="openai"
                isOffer
              />
            </td>
            <td className={tdClass}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
