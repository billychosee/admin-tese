'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { SkeletonList } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/providers/ThemeProvider';
import { api } from '@/services/api';
import { cn, formatRelativeTime } from '@/utils';
import { DEVICE_TYPES, MAX_DEVICES } from '@/constants';
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

  const getDeviceIcon = (type: Device['deviceType']) => {
    switch (type) {
      case 'desktop': return <Icons.LayoutDashboard size={20} />;
      case 'mobile': return <Icons.Smartphone size={20} />;
      case 'tablet': return <Icons.Grid size={20} />;
      default: return <Icons.Smartphone size={20} />;
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

  if (isLoading) {
    return (
      <div className={cn("space-y-6 min-h-screen font-sans", isDark ? "bg-[#020617]" : "bg-[#F1F5F9]")}>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 min-h-screen font-sans transition-colors duration-300", isDark ? "bg-[#020617]" : "bg-white")}>
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Active Sessions",
            value: devices.length,
            icon: <Icons.Activity />,
            color: "from-emerald-400 to-emerald-600",
          },
          {
            label: "Max Devices",
            value: MAX_DEVICES,
            icon: <Icons.Users />,
            color: "from-blue-400 to-blue-600",
          },
          {
            label: "Current Session",
            value: currentSession ? currentSession.browser.split(' ')[0] : 'None',
            icon: <Icons.Check />,
            color: "from-purple-400 to-purple-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={cn(
              "p-6 rounded-[2.5rem] text-white bg-gradient-to-br shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-500",
              stat.color,
            )}
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                  {stat.label}
                </span>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-black mt-4">{stat.value}</h3>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
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
            {DEVICE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
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
        <div className="space-y-4">
          {filteredDevices.map((device) => (
            <Card key={device.id} hover={!device.isCurrentSession} className={cn("rounded-[3rem] border-none shadow-xl transition-all duration-300", isDark ? "bg-slate-800" : "bg-white")}>
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    'p-4 rounded-2xl',
                    device.deviceType === 'desktop' && isDark ? 'bg-blue-500/20 text-blue-400' : device.deviceType === 'desktop' ? 'bg-blue-100 text-blue-600' :
                    device.deviceType === 'mobile' && isDark ? 'bg-green-500/20 text-green-400' : device.deviceType === 'mobile' ? 'bg-green-100 text-green-600' :
                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                  )}>
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={cn("text-lg font-black", isDark ? "text-white" : "text-slate-800")}>{device.browser}</h3>
                      <Badge variant={device.isCurrentSession ? 'success' : 'neutral'}>
                        {device.isCurrentSession ? 'Current' : 'Active'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Operating System</p>
                        <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-600")}>{device.os}</p>
                      </div>
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>IP Address</p>
                        <p className={cn("font-mono text-sm", isDark ? "text-slate-300" : "text-slate-600")}>{device.ipAddress}</p>
                      </div>
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Location</p>
                        <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-600")}>{device.location.city}, {device.location.country}</p>
                      </div>
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Last Active</p>
                        <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-600")}>{formatRelativeTime(device.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                  {!device.isCurrentSession && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowLogoutModal(true);
                      }}
                    >
                      <Icons.LogOut size={16} />
                      Force Logout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
