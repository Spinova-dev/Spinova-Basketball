import { notFound, redirect } from "next/navigation";
import LegacyTemplate from "@/components/LegacyTemplate";
import { auth } from "@/auth";
import { roleRouteToFile } from "@/lib/route-map";

export default async function RolePage({ params }) {
  const role = params.role;
  const slug = params.slug ?? ["dashboard"];

  if (!["admin", "coach", "player"].includes(role)) {
    notFound();
  }

  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role || "player";
  if (userRole !== role) redirect(`/${userRole}/dashboard`);

  const key = slug.join("/");
  const file = roleRouteToFile[role]?.[key];
  if (!file) notFound();

  const user = {
    email: session.user.email,
    name: session.user.name,
    role: userRole
  };

  return <LegacyTemplate file={file} role={role} user={user} />;
}
