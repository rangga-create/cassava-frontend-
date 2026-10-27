"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Plus, Search, Users, MessageSquare, Lock, Globe, ChevronRight, Loader2, Trash, Edit, Mail, Leaf, Sprout, FlaskConical, Cog, TrendingUp, AlertCircle, RefreshCw, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Group {
  id: string;
  name: string;
  description?: string;
  topic: string;
  visibility: string;
  rules?: string;
  imageUrl?: string;
  imagePublicId?: string;
  memberCount: number;
  isMember: boolean;
  userRole?: string;
  createdAt: string;
}

interface GroupsResponse {
  success: boolean;
  data: Group[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

const MAX_GROUP_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_GROUP_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const TOPIC_LABELS: Record<string, string> = {
  CULTIVATION: "Budidaya",
  QUALITY: "Kualitas",
  PROCESSING: "Pengolahan",
  TECHNOLOGY: "Teknologi",
  MARKET: "Pasar",
  GENERAL: "Umum",
};

const VISIBILITY_ICONS: Record<string, React.ReactNode> = {
  PUBLIC: <Globe className="h-4 w-4" />,
  PRIVATE: <Lock className="h-4 w-4" />,
  INVITE_ONLY: <Users className="h-4 w-4" />,
};

const TOPIC_ICONS: Record<string, typeof Sprout> = {
  CULTIVATION: Sprout,
  QUALITY: FlaskConical,
  PROCESSING: Cog,
  TECHNOLOGY: TrendingUp,
  MARKET: TrendingUp,
  GENERAL: Leaf,
};

interface GroupPhotoPickerProps {
  preview: string;
  error: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file?: File) => void;
  onRemove: () => void;
}

function GroupPhotoPicker({ preview, error, inputRef, onSelect, onRemove }: GroupPhotoPickerProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e5ebe2] bg-[#f8faf7] p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#eaf3e8]">
        {preview ? (
          <img src={preview} alt="Pratinjau foto grup" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#43834e]">
            <Camera className="h-7 w-7" />
          </div>
        )}
        {preview && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Hapus foto grup"
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#29392d]">Foto grup</p>
        <p className="mt-1 text-xs leading-5 text-[#718074]">Pilih foto agar komunitas mudah dikenali. Maksimal 5 MB.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#cbdcc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#367746] hover:bg-[#edf5eb]"
        >
          <Camera className="h-3.5 w-3.5" />
          {preview ? "Ganti foto" : "Pilih foto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => onSelect(event.target.files?.[0])}
          className="hidden"
        />
        {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function CommunityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupsError, setGroupsError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [groupImageFile, setGroupImageFile] = useState<File | null>(null);
  const [groupImagePreview, setGroupImagePreview] = useState("");
  const [groupImageError, setGroupImageError] = useState("");
  const groupImageInputRef = useRef<HTMLInputElement>(null);
  const [updateData, setUpdateData] = useState({
    name: "",
    description: "",
    topic: "",
    visibility: "",
    rules: "",
    imageUrl: "",
    imagePublicId: "",
  });
  const [groupToUpdate, setGroupToUpdate] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [groupToInvite, setGroupToInvite] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setGroupsError("");
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (search) params.search = search;
      const response = await api.community.groups.list<Group>(params);
      if (response.success) {
        setGroups(response.data);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroupsError(
        axios.isAxiosError(error) && !error.response
          ? "Tidak dapat terhubung ke server. Pastikan backend berjalan, lalu coba lagi."
          : "Komunitas gagal dimuat. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const visibleGroups = topicFilter === "ALL"
    ? groups
    : groups.filter((group) => group.topic === topicFilter);

  const selectGroupImage = (file?: File) => {
    setGroupImageError("");
    if (!file) return;
    if (!ACCEPTED_GROUP_IMAGE_TYPES.includes(file.type)) {
      setGroupImageError("Pilih gambar JPG, PNG, WebP, atau GIF.");
      if (groupImageInputRef.current) groupImageInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_GROUP_IMAGE_SIZE) {
      setGroupImageError("Ukuran gambar maksimal 5 MB.");
      if (groupImageInputRef.current) groupImageInputRef.current.value = "";
      return;
    }

    setGroupImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setGroupImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadGroupImage = async (file: File, oldPublicId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "cassava/community/groups");
    if (oldPublicId) formData.append("oldPublicId", oldPublicId);

    const response = oldPublicId
      ? await api.upload.replace(formData)
      : await api.upload.image(formData);
    return response.data.data;
  };

  const resetGroupImage = () => {
    setGroupImageFile(null);
    setGroupImagePreview("");
    setGroupImageError("");
    if (groupImageInputRef.current) groupImageInputRef.current.value = "";
  };

  const removeGroupImage = () => {
    setGroupImageFile(null);
    setGroupImagePreview("");
    setGroupImageError("");
    setUpdateData((current) => ({ ...current, imageUrl: "", imagePublicId: "" }));
    if (groupImageInputRef.current) groupImageInputRef.current.value = "";
  };

  useEffect(() => {
    fetchGroups();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.push(`/community?search=${encodeURIComponent(search)}`);
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: formData.get("name"),
      description: formData.get("description"),
      topic: formData.get("topic"),
      visibility: formData.get("visibility"),
      rules: formData.get("rules"),
    };
    try {
      if (groupImageFile) {
        const image = await uploadGroupImage(groupImageFile);
        data.imageUrl = image.url;
        data.imagePublicId = image.publicId;
      }
      const response = await api.community.groups.create<Group>(data);
      if (response.success) {
        setShowCreateModal(false);
        resetGroupImage();
        fetchGroups();
        router.push(`/community/groups/${response.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      if (groupImageFile) {
        setGroupImageError(
          axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "Foto grup gagal diunggah. Periksa koneksi dan coba lagi."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.community.groups.join(groupId);
      fetchGroups();
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("Yakin ingin keluar dari grup ini?")) return;
    try {
      await api.community.groups.leave(groupId);
      fetchGroups();
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!groupToUpdate) return;
    setUpdating(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      topic: String(formData.get("topic") ?? ""),
      visibility: String(formData.get("visibility") ?? ""),
      rules: String(formData.get("rules") ?? ""),
      imageUrl: groupImagePreview || null,
      imagePublicId: groupImagePreview ? updateData.imagePublicId || null : null,
    };
    try {
      if (groupImageFile) {
        const image = await uploadGroupImage(groupImageFile, updateData.imagePublicId || undefined);
        data.imageUrl = image.url;
        data.imagePublicId = image.publicId;
      }
      const response = await api.community.groups.update<Group>(groupToUpdate, data);
      if (response.success) {
        setShowUpdateModal(false);
        setGroupToUpdate(null);
        resetGroupImage();
        fetchGroups();
      }
    } catch (error) {
      console.error("Failed to update group:", error);
      if (groupImageFile) {
        setGroupImageError(
          axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "Foto grup gagal disimpan. Periksa koneksi dan coba lagi."
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    if (!confirm("Yakin ingin menghapus grup ini?")) return;
    try {
      await api.community.groups.delete(groupToDelete);
      setShowDeleteModal(false);
      setGroupToDelete(null);
      fetchGroups();
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleInvite = async () => {
    if (!groupToInvite || !inviteEmail.trim() || inviting) return;
    setInviting(true);
    try {
      await api.community.groups.invite(groupToInvite, {
        email: inviteEmail.trim(),
        role: "MEMBER",
      });
      setShowInviteModal(false);
      setGroupToInvite(null);
      setInviteEmail("");
      setInviteError("");
      fetchGroups();
    } catch (error) {
      console.error("Failed to invite member:", error);
      setInviteError(
        axios.isAxiosError(error) && error.response?.status === 404
          ? "Akun dengan email tersebut belum terdaftar. Undang anggota yang sudah memiliki akun."
          : axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "Undangan gagal dikirim. Silakan coba lagi."
      );
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f4f8f3] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-[#dcebdc] bg-gradient-to-br from-[#edf7ec] via-[#f7fbf5] to-[#e6f2e4] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/50" />
          <div className="pointer-events-none absolute -bottom-20 right-36 h-48 w-48 rounded-full bg-[#d8ebd5]/70" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d2e5d0] bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#367746]">
                <Leaf className="h-3.5 w-3.5" />
                Panen Loop · Tumbuh bersama
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#183b25] sm:text-4xl">
                Komunitas Singkong
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#58705d] sm:text-base">
                Ruang berbagi pengalaman, belajar, dan saling menguatkan untuk
                seluruh pelaku pertanian singkong.
              </p>
            </div>
            <button
              onClick={() => {
                resetGroupImage();
                setShowCreateModal(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#287a3c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#216733] focus:outline-none focus:ring-2 focus:ring-[#287a3c]/30 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5" />
              Buat komunitas
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-[#e2e9df] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#829184]" />
              <input
                type="search"
                placeholder="Cari komunitas atau topik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#e2e9df] bg-[#fbfcfa] py-3 pl-12 pr-4 text-sm text-text outline-none transition focus:border-[#77ad7a] focus:ring-4 focus:ring-[#77ad7a]/10"
              />
            </form>
            <div className="flex flex-wrap gap-2" aria-label="Filter berdasarkan topik">
              {[
                ["ALL", "Semua"],
                ["CULTIVATION", "Budidaya"],
                ["QUALITY", "Kualitas"],
                ["PROCESSING", "Pengolahan"],
                ["TECHNOLOGY", "Teknologi"],
                ["MARKET", "Pasar"],
                ["GENERAL", "Umum"],
              ].map(([topic, label]) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTopicFilter(topic)}
                  aria-pressed={topicFilter === topic}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                    topicFilter === topic
                      ? "bg-[#287a3c] text-white"
                      : "bg-[#f3f7f1] text-[#647467] hover:bg-[#e8f1e5] hover:text-[#287a3c]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Groups Grid */}
        <section>
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-[#e2e9df] bg-white p-6">
                  <div className="mb-5 h-12 w-12 rounded-2xl bg-[#edf3eb]" />
                  <div className="mb-4 h-5 w-3/4 rounded bg-[#edf3eb]" />
                  <div className="mb-3 h-4 w-full rounded bg-[#f2f5f0]" />
                  <div className="h-4 w-2/3 rounded bg-[#f2f5f0]" />
                </div>
              ))}
            </div>
          ) : groupsError ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <h2 className="text-lg font-semibold text-[#243328]">Komunitas belum dapat dimuat</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#718074]">{groupsError}</p>
              <button
                type="button"
                onClick={fetchGroups}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#287a3c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#216733]"
              >
                <RefreshCw className="h-4 w-4" />
                Coba lagi
              </button>
            </div>
          ) : visibleGroups.length === 0 ? (
            <div className="rounded-2xl border border-[#e2e9df] bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5eb] text-[#43834e]">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-[#243328]">
                {groups.length === 0 ? "Belum ada komunitas" : "Belum ada komunitas untuk topik ini"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718074]">
                {groups.length === 0
                  ? "Jadilah yang pertama membuat ruang diskusi untuk para pelaku pertanian singkong."
                  : "Pilih topik lain atau buat komunitas baru untuk memulai diskusi."}
              </p>
              {groups.length === 0 && (
                <button
                  onClick={() => {
                    resetGroupImage();
                    setShowCreateModal(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#287a3c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#216733]"
                >
                  <Plus className="h-4 w-4" /> Buat komunitas pertama
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#243328]">Temukan komunitas</h2>
                  <p className="mt-1 text-sm text-[#718074]">
                    {visibleGroups.length} komunitas{visibleGroups.length === 1 ? "" : " tersedia"}
                  </p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleGroups.map((group) => {
                  const TopicIcon = TOPIC_ICONS[group.topic] || MessageSquare;
                  return (
                    <article
                      key={group.id}
                      className="group flex min-h-64 flex-col rounded-2xl border border-[#e2e9df] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9d5b7] hover:shadow-md"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#edf5eb] text-[#43834e] ring-1 ring-[#dcebdc]">
                          {group.imageUrl ? (
                            <img src={group.imageUrl} alt={`Foto grup ${group.name}`} className="h-full w-full object-cover" />
                          ) : (
                            <TopicIcon className="h-7 w-7" />
                          )}
                        </div>
                        <span
                          title={group.visibility === "PRIVATE" ? "Privat" : group.visibility === "INVITE_ONLY" ? "Hanya undangan" : "Publik"}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f7f4] text-[#788579]"
                        >
                          {VISIBILITY_ICONS[group.visibility] || <Globe className="h-4 w-4" />}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="inline-flex rounded-full bg-[#edf5eb] px-2.5 py-1 text-[11px] font-semibold text-[#43834e]">
                          {TOPIC_LABELS[group.topic] || group.topic}
                        </span>
                        <h3 className="mt-3 text-lg font-bold leading-snug text-[#243328] transition-colors group-hover:text-[#287a3c]">
                          {group.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#718074]">
                          {group.description || "Ruang diskusi untuk berbagi informasi dan pengalaman."}
                        </p>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#718074]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf5eb] text-[#43834e]">
                            <Users className="h-3.5 w-3.5" />
                          </span>
                          {group.memberCount} anggota
                        </div>
                        <div className="flex items-center gap-2">
                          {group.isMember ? (
                            <span className="rounded-full bg-[#edf5eb] px-2.5 py-1 text-xs font-semibold text-[#43834e]">
                              {group.userRole === "OWNER" ? "Pemilik" : group.userRole === "ADMIN" ? "Admin" : "Anggota"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleJoinGroup(group.id)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-[#43834e] transition-colors hover:bg-[#edf5eb]"
                            >
                              Gabung
                            </button>
                          )}
                          <Link
                            href={`/community/groups/${group.id}`}
                            aria-label={`Buka komunitas ${group.name}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#287a3c] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#216733]"
                          >
                            Buka ruang <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                      {(group.userRole === "OWNER" || group.userRole === "ADMIN") && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setUpdateData({
                                name: group.name,
                                description: group.description || "",
                                topic: group.topic,
                                visibility: group.visibility,
                                rules: group.rules || "",
                                imageUrl: group.imageUrl || "",
                                imagePublicId: group.imagePublicId || "",
                              });
                              setGroupImageFile(null);
                              setGroupImagePreview(group.imageUrl || "");
                              setGroupImageError("");
                              setGroupToUpdate(group.id);
                              setShowUpdateModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#43834e] hover:bg-[#edf5eb]"
                          >
                            <Edit className="h-3.5 w-3.5" /> Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGroupToDelete(group.id);
                              setShowDeleteModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash className="h-3.5 w-3.5" /> Hapus
                          </button>
                          {group.userRole === "OWNER" && (
                            <button
                              type="button"
                              onClick={() => {
                                setGroupToInvite(group.id);
                                setInviteEmail("");
                                setInviteError("");
                                setShowInviteModal(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#43834e] hover:bg-[#edf5eb]"
                            >
                              <Mail className="h-3.5 w-3.5" /> Undang
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              <button
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#dce5d9] bg-white px-4 py-2 text-sm font-medium text-[#526454] transition-colors hover:bg-[#f1f6ef] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Halaman sebelumnya"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-[#718074]">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[#dce5d9] bg-white px-4 py-2 text-sm font-medium text-[#526454] transition-colors hover:bg-[#f1f6ef] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Halaman selanjutnya"
              >
                Selanjutnya
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-surface rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-text mb-6"
            >
              Buat Grup Baru
            </h2>
            <GroupPhotoPicker
              preview={groupImagePreview}
              error={groupImageError}
              inputRef={groupImageInputRef}
              onSelect={selectGroupImage}
              onRemove={resetGroupImage}
            />
            <form onSubmit={handleCreateGroup}>
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Nama Grup *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Contoh: Budidaya Singkong Berkualitas"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    maxLength={500}
                    rows={3}
                    placeholder="Jelaskan tujuan dan topik grup ini..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Topik *
                  </label>
                  <select
                    name="topic"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Pilih topik</option>
                    <option value="CULTIVATION">Budidaya</option>
                    <option value="QUALITY">Kualitas</option>
                    <option value="PROCESSING">Pengolahan</option>
                    <option value="TECHNOLOGY">Teknologi</option>
                    <option value="MARKET">Pasar</option>
                    <option value="GENERAL">Umum</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Visibilitas *
                  </label>
                  <select
                    name="visibility"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="PUBLIC">Publik - Siapapun bisa lihat dan gabung</option>
                    <option value="PRIVATE">Privat - Hanya anggota yang bisa lihat</option>
                    <option value="INVITE_ONLY">Hanya Undangan - Perlu diundang admin</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Aturan Grup
                  </label>
                  <textarea
                    name="rules"
                    maxLength={1000}
                    rows={3}
                    placeholder="Contoh: Tetap santun, tidak spam, bahas sesuai topik..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetGroupImage();
                  }}
                  className="px-6 py-3 border border-border rounded-lg text-text hover:bg-background transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  Buat Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Group Modal */}
      {showUpdateModal && groupToUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-surface rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-text mb-6"
            >
              Ubah Grup
            </h2>
            <GroupPhotoPicker
              preview={groupImagePreview}
              error={groupImageError}
              inputRef={groupImageInputRef}
              onSelect={selectGroupImage}
              onRemove={removeGroupImage}
            />
            <form onSubmit={handleUpdateGroup}>
              <input
                type="hidden"
                name="id"
                value={groupToUpdate}
              />
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Nama Grup *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    value={updateData.name}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Contoh: Budidaya Singkong Berkualitas"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    maxLength={500}
                    rows={3}
                    placeholder="Jelaskan tujuan dan topik grup ini..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                    value={updateData.description}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Topik *
                  </label>
                  <select
                    name="topic"
                    required
                    value={updateData.topic}
                    onChange={(e) => setUpdateData({ ...updateData, topic: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="CULTIVATION">Budidaya</option>
                    <option value="QUALITY">Kualitas</option>
                    <option value="PROCESSING">Pengolahan</option>
                    <option value="TECHNOLOGY">Teknologi</option>
                    <option value="MARKET">Pasar</option>
                    <option value="GENERAL">Umum</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Visibilitas *
                  </label>
                  <select
                    name="visibility"
                    required
                    value={updateData.visibility}
                    onChange={(e) => setUpdateData({ ...updateData, visibility: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="PUBLIC">Publik - Siapapun bisa lihat dan gabung</option>
                    <option value="PRIVATE">Privat - Hanya anggota yang bisa lihat</option>
                    <option value="INVITE_ONLY">Hanya Undangan - Perlu diundang admin</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Aturan Grup
                  </label>
                  <textarea
                    name="rules"
                    maxLength={1000}
                    rows={3}
                    placeholder="Contoh: Tetap santun, tidak spam, bahas sesuai topik..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                    value={updateData.rules}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        rules: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setGroupToUpdate(null);
                    setUpdateData({
                      name: "",
                      description: "",
                      topic: "",
                      visibility: "",
                      rules: "",
                      imageUrl: "",
                      imagePublicId: "",
                    });
                    resetGroupImage();
                  }}
                  className="px-6 py-3 border border-border rounded-lg text-text hover:bg-background transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {updating && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {showDeleteModal && groupToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-surface rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-text mb-6"
            >
              Hapus Grup
            </h2>
            <p
              className="text-text-secondary mb-8"
            >
              Apakah Anda yakin ingin menghapus grup ini? Semua pesan dan
              anggota akan terhapus.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setGroupToDelete(null);
                }}
                className="px-6 py-3 border border-border rounded-lg text-text hover:bg-background transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                className="px-6 py-3 bg-danger text-white rounded-lg hover:bg-danger/90"
              >
                Hapus Grup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && groupToInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-surface rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-text mb-4"
            >
              Undang Anggota
            </h2>
            <p
              className="text-text-secondary mb-4"
            >
              Masukkan email orang yang ingin Anda undang ke grup ini
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInvite();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    name="invite-email"
                    required
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError("");
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs leading-5 text-text-secondary">
                  Email yang diundang harus sudah memiliki akun di aplikasi.
                </p>
                {inviteError && (
                  <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {inviteError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setGroupToInvite(null);
                    setInviteEmail("");
                    setInviteError("");
                  }}
                  className="px-6 py-3 border border-border rounded-lg text-text hover:bg-background transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {inviting && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  Undang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={<div className="p-6">Loading...</div>}
    >
      <CommunityPageContent />
    </Suspense>
  );
}