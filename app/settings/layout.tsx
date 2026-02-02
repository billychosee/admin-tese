import { Metadata } from "next";
import SettingsClientLayout from "./SettingsClientLayout";

export const metadata: Metadata = {
  title: "Settings - TESE Admin Portal",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsClientLayout>{children}</SettingsClientLayout>;
}
