import { redirect } from "next/navigation";

export const instant = false;

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const { table } = await searchParams;
  if (table && /^\d{1,4}$/.test(table)) {
    redirect(`/checkout?table=${encodeURIComponent(table)}`);
  }
  redirect("/menu");
}
