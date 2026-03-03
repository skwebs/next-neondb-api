import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/users/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!user) {
    notFound();
  }

  return (
    <UserForm
      mode="edit"
      userId={user.id}
      defaultValues={{ name: user.name, email: user.email }}
    />
  );
}
