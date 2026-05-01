import LegacyTemplate from "@/components/LegacyTemplate";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingCompletePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role || "player";
  const name = session.user.name || "User";
  return <LegacyTemplate file="onboarding/complete.html" role={role} user={{ role, name }} />;
}
