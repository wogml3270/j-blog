import { ContactManager } from "@/components/admin/contact-manager";
import { getAdminContactMessages } from "@/lib/contact/repository";

type AdminContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

export default async function AdminContactPage({ searchParams }: AdminContactPageProps) {
  const contacts = await getAdminContactMessages();
  const query = await searchParams;
  const initialSelectedId = pickQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">문의 관리</h1>
      <ContactManager initialContacts={contacts} initialSelectedId={initialSelectedId} />
    </main>
  );
}
