"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DevicesLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
