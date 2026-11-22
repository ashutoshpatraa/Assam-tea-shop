import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ItemCustomizer from "@/components/item-customizer";

export const instant = false;

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.menuItem.findUnique({
    where: { slug },
    include: {
      optionGroups: {
        where: { options: { some: { active: true } } },
        include: { options: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!item || !item.active) notFound();

  return (
    <ItemCustomizer
      item={{
        id: item.id,
        name: item.name,
        slug: item.slug,
        category: item.category,
        imageUrl: item.imageUrl,
        pricePaise: item.pricePaise,
        dietary: item.dietary,
        soldOutToday: item.soldOutToday,
        description: item.description,
        optionGroups: item.optionGroups.map((group) => ({
          id: group.id,
          name: group.name,
          selection: group.selection,
          required: group.required,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          options: group.options.map((option) => ({
            id: option.id,
            name: option.name,
            priceDeltaPaise: option.priceDeltaPaise,
          })),
        })),
      }}
    />
  );
}
