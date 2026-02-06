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
  const [blockedFilter, setBlockedFilter] = useState<'all' | 'blocked' | 'unblocked'>('all');
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
      const matchesBlocked =
        blockedFilter === 'all' ||
        (blockedFilter === 'blocked' && device.isBlocked) ||
        (blockedFilter === 'unblocked' && !device.isBlocked);
      return matchesSearch && matchesType && matchesBlocked;
    });
  }, [devices, searchTerm, deviceTypeFilter, blockedFilter]);

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
            <div className="relative">
              <select
                value={deviceTypeFilter}
                onChange={(e) => {
                  setDeviceTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={blockedFilter}
                onChange={(e) => {
                  setBlockedFilter(e.target.value as 'all' | 'blocked' | 'unblocked');
                  setCurrentPage(1);
                }}
                className="appearance-none w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="unblocked">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            {/* Mobile skeleton */}
            <div className="sm:hidden space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                    <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden sm:block space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden">
              {paginatedDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Icons.Smartphone size={32} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium">No devices found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      {/* Top Row - Device Icon, Browser/OS, Status */}
                      <div className="flex items-center gap-3 p-4">
                        {/* Device Icon */}
                        <div className={cn("p-3 rounded-xl w-fit", getDeviceColor(device.deviceType))}>
                          {getDeviceIcon(device.deviceType)}
                        </div>

                        {/* Browser and OS */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {device.browser}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {device.os}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant={device.isBlocked ? "danger" : device.isCurrentSession ? "success" : "neutral"}
                          className="capitalize text-xs"
                        >
                          {device.isBlocked ? "Blocked" : device.isCurrentSession ? "Current" : "Active"}
                        </Badge>
                      </div>

                      {/* IP and Location Row */}
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icons.Globe size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {device.location.city}, {device.location.country}
                            </span>
                          </div>
                          <code className="text-xs font-mono text-slate-600 dark:text-slate-300">
                            {device.ipAddress}
                          </code>
                        </div>
                      </div>

                      {/* Last Active Row */}
                      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Icons.Clock size={14} />
                          <span>Last active: {formatRelativeTime(device.lastActive)}</span>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                        {!device.isBlocked && !device.isCurrentSession && (
                          <button
                            onClick={() => onForceLogout(device)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Icons.LogOut size={14} />
                            Force Logout
                          </button>
                        )}
                        {device.isBlocked && (
                          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <Icons.Lock size={14} />
                            Device is Blocked
                          </div>
                        )}
                        {device.isCurrentSession && (
                          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium">
                            <Icons.CheckCircle size={14} />
                            Current Session
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
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
                          <Badge variant={device.isBlocked ? "danger" : device.isCurrentSession ? "success" : "neutral"}>
                            {device.isBlocked ? "Blocked" : device.isCurrentSession ? "Current" : "Active"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {!device.isBlocked && !device.isCurrentSession && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onForceLogout(device)}
                            >
                              <Icons.LogOut size={14} />
                              Logout
                            </Button>
                          )}
                          {device.isBlocked && (
                            <span className="text-xs text-red-500 dark:text-red-400">Blocked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 sm:hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredDevices.length
                  )}
                  -
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredDevices.length
                  )}{" "}
                  of {filteredDevices.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icons.ChevronLeft size={14} />
                  </Button>
                  <Button variant="primary" size="sm" disabled className="px-3">
                    {currentPage}/{totalPages}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icons.ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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
