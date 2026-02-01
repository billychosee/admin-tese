"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function TransactionsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
