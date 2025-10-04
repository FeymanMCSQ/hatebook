'use client';
import './MiddleFingerLoader.css';

export default function MiddleFingerLoader() {
  return (
    <div className="hand">
      <div className="finger side-finger f1" />
      <div className="finger side-finger f2" />
      <div className="finger middle" />

      {/* Wrap f3 + thumb in a shared container */}
      <div className="finger-group">
        <div className="finger side-finger f3" />
        <div className="thumb" />
      </div>
    </div>
  );
}
