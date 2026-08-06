import { redirect } from "next/navigation";

export default function PetsPageRedirect() {
  redirect("/dashboard/companion");
}
