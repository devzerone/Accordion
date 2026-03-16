// React UI Component
import React, { useState, useEffect } from 'react';
import { emit } from '@figma/plugin-typings';

interface Breakpoint {
  minWidth: number;
  maxWidth: number;
  frameId: string;
  name: string;
}

interface AdaptiveLayoutData {
  breakpoints: Breakpoint[];
  currentFrameId: string;
}

const App: React.FC = () => {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { name: 'Mobile', minWidth: 0, maxWidth: 600, frameId: '' },
    { name: 'Tablet', minWidth: 601, maxWidth: 1024, frameId: '' },
    { name: 'Desktop', minWidth: 1025, maxWidth: 9999, frameId: '' },
  ]);

  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    // Listen for messages from plugin code
    window.addEventListener('message', (event) => {
      const msg = event.data.pluginMessage;

      if (msg.type === 'selection-info') {
        setSelectedFrame(msg.data);
        setIsResponsive(!!msg.data.adaptiveLayout);
        if (msg.data.adaptiveLayout) {
          setBreakpoints(msg.data.adaptiveLayout.breakpoints);
        }
      } else if (msg.type === 'error') {
        alert(msg.message);
      } else if (msg.type === 'layout-created') {
        setIsResponsive(true);
      }
    });

    // Request current selection
    parent.postMessage({ pluginMessage: { type: 'get-current-selection' } }, '*');
  }, []);

  const handleCreateAdaptiveLayout = () => {
    const validBreakpoints = breakpoints.filter((bp) => bp.frameId !== '');

    if (validBreakpoints.length === 0) {
      alert('Please select at least one frame for a breakpoint');
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'create-adaptive-layout',
          data: { breakpoints: validBreakpoints },
        },
      },
      '*'
    );
  };

  const handleFrameSelect = (index: number) => {
    // Trigger frame selection in Figma
    // This would need to be implemented with proper frame selection UI
    alert(`Select a frame for ${breakpoints[index].name} breakpoint`);

    // For now, just mark as selected (in real implementation, user would select from canvas)
    const updatedBreakpoints = [...breakpoints];
    updatedBreakpoints[index].frameId = 'selected-frame-id'; // Placeholder
    setBreakpoints(updatedBreakpoints);
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
        { name: 'iPad', minWidth: 429, maxWidth: 1024, frameId: '' },
      ],
      android: [
        { name: 'Android Small', minWidth: 0, maxWidth: 360, frameId: '' },
        { name: 'Android Medium', minWidth: 361, maxWidth: 400, frameId: '' },
        { name: 'Android Large', minWidth: 401, maxWidth: 600, frameId: '' },
      ],
      web: [
        { name: 'Mobile', minWidth: 0, maxWidth: 600, frameId: '' },
        { name: 'Tablet', minWidth: 601, maxWidth: 1024, frameId: '' },
        { name: 'Desktop', minWidth: 1025, maxWidth: 9999, frameId: '' },
      ],
    };

    setBreakpoints(presets[preset] || presets.web);
  };

  return (
    <div className="app">
      <header className="header">
        <h2>Accordion</h2>
        {selectedFrame && (
          <div className="frame-info">
            <span className="frame-name">{selectedFrame.frameName}</span>
            <span className="frame-size">
              {Math.round(selectedFrame.width)} × {Math.round(selectedFrame.height)}
            </span>
          </div>
        )}
      </header>

      <main className="main">
        {selectedFrame ? (
          <>
            {!isResponsive ? (
              <div className="setup-view">
                <h3>Create Adaptive Layout</h3>

                <div className="presets">
                  <h4>Quick Presets</h4>
                  <button onClick={() => handlePresetLoad('ios')}>iOS</button>
                  <button onClick={() => handlePresetLoad('android')}>Android</button>
                  <button onClick={() => handlePresetLoad('web')}>Web</button>
                </div>

                <div className="breakpoints">
                  <h4>Breakpoints</h4>
                  {breakpoints.map((bp, index) => (
                    <div key={index} className="breakpoint-row">
                      <input
                        type="text"
                        value={bp.name}
                        onChange={(e) => {
                          const updated = [...breakpoints];
                          updated[index].name = e.target.value;
                          setBreakpoints(updated);
                        }}
                        placeholder="Name"
                      />
                      <input
                        type="number"
                        value={bp.minWidth}
                        onChange={(e) => {
                          const updated = [...breakpoints];
                          updated[index].minWidth = Number(e.target.value);
                          setBreakpoints(updated);
                        }}
                        placeholder="Min"
                      />
                      <span>~</span>
                      <input
                        type="number"
                        value={bp.maxWidth}
                        onChange={(e) => {
                          const updated = [...breakpoints];
                          updated[index].maxWidth = Number(e.target.value);
                          setBreakpoints(updated);
                        }}
                        placeholder="Max"
                      />
                      <button onClick={() => handleFrameSelect(index)}>
                        {bp.frameId ? '✓' : 'Select Frame'}
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...breakpoints];
                          updated.splice(index, 1);
                          setBreakpoints(updated);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="add-breakpoint"
                    onClick={() =>
                      setBreakpoints([
                        ...breakpoints,
                        {
                          name: `Breakpoint ${breakpoints.length + 1}`,
                          minWidth: 0,
                          maxWidth: 9999,
                          frameId: '',
                        },
                      ])
                    }
                  >
                    + Add Breakpoint
                  </button>
                </div>

                <button
                  className="create-button"
                  onClick={handleCreateAdaptiveLayout}
                >
                  Create Adaptive Layout
                </button>
              </div>
            ) : (
              <div className="active-view">
                <h3>Adaptive Layout Active</h3>
                <div className="breakpoint-indicator">
                  {breakpoints.map((bp, index) => (
                    <div key={index} className="breakpoint-indicator-item">
                      <span>{bp.name}</span>
                      <span>
                        {bp.minWidth}px - {bp.maxWidth}px
                      </span>
                    </div>
                  ))}
                </div>
                <p className="hint">
                  Resize the frame to see layout changes automatically
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="no-selection">
            <p>Select a frame to create an adaptive layout</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')}>
          Close
        </button>
      </footer>
    </div>
  );
};

export default App;
