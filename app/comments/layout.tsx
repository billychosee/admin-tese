import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function CommentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
