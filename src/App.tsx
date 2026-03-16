// Enhanced React UI Component
import React, { useState, useEffect } from 'react';

interface Breakpoint {
  minWidth: number;
  maxWidth: number;
  frameId: string;
  name: string;
}

interface AdaptiveLayoutData {
  breakpoints: Breakpoint[];
  currentFrameId: string;
  currentBreakpointIndex?: number;
}

interface FrameInfo {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

const App: React.FC = () => {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { name: 'Mobile', minWidth: 0, maxWidth: 600, frameId: '' },
    { name: 'Tablet', minWidth: 601, maxWidth: 1024, frameId: '' },
    { name: 'Desktop', minWidth: 1025, maxWidth: 9999, frameId: '' },
  ]);

  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [isResponsive, setIsResponsive] = useState(false);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableFrames, setAvailableFrames] = useState<FrameInfo[]>([]);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string | null>(null);
  const [masterFrameName, setMasterFrameName] = useState<string>('');

  useEffect(() => {
    // Listen for messages from plugin code
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMessage = (event: MessageEvent) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;

    switch (msg.type) {
      case 'selection-info':
        handleSelectionInfo(msg.data);
        break;
      case 'error':
        handleError(msg.message, msg.details);
        break;
      case 'success':
        handleSuccess(msg.message, msg.data);
        break;
      case 'loading-state':
        setLoading(msg.data);
        break;
      case 'available-frames':
        setAvailableFrames(msg.data);
        break;
      case 'breakpoint-changed':
        setCurrentBreakpoint(msg.data.breakpointName);
        break;
      case 'frame-swapped':
        handleSuccess('Layout updated successfully', msg.data);
        break;
      case 'layout-created':
        setIsResponsive(true);
        handleSuccess(msg.message || 'Adaptive layout created!', msg.data);
        break;
    }
  };

  const handleSelectionInfo = (data: any) => {
    if (data) {
      setSelectedFrame(data);
      setIsResponsive(data.hasAdaptiveLayout);
      if (data.adaptiveLayout) {
        setBreakpoints(data.adaptiveLayout.breakpoints);
        setMasterFrameName(data.frameName);
      }
    } else {
      setSelectedFrame(null);
      setIsResponsive(false);
    }
    setError(null);
  };

  const handleError = (message: string, details?: string) => {
    setError(details ? `${message}: ${details}` : message);
    setTimeout(() => setError(null), 5000);
    setLoading({ isLoading: false });
  };

  const handleSuccess = (message: string, data?: any) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
    setLoading({ isLoading: false });

    // Update breakpoints if returned
    if (data?.data?.breakpoints) {
      setBreakpoints(data.data.breakpoints);
    }
  };

  const sendMessage = (type: string, data?: any) => {
    parent.postMessage({ pluginMessage: { type, data } }, '*');
  };

  const handleCreateAdaptiveLayout = () => {
    const validBreakpoints = breakpoints.filter((bp) => bp.frameId !== '');

    if (validBreakpoints.length === 0) {
      setError('Please select at least one frame for a breakpoint');
      return;
    }

    // Validate breakpoint ranges don't overlap incorrectly
    for (let i = 0; i < validBreakpoints.length - 1; i++) {
      const current = validBreakpoints[i];
      const next = validBreakpoints[i + 1];
      if (current.maxWidth >= next.minWidth) {
        setError(`Breakpoint ranges overlap: ${current.name} and ${next.name}`);
        return;
      }
    }

    setLoading({ isLoading: true, message: 'Creating adaptive layout...' });
    sendMessage('create-adaptive-layout', {
      breakpoints: validBreakpoints,
      masterFrameName: masterFrameName || 'Adaptive Layout',
    });
  };

  const handleFrameSelect = (index: number, specificFrameId?: string) => {
    setLoading({
      isLoading: true,
      message: 'Select a frame from the canvas...',
    });

    if (specificFrameId) {
      sendMessage('select-frame-for-breakpoint', {
        breakpointIndex: index,
        frameId: specificFrameId,
      });
    } else {
      sendMessage('select-frame-for-breakpoint', {
        breakpointIndex: index,
      });
    }
  };

  const handleTestBreakpoint = (index: number) => {
    if (!breakpoints[index].frameId) {
      setError('This breakpoint does not have a linked frame');
      return;
    }

    setLoading({ isLoading: true, message: `Switching to ${breakpoints[index].name}...` });
    sendMessage('test-breakpoint', { breakpointIndex: index });
  };

  const handlePresetLoad = (preset: string) => {
    const presets: Record<
      string,
      { name: string; minWidth: number; maxWidth: number; frameId: string }[]
    > = {
      ios: [
        { name: 'iPhone SE', minWidth: 0, maxWidth: 375, frameId: '' },
        { name: 'iPhone 14', minWidth: 376, maxWidth: 390, frameId: '' },
        { name: 'iPhone 14 Plus', minWidth: 391, maxWidth: 428, frameId: '' },
        { name: 'iPad Mini', minWidth: 429, maxWidth: 744, frameId: '' },
        { name: 'iPad Pro', minWidth: 745, maxWidth: 1024, frameId: '' },
      ],
      android: [
        { name: 'Android Small', minWidth: 0, maxWidth: 360, frameId: '' },
        { name: 'Android Medium', minWidth: 361, maxWidth: 400, frameId: '' },
        { name: 'Android Large', minWidth: 401, maxWidth: 600, frameId: '' },
        { name: 'Android Tablet', minWidth: 601, maxWidth: 1024, frameId: '' },
      ],
      web: [
        { name: 'Mobile', minWidth: 0, maxWidth: 600, frameId: '' },
        { name: 'Tablet', minWidth: 601, maxWidth: 1024, frameId: '' },
        { name: 'Desktop', minWidth: 1025, maxWidth: 9999, frameId: '' },
      ],
    };

    setBreakpoints((presets[preset] || presets.web).map((bp) => ({
      ...bp,
      frameId: '',
    })));
    setIsResponsive(false);
    setCurrentBreakpoint(null);
  };

  const updateBreakpoint = (index: number, field: keyof Breakpoint, value: any) => {
    const updated = [...breakpoints];
    updated[index] = { ...updated[index], [field]: value };
    setBreakpoints(updated);
  };

  const addBreakpoint = () => {
    setBreakpoints([
      ...breakpoints,
      {
        name: `Breakpoint ${breakpoints.length + 1}`,
        minWidth: 0,
        maxWidth: 9999,
        frameId: '',
      },
    ]);
  };

  const removeBreakpoint = (index: number) => {
    const updated = breakpoints.filter((_, i) => i !== index);
    setBreakpoints(updated);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h2>Accordion</h2>
          <span className="version">v1.0</span>
        </div>
        {selectedFrame && (
          <div className="frame-info">
            <input
              type="text"
              value={masterFrameName}
              onChange={(e) => setMasterFrameName(e.target.value)}
              placeholder="Frame name"
              className="frame-name-input"
            />
            <span className="frame-size">
              {Math.round(selectedFrame.width)} × {Math.round(selectedFrame.height)}
            </span>
          </div>
        )}
      </header>

      {/* Status Messages */}
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      {loading.isLoading && (
        <div className="message loading">
          {loading.message || 'Loading...'}
        </div>
      )}

      <main className="main">
        {!selectedFrame ? (
          <div className="no-selection">
            <div className="no-selection-icon">🪗</div>
            <h3>Select a Frame</h3>
            <p>Select a frame to create an adaptive layout</p>
          </div>
        ) : !isResponsive ? (
          <div className="setup-view">
            <h3>Create Adaptive Layout</h3>

            <div className="presets">
              <h4>Quick Presets</h4>
              <div className="preset-buttons">
                <button onClick={() => handlePresetLoad('ios')} className="preset-btn ios">
                  iOS
                </button>
                <button onClick={() => handlePresetLoad('android')} className="preset-btn android">
                  Android
                </button>
                <button onClick={() => handlePresetLoad('web')} className="preset-btn web">
                  Web
                </button>
              </div>
            </div>

            <div className="breakpoints">
              <h4>Breakpoints</h4>
              {breakpoints.map((bp, index) => (
                <div key={index} className="breakpoint-row">
                  <div className="breakpoint-main">
                    <input
                      type="text"
                      value={bp.name}
                      onChange={(e) => updateBreakpoint(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="breakpoint-input name"
                    />
                    <div className="breakpoint-range">
                      <input
                        type="number"
                        value={bp.minWidth}
                        onChange={(e) =>
                          updateBreakpoint(index, 'minWidth', Number(e.target.value))
                        }
                        placeholder="Min"
                        className="breakpoint-input range"
                      />
                      <span className="range-separator">~</span>
                      <input
                        type="number"
                        value={bp.maxWidth}
                        onChange={(e) =>
                          updateBreakpoint(index, 'maxWidth', Number(e.target.value))
                        }
                        placeholder="Max"
                        className="breakpoint-input range"
                      />
                      <span className="unit">px</span>
                    </div>
                  </div>
                  <div className="breakpoint-actions">
                    <button
                      onClick={() => handleFrameSelect(index)}
                      className={`frame-btn ${bp.frameId ? 'linked' : ''}`}
                      title={bp.frameId ? 'Change linked frame' : 'Link a frame'}
                    >
                      {bp.frameId ? '🔗' : '➕'}
                    </button>
                    {bp.frameId && (
                      <button
                        onClick={() => handleTestBreakpoint(index)}
                        className="test-btn"
                        title="Test this breakpoint"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      onClick={() => removeBreakpoint(index)}
                      className="remove-btn"
                      title="Remove breakpoint"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button className="add-breakpoint" onClick={addBreakpoint}>
                + Add Breakpoint
              </button>
            </div>

            <div className="validation-info">
              <p>
                <strong>Required:</strong> Link at least one breakpoint to a frame
              </p>
              <p className="hint">Click ➕ to link frames from your canvas</p>
            </div>

            <button
              className="create-button"
              onClick={handleCreateAdaptiveLayout}
              disabled={breakpoints.every((bp) => !bp.frameId)}
            >
              Create Adaptive Layout
            </button>
          </div>
        ) : (
          <div className="active-view">
            <h3>🪗 Adaptive Layout Active</h3>

            {currentBreakpoint && (
              <div className="current-breakpoint">
                <span className="breakpoint-label">Current:</span>
                <span className="breakpoint-name">{currentBreakpoint}</span>
              </div>
            )}

            <div className="breakpoint-indicator">
              {breakpoints.map((bp, index) => (
                <div
                  key={index}
                  className={`breakpoint-indicator-item ${
                    currentBreakpoint === bp.name ? 'active' : ''
                  }`}
                >
                  <div className="breakpoint-header">
                    <span className="breakpoint-name">{bp.name}</span>
                    <span className="breakpoint-status">
                      {bp.frameId ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="breakpoint-range-display">
                    {bp.minWidth}px - {bp.maxWidth}px
                  </div>
                  <button
                    onClick={() => handleTestBreakpoint(index)}
                    className="test-breakpoint-btn"
                    disabled={!bp.frameId}
                  >
                    Test {bp.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="active-layout-info">
              <h4>How to Use</h4>
              <ol className="instructions">
                <li>Resize the master frame to see layout changes</li>
                <li>Click "Test" buttons to preview specific breakpoints</li>
                <li>Edit breakpoints in plugin settings</li>
              </ol>
            </div>

            <button
              className="reset-button"
              onClick={() => {
                setIsResponsive(false);
                setCurrentBreakpoint(null);
              }}
            >
              Edit Layout
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <button onClick={() => sendMessage('cancel')}>Close Plugin</button>
      </footer>
    </div>
  );
};

export default App;
