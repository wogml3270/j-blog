import { ContactManager } from "@/components/admin/contact/contact-manager";
import { getAdminContactMessages } from "@/lib/contact/repository";
import { pickSingleQueryValue } from "@/lib/utils/search-params";

type AdminContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminContactPage({ searchParams }: AdminContactPageProps) {
  const contacts = await getAdminContactMessages();
  const query = await searchParams;
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">문의 관리</h1>
      <ContactManager initialContacts={contacts} initialSelectedId={initialSelectedId} />
    </main>
  );
}
