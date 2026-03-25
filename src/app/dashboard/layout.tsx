import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function SubscriberLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="SUBSCRIBER">{children}</DashboardLayout>;
}
