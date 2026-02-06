"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatDate } from "@/utils";
import { ADMIN_ROLES, PERMISSION_MODULES, FEE_TYPES } from "@/constants";
import type {
  AdminUser,
  Role,
  Permission,
  FeeConfiguration,
  ActivityLog,
} from "@/types";

type SettingsTab = "users" | "roles" | "fees" | "activity";

export default function SettingsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Activity log state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Password reset state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordResetTarget, setPasswordResetTarget] =
    useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Fees state
  const [fees, setFees] = useState<FeeConfiguration[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(true);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "role";
    id: string;
    name: string;
  } | null>(null);

  // Form states
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> | null>(
    null,
  );
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [editingFee, setEditingFee] =
    useState<Partial<FeeConfiguration> | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === "users") {
      setIsLoadingUsers(true);
      try {
        const data = await api.adminUsers.getAll();
        setUsers(data);
      } catch {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load users",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    } else if (activeTab === "activity") {
      setIsLoadingActivity(true);
      try {
        const data = await api.activityLog.getAll();
        setActivityLogs(data);
      } catch {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load activity logs",
        });
      } finally {
        setIsLoadingActivity(false);
      }
    } else if (activeTab === "roles") {
      setIsLoadingRoles(true);
      try {
        const [rolesData, permsData] = await Promise.all([
          api.roles.getAll(),
          api.permissions.getAll(),
        ]);
        setRoles(rolesData);
        setPermissions(permsData);
      } catch {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load roles",
        });
      } finally {
        setIsLoadingRoles(false);
      }
    } else if (activeTab === "fees") {
      setIsLoadingFees(true);
      try {
        const data = await api.fees.getAll();
        setFees(data);
      } catch {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load fees",
        });
      } finally {
        setIsLoadingFees(false);
      }
    }
  };

  // User handlers
  const handleCreateUser = () => {
    setEditingUser({
      email: "",
      name: "",
      role: "admin",
      isActive: true,
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      if (editingUser.id) {
        await api.adminUsers.update(editingUser.id, editingUser);
        addToast({
          type: "success",
          title: "Success",
          message: "User updated successfully",
        });
      } else {
        await api.adminUsers.create(
          editingUser as Omit<AdminUser, "id" | "createdAt">,
        );
        addToast({
          type: "success",
          title: "Success",
          message: "User created successfully",
        });
      }
      setShowUserModal(false);
      setEditingUser(null);
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to save user",
      });
    }
  };

  const handleToggleUserActive = async (user: AdminUser) => {
    try {
      await api.adminUsers.toggleActive(user.id);
      addToast({
        type: "success",
        title: "Success",
        message: `User ${user.isActive ? "deactivated" : "activated"}`,
      });
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update user status",
      });
    }
  };

  // Bulk user actions
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    try {
      await api.adminUsers.bulkActivate(Array.from(selectedUsers), activate);
      addToast({
        type: "success",
        title: "Success",
        message: `${selectedUsers.size} users ${activate ? "activated" : "deactivated"}`,
      });
      setSelectedUsers(new Set());
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update users",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.adminUsers.bulkDelete(Array.from(selectedUsers));
      addToast({
        type: "success",
        title: "Success",
        message: `${selectedUsers.size} users deleted`,
      });
      setSelectedUsers(new Set());
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete users",
      });
    }
  };

  // Password reset handlers
  const handleOpenPasswordModal = (user: AdminUser) => {
    setPasswordResetTarget(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!passwordResetTarget) return;
    if (newPassword !== confirmPassword) {
      addToast({
        type: "error",
        title: "Error",
        message: "Passwords do not match",
      });
      return;
    }
    if (newPassword.length < 8) {
      addToast({
        type: "error",
        title: "Error",
        message: "Password must be at least 8 characters",
      });
      return;
    }
    try {
      await api.adminUsers.resetPassword(passwordResetTarget.id, newPassword);
      addToast({
        type: "success",
        title: "Success",
        message: "Password reset successfully",
      });
      setShowPasswordModal(false);
      setPasswordResetTarget(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to reset password",
      });
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (userId: string, file: File) => {
    try {
      const avatarUrl = await api.adminUsers.uploadAvatar(userId, file);
      setEditingUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
      addToast({
        type: "success",
        title: "Success",
        message: "Avatar uploaded successfully",
      });
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to upload avatar",
      });
    }
  };

  // Filtered users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearch.toLowerCase()),
  );

  // Role handlers
  const handleCreateRole = () => {
    setEditingRole({
      name: "",
      description: "",
      permissions: [],
    });
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;
    try {
      if (editingRole.id) {
        await api.roles.update(editingRole.id, editingRole);
        addToast({
          type: "success",
          title: "Success",
          message: "Role updated successfully",
        });
      } else {
        await api.roles.create(editingRole as Omit<Role, "id" | "createdAt">);
        addToast({
          type: "success",
          title: "Success",
          message: "Role created successfully",
        });
      }
      setShowRoleModal(false);
      setEditingRole(null);
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to save role",
      });
    }
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteTarget({ type: "role", id: role.id, name: role.name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "role") {
        await api.roles.delete(deleteTarget.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Role deleted successfully",
        });
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete",
      });
    }
  };

  // Fee handlers
  const handleEditFee = (fee: FeeConfiguration) => {
    setEditingFee(fee);
    setShowFeeModal(true);
  };

  const handleSaveFee = async () => {
    if (!editingFee) return;
    try {
      if (editingFee.id) {
        await api.fees.update(editingFee.id, editingFee);
        addToast({
          type: "success",
          title: "Success",
          message: "Fee configuration updated",
        });
      }
      setShowFeeModal(false);
      setEditingFee(null);
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to save fee",
      });
    }
  };

  const handleToggleFeeActive = async (fee: FeeConfiguration) => {
    try {
      await api.fees.toggleActive(fee.id);
      addToast({
        type: "success",
        title: "Success",
        message: `Fee ${fee.isActive ? "disabled" : "enabled"}`,
      });
      loadData();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update fee",
      });
    }
  };

  const tabs = [
    { id: "users", label: "Users", icon: <Icons.Users size={18} /> },
    {
      id: "activity",
      label: "Activity Log",
      icon: <Icons.History size={18} />,
    },
    {
      id: "roles",
      label: "Roles & Permissions",
      icon: <Icons.Shield size={18} />,
    },
    {
      id: "fees",
      label: "Fees Configuration",
      icon: <Icons.DollarSign size={18} />,
    },
  ] as const;

  return (
    <div
      className={cn(
        "space-y-6 sm:space-y-8 min-h-screen font-sans transition-colors duration-300 p-4 sm:p-6 lg:p-8",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Settings
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--text-muted))]">
            Manage system settings
          </p>
        </div>
        {/* Mobile Tab Heading */}
        <div className="sm:hidden">
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] capitalize">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
        </div>
      </div>

      {/* Tabs - scrollable on mobile */}
      <div
        className={cn(
          "flex gap-2 p-1 rounded-xl overflow-x-auto",
          isDark ? "bg-slate-800" : "bg-slate-100",
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              "min-w-[100px] justify-center",
              activeTab === tab.id
                ? "bg-emerald-500 text-white shadow-lg"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900",
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Icons.Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="primary" onClick={handleCreateUser}>
              <Icons.Plus size={16} />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">User</span>
            </Button>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {selectedUsers.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={() => handleBulkActivate(true)}>
                <Icons.Check size={14} className="mr-1" />
                Activate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkActivate(false)}>
                <Icons.X size={14} className="mr-1" />
                Deactivate
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={handleBulkDelete}>
                <Icons.Trash2 size={14} className="mr-1" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUsers(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {isLoadingUsers ? (
            <div className="sm:hidden space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border transition-colors",
                      selectedUsers.has(user.id)
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <Icons.User
                            size={20}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant={user.isActive ? "success" : "danger"}
                        className="capitalize text-xs"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" className="capitalize text-xs">
                        {user.role}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Icons.Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenPasswordModal(user)}
                        >
                          <Icons.Key size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserActive(user)}
                        >
                          {user.isActive ? (
                            <Icons.Lock size={16} />
                          ) : (
                            <Icons.Unlock size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <Card className="hidden sm:block">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th className="text-left py-4 px-4 font-bold text-sm w-12">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                            onChange={toggleSelectAll}
                            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Name</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Email</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Role</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Status</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className={cn(
                            "border-b border-slate-200 dark:border-slate-700 transition-colors",
                            selectedUsers.has(user.id) && "bg-emerald-50 dark:bg-emerald-900/10"
                          )}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <Icons.User size={16} className="text-emerald-600 dark:text-emerald-400" />
                                )}
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="neutral">{user.role}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={user.isActive ? "success" : "danger"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                title="Edit"
                              >
                                <Icons.Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenPasswordModal(user)}
                                title="Reset Password"
                              >
                                <Icons.Key size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserActive(user)}
                                title={user.isActive ? "Deactivate" : "Activate"}
                              >
                                {user.isActive ? (
                                  <Icons.Lock size={16} />
                                ) : (
                                  <Icons.Unlock size={16} />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleCreateRole}>
              <Icons.Plus size={16} />
              Create Role
            </Button>
          </div>

          {isLoadingRoles ? (
            <SkeletonTable rows={5} cols={4} />
          ) : (
            <div className="grid gap-4">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-slate-500">
                          {role.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Icons.Edit size={16} />
                        </Button>
                        {role.name !== "Super Admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Icons.Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((perm) => (
                        <Badge
                          key={perm.id}
                          variant="neutral"
                          className="text-xs"
                        >
                          {perm.name}
                        </Badge>
                      ))}
                      {role.permissions.length > 6 && (
                        <Badge variant="neutral" className="text-xs">
                          +{role.permissions.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          {isLoadingActivity ? (
            <SkeletonTable rows={5} cols={5} />
          ) : (
            <>
              <Card className="hidden md:block overflow-hidden">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th className="text-left py-4 px-4 font-bold text-sm">Admin</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Action</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Target</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Details</th>
                        <th className="text-left py-4 px-4 font-bold text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-slate-200 dark:border-slate-700"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Icons.User size={14} className="text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-medium">{log.adminUserName}</p>
                                <p className="text-xs text-slate-500">{log.adminUserEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="neutral" className="capitalize">
                              {log.action.replace(/_/g, " ").toLowerCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="neutral" className="capitalize text-xs">
                              {log.targetType}
                            </Badge>
                            <p className="text-sm text-slate-500 mt-1">{log.targetName}</p>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500 max-w-xs truncate">
                            {log.details || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">
                            {formatDate(log.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Mobile Cards */}
              <div className="md:hidden grid gap-4">
                {activityLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Icons.User size={18} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold">{log.adminUserName}</p>
                            <p className="text-xs text-slate-500">{log.adminUserEmail}</p>
                          </div>
                        </div>
                        <Badge variant="neutral" className="capitalize text-xs">
                          {log.action.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Target</p>
                          <Badge variant="neutral" className="capitalize text-xs">
                            {log.targetType}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="text-sm">{formatDate(log.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {log.targetName}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          {isLoadingFees ? (
            <SkeletonTable rows={4} cols={5} />
          ) : (
            <>
              {/* Desktop Table */}
              <Card className="hidden md:block overflow-hidden">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th className="text-left py-4 px-4 font-bold text-sm">
                          Name
                        </th>
                        <th className="text-left py-4 px-4 font-bold text-sm">
                          Type
                        </th>
                        <th className="text-left py-4 px-4 font-bold text-sm">
                          Percentage
                        </th>
                        <th className="text-left py-4 px-4 font-bold text-sm">
                          Fixed Amount
                        </th>
                        <th className="text-left py-4 px-4 font-bold text-sm">
                          Status
                        </th>
                        <th className="text-left py-4 px-4 font-bold text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => (
                        <tr
                          key={fee.id}
                          className="border-b border-slate-200 dark:border-slate-700"
                        >
                          <td className="py-4 px-4 font-medium">{fee.name}</td>
                          <td className="py-4 px-4 text-sm capitalize">
                            {fee.type}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {fee.percentage > 0 ? `${fee.percentage}%` : "-"}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {fee.fixedAmount > 0
                              ? `${fee.fixedAmount.toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={fee.isActive ? "success" : "danger"}
                            >
                              {fee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFee(fee)}
                              >
                                <Icons.Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFeeActive(fee)}
                              >
                                {fee.isActive ? (
                                  <Icons.Lock size={16} />
                                ) : (
                                  <Icons.Unlock size={16} />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Mobile Cards */}
              <div className="md:hidden grid gap-4">
                {fees.map((fee) => (
                  <Card key={fee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{fee.name}</h3>
                          <p className="text-sm text-slate-500 capitalize">
                            {fee.type}
                          </p>
                        </div>
                        <Badge variant={fee.isActive ? "success" : "danger"}>
                          {fee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Percentage</p>
                          <p className="font-medium">
                            {fee.percentage > 0 ? `${fee.percentage}%` : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Fixed Amount</p>
                          <p className="font-medium">
                            {fee.fixedAmount > 0
                              ? `${fee.fixedAmount.toFixed(2)}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditFee(fee)}
                        >
                          <Icons.Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleFeeActive(fee)}
                        >
                          {fee.isActive ? (
                            <>
                              <Icons.Lock size={14} className="mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Icons.Unlock size={14} className="mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        title={editingUser?.id ? "Edit User" : "Create User"}
        size="md"
      >
        {editingUser && (
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden">
                {editingUser.avatar ? (
                  <img
                    src={editingUser.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icons.User size={24} className="text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Icons.Upload size={14} />
                  Upload Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && editingUser.id) {
                      handleAvatarUpload(editingUser.id, file);
                    }
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, max 2MB</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Name</label>
              <Input
                value={editingUser.name || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Email</label>
              <Input
                type="email"
                value={editingUser.email || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Role</label>
              <select
                value={editingUser.role || "admin"}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as AdminUser["role"],
                  })
                }
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 dark:text-white",
                  isDark ? "border-slate-700" : "border-slate-200",
                )}
              >
                {ADMIN_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editingUser.isActive || false}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, isActive: e.target.checked })
                }
              />
              <label htmlFor="isActive" className="text-sm">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordResetTarget(null);
          setNewPassword("");
          setConfirmPassword("");
        }}
        title={`Reset Password - ${passwordResetTarget?.name}`}
        size="md"
      >
        {passwordResetTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter a new password for <strong>{passwordResetTarget.email}</strong>
            </p>
            <div>
              <label className="text-xs font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordResetTarget(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleResetPassword}
                disabled={!newPassword || !confirmPassword}
              >
                Reset Password
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setEditingRole(null);
        }}
        title={editingRole?.id ? "Edit Role" : "Create Role"}
        size="lg"
      >
        {editingRole && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Role Name</label>
              <Input
                value={editingRole.name || ""}
                onChange={(e) =>
                  setEditingRole({ ...editingRole, name: e.target.value })
                }
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <Input
                value={editingRole.description || ""}
                onChange={(e) =>
                  setEditingRole({
                    ...editingRole,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block">
                Permissions
              </label>
              <div className="max-h-60 overflow-y-auto space-y-4">
                {PERMISSION_MODULES.map((module) => (
                  <div key={module.value}>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      {module.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {permissions
                        .filter((p) => p.module === module.value)
                        .map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-1 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={editingRole.permissions?.some(
                                (p) => p.id === perm.id,
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingRole({
                                    ...editingRole,
                                    permissions: [
                                      ...(editingRole.permissions || []),
                                      perm,
                                    ],
                                  });
                                } else {
                                  setEditingRole({
                                    ...editingRole,
                                    permissions:
                                      editingRole.permissions?.filter(
                                        (p) => p.id !== perm.id,
                                      ),
                                  });
                                }
                              }}
                            />
                            {perm.name}
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveRole}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Fee Modal */}
      <Modal
        isOpen={showFeeModal}
        onClose={() => {
          setShowFeeModal(false);
          setEditingFee(null);
        }}
        title="Edit Fee Configuration"
        size="md"
      >
        {editingFee && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Fee Name</label>
              <Input value={editingFee.name || ""} disabled />
            </div>
            <div>
              <label className="text-xs font-medium">Type</label>
              <Input value={editingFee.type || ""} disabled />
            </div>
            <div>
              <label className="text-xs font-medium">Percentage (%)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={editingFee.percentage || 0}
                onChange={(e) =>
                  setEditingFee({
                    ...editingFee,
                    percentage: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium">Fixed Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editingFee.fixedAmount || 0}
                onChange={(e) =>
                  setEditingFee({
                    ...editingFee,
                    fixedAmount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="feeActive"
                checked={editingFee.isActive || false}
                onChange={(e) =>
                  setEditingFee({ ...editingFee, isActive: e.target.checked })
                }
              />
              <label htmlFor="feeActive" className="text-sm">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeeModal(false);
                  setEditingFee(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveFee}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
