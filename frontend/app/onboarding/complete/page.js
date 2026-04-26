import LegacyTemplate from "@/components/LegacyTemplate";

export const dynamic = "force-dynamic";

export default function OnboardingCompletePage() {
  return <LegacyTemplate file="onboarding/complete.html" role="" user={{ role: "", name: "" }} />;
}
