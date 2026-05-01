import { notFound, redirect } from "next/navigation";
import LegacyTemplate from "@/components/LegacyTemplate";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }) {
  const type = params.type;
  if (!["player", "coach"].includes(type)) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role || "player";
  if (role !== type) {
    redirect(`/${role}/dashboard`);
  }

  if (type === "player") {
    return <LegacyTemplate file="onboarding/player.html" role="" user={{ role: "", name: "" }} />;
  }
  if (type === "coach") {
    return <LegacyTemplate file="onboarding/coach.html" role="" user={{ role: "", name: "" }} />;
  }
  notFound();
}
