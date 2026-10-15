"use client";

import { useState } from "react";
import { useQualityControl } from "@/features/quality-control";
import { InspectionsTable } from "@/features/quality-control";
import { InspectionForm } from "@/features/quality-control";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ClipboardCheck, Search, Download, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { QualityInspection } from "@/types";

const RESULT_OPTIONS = [
  { value: "", label: "All Results" },
  { value: "APPROVED", label: "Approved" },
  { value: "CONDITIONAL", label: "Conditional" },
  { value: "REJECTED", label: "Rejected" },
];

export default function QualityControlPage() {
  const {
    inspections,
    loading,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setSearch,
    setResult,
    setSortBy,
    setSortOrder,
    sortBy,
    sortOrder,
    refresh,
    createInspection,
    updateInspection,
    calculateScore,
  } = useQualityControl();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calculate stats
  const approved = inspections.filter((i) => i.result === "APPROVED").length;
  const conditional = inspections.filter((i) => i.result === "CONDITIONAL").length;
  const rejected = inspections.filter((i) => i.result === "REJECTED").length;
  const avgScore =
    inspections.length > 0
      ? inspections.reduce((sum, i) => sum + i.qualityScore, 0) / inspections.length
      : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleCreate = async (data: any) => {
    try {
      setSubmitting(true);
      await createInspection(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create inspection:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedInspection) return;
    try {
      setSubmitting(true);
      await updateInspection(selectedInspection.id, data);
      setShowEditModal(false);
      setSelectedInspection(null);
    } catch (error) {
      console.error("Failed to update inspection:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Quality Control</h1>
          <p className="text-text-secondary">
            Manage quality inspections and ensure product standards
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
          New Inspection
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Inspections"
          value={total}
          icon={<ClipboardCheck className="h-5 w-5" />}
        />
        <KPICard
          title="Approved"
          value={approved}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <KPICard
          title="Conditional"
          value={conditional}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KPICard
          title="Rejected"
          value={rejected}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Average Score Card */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Average Quality Score</p>
            <p className="mt-1 text-3xl font-bold text-navy">{avgScore.toFixed(1)}/100</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{approved}</p>
              <p className="text-xs text-text-secondary">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{conditional}</p>
              <p className="text-xs text-text-secondary">Conditional</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{rejected}</p>
              <p className="text-xs text-text-secondary">Rejected</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by batch number or supplier..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <Select
            options={RESULT_OPTIONS}
            value={undefined}
            onChange={(e) => {
              setResult(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40"
          />
          <Button variant="secondary" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="secondary">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Inspections Table */}
      <InspectionsTable
        inspections={inspections}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={setPage}
        onView={(inspection) => {
          // TODO: Navigate to inspection detail page
          console.log("View inspection:", inspection);
        }}
        onEdit={(inspection) => {
          setSelectedInspection(inspection);
          setShowEditModal(true);
        }}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Quality Inspection"
        description="Record a new quality inspection with parameters"
        size="xl"
      >
        <InspectionForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={submitting}
          calculateScore={calculateScore}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInspection(null);
        }}
        title="Edit Quality Inspection"
        description="Update inspection details and parameters"
        size="xl"
      >
        {selectedInspection && (
          <InspectionForm
            inspection={selectedInspection}
            onSubmit={handleEdit}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedInspection(null);
            }}
            loading={submitting}
            calculateScore={calculateScore}
          />
        )}
      </Modal>
    </div>
  );
}
