"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDate, getInitials } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { Creator } from "@/types";

interface KYCTableProps {
  creators: Creator[];
  isLoading?: boolean;
  onApprove: (creator: Creator) => void;
  onReject: (creator: Creator) => void;
}

export function KYCTable({
  creators,
  isLoading,
  onApprove,
  onReject,
}: KYCTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const itemsPerPage = 10;

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesSearch =
        creator.creatorFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.channelName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        statusFilter === "all" || creator.kycStatus === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [creators, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage);
  const paginatedCreators = filteredCreators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const kycStatusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    pending_approval: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const kycStatusLabels = {
    pending: "Pending Upload",
    pending_approval: "Pending Approval",
    approved: "Approved",
    declined: "Declined",
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>KYC Verification</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search creators..."
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
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
                >
                  <option value="all">All KYC Status</option>
                  <option value="pending">Pending Upload</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
                <Icons.ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
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
                        Creator
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Channel
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        KYC Status
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        ID Type
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCreators.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-slate-500 dark:text-slate-400"
                        >
                          No creators found
                        </td>
                      </tr>
                    ) : (
                      paginatedCreators.map((creator) => (
                        <tr
                          key={creator.id}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {creator.avatar ? (
                                <img
                                  src={creator.avatar}
                                  alt={creator.creatorFullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="avatar avatar-md font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                  {getInitials(creator.creatorFullName)}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {creator.creatorFullName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {creator.email}
                                </p>
                                {creator.isCompany && (
                                  <p className="text-xs text-blue-500 dark:text-blue-400">
                                    {creator.companyName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {creator.channelName}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                creator.kycStatus === "approved"
                                  ? "success"
                                  : creator.kycStatus === "pending_approval"
                                    ? "info"
                                    : creator.kycStatus === "declined"
                                      ? "danger"
                                      : "warning"
                              }
                            >
                              {kycStatusLabels[creator.kycStatus]}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300 capitalize">
                            {creator.idType?.replace("_", " ") || "N/A"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedCreator(creator)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                                title="View KYC details"
                              >
                                <Icons.Eye size={16} />
                              </button>
                            </div>
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
                      filteredCreators.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredCreators.length
                    )}{" "}
                    of {filteredCreators.length} results
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

      {/* KYC Details Modal */}
      <Modal
        isOpen={!!selectedCreator}
        onClose={() => setSelectedCreator(null)}
        title="KYC Verification Details"
        size="xl"
      >
        {selectedCreator && (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="relative flex-shrink-0">
                {selectedCreator.avatar ? (
                  <img
                    src={selectedCreator.avatar}
                    alt={selectedCreator.creatorFullName}
                    className="w-20 h-20 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {getInitials(selectedCreator.creatorFullName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedCreator.creatorFullName}
                  </h3>
                  <Badge
                    variant={
                      selectedCreator.kycStatus === "approved"
                        ? "success"
                        : selectedCreator.kycStatus === "pending_approval"
                          ? "info"
                          : selectedCreator.kycStatus === "declined"
                            ? "danger"
                            : "warning"
                    }
                  >
                    {kycStatusLabels[selectedCreator.kycStatus]}
                  </Badge>
                </div>
                <p className="text-base text-slate-600 dark:text-slate-300 mb-2">
                  {selectedCreator.channelName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedCreator.email}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.User size={18} className="text-emerald-500" />
                Personal Information
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Full Name
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.creatorFullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Mobile Number
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.mobileNumber || selectedCreator.phoneNumber}
                    </p>
                  </div>
                  {selectedCreator.isCompany && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Company Name
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.companyName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ID Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.CreditCard size={18} className="text-emerald-500" />
                ID Information
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      ID Type
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                      {selectedCreator.idType?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      ID Number
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.idNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Images */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Image size={18} className="text-emerald-500" />
                ID Images
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedCreator.idImage && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      ID Image
                    </p>
                    <img
                      src={selectedCreator.idImage}
                      alt="ID Image"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                {selectedCreator.selfie && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Selfie
                    </p>
                    <img
                      src={selectedCreator.selfie}
                      alt="Selfie"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                {selectedCreator.idCopyUrl && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      ID Copy
                    </p>
                    <img
                      src={selectedCreator.idCopyUrl}
                      alt="ID Copy"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                {selectedCreator.proofOfResidenceUrl && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Proof of Residence
                    </p>
                    <img
                      src={selectedCreator.proofOfResidenceUrl}
                      alt="Proof of Residence"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            {selectedCreator.isCompany && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.Briefcase size={18} className="text-emerald-500" />
                  Company Information
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Company Name
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.companyName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        VAT Number
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.VAT || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        TIN Number
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.tinNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {(selectedCreator.kycStatus === "pending" ||
              selectedCreator.kycStatus === "pending_approval") && (
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onReject(selectedCreator);
                      setSelectedCreator(null);
                    }}
                  >
                    <Icons.XCircle size={16} className="mr-2" />
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onApprove(selectedCreator);
                      setSelectedCreator(null);
                    }}
                  >
                    <Icons.CheckCircle size={16} className="mr-2" />
                    Approve
                  </Button>
                </div>
              )}
          </div>
        )}
      </Modal>
    </>
  );
}
