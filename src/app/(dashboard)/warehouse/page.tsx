"use client";
import { useState } from "react";
import { useWarehouse } from "@/features/warehouse";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Warehouse as WarehouseIcon, Search, RefreshCw } from "lucide-react";

export default function WarehousePage() {
  const { warehouses, loading, total, setPage, refresh } = useWarehouse();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0);
  const totalOccupied = warehouses.reduce((sum, w) => sum + (w.occupied || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Warehouses</h1>
          <p className="text-text-secondary">Manage warehouse locations and capacity</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>Add Warehouse</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Warehouses" value={total} icon={<WarehouseIcon className="h-5 w-5" />} />
        <KPICard title="Total Capacity" value={`${totalCapacity.toLocaleString()} MT`} icon={<WarehouseIcon className="h-5 w-5" />} />
        <KPICard title="Occupied" value={`${totalOccupied.toLocaleString()} MT`} icon={<WarehouseIcon className="h-5 w-5" />} />
        <KPICard title="Available" value={`${(totalCapacity - totalOccupied).toLocaleString()} MT`} icon={<WarehouseIcon className="h-5 w-5" />} />
      </div>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : warehouses.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No warehouses found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Name</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Location</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Capacity</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Occupied</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Utilization</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Manager</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {warehouses.map((wh) => {
                  const utilization = wh.capacity > 0 ? Math.round((wh.occupied / wh.capacity) * 100) : 0;
                  return (
                    <tr key={wh.id} className="hover:bg-background">
                      <td className="px-5 py-3 font-medium">{wh.name}</td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{wh.location}</td>
                      <td className="px-5 py-3 text-sm">{wh.capacity.toLocaleString()} MT</td>
                      <td className="px-5 py-3 text-sm">{wh.occupied.toLocaleString()} MT</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-border rounded-full h-1.5"><div className={`h-1.5 rounded-full ${utilization > 80 ? "bg-danger" : utilization > 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${utilization}%` }} /></div>
                          <span className="text-sm text-text-secondary">{utilization}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm">{wh.manager}</td>
                      <td className="px-5 py-3"><StatusBadge status={wh.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Warehouse" size="lg">
        <p className="text-text-secondary">Create warehouse form coming soon</p>
      </Modal>
    </div>
  );
}
