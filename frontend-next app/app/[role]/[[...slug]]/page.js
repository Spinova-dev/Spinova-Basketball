import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import LegacyTemplate from "@/components/LegacyTemplate";
import { decodeSession, getSessionCookieName } from "@/lib/auth";
import { roleRouteToFile } from "@/lib/route-map";

export default function RolePage({ params }) {
  const role = params.role;
  const slug = params.slug ?? ["dashboard"];

  if (!["admin", "coach", "player"].includes(role)) {
    notFound();
  }

  const sessionValue = cookies().get(getSessionCookieName())?.value;
  const user = decodeSession(sessionValue);
  if (!user) redirect("/login");
  if (user.role !== role) redirect(`/${user.role}/dashboard`);

  const key = slug.join("/");
  const file = roleRouteToFile[role]?.[key];
  if (!file) notFound();

  return <LegacyTemplate file={file} role={role} user={user} />;
}
