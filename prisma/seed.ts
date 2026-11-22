import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type StarterItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  pricePaise: number;
  dietary: string;
  imageUrl: string;
  optionGroups: Array<{
    name: string;
    selection: string;
    required: boolean;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    options: Array<{ name: string; priceDeltaPaise: number; sortOrder: number }>;
  }>;
};

const starterItems: StarterItem[] = [
  {
    slug: "assam-milk-chai",
    name: "Assam Milk Chai",
    description: "Strong Assam tea simmered with milk and a little spice.",
    category: "Hot Tea",
    pricePaise: 3000,
    dietary: "VEG",
    imageUrl: "/images/milk-chai.svg",
    optionGroups: [
      {
        name: "Sugar",
        selection: "SINGLE",
        required: true,
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 0,
        options: [
          { name: "Regular", priceDeltaPaise: 0, sortOrder: 0 },
          { name: "Less sugar", priceDeltaPaise: 0, sortOrder: 1 },
          { name: "No sugar", priceDeltaPaise: 0, sortOrder: 2 },
        ],
      },
      {
        name: "Milk",
        selection: "SINGLE",
        required: true,
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 1,
        options: [
          { name: "Dairy", priceDeltaPaise: 0, sortOrder: 0 },
          { name: "Oat milk", priceDeltaPaise: 2000, sortOrder: 1 },
        ],
      },
      {
        name: "Cup size",
        selection: "SINGLE",
        required: true,
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 2,
        options: [
          { name: "Small", priceDeltaPaise: -500, sortOrder: 0 },
          { name: "Regular", priceDeltaPaise: 0, sortOrder: 1 },
          { name: "Large", priceDeltaPaise: 1000, sortOrder: 2 },
        ],
      },
      {
        name: "Add a little extra",
        selection: "MULTI",
        required: false,
        minSelect: 0,
        maxSelect: 2,
        sortOrder: 3,
        options: [
          { name: "Ginger", priceDeltaPaise: 500, sortOrder: 0 },
          { name: "Cardamom", priceDeltaPaise: 500, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "black-assam-tea",
    name: "Black Assam Tea",
    description: "A brisk, malty cup brewed without milk.",
    category: "Hot Tea",
    pricePaise: 2500,
    dietary: "VEG",
    imageUrl: "/images/black-tea.svg",
    optionGroups: [],
  },
  {
    slug: "iced-assam-chai",
    name: "Iced Assam Chai",
    description: "Chilled Assam chai over ice.",
    category: "Cold Drinks",
    pricePaise: 6500,
    dietary: "VEG",
    imageUrl: "/images/iced-tea.svg",
    optionGroups: [],
  },
  {
    slug: "vegetable-samosa",
    name: "Vegetable Samosa",
    description: "A crisp pastry filled with spiced potato and peas.",
    category: "Snacks",
    pricePaise: 2500,
    dietary: "VEG",
    imageUrl: "/images/samosa.svg",
    optionGroups: [],
  },
  {
    slug: "egg-puff",
    name: "Egg Puff",
    description: "Flaky pastry with a spiced egg filling.",
    category: "Snacks",
    pricePaise: 3500,
    dietary: "NON_VEG",
    imageUrl: "/images/egg-puff.svg",
    optionGroups: [],
  },
  {
    slug: "masala-omelette-toast",
    name: "Masala Omelette Toast",
    description: "A spiced omelette served with toasted bread.",
    category: "Light Meals",
    pricePaise: 9000,
    dietary: "NON_VEG",
    imageUrl: "/images/omelette-toast.svg",
    optionGroups: [],
  },
  {
    slug: "assam-ctc-loose-leaf",
    name: "Assam CTC Loose Leaf (100 g)",
    description: "A sample take-home pack of brisk Assam CTC tea.",
    category: "Packaged Tea",
    pricePaise: 16000,
    dietary: "VEG",
    imageUrl: "/images/loose-leaf.svg",
    optionGroups: [],
  },
];

async function main() {
  if (process.env.SEED_STARTER_DATA !== "true") {
    console.info(
      "Starter data seed skipped. Set SEED_STARTER_DATA=true for local development only.",
    );
    return;
  }

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      shopOpen: false,
      businessConfigured: false,
      address: "Temporary sample location - Guwahati, Assam",
      deliveryEnabled: false,
      starterDataMode: true,
      openingHours: {
        create: Array.from({ length: 7 }, (_, weekday) => ({
          weekday,
          isClosed: true,
        })),
      },
    },
    update: { starterDataMode: true, shopOpen: false, businessConfigured: false },
  });

  for (let weekday = 0; weekday < 7; weekday += 1) {
    await prisma.openingHour.upsert({
      where: { settingsId_weekday: { settingsId: "default", weekday } },
      create: { settingsId: "default", weekday, isClosed: true },
      update: {},
    });
  }

  for (const item of starterItems) {
    const optionGroups = item.optionGroups.map(({ options, ...group }) => ({
      ...group,
      options: { create: options },
    }));
    const savedItem = await prisma.menuItem.upsert({
      where: { slug: item.slug },
      create: {
        ...item,
        optionGroups: { create: optionGroups },
        active: true,
        isStarterData: true,
      },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        pricePaise: item.pricePaise,
        dietary: item.dietary,
        imageUrl: item.imageUrl,
        active: true,
        isStarterData: true,
      },
    });

    for (const { options, ...group } of item.optionGroups) {
      const existingGroup = await prisma.menuOptionGroup.findFirst({
        where: { itemId: savedItem.id, name: group.name },
      });
      const savedGroup = existingGroup
        ? await prisma.menuOptionGroup.update({
            where: { id: existingGroup.id },
            data: {
              selection: group.selection,
              required: group.required,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              sortOrder: group.sortOrder,
            },
          })
        : await prisma.menuOptionGroup.create({
            data: {
              ...group,
              itemId: savedItem.id,
              options: { create: options },
            },
          });

      for (const option of options) {
        const existingOption = await prisma.menuOption.findFirst({
          where: { groupId: savedGroup.id, name: option.name },
        });
        if (existingOption) {
          await prisma.menuOption.update({
            where: { id: existingOption.id },
            data: {
              priceDeltaPaise: option.priceDeltaPaise,
              active: true,
              sortOrder: option.sortOrder,
            },
          });
        } else {
          await prisma.menuOption.create({
            data: { ...option, groupId: savedGroup.id },
          });
        }
      }
    }
  }

  const sampleCustomer = await prisma.customer.upsert({
    where: { phone: "sample-only-no-phone" },
    create: { name: "Sample customer (development data)", phone: "sample-only-no-phone" },
    update: { name: "Sample customer (development data)" },
  });
  const sampleItem = await prisma.menuItem.findUniqueOrThrow({
    where: { slug: "assam-milk-chai" },
  });

  await prisma.order.upsert({
    where: { publicId: "AT-0001" },
    create: {
      publicId: "AT-0001",
      customerId: sampleCustomer.id,
      status: "CANCELLED",
      orderType: "PICKUP",
      subtotalPaise: sampleItem.pricePaise,
      totalPaise: sampleItem.pricePaise,
      isSample: true,
      notes: "Development sample; not a customer order.",
      items: {
        create: {
          menuItemId: sampleItem.id,
          nameSnapshot: sampleItem.name,
          unitPricePaise: sampleItem.pricePaise,
          quantity: 1,
          dietarySnapshot: sampleItem.dietary,
          customizationsJson: JSON.stringify([]),
        },
      },
    },
    update: { isSample: true, status: "CANCELLED" },
  });

  await prisma.orderCounter.upsert({
    where: { id: "orders" },
    create: { id: "orders", nextValue: 2 },
    update: {},
  });
}

main()
  .catch((error: unknown) => {
    console.error("Starter data seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
