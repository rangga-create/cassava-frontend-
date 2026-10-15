"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, KPICard } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { useCompanies } from "@/features/companies";
import { CompanyForm, CompaniesTable } from "@/features/companies/components";

export default function CompaniesPage() {
  const {
    companies,
    loading,
    total,
    page,
    limit,
    totalPages,
    sortBy,
    sortOrder,
    setPage,
    setSortBy,
    setSortOrder,
    setSearch,
    setStatus,
    refresh,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCompanies();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSearch(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCreate = async (data: any) => {
    try {
      setSubmitting(true);
      await createCompany(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create company:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: any) => {
    try {
      setSubmitting(true);
      await updateCompany(selectedCompany.id, data);
      setShowEditModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Failed to update company:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteCompany(selectedCompany.id);
      setShowDeleteModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Failed to delete company:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate KPIs
  const activeCompanies = companies.filter((c) => c.status === "ACTIVE").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Companies</h1>
            <p className="text-secondary">Manage your company profiles and organizations</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>+ Add Company</Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Companies"
            value={total.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <KPICard
            title="Active"
            value={activeCompanies.toString()}
            change={total > 0 ? Math.round((activeCompanies / total) * 100) : 0}
            changeLabel="of total"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KPICard
            title="Countries"
            value={new Set(companies.map((c) => c.country).filter(Boolean)).size.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KPICard
            title="Inactive"
            value={(total - activeCompanies).toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
          />
        </div>

        {/* Search & Filters */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                icon={
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card padding="none">
          <CompaniesTable
            companies={companies}
            loading={loading}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={(company) => {
              setSelectedCompany(company);
              setShowDeleteModal(true);
            }}
          />
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Company"
        size="lg"
      >
        <CompanyForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCompany(null);
        }}
        title="Edit Company"
        size="lg"
      >
        <CompanyForm
          initialData={selectedCompany}
          onSubmit={handleUpdate}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCompany(null);
        }}
        title="Delete Company"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Are you sure you want to delete <strong>{selectedCompany?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCompany(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={submitting}>
              Delete Company
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
