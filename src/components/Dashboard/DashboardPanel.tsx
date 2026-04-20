// components/Dashboard/DashboardPanel.tsx — Analytics & Live Runs Dashboard
// Shows workflow instances, SLA tracking, and performance metrics

import { useState } from 'react';
import { BarChart3, Clock, CheckCircle2, AlertTriangle, Activity, TrendingUp, X } from 'lucide-react';

interface WorkflowRun {
  id: string;
  templateName: string;
  startedAt: string;
  status: 'running' | 'completed' | 'breached' | 'paused';
  currentStep: string;
  progress: number;
  slaStatus: 'ok' | 'warning' | 'breached';
}

const MOCK_RUNS: WorkflowRun[] = [
  { id: 'WF-001', templateName: 'Employee Onboarding', startedAt: '2026-04-20 09:00', status: 'running', currentStep: 'Collect Documents', progress: 40, slaStatus: 'ok' },
  { id: 'WF-002', templateName: 'Leave Approval', startedAt: '2026-04-19 14:30', status: 'running', currentStep: 'Manager Review', progress: 50, slaStatus: 'warning' },
  { id: 'WF-003', templateName: 'Employee Offboarding', startedAt: '2026-04-18 10:15', status: 'breached', currentStep: 'Knowledge Transfer', progress: 30, slaStatus: 'breached' },
  { id: 'WF-004', templateName: 'Performance Review', startedAt: '2026-04-17 08:00', status: 'completed', currentStep: 'Complete', progress: 100, slaStatus: 'ok' },
  { id: 'WF-005', templateName: 'Employee Onboarding', startedAt: '2026-04-16 11:00', status: 'completed', currentStep: 'Complete', progress: 100, slaStatus: 'ok' },
];

interface DashboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardPanel = ({ isOpen, onClose }: DashboardPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'breached'>('all');

  if (!isOpen) return null;

  const filteredRuns = filter === 'all' ? MOCK_RUNS : MOCK_RUNS.filter(r => r.status === filter);
  
  const totalRuns = MOCK_RUNS.length;
  const completedRuns = MOCK_RUNS.filter(r => r.status === 'completed').length;
  const activeRuns = MOCK_RUNS.filter(r => r.status === 'running').length;
  const breachedRuns = MOCK_RUNS.filter(r => r.slaStatus === 'breached').length;
  const completionRate = Math.round((completedRuns / totalRuns) * 100);
  const avgCycleTime = '2.4 days';

  const statusColor = (status: string) => {
    switch (status) {
      case 'running': return '#6366f1';
      case 'completed': return '#10b981';
      case 'breached': return '#ef4444';
      case 'paused': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const slaIndicator = (sla: string) => {
    switch (sla) {
      case 'ok': return { color: '#10b981', label: 'On Track' };
      case 'warning': return { color: '#f59e0b', label: 'At Risk' };
      case 'breached': return { color: '#ef4444', label: 'Breached' };
      default: return { color: '#9ca3af', label: 'Unknown' };
    }
  };

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-panel">
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <BarChart3 size={20} />
            <h2>Dashboard & Analytics</h2>
          </div>
          <button onClick={onClose} className="btn-icon" title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="dashboard-body">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                <Activity size={20} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{activeRuns}</span>
                <span className="kpi-label">Active Runs</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <CheckCircle2 size={20} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{completionRate}%</span>
                <span className="kpi-label">Completion Rate</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                <AlertTriangle size={20} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{breachedRuns}</span>
                <span className="kpi-label">SLA Breached</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                <TrendingUp size={20} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{avgCycleTime}</span>
                <span className="kpi-label">Avg. Cycle Time</span>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="dash-filter-tabs">
            {(['all', 'running', 'completed', 'breached'] as const).map(f => (
              <button
                key={f}
                className={`dash-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && <span className="dash-tab-count">{MOCK_RUNS.filter(r => f === 'breached' ? r.slaStatus === f : r.status === f).length}</span>}
              </button>
            ))}
          </div>

          {/* Live Runs Table */}
          <div className="runs-table-container">
            <table className="runs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Workflow</th>
                  <th>Started</th>
                  <th>Current Step</th>
                  <th>Progress</th>
                  <th>SLA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map(run => {
                  const sla = slaIndicator(run.slaStatus);
                  return (
                    <tr key={run.id}>
                      <td className="run-id">{run.id}</td>
                      <td className="run-name">{run.templateName}</td>
                      <td className="run-date">{run.startedAt}</td>
                      <td className="run-step">{run.currentStep}</td>
                      <td>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${run.progress}%`, background: statusColor(run.status) }}></div>
                        </div>
                      </td>
                      <td>
                        <span className="sla-badge" style={{ color: sla.color, borderColor: `${sla.color}30`, background: `${sla.color}10` }}>
                          <Clock size={10} /> {sla.label}
                        </span>
                      </td>
                      <td>
                        <span className="status-dot" style={{ background: statusColor(run.status) }}></span>
                        {run.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
