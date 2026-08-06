import { redirect } from "next/navigation";

interface PetsDetailRedirectProps {
  params: Promise<{ petId: string }>;
}

export default async function PetsDetailRedirect({
  params,
}: PetsDetailRedirectProps) {
  const { petId } = await params;
  redirect(`/dashboard/companion/${petId}`);
}
