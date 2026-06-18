import { formatETH, formatDeadline } from "../utils/helpers";

function StatCard({ label, value, sub, valueClass = "" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-1 text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-medium text-slate-900 ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2.5 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function RewardCard({
  loading,
  rewardAmount,
  hasClaimed,
  isWhitelisted,
  isActive,
  claimDeadline,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  // Mahasiswa yang belum pernah di-grant reward sama sekali (belum
  // whitelisted) tidak punya apa-apa untuk ditampilkan sebagai reward —
  // ini kondisi nyata di kontrak (whitelist[student] baru true setelah
  // dosen memanggil grantReward).
  if (!isWhitelisted) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">
          Belum ada reward untuk alamat ini. Reward akan muncul setelah dosen memberikannya.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* READ #1 */}
      <StatCard label="Reward amount" value={formatETH(rewardAmount)} sub="Ditransfer saat klaim" />
      {/* READ #2 */}
      <StatCard
        label="Status klaim"
        value={hasClaimed ? "Sudah diklaim" : "Belum diklaim"}
        sub="Dibaca dari smart contract"
        valueClass={hasClaimed ? "text-emerald-600" : "text-amber-600"}
      />
      {!isActive && (
        <div className="sm:col-span-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Program reward sedang dinonaktifkan oleh dosen.
        </div>
      )}
      {isActive && claimDeadline > 0 && (
        <div className="sm:col-span-2 text-xs text-slate-400">
          Batas waktu klaim: {formatDeadline(claimDeadline)}
        </div>
      )}
    </div>
  );
}
