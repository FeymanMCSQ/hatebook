import MiddleFingerLoader from '@/components/middleFinger/MiddleFingerLoader';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
      <div className="absolute h-64 w-64 rounded-full bg-fuchsia-700/10 blur-3xl animate-pulse" />
      <MiddleFingerLoader />
    </div>
  );
}
