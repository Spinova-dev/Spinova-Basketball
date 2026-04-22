import { notFound } from "next/navigation";
import LegacyTemplate from "@/components/LegacyTemplate";

export default function OnboardingPage({ params }) {
  if (params.type === "player") {
    return <LegacyTemplate file="onboarding/player.html" role="" user={{ role: "", name: "" }} />;
  }
  if (params.type === "coach") {
    return <LegacyTemplate file="onboarding/coach.html" role="" user={{ role: "", name: "" }} />;
  }
  notFound();
}
