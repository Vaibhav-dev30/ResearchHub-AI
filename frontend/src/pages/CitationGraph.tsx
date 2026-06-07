import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import type { Connection, Edge, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Loader2, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../api';

// Custom Node component
const PaperNode = ({ data, selected }: NodeProps) => {
  const isCenter = data.type === 'center';
  const isRef = data.type === 'reference';
  
  let bg = 'var(--panel-bg)';
  let border = '1px solid var(--border-color)';
  
  if (isCenter) {
    bg = 'rgba(96,165,250,0.15)';
    border = '2px solid var(--primary-color)';
  } else if (isRef) {
    bg = 'rgba(167,139,250,0.1)';
    border = '1px solid rgba(167,139,250,0.4)';
  } else {
    bg = 'rgba(52,211,153,0.1)';
    border = '1px solid rgba(52,211,153,0.4)';
  }

  if (selected) {
    border = '2px solid #fff';
  }

  return (
    <div style={{
      background: bg,
      border,
      borderRadius: '8px',
      padding: '10px 14px',
      width: '280px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      color: 'var(--text-primary)',
      backdropFilter: 'blur(8px)',
      position: 'relative'
    }}>
      {!isCenter && <Handle type="target" position={Position.Top} style={{ background: 'var(--text-secondary)' }} />}
      
      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{String(data.type)}</span>
        <span>{String(data.year || '')}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', lineHeight: 1.3 }}>
        {String(data.label)}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {Array.isArray(data.authors) ? data.authors.join(', ') : String(data.authors || '')}
      </div>
      
      {isCenter && <Handle type="source" position={Position.Bottom} style={{ background: 'var(--primary-color)' }} />}
    </div>
  );
};

// Main Graph Component
const CitationGraph = () => {
  const { arxiv_id } = useParams();
  const navigate = useNavigate();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const nodeTypes = useMemo(() => ({ paperNode: PaperNode }), []);

  useEffect(() => {
    if (!arxiv_id) return;
    
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/citation-graph/${encodeURIComponent(arxiv_id)}`);
        const data = res.data;
        
        // Simple radial layout algorithm
        const centerNode = data.nodes.find((n: any) => n.data.type === 'center');
        const refs = data.nodes.filter((n: any) => n.data.type === 'reference');
        const cites = data.nodes.filter((n: any) => n.data.type === 'citation');
        
        const formattedNodes = [];
        
        // Center
        if (centerNode) {
          formattedNodes.push({
            id: centerNode.id,
            type: 'paperNode',
            position: { x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 50 },
            data: centerNode.data
          });
        }
        
        // References (bottom semicircle)
        refs.forEach((node: any, i: number) => {
          const angle = Math.PI + (Math.PI / (refs.length + 1)) * (i + 1);
          const radius = 400 + (i % 2 === 0 ? 0 : 80); // Stagger radius
          formattedNodes.push({
            id: node.id,
            type: 'paperNode',
            position: { 
              x: (window.innerWidth / 2 - 140) + Math.cos(angle) * radius, 
              y: (window.innerHeight / 2 - 50) - Math.sin(angle) * radius 
            },
            data: node.data
          });
        });
        
        // Citations (top semicircle)
        cites.forEach((node: any, i: number) => {
          const angle = (Math.PI / (cites.length + 1)) * (i + 1);
          const radius = 400 + (i % 2 === 0 ? 0 : 80);
          formattedNodes.push({
            id: node.id,
            type: 'paperNode',
            position: { 
              x: (window.innerWidth / 2 - 140) + Math.cos(angle) * radius, 
              y: (window.innerHeight / 2 - 50) - Math.sin(angle) * radius 
            },
            data: node.data
          });
        });
        
        // Format Edges with arrows
        const formattedEdges = data.edges.map((e: any) => ({
          ...e,
          animated: e.type === 'citation',
          style: { stroke: e.type === 'citation' ? 'rgba(52,211,153,0.6)' : 'rgba(167,139,250,0.6)', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: e.type === 'citation' ? 'rgba(52,211,153,0.8)' : 'rgba(167,139,250,0.8)' }
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load citation graph.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraph();
  }, [arxiv_id, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ height: 'calc(100vh - 60px)', width: '100%', position: 'relative' }}>
      {/* Header Overlay */}
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 10,
        display: 'flex', gap: '1rem', alignItems: 'center'
      }}>
        <button className="btn" onClick={() => navigate(-1)} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ background: 'var(--panel-bg)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={18} style={{ color: 'var(--primary-color)' }} /> 
            Citation Network
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary-color)', marginTop: '0.2rem' }}>
            ArXiv ID: {arxiv_id}
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--primary-color)' }}>
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 500 }}>Generating Knowledge Graph...</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, background: 'rgba(248,113,113,0.1)', color: 'var(--danger-color)', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.2)' }}>
          {error}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        colorMode="dark"
        style={{ background: 'var(--bg-color)' }}
      >
        <Background gap={24} size={2} color="rgba(96,165,250,0.1)" />
        <Controls style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px' }} />
        <MiniMap 
          nodeColor={(n: any) => {
            if (n.data?.type === 'center') return '#3B82F6';
            if (n.data?.type === 'reference') return '#A78BFA';
            return '#34D399';
          }}
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
          maskColor="rgba(15,23,42,0.7)"
        />
      </ReactFlow>
    </div>
  );
};

export default CitationGraph;
