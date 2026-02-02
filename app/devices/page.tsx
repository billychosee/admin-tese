'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { SkeletonList } from '@/components/ui/Skeleton';
import { DeviceTable } from '@/components/Tables/DeviceTable';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/providers/ThemeProvider';
import { api } from '@/services/api';
import { cn, formatRelativeTime } from '@/utils';
import { MAX_DEVICES } from '@/constants';
import type { Device } from '@/types';

export default function DevicesPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const data = await api.devices.getAll();
      setDevices(data);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch devices' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceLogout = async () => {
    if (!selectedDevice) return;
    try {
      await api.devices.forceLogout(selectedDevice.id);
      addToast({ type: 'success', title: 'Success', message: 'Device logged out successfully' });
      setShowLogoutModal(false);
      setSelectedDevice(null);
      fetchDevices();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to logout device' });
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.ipAddress.includes(searchQuery) ||
      device.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.os.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = deviceTypeFilter === 'all' || device.deviceType === deviceTypeFilter;
    return matchesSearch && matchesType;
  });

  const currentSession = devices.find((d) => d.isCurrentSession);

  // Dashboard-style colors
  const colors = {
    surface: "bg-[hsl(var(--surface))]",
    surfaceBorder: "border-[hsl(var(--surface-border))]",
    textPrimary: "text-[hsl(var(--text-primary))]",
    textMuted: "text-[hsl(var(--text-muted))]",
  };

  // Stats cards with dashboard styling
  const statsCards = [
    {
      label: "Active Sessions",
      value: devices.length,
      icon: <Icons.Activity size={20} />,
      iconColor: "text-emerald-500",
      iconBg: isDark ? "bg-emerald-500/20" : "bg-emerald-100",
    },
    {
      label: "Max Devices",
      value: MAX_DEVICES,
      icon: <Icons.Users size={20} />,
      iconColor: "text-blue-500",
      iconBg: isDark ? "bg-blue-500/20" : "bg-blue-100",
    },
    {
      label: "Current Session",
      value: currentSession ? currentSession.browser.split(' ')[0] : 'None',
      icon: <Icons.Check size={20} />,
      iconColor: "text-purple-500",
      iconBg: isDark ? "bg-purple-500/20" : "bg-purple-100",
    },
  ];

  if (isLoading) {
    return (
      <div className={cn("space-y-6 min-h-screen font-sans", isDark ? "bg-[#020617]" : "bg-[#F1F5F9]")}>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 min-h-screen font-sans transition-colors duration-300", isDark ? "bg-[#020617]" : "bg-white")}>
      {/* Stats Cards - Dashboard Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
              colors.surfaceBorder,
              colors.surface,
            )}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium uppercase tracking-wider", colors.textMuted)}>
                  {card.label}
                </span>
                <div className={cn("p-2 rounded-lg", card.iconBg)}>
                  <span className={card.iconColor}>{card.icon}</span>
                </div>
              </div>
              <h3 className={cn("text-2xl font-bold mt-3", colors.textPrimary)}>
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("relative", isDark ? "bg-slate-800" : "bg-white")}>
            <Input
              placeholder="Search by IP or device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-64 pl-10", isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "bg-slate-50 border-slate-200")}
            />
            <Icons.Search size={18} className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-slate-400" : "text-slate-400")} />
          </div>
          <select
            value={deviceTypeFilter}
            onChange={(e) => setDeviceTypeFilter(e.target.value)}
            className={cn("input w-40", isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200")}
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <Card className={cn("p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300", isDark ? "bg-slate-800" : "bg-white")}>
          <CardContent>
            <Icons.Smartphone className={cn("mx-auto h-16 w-16 mb-4", isDark ? "text-slate-600" : "text-slate-300")} />
            <p className={cn("text-lg font-medium", isDark ? "text-slate-400" : "text-slate-500")}>No devices found</p>
          </CardContent>
        </Card>
      ) : (
        <DeviceTable
          devices={filteredDevices}
          isLoading={isLoading}
          onForceLogout={(device) => {
            setSelectedDevice(device);
            setShowLogoutModal(true);
          }}
        />
      )}

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleForceLogout}
        title="Force Logout"
        message="Are you sure you want to force logout this device? They will need to log in again."
        confirmText="Logout Device"
        variant="danger"
      />
    </div>
  );
}
