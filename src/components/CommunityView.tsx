import React, { useState } from 'react';
import {
  Flag,
  AlertTriangle,
  ThumbsUp,
  MapPin,
  CheckCircle,
  Plus,
  Shield,
  Clock,
  EyeOff,
} from 'lucide-react';
import { IncidentReport } from '../types';

interface CommunityViewProps {
  reports: IncidentReport[];
  onAddReport: (report: IncidentReport) => void;
  onUpvoteReport: (id: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  reports,
  onAddReport,
  onUpvoteReport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState<IncidentReport['category']>('unlit_road');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locationName) return;

    const newReport: IncidentReport = {
      id: `rep-${Date.now()}`,
      title,
      category,
      locationName,
      coordinates: [28.685 + (Math.random() - 0.5) * 0.01, 77.205 + (Math.random() - 0.5) * 0.01],
      description,
      upvotes: 1,
      timestamp: 'Just now',
      anonymous: isAnonymous,
      status: 'verified',
    };

    onAddReport(newReport);
    setTitle('');
    setLocationName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flag className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold">Community Safety Radar</h2>
          </div>
          <p className="text-xs text-purple-200 mt-1 max-w-md">
            Crowdsourced alerts, unlit road warnings, and verified traveler hazards. Keep fellow commuters informed.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Report Hazard</span>
        </button>
      </div>

      {/* New Incident Modal */}
      {isModalOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-3xl bg-white border border-purple-200 shadow-lg space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Submit Safety Incident</h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Incident Headline</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Streetlights not working on Chhatra Marg"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="unlit_road">Unlit Road / Broken Lights</option>
                  <option value="harassment">Suspicious Activity / Harassment</option>
                  <option value="pothole">Road Damage / Pothole</option>
                  <option value="police_assistance">Police Checkpost / Barricade</option>
                  <option value="accident">Accident Prone Spot</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Near Ramjas College Gate"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Details (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lighting condition, alternative safe path, etc."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="anon" className="text-xs text-slate-600 flex items-center gap-1 cursor-pointer">
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                Submit Anonymously (Identity protected)
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md"
            >
              Broadcast Report
            </button>
          </div>
        </form>
      )}

      {/* Reports Feed */}
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    · {report.timestamp}
                  </span>
                  {report.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Community Verified
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {report.locationName}
                </p>
              </div>

              {/* Upvote Button */}
              <button
                onClick={() => onUpvoteReport(report.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="tabular-nums">{report.upvotes}</span>
              </button>
            </div>

            {report.description && (
              <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                {report.description}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{report.anonymous ? 'Anonymous Traveler' : 'Verified Student Resident'}</span>
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                View on map
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
