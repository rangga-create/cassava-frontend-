"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

interface InvitePreview {
  group: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    memberCount: number;
  };
  expiresAt: string;
}

export default function CommunityInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.community.invitations.get<InvitePreview>(token)
      .then((response) => {
        if (active && response.success) setInvite(response.data);
      })
      .catch((requestError: unknown) => {
        console.error("Failed to load group invitation:", requestError);
        if (active) setError("Link undangan tidak valid atau sudah kedaluwarsa.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleJoin = async () => {
    if (!invite || joining) return;
    setJoining(true);
    setError("");
    try {
      await api.community.invitations.join(token);
      router.push(`/community/groups/${invite.group.id}`);
    } catch (requestError: unknown) {
      console.error("Failed to join group using invitation:", requestError);
      setError("Undangan tidak dapat digunakan. Mungkin sudah kedaluwarsa atau dicabut.");
    } finally {
      setJoining(false);
    }
  };

  const redirectPath = `/community/invite/${encodeURIComponent(token)}`;
  const authQuery = `?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f6ef] p-5">
      <section className="w-full max-w-md rounded-3xl border border-[#e0e9dd] bg-white p-7 text-center shadow-sm">
        {loading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#287a3c]" />
        ) : invite ? (
          <>
            <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-3xl bg-[#edf5eb]">
              {invite.group.imageUrl ? (
                <img src={invite.group.imageUrl} alt={`Foto grup ${invite.group.name}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#43834e]">
                  {invite.group.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#43834e]">Undangan komunitas</p>
            <h1 className="mt-2 text-2xl font-bold text-[#243328]">{invite.group.name}</h1>
            {invite.group.description && (
              <p className="mt-2 text-sm leading-6 text-[#718074]">{invite.group.description}</p>
            )}
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#718074]">
              <Users className="h-4 w-4" />
              {invite.group.memberCount} anggota
            </p>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {authLoading ? (
              <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-[#287a3c]" />
            ) : user ? (
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining}
                className="mt-6 w-full rounded-xl bg-[#287a3c] px-5 py-3 font-semibold text-white transition hover:bg-[#216733] disabled:opacity-60"
              >
                {joining ? "Memproses..." : "Gabung komunitas"}
              </button>
            ) : (
              <div className="mt-6 grid gap-3">
                <Link href={`/login${authQuery}`} className="rounded-xl bg-[#287a3c] px-5 py-3 font-semibold text-white hover:bg-[#216733]">
                  Masuk untuk bergabung
                </Link>
                <Link href={`/register${authQuery}`} className="rounded-xl border border-[#cbdcc8] px-5 py-3 font-semibold text-[#367746] hover:bg-[#edf5eb]">
                  Buat akun
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#243328]">Undangan tidak tersedia</h1>
            <p role="alert" className="mt-3 text-sm text-[#718074]">{error || "Link ini tidak valid atau sudah kedaluwarsa."}</p>
            <Link href="/community" className="mt-6 inline-flex rounded-xl bg-[#287a3c] px-5 py-3 font-semibold text-white hover:bg-[#216733]">
              Buka komunitas
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
