"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCommunitySocket } from "@/hooks/use-community-socket";
import { api } from "@/services/api";
import { Send, Users, MoreVertical, Flag, Trash2, Crown, Shield, Loader2, X, ChevronLeft, MessageSquare, Search, UserMinus, Link2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  description?: string;
  topic: string;
  visibility: string;
  rules?: string;
  imageUrl?: string;
  memberCount: number;
  userRole?: string;
  isMember: boolean;
}

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  text: string;
  mentions?: { userId: string; username: string }[];
  status: string;
  createdAt: string;
  sender?: { id: string; name: string };
}

interface Member {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  user?: { id: string; name: string; email: string; username?: string };
}

interface MentionSelection {
  userId: string;
  username: string;
}

function renderMessageText(text: string, mentions: MentionSelection[] = []) {
  if (!mentions.length) return text;
  const mentionPattern = new RegExp(
    `@(${mentions.map(({ username }) => username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![a-zA-Z0-9_.-])`,
    "gi",
  );
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = mentionPattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <span key={`${match.index}-${match[1]}`} className="font-semibold text-[#287a3c]">
        {match[0]}
      </span>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

const TOPIC_LABELS: Record<string, string> = {
  CULTIVATION: "Budidaya",
  QUALITY: "Kualitas",
  PROCESSING: "Pengolahan",
  TECHNOLOGY: "Teknologi",
  MARKET: "Pasar",
  GENERAL: "Umum",
};

export default function GroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { connected, joinGroup, leaveGroup, sendMessage: sendSocketMessage, onNewMessage, onMemberJoined, onMemberLeft } = useCommunitySocket();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [mentionSelections, setMentionSelections] = useState<MentionSelection[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [creatingInviteLink, setCreatingInviteLink] = useState(false);
  const [inviteLinkError, setInviteLinkError] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [showReportModal, setShowReportModal] = useState<{ messageId: string } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchGroup = async () => {
    try {
      const response = await api.community.groups.get<Group>(groupId);
      if (response.success) setGroup(response.data);
    } catch (error) {
      console.error("Failed to fetch group:", error);
      router.push("/community");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.community.groups.messages<Message>(groupId, { limit: 50, sortOrder: "asc" });
      if (response.success) setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.community.groups.members<Member>(groupId);
      if (response.success) setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGroup(), fetchMessages(), fetchMembers()]);
      setLoading(false);
    };
    loadData();
  }, [groupId]);

  // Socket event handlers
  useEffect(() => {
    if (!connected) return;

    joinGroup(groupId);

    const unsubNewMessage = onNewMessage((newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    const unsubMemberJoined = onMemberJoined(() => {
      fetchMembers();
      fetchGroup();
    });

    const unsubMemberLeft = onMemberLeft(() => {
      fetchMembers();
      fetchGroup();
    });

    return () => {
      leaveGroup(groupId);
      unsubNewMessage();
      unsubMemberJoined();
      unsubMemberLeft();
    };
  }, [connected, groupId, joinGroup, leaveGroup, onNewMessage, onMemberJoined, onMemberLeft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    const mentionIds = mentionSelections
      .filter(({ username }) => new RegExp(`@${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-zA-Z0-9_.-])`, "i").test(text))
      .map(({ userId }) => userId);
    setSending(true);
    setMessageText("");
    setMentionSelections([]);
    
    try {
      // Send via socket for real-time
      sendSocketMessage(groupId, text, mentionIds);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageText(text); // Restore on error
    } finally {
      setSending(false);
    }
  };

  const createInviteLink = async () => {
    setCreatingInviteLink(true);
    setInviteLinkError("");
    setInviteCopied(false);
    try {
      const response = await api.community.invitations.create<{ token: string }>(groupId);
      const url = `${window.location.origin}/community/invite/${encodeURIComponent(response.data.token)}`;
      setInviteLink(url);
      try {
        await navigator.clipboard.writeText(url);
        setInviteCopied(true);
      } catch {
        // The link remains available to copy manually if clipboard access is blocked.
      }
    } catch (error) {
      console.error("Failed to create group invitation link:", error);
      setInviteLinkError("Link undangan gagal dibuat. Pastikan Anda admin grup dan coba lagi.");
    } finally {
      setCreatingInviteLink(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    try {
      await api.community.messages.delete(messageId);
      fetchMessages();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleReportMessage = async (messageId: string) => {
    if (!reportReason || !reportDescription.trim()) return;
    try {
      await api.community.reports.create({
        targetType: "MESSAGE",
        targetId: messageId,
        reason: reportReason,
        description: reportDescription,
      });
      setShowReportModal(null);
      setReportReason("");
      setReportDescription("");
      alert("Laporan terkirim");
    } catch (error) {
      console.error("Failed to report:", error);
    }
  };

  const handleKickMember = async (targetUserId: string) => {
    if (!confirm("Keluarkan anggota ini dari grup?")) return;
    try {
      await api.community.groups.removeMember(groupId, targetUserId);
      fetchMembers();
      fetchGroup();
    } catch (error) {
      console.error("Failed to kick member:", error);
    }
  };

  const handlePromoteMember = async (targetUserId: string, newRole: "ADMIN" | "MEMBER") => {
    try {
      await api.community.groups.updateMemberRole(groupId, targetUserId, { role: newRole });
      fetchMembers();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const canManage = group?.userRole === "OWNER" || group?.userRole === "ADMIN";
  const isOwner = group?.userRole === "OWNER";
  const isCurrentUser = (userId: string) => userId === user?.uid;
  const filteredMembers = members.filter((member) => {
    const query = memberSearch.trim().toLowerCase();
    return !query ||
      member.user?.name?.toLowerCase().includes(query) ||
      member.user?.email?.toLowerCase().includes(query);
  });
  const mentionQuery = messageText.match(/(?:^|\s)@([a-zA-Z0-9_.-]*)$/);
  const mentionSuggestions = mentionQuery
    ? members.filter((member) => {
        const username = member.user?.username || "";
        return member.userId !== user?.uid && username.toLowerCase().includes(mentionQuery[1].toLowerCase());
      }).slice(0, 6)
    : [];

  const handleMessageInput = (value: string) => {
    setMessageText(value);
    setMentionSelections((selected) =>
      selected.filter(({ username }) =>
        new RegExp(`@${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-zA-Z0-9_.-])`, "i").test(value),
      ),
    );
  };

  const selectMention = (member: Member) => {
    const username = member.user?.username;
    if (!username) return;
    const nextText = messageText.replace(/(?:^|\s)@[a-zA-Z0-9_.-]*$/, (match) => `${match.startsWith(" ") ? " " : ""}@${username} `);
    setMessageText(nextText);
    setMentionSelections((selected) => [
      ...selected.filter((mention) => mention.userId !== member.userId),
      { userId: member.userId, username },
    ]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary">Grup tidak ditemukan</p>
      </div>
    );
  }

  if (!group.isMember) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Users className="h-16 w-16 text-text-secondary mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Anda bukan anggota grup ini</h2>
        <p className="text-text-secondary mb-6">Gabung grup untuk melihat percakapan</p>
        <button
          onClick={async () => {
            if (joining) return;
            setJoining(true);
            try {
              await api.community.groups.join(groupId);
              await Promise.all([fetchGroup(), fetchMessages(), fetchMembers()]);
            } catch (e) {
              console.error(e);
            } finally {
              setJoining(false);
            }
          }}
          disabled={joining}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          {joining ? "Memproses..." : "Gabung Grup"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-[#e4ebe2] bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[#e4ebe2] bg-white px-4 py-3 shadow-sm sm:gap-4 sm:px-6">
        <button
          onClick={() => router.push("/community")}
          aria-label="Kembali ke komunitas"
          className="rounded-xl p-2 text-[#718074] transition-colors hover:bg-[#f1f6ef] hover:text-[#287a3c]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#eaf3e8] ring-2 ring-[#dcebdc]">
          {group.imageUrl ? (
            <img src={group.imageUrl} alt={`Foto grup ${group.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#43834e]">
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-[#243328] sm:text-lg">{group.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#718074] sm:text-sm">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", connected ? "bg-[#4da563]" : "bg-[#a6b0a6]")} />
            <span className="shrink-0">{connected ? "Online" : "Menghubungkan"}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{TOPIC_LABELS[group.topic] || group.topic}</span>
            {group.description && (
              <>
                <span aria-hidden="true">·</span>
                <span className="hidden truncate md:inline">{group.description}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[#718074] transition-colors hover:bg-[#f1f6ef] hover:text-[#287a3c]"
          aria-label={`Lihat ${group.memberCount} anggota`}
        >
          <Users className="h-5 w-5" />
          <span className="hidden text-sm font-medium sm:inline">{group.memberCount}</span>
        </button>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setShowInviteLink(true);
              setInviteLink("");
              setInviteLinkError("");
              setInviteCopied(false);
            }}
            aria-label="Buat link undangan"
            title="Buat link undangan"
            className="rounded-xl p-2 text-[#718074] transition-colors hover:bg-[#f1f6ef] hover:text-[#287a3c]"
          >
            <Link2 className="h-5 w-5" />
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f1f6ef] p-4 sm:px-6" id="messages-container">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center py-10 text-center">
            <div className="max-w-md rounded-2xl border border-[#e0e9dd] bg-white p-7 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#edf5eb] text-[#43834e]">
                {group.imageUrl ? (
                  <img src={group.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <MessageSquare className="h-7 w-7" />
                )}
              </div>
              <p className="text-lg font-bold text-[#243328]">{group.name}</p>
              <p className="mt-2 text-sm leading-6 text-[#718074]">
                {group.description || "Ruang untuk berbagi pengalaman dan berdiskusi bersama."}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#edf5eb] px-3 py-1.5 text-xs font-semibold text-[#43834e]">
                <Users className="h-3.5 w-3.5" />
                {group.memberCount} anggota · Mulai percakapan pertama
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.uid;
            const senderName = msg.sender?.name || "Pengguna";
            const showActions = isOwn || canManage;
            const isMenuOpen = openMenuId === msg.id;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[88%] gap-2 sm:max-w-[75%] sm:gap-3",
                  isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {!isOwn && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#43834e] shadow-sm">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className={cn(
                    "relative px-4 py-2 rounded-2xl",
                    isOwn
                      ? "rounded-br-md bg-[#d8f2d0] text-[#223d29] shadow-sm"
                        : "rounded-bl-md border border-[#e5ebe2] bg-white shadow-sm"
                  )}
                >
                  {!isOwn && <p className="mb-1 text-xs font-semibold text-[#43834e]">{senderName}</p>}
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#29392d]">
                    {renderMessageText(msg.text, msg.mentions)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                      <time className="text-[11px] text-[#7a897b]">
                      {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </time>
                    {showActions && (
                      <>
                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : msg.id)}
                          className="p-1 rounded hover:bg-white/10"
                        >
                          <MoreVertical className="h-4 w-4 text-[#718074]" />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute bottom-full right-0 mb-1 bg-surface border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-background"
                              >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </button>
                            )}
                            {!isOwn && (
                              <button
                                onClick={() => setShowReportModal({ messageId: msg.id })}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text hover:bg-background"
                              >
                                <Flag className="h-4 w-4" />
                                Laporkan
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {isOwn && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-[#e4ebe2] bg-white p-3 sm:px-6 sm:py-4">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            {mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full left-0 z-20 mb-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-[#e0e9dd] bg-white p-2 shadow-lg">
                {mentionSuggestions.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => selectMention(member)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#f1f6ef]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf3e8] text-sm font-semibold text-[#43834e]">
                      {member.user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#29392d]">{member.user?.name || member.user?.username}</span>
                      <span className="block text-xs text-[#718074]">@{member.user?.username}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={messageText}
              onChange={(e) => handleMessageInput(e.target.value)}
              placeholder="Ketik pesan... Gunakan @ untuk mention"
              className="w-full rounded-full border border-[#e2e9df] bg-[#f8faf7] px-5 py-3 text-sm text-[#29392d] placeholder-[#89958a] outline-none transition focus:border-[#77ad7a] focus:ring-4 focus:ring-[#77ad7a]/10"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            aria-label="Kirim pesan"
            className="rounded-full bg-[#287a3c] p-3 text-white shadow-sm transition-colors hover:bg-[#216733] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </form>

      {showInviteLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#243328]">Link undangan grup</h2>
                <p className="mt-1 text-sm text-[#718074]">Link berlaku selama 7 hari dan dapat digunakan beberapa kali.</p>
              </div>
              <button type="button" onClick={() => setShowInviteLink(false)} aria-label="Tutup" className="rounded-lg p-1 text-[#718074] hover:bg-[#f1f6ef]">
                <X className="h-5 w-5" />
              </button>
            </div>
            {inviteLinkError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{inviteLinkError}</p>}
            {inviteLink ? (
              <div className="mt-5 space-y-3">
                <input readOnly value={inviteLink} className="w-full rounded-lg border border-[#dfe8dc] bg-[#f8faf7] px-3 py-2 text-sm text-[#29392d]" onFocus={(event) => event.currentTarget.select()} />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(inviteLink);
                      setInviteCopied(true);
                    } catch (error) {
                      console.error("Failed to copy invitation link:", error);
                      setInviteLinkError("Link belum dapat disalin otomatis. Silakan pilih dan salin link di atas.");
                    }
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#287a3c] px-4 py-2.5 font-semibold text-white hover:bg-[#216733]"
                >
                  <Copy className="h-4 w-4" />
                  {inviteCopied ? "Link disalin" : "Salin link"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={createInviteLink}
                disabled={creatingInviteLink}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#287a3c] px-4 py-2.5 font-semibold text-white hover:bg-[#216733] disabled:opacity-60"
              >
                {creatingInviteLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                {creatingInviteLink ? "Membuat link..." : "Buat link undangan"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Members Sidebar Modal */}
      {showMembers && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Tutup daftar anggota"
            className="absolute inset-0 bg-[#17231a]/45 backdrop-blur-[2px]"
            onClick={() => setShowMembers(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="members-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-[#e4ebe2] bg-[#f8faf7] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#e5ebe2] bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#43834e]">Komunitas</p>
                <h2 id="members-title" className="mt-1 text-lg font-bold text-[#243328]">
                  Anggota <span className="font-medium text-[#718074]">({members.length})</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMembers(false)}
                aria-label="Tutup"
                className="rounded-xl p-2 text-[#718074] transition-colors hover:bg-[#f1f6ef] hover:text-[#243328]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#e5ebe2] bg-white px-5 pb-5">
              <div className="flex items-center gap-3 rounded-2xl border border-[#e3ebe0] bg-[#f8faf7] p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eaf3e8] text-lg font-bold text-[#43834e]">
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    group.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#29392d]">{group.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[#718074]">
                    {group.description || TOPIC_LABELS[group.topic] || group.topic}
                  </p>
                </div>
              </div>
              <label className="relative mt-4 block">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829184]" />
                <input
                  type="search"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full rounded-xl border border-[#e2e9df] bg-white py-2.5 pl-10 pr-4 text-sm text-[#29392d] outline-none transition placeholder:text-[#89958a] focus:border-[#77ad7a] focus:ring-4 focus:ring-[#77ad7a]/10"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#829184]">
                  Semua anggota
                </p>
                {canManage && <span className="text-xs text-[#829184]">Kelola peran anggota</span>}
              </div>
              {filteredMembers.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredMembers.map((member) => {
                    const name = member.user?.name || "Pengguna";
                    const isSelf = isCurrentUser(member.userId);
                    return (
                      <article
                        key={member.id}
                        className="rounded-2xl border border-[#e5ebe2] bg-white p-3.5 shadow-sm transition-colors hover:border-[#cbdcc8]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf3e8] text-sm font-bold text-[#43834e]">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#29392d]">{name}</p>
                              {isSelf && (
                                <span className="shrink-0 rounded-full bg-[#f0f3ed] px-2 py-0.5 text-[10px] font-semibold text-[#718074]">
                                  Anda
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-[#829184]">{member.user?.email || "Email tidak tersedia"}</p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              member.role === "OWNER" && "bg-amber-50 text-amber-700",
                              member.role === "ADMIN" && "bg-[#edf5eb] text-[#367746]",
                              member.role === "MEMBER" && "bg-[#f1f3f0] text-[#647467]"
                            )}
                          >
                            {member.role === "OWNER" ? "Pemilik" : member.role === "ADMIN" ? "Admin" : "Anggota"}
                          </span>
                        </div>
                        {canManage && !isSelf && member.role !== "OWNER" && (
                          <div className="mt-3 flex justify-end gap-2 border-t border-[#f0f2ee] pt-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                handlePromoteMember(
                                  member.userId,
                                  member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#43834e] transition-colors hover:bg-[#edf5eb]"
                            >
                              {member.role === "ADMIN" ? <Shield className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
                              {member.role === "ADMIN" ? "Jadikan anggota" : "Jadikan admin"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleKickMember(member.userId)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                              Keluarkan
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#dce5d9] bg-white px-5 py-10 text-center">
                  <Users className="mx-auto h-8 w-8 text-[#a0aea0]" />
                  <p className="mt-3 text-sm font-semibold text-[#526454]">
                    {members.length ? "Anggota tidak ditemukan" : "Belum ada anggota"}
                  </p>
                  <p className="mt-1 text-xs text-[#829184]">
                    {members.length ? "Coba kata kunci nama atau email lain." : "Daftar anggota komunitas akan tampil di sini."}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-text mb-4">Laporkan Pesan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Alasan *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">Pilih alasan</option>
                  <option value="SPAM">Spam</option>
                  <option value="HARASSMENT">Pelecehan</option>
                  <option value="FRAUD">Penipuan</option>
                  <option value="THREAT">Ancaman</option>
                  <option value="ILLEGAL_CONTENT">Konten Ilegal</option>
                  <option value="OFF_TOPIC">Salah Topik</option>
                  <option value="SENSITIVE_DATA_LEAK">Kebocoran Data Sensitif</option>
                  <option value="IMPERSONATION">Menyamar</option>
                  <option value="PRICE_COLLUSION">Kolusi Harga</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Deskripsi</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan detail pelanggaran..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(null)}
                className="px-4 py-2 border border-border rounded-lg text-text hover:bg-background"
              >
                Batal
              </button>
              <button
                onClick={() => handleReportMessage(showReportModal.messageId)}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90"
              >
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}