// Linear-style Figma Plugin UI
import React, { useState, useEffect } from 'react';

interface Breakpoint {
  minWidth: number;
  maxWidth: number;
  frameId: string;
  name: string;
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
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string | null>(null);
  const [masterFrameName, setMasterFrameName] = useState<string>('');

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMessage = (event: MessageEvent) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;

    switch (msg.type) {
      case 'selection-info':
        if (msg.data) {
          setSelectedFrame(msg.data);
          setIsResponsive(msg.data.hasAdaptiveLayout);
          if (msg.data.adaptiveLayout) {
            setBreakpoints(msg.data.adaptiveLayout.breakpoints);
            setMasterFrameName(msg.data.frameName);
          }
        }
        break;
      case 'error':
        setError(msg.message);
        setTimeout(() => setError(null), 5000);
        break;
      case 'success':
        setSuccess(msg.message);
        setTimeout(() => setSuccess(null), 3000);
        break;
      case 'loading-state':
        setLoading(msg.data);
        break;
      case 'breakpoint-changed':
        setCurrentBreakpoint(msg.data.breakpointName);
        break;
      case 'layout-created':
        setIsResponsive(true);
        setSuccess(msg.message || 'Adaptive layout created!');
        setTimeout(() => setSuccess(null), 3000);
        break;
    }
  };

  const sendMessage = (type: string, data?: any) => {
    parent.postMessage({ pluginMessage: { type, data } }, '*');
  };

  const handleCreateLayout = () => {
    const validBreakpoints = breakpoints.filter((bp) => bp.frameId !== '');
    if (validBreakpoints.length === 0) {
      setError('Please link at least one frame to a breakpoint');
      setTimeout(() => setError(null), 5000);
      return;
    }
    setLoading({ isLoading: true, message: 'Creating adaptive layout...' });
    sendMessage('create-adaptive-layout', {
      breakpoints: validBreakpoints,
      masterFrameName: masterFrameName || 'Adaptive Layout',
    });
  };

  const handleFrameSelect = (index: number) => {
    setLoading({ isLoading: true, message: 'Select a frame from canvas...' });
    sendMessage('select-frame-for-breakpoint', { breakpointIndex: index });
  };

  const handleTestBreakpoint = (index: number) => {
    if (!breakpoints[index].frameId) {
      setError('This breakpoint needs a linked frame');
      setTimeout(() => setError(null), 5000);
      return;
    }
    setLoading({ isLoading: true, message: `Switching to ${breakpoints[index].name}...` });
    sendMessage('test-breakpoint', { breakpointIndex: index });
  };

  const handlePreset = (preset: 'ios' | 'android' | 'web') => {
    const presets = {
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
    setBreakpoints(presets[preset].map((bp) => ({ ...bp, frameId: '' })));
    setIsResponsive(false);
    setCurrentBreakpoint(null);
  };

  const updateBreakpoint = (index: number, field: keyof Breakpoint, value: any) => {
    const updated = [...breakpoints];
    updated[index] = { ...updated[index], [field]: value };
    setBreakpoints(updated);
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e5e5e5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        height: '56px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #5b5fc7 0%, #4045a3 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '700',
          }}>
            🪗
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #fff 0%, #a5a5a5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Accordion
            </div>
            <div style={{
              fontSize: '11px',
              color: '#737373',
              marginTop: '1px',
            }}>
              Responsive Layout
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedFrame && (
            <input
              type="text"
              value={masterFrameName}
              onChange={(e) => setMasterFrameName(e.target.value)}
              placeholder="Frame name"
              style={{
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          margin: '16px 20px 0',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          margin: '16px 20px 0',
          padding: '12px 16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#86efac',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {loading.isLoading && (
        <div style={{
          margin: '16px 20px 0',
          padding: '12px 16px',
          background: 'rgba(91, 95, 199, 0.1)',
          border: '1px solid rgba(91, 95, 199, 0.3)',
          borderRadius: '8px',
          color: '#a5b4fc',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            border: '2px solid #5b5fc7',
            borderTop: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}></div>
          <span>{loading.message || 'Loading...'}</span>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {!selectedFrame ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.5,
            }}>🪗</div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#e5e5e5',
              marginBottom: '8px',
            }}>
              Select a Frame
            </div>
            <div style={{
              fontSize: '13px',
              color: '#737373',
            }}>
              Choose a frame to create an adaptive layout
            </div>
          </div>
        ) : !isResponsive ? (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Presets */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#737373',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Quick Presets
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handlePreset('ios')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(91, 95, 199, 0.15) 0%, rgba(64, 69, 163, 0.15) 100%)',
                    border: '1px solid rgba(91, 95, 199, 0.3)',
                    borderRadius: '8px',
                    color: '#a5a5a5',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(91, 95, 199, 0.25) 0%, rgba(64, 69, 163, 0.25) 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(91, 95, 199, 0.15) 0%, rgba(64, 69, 163, 0.15) 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🍎 iOS
                </button>
                <button
                  onClick={() => handlePreset('android')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(61, 220, 132, 0.15) 0%, rgba(48, 189, 113, 0.15) 100%)',
                    border: '1px solid rgba(61, 220, 132, 0.3)',
                    borderRadius: '8px',
                    color: '#a5a5a5',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(61, 220, 132, 0.25) 0%, rgba(48, 189, 113, 0.25) 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(61, 220, 132, 0.15) 0%, rgba(48, 189, 113, 0.15) 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🤖 Android
                </button>
                <button
                  onClick={() => handlePreset('web')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: '8px',
                    color: '#a5a5a5',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🌐 Web
                </button>
              </div>
            </div>

            {/* Breakpoints */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#737373',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Breakpoints
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#737373',
                }}>
                  {breakpoints.length} configured
                </div>
              </div>

              {breakpoints.map((bp, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: bp.frameId
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(48, 189, 113, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(91, 95, 199, 0.2) 0%, rgba(64, 69, 163, 0.2) 100%)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}>
                    {bp.frameId ? '✓' : '📱'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={bp.name}
                      onChange={(e) => updateBreakpoint(index, 'name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 0',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#e5e5e5',
                        fontSize: '13px',
                        fontWeight: '500',
                        outline: 'none',
                      }}
                    />
                    </div>

                  <div style={{
                    fontSize: '11px',
                    color: '#737373',
                    fontFamily: 'Monaco, monospace',
                  }}>
                    {bp.minWidth}-{bp.maxWidth}px
                  </div>

                  <button
                    onClick={() => handleFrameSelect(index)}
                    style={{
                      padding: '6px 12px',
                      background: bp.frameId
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(91, 95, 199, 0.15)',
                      border: bp.frameId
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(91, 95, 199, 0.3)',
                      borderRadius: '6px',
                      color: bp.frameId ? '#86efac' : '#a5b4fc',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    >
                    {bp.frameId ? '✓ Linked' : '+ Link'}
                  </button>
                </div>
              ))}
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateLayout}
              disabled={breakpoints.every((bp) => !bp.frameId)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                background: breakpoints.every((bp) => !bp.frameId)
                  ? 'rgba(91, 95, 199, 0.2)'
                  : 'linear-gradient(135deg, #5b5fc7 0%, #4045a3 100%)',
                border: 'none',
                borderRadius: '8px',
                color: breakpoints.every((bp) => !bp.frameId) ? '#737373' : 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: breakpoints.every((bp) => !bp.frameId) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: breakpoints.every((bp) => !bp.frameId)
                  ? 'none'
                  : '0 4px 20px rgba(91, 95, 199, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!breakpoints.every((bp) => !bp.frameId)) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(91, 95, 199, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!breakpoints.every((bp) => !bp.frameId)) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(91, 95, 199, 0.3)';
                }
              }}
            >
              Create Adaptive Layout
            </button>
          </div>
        ) : (
          /* Active State */
          <div style={{
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(91, 95, 199, 0.1) 0%, rgba(64, 69, 163, 0.1) 100%)',
            border: '1px solid rgba(91, 95, 199, 0.3)',
            borderRadius: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}>✨</div>

            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #fff 0%, #a5a5a5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Adaptive Layout Active
            </h2>

            {currentBreakpoint && (
              <div style={{
                marginBottom: '24px',
                padding: '8px 16px',
                background: 'rgba(91, 95, 199, 0.15)',
                border: '1px solid rgba(91, 95, 199, 0.3)',
                borderRadius: '20px',
                display: 'inline-block',
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#a5b4fc',
                  marginRight: '8px',
                }}>
                  Current:
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#e5e5e5',
                }}>
                  {currentBreakpoint}
                </span>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {breakpoints.map((bp, index) => (
                <button
                  key={index}
                  onClick={() => handleTestBreakpoint(index)}
                  disabled={!bp.frameId}
                  style={{
                    padding: '16px',
                    background: bp.frameId
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: bp.frameId
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    color: bp.frameId ? '#e5e5e5' : '#737373',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: bp.frameId ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (bp.frameId) {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (bp.frameId) {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '16px',
                    marginBottom: '4px',
                  }}>
                    📱
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '2px',
                  }}>
                    {bp.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#737373',
                  }}>
                    {bp.minWidth}-{bp.maxWidth}px
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '13px',
                color: '#a5a5a5',
                margin: '0 0 8px 0',
                lineHeight: '1.6',
              }}>
                Resize the frame to see automatic layout changes
              </p>
              <p style={{
                fontSize: '13px',
                color: '#737373',
                margin: 0,
                lineHeight: '1.6',
              }}>
                Click any breakpoint above to preview
              </p>
            </div>

            <button
              onClick={() => {
                setIsResponsive(false);
                setCurrentBreakpoint(null);
                sendMessage('edit-layout');
              }}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              Edit Layout
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          fontSize: '11px',
          color: '#737373',
        }}>
          v1.0
        </div>
        <button
          onClick={() => sendMessage('cancel')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#737373',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#e5e5e5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#737373';
          }}
        >
          Close
        </button>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
export { App };
