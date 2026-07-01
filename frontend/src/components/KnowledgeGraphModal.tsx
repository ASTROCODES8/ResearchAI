import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { X, Network, Info } from 'lucide-react';

interface KnowledgeGraphModalProps {
  paperId: string;
  onClose: () => void;
  graphData: {
    nodes: any[];
    edges: any[];
  } | null;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 45;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : ('top' as any);
    node.sourcePosition = isHorizontal ? 'right' : ('bottom' as any);
    
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export default function KnowledgeGraphModal({ paperId, onClose, graphData }: KnowledgeGraphModalProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  useEffect(() => {
    if (graphData && graphData.nodes && graphData.edges) {
      const initialNodes: Node[] = graphData.nodes.map((n) => ({
        id: n.id,
        data: { label: n.label, type: n.type },
        position: { x: 0, y: 0 },
        className: 'bg-white dark:bg-slate-800 border-2 border-brand-400 dark:border-brand-500/50 rounded-xl shadow-sm text-sm font-semibold px-4 py-2 text-slate-800 dark:text-slate-200 text-center',
      }));

      const initialEdges: Edge[] = graphData.edges.map((e, i) => ({
        id: `e-${e.source}-${e.target}-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        labelStyle: { fill: '#475569', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9, rx: 4, ry: 4 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    }
  }, [graphData, setNodes, setEdges]);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 animate-fade-in flex flex-col">
      <div className="w-full h-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center border border-brand-100 dark:border-brand-500/20">
              <Network className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Knowledge Graph</h2>
              <p className="text-xs font-medium text-slate-500">Interactive visualization of extracted concepts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Graph Area */}
        <div className="flex-1 relative bg-slate-50/50 dark:bg-slate-950/50">
          {!graphData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              fitView
              minZoom={0.2}
              maxZoom={2}
              className="bg-transparent"
            >
              <Background color="#cbd5e1" gap={24} size={1.5} />
              <Controls className="bg-white dark:bg-slate-800 border-none shadow-xl rounded-xl overflow-hidden [&>button]:border-slate-100 dark:[&>button]:border-slate-700 [&>button]:text-slate-700 dark:[&>button]:text-slate-300" />
            </ReactFlow>
          )}

          {/* Side Panel Overlay */}
          {(selectedNode || selectedEdge) && (
            <div className="absolute top-4 right-4 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-5 animate-slide-up z-20">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedNode ? "Concept Details" : "Relationship Details"}
                </h3>
              </div>
              
              {selectedNode && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Concept Name</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{selectedNode.data.label}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Entity Type</p>
                    <span className="inline-block px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-lg text-xs font-medium border border-brand-100 dark:border-brand-500/20 shadow-sm">
                      {selectedNode.data.type || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}

              {selectedEdge && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Relation Type</p>
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                      {selectedEdge.label || 'RELATED_TO'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="truncate text-slate-700 dark:text-slate-300 font-semibold">{selectedEdge.source}</div>
                    <div className="flex items-center gap-2 opacity-50 pl-2">
                      <div className="w-px h-3 bg-slate-400" />
                      <span>connects to</span>
                    </div>
                    <div className="truncate text-slate-700 dark:text-slate-300 font-semibold">{selectedEdge.target}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
