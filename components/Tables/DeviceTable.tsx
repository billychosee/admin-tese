"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatRelativeTime } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import { DEVICE_TYPES } from "@/constants";
import type { Device } from "@/types";

interface DeviceTableProps {
  devices: Device[];
  isLoading?: boolean;
  onForceLogout: (device: Device) => void;
}

export function DeviceTable({
  devices,
  isLoading,
  onForceLogout,
}: DeviceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        device.ipAddress.includes(searchTerm) ||
        device.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.os.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        deviceTypeFilter === "all" || device.deviceType === deviceTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [devices, searchTerm, deviceTypeFilter]);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDeviceIcon = (type: Device["deviceType"]) => {
    switch (type) {
      case "desktop":
        return <Icons.LayoutDashboard size={20} />;
      case "mobile":
        return <Icons.Smartphone size={20} />;
      case "tablet":
        return <Icons.Grid size={20} />;
      default:
        return <Icons.Smartphone size={20} />;
    }
  };

  const getDeviceColor = (type: Device["deviceType"]) => {
    switch (type) {
      case "desktop":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "mobile":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "tablet":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>Devices</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by IP or device..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10"
              />
            </div>
            <select
              value={deviceTypeFilter}
              onChange={(e) => {
                setDeviceTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10"
            >
              {DEVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Device
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Browser
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      OS
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      IP Address
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Location
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Last Active
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Status
                    </th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDevices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No devices found
                      </td>
                    </tr>
                  ) : (
                    paginatedDevices.map((device) => (
                      <tr
                        key={device.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                      >
                        <td className="py-4 px-4">
                          <div className={cn("p-2 rounded-xl w-fit", getDeviceColor(device.deviceType))}>
                            {getDeviceIcon(device.deviceType)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-900 dark:text-white">
                          {device.browser}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                          {device.os}
                        </td>
                        <td className="py-4 px-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                          {device.ipAddress}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                          {device.location.city}, {device.location.country}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatRelativeTime(device.lastActive)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={device.isCurrentSession ? "success" : "neutral"}>
                            {device.isCurrentSession ? "Current" : "Active"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {!device.isCurrentSession && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onForceLogout(device)}
                            >
                              <Icons.LogOut size={14} />
                              Logout
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredDevices.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredDevices.length
                  )}{" "}
                  of {filteredDevices.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icons.ChevronLeft size={16} />
                  </Button>
                  <Button variant="primary" size="sm" disabled>
                    {currentPage} / {totalPages}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icons.ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
