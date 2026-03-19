// Component Styles Showcase
// This file demonstrates all the new CSS classes and components

import { 
  Network, Upload, GitCompare, Search, BarChart3, 
  History, Settings, TrendingUp, Zap, Lock, 
  Check, X, AlertCircle, Info 
} from 'lucide-react'

export default function ComponentStyles() {
  return (
    <div className="p-8 space-y-12 bg-[var(--bg-base)] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Buttons</h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">
              Primary Button
            </button>
            <button className="btn btn-ghost">
              Ghost Button
            </button>
            <button className="btn btn-outline">
              Outline Button
            </button>
            <button className="btn btn-danger">
              Danger Button
            </button>
            <button className="btn btn-success">
              Success Button
            </button>
            <button className="btn btn-primary" disabled>
              Disabled
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary btn-sm">
              Small Button
            </button>
            <button className="btn btn-primary">
              Default Button
            </button>
            <button className="btn btn-primary btn-lg">
              Large Button
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">
              <Upload size={18} />
              With Icon
            </button>
            <button className="btn btn-icon btn-primary">
              <Search size={18} />
            </button>
            <button className="btn btn-icon-sm btn-ghost">
              <Settings size={16} />
            </button>
            <button className="btn btn-icon-lg btn-outline">
              <Network size={24} />
            </button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Badges</h2>
          
          <div className="flex flex-wrap gap-4">
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-danger">Danger</span>
            <span className="badge badge-info">Info</span>
            <span className="badge badge-purple">Purple</span>
            <span className="badge badge-gradient">Gradient</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <span className="badge badge-success badge-with-icon">
              <Check size={14} />
              Completed
            </span>
            <span className="badge badge-warning badge-with-icon">
              <AlertCircle size={14} />
              Pending
            </span>
            <span className="badge badge-danger badge-with-icon">
              <X size={14} />
              Failed
            </span>
          </div>
        </section>

        {/* Icons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Icons</h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="icon-wrapper icon-bg icon-bg-primary">
              <Network className="icon-lg" />
            </div>
            <div className="icon-wrapper icon-bg icon-bg-success">
              <Check className="icon-lg" />
            </div>
            <div className="icon-wrapper icon-bg icon-bg-warning">
              <AlertCircle className="icon-lg" />
            </div>
            <div className="icon-wrapper icon-bg icon-bg-danger">
              <X className="icon-lg" />
            </div>
            <div className="icon-wrapper icon-bg icon-bg-gradient">
              <Zap className="icon-lg" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Network className="icon-xs icon-primary" />
            <Network className="icon-sm icon-primary" />
            <Network className="icon-md icon-primary" />
            <Network className="icon-lg icon-primary" />
            <Network className="icon-xl icon-primary" />
            <Network className="icon-2xl icon-primary" />
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Inputs</h2>
          
          <div className="space-y-4 max-w-md">
            <input 
              type="text" 
              className="input" 
              placeholder="Default input"
            />
            
            <div className="input-group">
              <input 
                type="text" 
                className="input" 
                placeholder="Input with icon"
              />
              <Search className="input-group-icon" size={18} />
            </div>

            <input 
              type="text" 
              className="input input-sm" 
              placeholder="Small input"
            />

            <input 
              type="text" 
              className="input input-lg" 
              placeholder="Large input"
            />

            <input 
              type="text" 
              className="input" 
              placeholder="Disabled input"
              disabled
            />
          </div>
        </section>

        {/* Dashboard Stats */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard Stats</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon icon-bg-primary">
                <Upload className="icon-lg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-value">10</div>
                <div className="dashboard-stat-label">Documents</div>
              </div>
            </div>

            <div className="dashboard-stat">
              <div className="dashboard-stat-icon icon-bg-success">
                <GitCompare className="icon-lg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-value">36</div>
                <div className="dashboard-stat-label">Comparisons</div>
              </div>
            </div>

            <div className="dashboard-stat">
              <div className="dashboard-stat-icon icon-bg-warning">
                <BarChart3 className="icon-lg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-value">58.9%</div>
                <div className="dashboard-stat-label">Avg Similarity</div>
              </div>
            </div>

            <div className="dashboard-stat">
              <div className="dashboard-stat-icon icon-bg-gradient">
                <TrendingUp className="icon-lg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-value">+24%</div>
                <div className="dashboard-stat-label">This Month</div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Feature Cards</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="feature-card">
              <div className="feature-card-icon icon-bg-primary">
                <Network className="icon-xl" />
              </div>
              <h3 className="feature-card-title">Graph-Based</h3>
              <p className="feature-card-description">
                Convert documents to node-edge graphs for structural comparison
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon icon-bg-success">
                <Zap className="icon-xl" />
              </div>
              <h3 className="feature-card-title">Fast Detection</h3>
              <p className="feature-card-description">
                Multiple algorithms from O(n) node overlap to subgraph matching
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon icon-bg-warning">
                <Lock className="icon-xl" />
              </div>
              <h3 className="feature-card-title">Secure</h3>
              <p className="feature-card-description">
                JWT authentication with encrypted passwords and user isolation
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon icon-bg-danger">
                <BarChart3 className="icon-xl" />
              </div>
              <h3 className="feature-card-title">Rich Reports</h3>
              <p className="feature-card-description">
                Detailed similarity scores, matching sentences and keyword lists
              </p>
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Stat Cards</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="stat-card">
              <div className="stat-card-icon">
                <TrendingUp className="icon-xl text-white" />
              </div>
              <div className="stat-card-value">99%</div>
              <div className="stat-card-label">Accuracy</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <Zap className="icon-xl text-white" />
              </div>
              <div className="stat-card-value">95%</div>
              <div className="stat-card-label">Speed</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <Lock className="icon-xl text-white" />
              </div>
              <div className="stat-card-value">100%</div>
              <div className="stat-card-label">Security</div>
            </div>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Progress Bars</h2>
          
          <div className="space-y-4 max-w-md">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Processing</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Large</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">60%</span>
              </div>
              <div className="progress-bar progress-bar-lg">
                <div className="progress-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Small</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">90%</span>
              </div>
              <div className="progress-bar progress-bar-sm">
                <div className="progress-bar-fill" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Avatars */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Avatars</h2>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="avatar avatar-sm">FC</div>
            <div className="avatar">FC</div>
            <div className="avatar avatar-lg">FC</div>
            <div className="avatar avatar-xl">FC</div>
          </div>
        </section>

        {/* Tags */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Tags</h2>
          
          <div className="flex flex-wrap gap-3">
            <span className="tag">Default Tag</span>
            <span className="tag tag-primary">Primary Tag</span>
            <span className="tag tag-removable">
              Removable
              <span className="tag-remove">
                <X size={12} />
              </span>
            </span>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Loading States</h2>
          
          <div className="flex flex-wrap gap-8 items-center">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>

            <div className="loading-spinner loading-spinner-sm"></div>
            <div className="loading-spinner"></div>
            <div className="loading-spinner loading-spinner-lg"></div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Cards</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Default Card</h3>
              <p className="text-[var(--text-secondary)]">Basic card with hover effect</p>
            </div>

            <div className="card card-hover-lift">
              <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Lift Card</h3>
              <p className="text-[var(--text-secondary)]">Card with lift animation on hover</p>
            </div>

            <div className="card card-interactive">
              <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Interactive Card</h3>
              <p className="text-[var(--text-secondary)]">Clickable card with active state</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
