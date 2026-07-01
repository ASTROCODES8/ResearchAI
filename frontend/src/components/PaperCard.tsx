import React, { useState } from "react";
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Loader2,
  Network,
  Database,
  BrainCircuit,
  LayoutTemplate
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { getPaperGraph } from "../lib/api";
import toast from "react-hot-toast";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  published_date: string;
  overview: string;
  pdf_url: string;
  created_at: string;
}

interface PaperCardProps {
  paper: Paper;
  onDelete?: (id: string) => void;
}

const OVERVIEW_LIMIT = 150;

export default function PaperCard({ paper, onDelete }: PaperCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(paper.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paper.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleExpandGraph = async () => {
    setGraphExpanded(!graphExpanded);
    if (!graphExpanded && !graphData) {
      setGraphLoading(true);
      try {
        const data = await getPaperGraph(paper.id);
        setGraphData(data);
      } catch (error) {
        toast.error("Failed to load graph data");
      } finally {
        setGraphLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/papers/${paper.id}`);
      toast.success("Paper deleted successfully.");
      if (onDelete) onDelete(paper.id);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Failed to delete paper";
      toast.error(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isLong = paper.overview.length > OVERVIEW_LIMIT;
  const displayOverview =
    !expanded && isLong
      ? paper.overview.slice(0, OVERVIEW_LIMIT).trimEnd() + "…"
      : paper.overview;

  const uploadedDate = new Date(paper.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="
        group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800
        shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700
        transition-all duration-200 hover:-translate-y-0.5
        overflow-hidden flex flex-col
      ">
        {/* Top accent bar — reveals on hover */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* ── Header: icon + title + Delete button ── */}
          <div className="flex items-start gap-3">
            {/* Paper icon */}
            <div className="
              w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20
              flex items-center justify-center shrink-0 mt-0.5
              group-hover:bg-brand-100 dark:group-hover:bg-brand-500/30 transition-colors duration-200
            ">
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>

            {/* Title + date */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px] leading-snug line-clamp-2 tracking-tight">
                {paper.title}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Uploaded {uploadedDate}
              </p>
            </div>

            {/* Delete link */}
            <button
              onClick={() => setShowDeleteModal(true)}
              title="Delete Paper"
              className="
                shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10
                border border-transparent hover:border-red-100 dark:hover:border-red-500/20
                transition-all duration-150
              "
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Metadata row: authors + date ── */}
          <div className="space-y-2.5">
            {/* Authors */}
            {paper.authors.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {paper.authors.slice(0, 3).map((author) => (
                    <span
                      key={author}
                      className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-full font-medium"
                    >
                      {author}
                    </span>
                  ))}
                  {paper.authors.length > 3 && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-full font-medium">
                      +{paper.authors.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Published date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {paper.published_date}
              </span>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* ── Overview section ── */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-300 dark:text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                Overview
              </span>
            </div>

            <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {displayOverview}
            </p>

            {isLong && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="
                  inline-flex items-center gap-1 text-[11px] font-semibold
                  text-brand-600 hover:text-brand-700 transition-colors mt-0.5
                "
              >
                {expanded ? (
                  <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Read more <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
          
          {/* ── Divider ── */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* ── Knowledge Graph Section ── */}
          <div className="space-y-3">
            <button
              onClick={handleExpandGraph}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-1.5">
                <Network className="w-3 h-3 text-brand-500 dark:text-brand-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-600 dark:text-brand-400">
                  Knowledge Graph
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {graphExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            </button>

            {graphExpanded && (
              <div className="animate-slide-up space-y-4 pt-1">
                {graphLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                  </div>
                ) : graphData?.stats ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700/50">
                        <Database className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-none mb-0.5">{graphData.stats.chunk_count}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Chunks</p>
                      </div>
                      <div className="bg-brand-50 dark:bg-brand-500/10 rounded-lg p-2 text-center border border-brand-100 dark:border-brand-500/20">
                        <LayoutTemplate className="w-3.5 h-3.5 text-brand-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-brand-700 dark:text-brand-400 leading-none mb-0.5">{graphData.stats.entity_count}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400/80">Entities</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-2 text-center border border-purple-100 dark:border-purple-500/20">
                        <BrainCircuit className="w-3.5 h-3.5 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-400 leading-none mb-0.5">{graphData.stats.relationship_count}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400/80">Relations</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Concepts</p>
                      <div className="flex flex-wrap gap-1.5">
                        {graphData.stats.top_concepts.map((concept: string) => (
                          <span key={concept} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/graph/${paper.id}`)}
                      className="w-full py-2 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-xl transition-colors border border-brand-100 dark:border-brand-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Network className="w-3.5 h-3.5" />
                      View Interactive Graph
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500">No graph data available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer: Download button ── */}
        <div className="px-5 pb-4">
          <button
            onClick={handleDownload}
            className="
              w-full h-8 rounded-xl border border-slate-200 dark:border-slate-700
              text-[12px] font-semibold text-slate-500 dark:text-slate-400
              hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-500/20
              flex items-center justify-center gap-1.5
              transition-all duration-150 active:scale-[0.98]
            "
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in border border-slate-100 dark:border-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Delete Paper?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This will permanently remove:
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 mb-6 list-disc list-inside">
                <li>Original PDF</li>
                <li>AI-generated summary</li>
                <li>Chunk embeddings (Qdrant)</li>
                <li>Knowledge graph entities & relationships (Neo4j)</li>
                <li>Query history related to this paper</li>
              </ul>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="btn-secondary text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
