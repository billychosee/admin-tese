"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatDateTime, formatDate } from "@/utils";
import { KYC_STATUSES } from "@/constants";
import type { KYCUser, KYCStatus } from "@/types";

export default function KYCPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedKyc, setSelectedKyc] = useState<KYCUser | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    fetchKycUsers();
  }, [page, statusFilter]);

  const fetchKycUsers = async () => {
    setIsLoading(true);
    try {
      const result = await api.kyc.getAll(page, 10, statusFilter);
      setKycUsers(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch KYC applications",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedKyc) return;
    try {
      await api.kyc.approve(selectedKyc.id);
      addToast({
        type: "success",
        title: "Success",
        message: "KYC application approved",
      });
      setShowApproveModal(false);
      setSelectedKyc(null);
      fetchKycUsers();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve KYC",
      });
    }
  };

  const handleDecline = async () => {
    if (!selectedKyc || !declineReason.trim()) return;
    try {
      await api.kyc.decline(selectedKyc.id, declineReason);
      addToast({
        type: "success",
        title: "Success",
        message: "KYC application declined",
      });
      setShowDeclineModal(false);
      setDeclineReason("");
      setSelectedKyc(null);
      fetchKycUsers();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to decline KYC",
      });
    }
  };

  const getStatusVariant = (status: KYCStatus) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending_approval":
        return "warning";
      case "declined":
        return "danger";
      case "pending":
        return "neutral";
      default:
        return "neutral";
    }
  };

  if (isLoading && page === 1) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <SkeletonTable rows={10} cols={6} />
      </div>
    );
  }

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
            KYC Verification
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Verify user identity documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none w-full px-4 py-2 pr-10 rounded-lg text-sm h-10 cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              style={{ border: '1px solid hsl(var(--surface-border))' }}
            >
              {KYC_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Pending Upload",
            count: kycUsers.filter((k) => k.status === "pending").length,
            color: "bg-slate-500",
          },
          {
            label: "Pending Review",
            count: kycUsers.filter((k) => k.status === "pending_approval")
              .length,
            color: "bg-amber-500",
          },
          {
            label: "Approved",
            count: kycUsers.filter((k) => k.status === "approved").length,
            color: "bg-emerald-500",
          },
          {
            label: "Declined",
            count: kycUsers.filter((k) => k.status === "declined").length,
            color: "bg-red-500",
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", stat.color)} />
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KYC Table */}
      {kycUsers.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <CardContent>
            <Icons.Shield
              className={cn(
                "mx-auto h-16 w-16 mb-4",
                isDark ? "text-slate-600" : "text-slate-300",
              )}
            />
            <p
              className={cn(
                "text-lg font-medium",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            >
              No KYC applications found
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={cn(
                      "border-b-2",
                      isDark ? "border-slate-700" : "border-slate-200",
                    )}
                  >
                    <th className="text-left py-4 px-4 font-bold text-sm">
                      User
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm">
                      ID Type
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm">
                      Submitted
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
                  {kycUsers.map((kyc) => (
                    <tr
                      key={kyc.id}
                      className={cn(
                        "border-b transition-colors",
                        isDark
                          ? "border-slate-700 hover:bg-slate-800/50"
                          : "border-slate-100 hover:bg-slate-50",
                      )}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {kyc.selfieUrl ? (
                            <img
                              src={kyc.selfieUrl}
                              alt="Selfie"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              isDark ? "bg-slate-700" : "bg-slate-200"
                            )}>
                              <Icons.User size={20} className={isDark ? "text-slate-400" : "text-slate-500"} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {kyc.firstName} {kyc.lastName}
                            </p>
                            <p className="text-sm text-slate-500">{kyc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize">
                          {kyc.idType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {formatDate(kyc.submittedAt)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusVariant(kyc.status)}>
                          {kyc.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedKyc(kyc);
                              setShowReviewModal(true);
                            }}
                          >
                            <Icons.Eye size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={cn(
            "flex items-center justify-center gap-4 py-4 rounded-3xl",
            isDark ? "bg-slate-800" : "bg-white shadow-xl",
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="KYC Application Review"
        size="lg"
      >
        {selectedKyc && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="font-medium">
                  {selectedKyc.firstName} {selectedKyc.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium">{selectedKyc.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Type</p>
                <p className="font-medium capitalize">
                  {selectedKyc.idType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Number</p>
                <p className="font-medium">{selectedKyc.idNumber}</p>
              </div>
            </div>

            {/* Document Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Selfie Photo</p>
                <div
                  className={cn(
                    "rounded-xl p-4 text-center cursor-pointer transition-colors",
                    isDark ? "bg-slate-800" : "bg-slate-100",
                  )}
                  onClick={() => {
                    setShowReviewModal(false);
                    setShowSelfieModal(true);
                  }}
                >
                  {selectedKyc.selfieUrl ? (
                    <img
                      src={selectedKyc.selfieUrl}
                      alt="Selfie"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <Icons.User className="w-12 h-12 mx-auto text-slate-400" />
                  )}
                  <p className="text-xs mt-2 text-slate-500">
                    Click to enlarge
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">ID Document</p>
                <div
                  className={cn(
                    "rounded-xl p-4 text-center cursor-pointer transition-colors",
                    isDark ? "bg-slate-800" : "bg-slate-100",
                  )}
                  onClick={() => {
                    setShowReviewModal(false);
                    setShowIdModal(true);
                  }}
                >
                  {selectedKyc.idImageUrl ? (
                    <img
                      src={selectedKyc.idImageUrl}
                      alt="ID Document"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <Icons.FileText className="w-12 h-12 mx-auto text-slate-400" />
                  )}
                  <p className="text-xs mt-2 text-slate-500">
                    Click to enlarge
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </Button>
              {selectedKyc.status === "pending_approval" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowReviewModal(false);
                      setShowDeclineModal(true);
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowReviewModal(false);
                      setShowApproveModal(true);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Selfie Modal */}
      <Modal
        isOpen={showSelfieModal}
        onClose={() => {
          setShowSelfieModal(false);
          setShowReviewModal(true);
        }}
        title="Selfie Photo"
        size="md"
      >
        {selectedKyc?.selfieUrl && (
          <img
            src={selectedKyc.selfieUrl}
            alt="Selfie"
            className="w-full rounded-lg"
          />
        )}
      </Modal>

      {/* ID Modal */}
      <Modal
        isOpen={showIdModal}
        onClose={() => {
          setShowIdModal(false);
          setShowReviewModal(true);
        }}
        title="ID Document"
        size="lg"
      >
        {selectedKyc?.idImageUrl && (
          <img
            src={selectedKyc.idImageUrl}
            alt="ID Document"
            className="w-full rounded-lg"
          />
        )}
      </Modal>

      {/* Approve Confirmation */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve KYC"
        message="Are you sure you want to approve this KYC application? This will grant the user full access to the platform."
        confirmText="Approve"
        variant="info"
      />

      {/* Decline Confirmation */}
      <ConfirmModal
        isOpen={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setDeclineReason("");
        }}
        onConfirm={handleDecline}
        title="Decline KYC"
        message={
          <div className="space-y-3">
            <p>Are you sure you want to decline this KYC application?</p>
            <div>
              <label className="text-xs font-medium">Reason for decline:</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter the reason..."
                className={cn(
                  "w-full mt-1 p-3 rounded-xl text-sm border resize-none",
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200",
                )}
                rows={3}
              />
            </div>
          </div>
        }
        confirmText="Decline"
        variant="danger"
      />
    </div>
  );
}
