import HomeStorefront from "@/components/home-storefront";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function HomePage() {
  const [settings, featured] = await Promise.all([
    prisma.businessSettings.findUnique({
      where: { id: "default" },
      include: { openingHours: { orderBy: { weekday: "asc" } } },
    }),
    prisma.menuItem.findMany({
      where: { active: true, soldOutToday: false },
      take: 8,
      orderBy: { createdAt: "asc" },
      include: { optionGroups: { select: { id: true } } },
    }),
  ]);
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const time = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const hours = (settings?.openingHours ?? []).map((entry) => entry.isClosed || entry.openMinute === null || entry.closeMinute === null
    ? `${weekdays[entry.weekday]} · Closed`
    : `${weekdays[entry.weekday]} · ${time(entry.openMinute)}–${time(entry.closeMinute)}`,
  );

  return <HomeStorefront
    featured={featured.map(({ optionGroups, ...item }) => ({ ...item, optionGroupCount: optionGroups.length }))}
    shop={{ address: settings?.address ?? "", mapUrl: settings?.mapUrl ?? null, hours, acceptingOrders: Boolean(settings?.businessConfigured && settings.shopOpen) }}
  />;
}
