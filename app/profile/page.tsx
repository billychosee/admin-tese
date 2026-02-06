"use client";

import React, { useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ProfilePage() {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 2FA state
  const [verificationCode, setVerificationCode] = useState("");
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "TESE Admin",
    email: "admin@tese.com",
    role: "Administrator",
    phone: "+27 12 345 6789",
    address: "123 TESE Street, Johannesburg, South Africa",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleUpdatePassword = () => {
    setShowPasswordModal(true);
  };

  const handleSetup2FA = () => {
    setShow2FAModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    setIsChangingPassword(true);
    // TODO: API call to change password
    setTimeout(() => {
      setIsChangingPassword(false);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password changed successfully");
    }, 1000);
  };

  const handleEnable2FA = async () => {
    if (verificationCode.length !== 6) {
      alert("Please enter a 6-digit verification code");
      return;
    }
    
    setIsEnabling2FA(true);
    // TODO: API call to enable 2FA
    setTimeout(() => {
      setIsEnabling2FA(false);
      setShow2FAModal(false);
      setVerificationCode("");
      alert("2FA enabled successfully");
    }, 1000);
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    // TODO: API call to delete account
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert("Account deleted");
    }, 1500);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const close2FAModal = () => {
    setShow2FAModal(false);
    setVerificationCode("");
  };

  const isDark = theme === "dark";

  // Color tokens matching dashboard
  const colors = {
    background: "bg-[hsl(var(--background))]",
    surface: "bg-[hsl(var(--surface))]",
    surfaceMuted: "bg-[hsl(var(--surface-muted))]",
    surfaceHover: "bg-[hsl(var(--surface-hover))]",
    surfaceBorder: "border-[hsl(var(--surface-border))]",
    textPrimary: "text-[hsl(var(--text-primary))]",
    textSecondary: "text-[hsl(var(--text-secondary))]",
    textMuted: "text-[hsl(var(--text-muted))]",
    primary: "bg-[hsl(var(--primary))]",
    primaryText: "text-[hsl(var(--primary))]",
    primaryForeground: "text-[hsl(var(--primary-foreground))]",
    success: "bg-[hsl(var(--success))]",
    successText: "text-[hsl(var(--success))]",
    danger: "bg-[hsl(var(--danger))]",
    dangerText: "text-[hsl(var(--danger))]",
    focusRing: "focus:ring-[hsl(var(--focus-ring))]",
  };

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        colors.background,
      )}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", colors.textPrimary)}>
            Profile
          </h1>
          <p className={cn("text-sm", colors.textMuted)}>
            Manage your account settings and profile information.
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              onClick={handleEditProfile}
              className={cn(
                "h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                isDark
                  ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                  : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
              )}
              style={{ color: "hsl(var(--primary-foreground))" }}
            >
              <Icons.Edit size={16} />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className={cn(
                  "h-10 px-4 rounded-lg text-sm font-medium transition-colors",
                  colors.surfaceBorder,
                  colors.surface,
                  colors.textPrimary,
                )}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={cn(
                  "h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  isDark
                    ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                    : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
                )}
                style={{ color: "hsl(var(--primary-foreground))" }}
              >
                <Icons.Check size={16} />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* HERO PROFILE SECTION */}
      <Card
        className={cn(
          "p-6 rounded-2xl border transition-colors duration-300",
          colors.surface,
          colors.surfaceBorder,
        )}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div
              className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold",
                isDark
                  ? "bg-[hsl(var(--primary))]"
                  : "bg-[hsl(var(--primary))]",
              )}
              style={{ color: "hsl(var(--primary-foreground))" }}
            >
              TA
            </div>
            <button
              className={cn(
                "absolute bottom-0 right-0 p-2 rounded-full transition-colors",
                isDark
                  ? "bg-slate-800 hover:bg-slate-700"
                  : "bg-white hover:bg-slate-100",
                colors.surfaceBorder,
                "border-2",
              )}
            >
              <Icons.Camera size={14} className={colors.textSecondary} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className={cn("text-xl font-semibold", colors.textPrimary)}>
              {formData.name}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
              <span
                className={cn(
                  "text-sm flex items-center gap-1",
                  colors.textSecondary,
                )}
              >
                <Icons.ShieldCheck size={14} className={colors.successText} />
                {formData.role}
              </span>
              <span
                className={cn(
                  "text-sm flex items-center gap-1",
                  colors.textSecondary,
                )}
              >
                <Icons.MapPin size={14} />
                Johannesburg, SA
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* PERSONAL INFORMATION */}
        <Card
          className={cn(
            "lg:col-span-2 p-6 rounded-2xl border transition-colors duration-300",
            colors.surface,
            colors.surfaceBorder,
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className={cn(
                "text-lg font-semibold",
                colors.textPrimary,
              )}
            >
              Account Details
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                label: "Full Name",
                name: "name",
                value: formData.name,
                type: "text",
                icon: <Icons.User size={16} />,
              },
              {
                label: "Email Address",
                name: "email",
                value: formData.email,
                type: "email",
                icon: <Icons.Mail size={16} />,
              },
              {
                label: "Phone Number",
                name: "phone",
                value: formData.phone,
                type: "tel",
                icon: <Icons.Phone size={16} />,
              },
              {
                label: "User Role",
                name: "role",
                value: formData.role,
                type: "text",
                icon: <Icons.Shield size={16} />,
                disabled: true,
              },
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label
                  className={cn(
                    "text-sm font-medium",
                    colors.textSecondary,
                  )}
                >
                  {field.label}
                </label>
                <div className="relative group">
                  <div
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                      colors.textMuted,
                      "group-focus-within:text-[hsl(var(--primary))]",
                    )}
                  >
                    {field.icon}
                  </div>
                  <input
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    onChange={handleInputChange}
                    disabled={!isEditing || field.disabled}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none",
                      colors.surfaceMuted,
                      colors.surfaceBorder,
                      colors.textPrimary,
                      isEditing && !field.disabled && "ring-2",
                      isEditing && !field.disabled
                        ? "focus:ring-[hsl(var(--focus-ring))]"
                        : "",
                      !isEditing || field.disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "",
                    )}
                  />
                </div>
              </div>
            ))}
            <div className="md:col-span-2 space-y-2">
              <label
                className={cn(
                  "text-sm font-medium",
                  colors.textSecondary,
                )}
              >
                Office Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none",
                  colors.surfaceMuted,
                  colors.surfaceBorder,
                  colors.textPrimary,
                  isEditing && "ring-2",
                  isEditing ? "focus:ring-[hsl(var(--focus-ring))]" : "",
                  !isEditing ? "opacity-60 cursor-not-allowed" : "",
                )}
              />
            </div>
          </div>
        </Card>

        {/* SECURITY & DANGER ZONE */}
        <div className="space-y-6">
          <Card
            className={cn(
              "p-6 rounded-2xl border transition-colors duration-300",
              colors.surface,
              colors.surfaceBorder,
            )}
          >
            <h3
              className={cn(
                "text-lg font-semibold mb-4",
                colors.textPrimary,
              )}
            >
              Security
            </h3>
            <div className="space-y-4">
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-colors",
                  colors.surfaceMuted,
                  colors.surfaceBorder,
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      colors.success + "/10",
                    )}
                  >
                    <Icons.Lock
                      size={18}
                      className={colors.successText}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        colors.textPrimary,
                      )}
                    >
                      Password
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        colors.textMuted,
                      )}
                    >
                      Last changed 30 days ago
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleUpdatePassword}
                  className={cn(
                    "h-9 px-3 rounded-lg text-xs font-medium transition-colors",
                    colors.surfaceBorder,
                    colors.surface,
                    colors.textPrimary,
                    "hover:shadow-md",
                  )}
                >
                  Update
                </Button>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-colors",
                  colors.surfaceMuted,
                  colors.surfaceBorder,
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      colors.primary + "/10",
                    )}
                  >
                    <Icons.ShieldCheck
                      size={18}
                      className={colors.primaryText}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        colors.textPrimary,
                      )}
                    >
                      2FA Auth
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        colors.textMuted,
                      )}
                    >
                      Disabled
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSetup2FA}
                  className={cn(
                    "h-9 px-3 rounded-lg text-xs font-medium transition-colors",
                    colors.surfaceBorder,
                    colors.surface,
                    colors.textPrimary,
                    "hover:shadow-md",
                  )}
                >
                  Setup
                </Button>
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              "p-6 rounded-2xl border transition-colors duration-300",
              colors.danger + "/5",
              colors.surfaceBorder,
            )}
          >
            <h3
              className={cn(
                "text-lg font-semibold mb-2",
                colors.dangerText,
              )}
            >
              Danger Zone
            </h3>
            <p
              className={cn(
                "text-sm mb-4",
                colors.textMuted,
              )}
            >
              Deleting your account will permanently remove all data and
              creators associated with you.
            </p>
            <Button
              onClick={handleDeleteAccount}
              className={cn(
                "w-full h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                colors.danger,
                "hover:opacity-80",
              )}
              style={{ color: "white" }}
            >
              <Icons.Trash2 size={16} />
              Delete Account
            </Button>
          </Card>
        </div>
      </div>

      {/* UPDATE PASSWORD MODAL */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="Update Password"
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.textPrimary)}>
              Current Password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className={cn(
                colors.surfaceMuted,
                colors.surfaceBorder,
                colors.textPrimary,
              )}
            />
          </div>
          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.textPrimary)}>
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={cn(
                colors.surfaceMuted,
                colors.surfaceBorder,
                colors.textPrimary,
              )}
            />
          </div>
          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.textPrimary)}>
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={cn(
                colors.surfaceMuted,
                colors.surfaceBorder,
                colors.textPrimary,
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={closePasswordModal}
              className={cn(
                colors.surfaceBorder,
                colors.surface,
                colors.textPrimary,
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className={cn(
                isDark
                  ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                  : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
              )}
              style={{ color: "hsl(var(--primary-foreground))" }}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* SETUP 2FA MODAL */}
      <Modal
        isOpen={show2FAModal}
        onClose={close2FAModal}
        title="Setup Two-Factor Authentication"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center space-y-4">
            <p className={cn("text-sm", colors.textMuted)}>
              Scan this QR code with your authenticator app
            </p>
            <div
              className={cn(
                "mx-auto w-48 h-48 rounded-xl flex items-center justify-center",
                colors.surfaceMuted,
              )}
            >
              {/* Placeholder for QR code */}
              <Icons.QrCode size={80} className={colors.textMuted} />
            </div>
            <p className={cn("text-xs", colors.textMuted)}>
              Or enter this key manually: <code className={cn("text-sm", colors.primaryText)}>JBSWY3DPEHPK3PXP</code>
            </p>
          </div>
          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.textPrimary)}>
              Verification Code
            </label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className={cn(
                colors.surfaceMuted,
                colors.surfaceBorder,
                colors.textPrimary,
                "text-center text-lg tracking-widest",
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={close2FAModal}
              className={cn(
                colors.surfaceBorder,
                colors.surface,
                colors.textPrimary,
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnable2FA}
              disabled={isEnabling2FA || verificationCode.length !== 6}
              className={cn(
                isDark
                  ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                  : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
              )}
              style={{ color: "hsl(var(--primary-foreground))" }}
            >
              {isEnabling2FA ? "Enabling..." : "Enable 2FA"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone. All your data, creators, and associated information will be permanently removed."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
