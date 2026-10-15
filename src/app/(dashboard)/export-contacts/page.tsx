"use client";

import { Phone, Globe, Building2, Search, Shield, Download } from "lucide-react";
import { useState } from "react";

const LPEI_CONTACTS = [
  { name: "Pak Maqin Norhadi", role: "Direktur Pelaksana LPEI", phone: "+62 815-9358-780" },
  { name: "Pak Djoko Retnadi", role: "Direktur Pelaksana LPEI", phone: "62 811-891-992" },
];

const GOVERNMENT_CONTACTS = [
  {
    category: "Konsultasi Ekspor",
    contacts: [
      { name: "Pak Agus Rofiudin", role: "Kepala Lembaga Nasional Single Window", phone: "+62 815-9408-333" },
    ],
  },
  {
    category: "Kepabeanan Internasional",
    contacts: [
      { name: "Pak Syarif Hidayat", role: "Direktur Kepabeanan Internasional, Ditjen Bea Cukai", phone: "+62 812-5234-0225" },
      { name: "Ibu Finari Manan", role: "Kepala Bea Cukai Soekarno Hatta", phone: "+62 811-968-718" },
      { name: "Bpk Dwi Teguh", role: "Kepala Bea Cukai Tanjung Priok", phone: "+62 897-6240-788" },
      { name: "Bapak Sodikin", role: "Kepala Bea Cukai Tanjung Perak, Surabaya", phone: "+62 822-5746-3619" },
    ],
  },
  {
    category: "Legalisasi Dokumen — Kementerian Luar Negeri",
    contacts: [
      { name: "Pak Zaenal Abidin", role: "Direktorat Konsuler Kemenlu", phone: "+62 821-1144-3479" },
    ],
  },
  {
    category: "Legalisasi Dokumen — Kementerian Perdagangan",
    contacts: [
      { name: "Ibu Desi", role: "Direktorat Fasilitas Kemendag", phone: "+62 811-8686-684" },
    ],
  },
  {
    category: "Karantina",
    contacts: [
      { name: "Bu Rindayuni", role: "Badan Karantina Pertanian", phone: "+62 818-164-098" },
    ],
  },
  {
    category: "Investasi",
    contacts: [
      { name: "Pak Husen Maulana", role: "Deputi BKPM", phone: "+62 821-2594-0807" },
    ],
  },
  {
    category: "Perindustrian",
    contacts: [
      { name: "Pak Warsito", role: "Staf Ahli Bidang Penguatan Kemampuan Industri Dalam Negeri, Kemenperin", phone: "+62 812-9238-836" },
    ],
  },
  {
    category: "Makanan, Minuman & Obat-Obatan",
    contacts: [
      { name: "Ibu Erma", role: "Direktur PRRS BPOM", phone: "+62 812-8058-030" },
      { name: "Ibu Dwita RM", role: "Badan POM", phone: "+62 878-7625-0568" },
    ],
  },
  {
    category: "Sertifikat Halal",
    contacts: [
      { name: "Ibu Siti Aminah", role: "Kepala Pusat Kerja Sama dan Standarisasi Halal, BPJPH, Kemenag", phone: "+62 812-9988-634" },
      { name: "Prof. Sukoso", role: "Mantan Kepala BPJPH", phone: "+62 813-3396-5392" },
    ],
  },
];

const ATDAG_CONTACTS = [
  { name: "Marina", role: "Atdag KBRI Beijing", phone: "+62 877-7521-4411", country: "China" },
  { name: "Novita", role: "Atdag KBRI Madrid", phone: "+34 664 05 55 53", country: "Spanyol" },
  { name: "Agung Wicaksono", role: "Atdag KBRI Canberra", phone: "+61 433 790 824", country: "Australia" },
  { name: "Iffah Sa'aidah", role: "Atdag KBRI Ottawa", phone: "+1 (613) 355-3438", country: "Kanada" },
  { name: "Sabbat Christian", role: "Atdag KBRI Den Haag", phone: "+31 6 18723960", country: "Belanda" },
  { name: "Arief", role: "Atdag KBRI Tokyo", phone: "+62 812-9449-235", country: "Jepang" },
  { name: "Rumaksono", role: "Atdag KBRI Singapura", phone: "+62 815-7008-477", country: "Singapura" },
  { name: "Dwi", role: "Atdag KBRI Seoul", phone: "+82 10-2003-7051", country: "Korea Selatan" },
  { name: "Bona Kusuma", role: "Atdag KBRI New Delhi", phone: "+62 818-174-787", country: "India" },
  { name: "Danang", role: "Atdag Jenewa", phone: "+41 79 625 23 78", country: "Swiss" },
  { name: "Deden", role: "Atdag Malaysia", phone: "+62 899-9999-091", country: "Malaysia" },
  { name: "Erick", role: "Atdag Ankara", phone: "+62 813-1466-3231", country: "Turki" },
  { name: "Erwansyah", role: "Atdag Riyadh", phone: "+966 53 476 7235", country: "Arab Saudi" },
  { name: "Flora", role: "Atdag Bangkok", phone: "+62 812-8123-8933", country: "Thailand" },
  { name: "Iqbal", role: "Atdag Vietnam", phone: "+62 812-9208-551", country: "Vietnam" },
  { name: "Irman Adi", role: "Atdag Mesir", phone: "+62 822-9968-4868", country: "Mesir" },
];

const ITPC_CONTACTS = [
  { name: "Anggun Paramita", role: "ITPC Johannesburg", phone: "+27 64 692 3092", country: "Afrika Selatan" },
  { name: "Kumara Jati", role: "ITPC Chennai", phone: "+91 75501 51483", country: "India" },
  { name: "Ami", role: "ITPC Brazil", phone: "+62 812-7777-1706", country: "Brazil" },
  { name: "Indra", role: "ITPC Shanghai", phone: "+62 812 1494 1440", country: "China" },
  { name: "Ayu", role: "ITPC Sidney", phone: "+61 499 011 872", country: "Australia" },
  { name: "Bayu", role: "ITPC LA", phone: "+62 857-1934-0486", country: "Amerika Serikat" },
  { name: "Bimo", role: "ITPC Milan", phone: "+62 812-1329-7022", country: "Italia" },
  { name: "Dicky", role: "ITPC Osaka", phone: "+62 816-1707-3330", country: "Jepang" },
  { name: "Husodo", role: "ITPC Mexico", phone: "+52 56 1111 7530", country: "Meksiko" },
  { name: "Khomaini", role: "Kepala ITPC Dubai", phone: "+62 857-1510-4956", country: "UAE" },
  { name: "Ranni Resnia", role: "Kepala ITPC Santiago", phone: "+56 9 6249 1811", country: "Chili" },
  { name: "Risma Oloana Siringoringo", role: "Waka ITPC Santiago", phone: "+56 22 441 0494", country: "Chili" },
  { name: "Bagus Wicaksena", role: "Kepala ITPC Lagos", phone: "+234 817 000 0031", country: "Nigeria" },
];

const JONNY_CONTACT = {
  name: "Jonny Sinaga",
  role: "Atase Dagang — Konsultasi 132 Perwakilan RI di Luar Negeri",
  phone: "+62 877-8291-6255",
};

function exportToCSV(data: { name: string; role: string; phone: string; section: string }[]) {
  const headers = ["Name", "Role", "Phone", "Section"];
  const rows = data.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.role.replace(/"/g, '""')}"`,
    `"${c.phone.replace(/"/g, '""')}"`,
    `"${c.section.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `export-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ContactCard({ name, role, phone }: { name: string; role: string; phone: string }) {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-3.5 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 font-medium text-xs group-hover:bg-primary/20 transition-colors">
          {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm">{name}</p>
          <p className="text-xs text-text-secondary mt-0.5">{role}</p>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:text-primary-dark font-medium"
          >
            <Phone className="h-3 w-3" /> {phone}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ExportContactsAdminPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "government" | "atdag" | "itpc">("all");

  const allContacts = [
    ...LPEI_CONTACTS.map((c) => ({ ...c, section: "LPEI" })),
    ...GOVERNMENT_CONTACTS.flatMap((g) => g.contacts.map((c) => ({ ...c, section: g.category }))),
    ...ATDAG_CONTACTS.map((c) => ({ ...c, section: "ATDAG" })),
    ...ITPC_CONTACTS.map((c) => ({ ...c, section: "ITPC" })),
    { ...JONNY_CONTACT, section: "Kontak Utama" },
  ];

  const filteredContacts = allContacts.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchSearch;
    if (activeTab === "government") return matchSearch && (c.section === "LPEI" || !["ATDAG", "ITPC", "Kontak Utama"].includes(c.section));
    if (activeTab === "atdag") return matchSearch && c.section === "ATDAG";
    if (activeTab === "itpc") return matchSearch && c.section === "ITPC";
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Export Contacts</h1>
          <p className="text-text-secondary text-sm mt-1">Narahubung terkait ekspor — informasi internal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-warning/10 text-warning px-3 py-1.5 rounded-md">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Internal Only</span>
          </div>
          <button
            onClick={() => exportToCSV(filteredContacts)}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "government", label: "Government" },
            { value: "atdag", label: "ATDAG" },
            { value: "itpc", label: "ITPC" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:text-text border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jonny Sinaga - Main Contact */}
      <div className="bg-primary rounded-lg p-5 text-white">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-md flex items-center justify-center">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Kontak Utama</p>
            <h2 className="text-xl font-bold">{JONNY_CONTACT.name}</h2>
          </div>
        </div>
        <p className="text-white/80 text-sm mb-3">{JONNY_CONTACT.role}</p>
        <a href={`tel:${JONNY_CONTACT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-white/90 transition-colors text-sm text-sm">
          <Phone className="h-4 w-4" /> {JONNY_CONTACT.phone}
        </a>
      </div>

      {/* Tabs Content */}
      {(activeTab === "all" || activeTab === "government") && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-700 rounded-md flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">LPEI & Instansi Pemerintah</h2>
              <p className="text-xs text-text-secondary">Pembiayaan ekspor, kepabeanan, legalisasi dokumen</p>
            </div>
          </div>
          <div className="space-y-6">
            {GOVERNMENT_CONTACTS.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.contacts.map((c) => (
                    <ContactCard key={c.name} {...c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(activeTab === "all" || activeTab === "atdag") && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-md flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Atase Dagang (ATDAG)</h2>
              <p className="text-xs text-text-secondary">Perwakilan RI di luar negeri</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {ATDAG_CONTACTS.map((c) => (
              <ContactCard key={c.name} {...c} />
            ))}
          </div>
        </section>
      )}

      {(activeTab === "all" || activeTab === "itpc") && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-md flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Indonesian Trade Promotion Center (ITPC)</h2>
              <p className="text-xs text-text-secondary">Promosi dagang di berbagai negara</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {ITPC_CONTACTS.map((c) => (
              <ContactCard key={c.name} {...c} />
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
        <p className="text-sm text-warning">
          <strong>Catatan:</strong> Informasi narahubung di atas berlaku per 30 Desember 2021.
          Untuk informasi terkini, silakan hubungi Jonny Sinaga di <strong>{JONNY_CONTACT.phone}</strong>.
        </p>
      </div>
    </div>
  );
}
