import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-md bg-[#00ade8] flex items-center justify-center">
        <span className="text-slate-950 font-bold text-sm">CE</span>
      </div>
      <div>
        <span className="text-lg font-display font-bold text-slate-100 tracking-tight">
          ness<span className="text-[#00ade8]">.</span>
        </span>
        <p className="text-xs text-slate-500 font-normal">ComplianceEngine</p>
      </div>
    </Link>
  );
}

