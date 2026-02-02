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
import {
  ADMIN_ROLES,
  PERMISSION_MODULES,
  FEE_TYPES,
} from "@/constants";
import type {
  AdminUser,
  Role,
  Permission,
  FeeConfiguration,
} from "@/types";

type SettingsTab = "users" | "roles" | "fees";

export default function SettingsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

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
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> | null>(null);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [editingFee, setEditingFee] = useState<Partial<FeeConfiguration> | null>(null);

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
        await api.adminUsers.create(editingUser as Omit<AdminUser, "id" | "createdAt">);
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
    { id: "roles", label: "Roles & Permissions", icon: <Icons.Shield size={18} /> },
    { id: "fees", label: "Fees Configuration", icon: <Icons.DollarSign size={18} /> },
  ] as const;

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Settings
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Manage system settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={cn(
          "flex gap-2 p-1 rounded-xl",
          isDark ? "bg-slate-800" : "bg-slate-100",
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-emerald-500 text-white shadow-lg"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleCreateUser}>
              <Icons.Plus size={16} />
              Add User
            </Button>
          </div>

          {isLoadingUsers ? (
            <SkeletonTable rows={5} cols={5} />
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-4 px-4 font-bold text-sm">Name</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Email</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Role</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-200 dark:border-slate-700"
                      >
                        <td className="py-4 px-4 font-medium">{user.name}</td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {user.email}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="neutral">{user.role}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={user.isActive ? "success" : "danger"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Icons.Edit size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
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
                        <Badge key={perm.id} variant="neutral" className="text-xs">
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

      {/* Fees Tab */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          {isLoadingFees ? (
            <SkeletonTable rows={4} cols={5} />
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-4 px-4 font-bold text-sm">Name</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Type</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Percentage</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Fixed Amount</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-sm">Actions</th>
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
                          {fee.fixedAmount > 0 ? `$${fee.fixedAmount.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={fee.isActive ? "success" : "danger"}>
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
                  "w-full px-4 py-2 rounded-xl border",
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200",
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
                                (p) => p.id === perm.id
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
                                    permissions: editingRole.permissions?.filter(
                                      (p) => p.id !== perm.id
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
              <label className="text-xs font-medium">
                Percentage (%)
              </label>
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
