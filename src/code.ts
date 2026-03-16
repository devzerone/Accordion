// Figma plugin code - runs in the main context
// Enhanced version with professional features
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

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// State management
let currentLayoutData: AdaptiveLayoutData | null = null;
let resizeTimer: NodeJS.Timeout | null = null;
let lastSwapTime = 0;
const SWAP_DEBOUNCE_MS = 300; // Prevent rapid swapping

// Show UI when plugin is started
figma.showUI(__html__, { width: 400, height: 600 });

// Enhanced error handling
function sendError(message: string, details?: string) {
  figma.ui.postMessage({
    type: 'error',
    message,
    details,
  });
}

function sendSuccess(message: string, data?: any) {
  figma.ui.postMessage({
    type: 'success',
    message,
    data,
  });
}

function sendLoading(isLoading: boolean, message?: string) {
  figma.ui.postMessage({
    type: 'loading-state',
    data: { isLoading, message },
  });
}

// Handle messages from UI with enhanced error handling
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'create-adaptive-layout':
        await createAdaptiveLayout(msg.data);
        break;
      case 'update-breakpoint':
        await updateBreakpoint(msg.data);
        break;
      case 'select-frame-for-breakpoint':
        await selectFrameForBreakpoint(msg.data);
        break;
      case 'resize-detected':
        handleResize(msg.width, msg.height);
        break;
      case 'get-current-selection':
        await sendCurrentSelection();
        break;
      case 'get-available-frames':
        await sendAvailableFrames();
        break;
      case 'cancel':
        figma.closePlugin();
        break;
      case 'test-breakpoint':
        await testBreakpoint(msg.data);
        break;
      default:
        sendError(`Unknown message type: ${msg.type}`);
    }
  } catch (error) {
    sendError(
      'Plugin error occurred',
      error instanceof Error ? error.message : String(error)
    );
  }
};

// Get all available frames in current page
async function sendAvailableFrames() {
  try {
    const frames = figma.currentPage.children
      .filter((node): node is FrameNode => node.type === 'FRAME')
      .map((frame) => ({
        id: frame.id,
        name: frame.name,
        width: frame.width,
        height: frame.height,
      }));

    figma.ui.postMessage({
      type: 'available-frames',
      data: frames,
    });
  } catch (error) {
    sendError('Failed to get available frames', String(error));
  }
}

// Enhanced frame selection for breakpoint
async function selectFrameForBreakpoint(data: {
  breakpointIndex: number;
  frameId?: string;
}) {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0 || selection[0].type !== 'FRAME') {
      sendError('Please select a master frame first');
      return;
    }

    const masterFrame = selection[0] as FrameNode;
    const existingData = masterFrame.getPluginData('adaptiveLayout');

    if (!existingData) {
      sendError('Please create an adaptive layout first');
      return;
    }

    const layoutData: AdaptiveLayoutData = JSON.parse(existingData);

    if (data.frameId) {
      // Validate frame exists
      const targetFrame = figma.getNodeById(data.frameId);
      if (!targetFrame || targetFrame.type !== 'FRAME') {
        sendError('Selected frame not found or is not a frame');
        return;
      }

      // Update breakpoint with selected frame
      if (layoutData.breakpoints[data.breakpointIndex]) {
        layoutData.breakpoints[data.breakpointIndex].frameId = data.frameId;
      }

      masterFrame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));
      currentLayoutData = layoutData;

      sendSuccess(`Frame linked to ${layoutData.breakpoints[data.breakpointIndex].name}`, {
        breakpointIndex: data.breakpointIndex,
        frameId: data.frameId,
        frameName: targetFrame.name,
      });
    } else {
      // Trigger frame selection mode
      sendLoading(true, 'Select a frame from canvas...');

      // Wait for user to select a frame
      const selectedFrame = await waitForFrameSelection();

      if (selectedFrame) {
        layoutData.breakpoints[data.breakpointIndex].frameId = selectedFrame.id;
        masterFrame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));
        currentLayoutData = layoutData;

        sendSuccess(`Frame "${selectedFrame.name}" linked to breakpoint`, {
          breakpointIndex: data.breakpointIndex,
          frameId: selectedFrame.id,
          frameName: selectedFrame.name,
        });
      } else {
        sendError('Frame selection cancelled');
      }

      sendLoading(false);
    }
  } catch (error) {
    sendError('Failed to select frame', String(error));
    sendLoading(false);
  }
}

// Wait for user to select a frame
function waitForFrameSelection(): Promise<FrameNode | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      figma.off('selectionchange', checkSelection);
      resolve(null);
    }, 30000); // 30 second timeout

    function checkSelection() {
      const selection = figma.currentPage.selection;
      if (selection.length > 0 && selection[0].type === 'FRAME') {
        clearTimeout(timeout);
        figma.off('selectionchange', checkSelection);
        resolve(selection[0] as FrameNode);
      }
    }

    figma.on('selectionchange', checkSelection);
  });
}

// Enhanced adaptive layout creation with validation
async function createAdaptiveLayout(data: {
  breakpoints: Breakpoint[];
  masterFrameName?: string;
}) {
  try {
    sendLoading(true, 'Creating adaptive layout...');

    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      sendError('Please select a frame to convert to adaptive layout');
      sendLoading(false);
      return;
    }

    if (selection[0].type !== 'FRAME') {
      sendError('Selected element is not a frame. Please select a frame.');
      sendLoading(false);
      return;
    }

    const masterFrame = selection[0] as FrameNode;

    // Validate breakpoints
    const validBreakpoints = data.breakpoints.filter((bp) => {
      const hasFrame = bp.frameId !== '';
      const validRange = bp.minWidth < bp.maxWidth;
      return hasFrame && validRange;
    });

    if (validBreakpoints.length === 0) {
      sendError(
        'No valid breakpoints found. Please select frames for at least one breakpoint.'
      );
      sendLoading(false);
      return;
    }

    // Check if referenced frames exist
    for (const bp of validBreakpoints) {
      const frame = figma.getNodeById(bp.frameId);
      if (!frame || frame.type !== 'FRAME') {
        sendError(
          `Frame not found for breakpoint "${bp.name}". Please select a valid frame.`
        );
        sendLoading(false);
        return;
      }
    }

    // Store adaptive layout data
    const layoutData: AdaptiveLayoutData = {
      breakpoints: validBreakpoints,
      currentFrameId: masterFrame.id,
    };

    masterFrame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));
    currentLayoutData = layoutData;

    // Update frame name if provided
    if (data.masterFrameName) {
      masterFrame.name = data.masterFrameName;
    }

    sendSuccess('Adaptive layout created successfully!', {
      frameId: masterFrame.id,
      breakpointCount: validBreakpoints.length,
    });
    sendLoading(false);
  } catch (error) {
    sendError('Failed to create adaptive layout', String(error));
    sendLoading(false);
  }
}

// Enhanced breakpoint update
async function updateBreakpoint(data: Breakpoint) {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0 || selection[0].type !== 'FRAME') {
      sendError('Please select a frame with adaptive layout');
      return;
    }

    const frame = selection[0] as FrameNode;
    const existingData = frame.getPluginData('adaptiveLayout');

    if (!existingData) {
      sendError('This frame does not have an adaptive layout');
      return;
    }

    const layoutData: AdaptiveLayoutData = JSON.parse(existingData);

    // Validate frame exists if provided
    if (data.frameId) {
      const targetFrame = figma.getNodeById(data.frameId);
      if (!targetFrame || targetFrame.type !== 'FRAME') {
        sendError('Referenced frame not found');
        return;
      }
    }

    // Update or add breakpoint
    const existingIndex = layoutData.breakpoints.findIndex(
      (bp) => bp.name === data.name
    );

    if (existingIndex >= 0) {
      layoutData.breakpoints[existingIndex] = data;
    } else {
      layoutData.breakpoints.push(data);
    }

    frame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));
    currentLayoutData = layoutData;

    sendSuccess('Breakpoint updated successfully', {
      data: layoutData,
    });
  } catch (error) {
    sendError('Failed to update breakpoint', String(error));
  }
}

// Enhanced resize handling with debouncing and optimization
function handleResize(width: number, height: number) {
  // Clear existing timer
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  // Debounce resize handling
  resizeTimer = setTimeout(() => {
    performResize(width, height);
  }, SWAP_DEBOUNCE_MS);
}

async function performResize(width: number, height: number) {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0 || selection[0].type !== 'FRAME') {
      return;
    }

    const frame = selection[0] as FrameNode;
    const existingData = frame.getPluginData('adaptiveLayout');

    if (!existingData) {
      return;
    }

    const layoutData: AdaptiveLayoutData = JSON.parse(existingData);
    const matchingBreakpoint = findMatchingBreakpoint(
      width,
      layoutData.breakpoints
    );

    if (matchingBreakpoint) {
      const currentIndex = layoutData.breakpoints.indexOf(matchingBreakpoint);

      // Only swap if breakpoint changed and enough time passed
      if (
        currentIndex !== layoutData.currentBreakpointIndex &&
        Date.now() - lastSwapTime > SWAP_DEBOUNCE_MS
      ) {
        await swapFrameContent(frame, matchingBreakpoint.frameId);

        // Update current breakpoint index
        layoutData.currentBreakpointIndex = currentIndex;
        frame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));

        // Notify UI of breakpoint change
        figma.ui.postMessage({
          type: 'breakpoint-changed',
          data: {
            breakpointName: matchingBreakpoint.name,
            breakpointIndex: currentIndex,
          },
        });

        lastSwapTime = Date.now();
      }
    }
  } catch (error) {
    console.error('Resize handling error:', error);
  }
}

// Test specific breakpoint
async function testBreakpoint(data: { breakpointIndex: number }) {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0 || selection[0].type !== 'FRAME') {
      sendError('Please select a frame with adaptive layout');
      return;
    }

    const frame = selection[0] as FrameNode;
    const existingData = frame.getPluginData('adaptiveLayout');

    if (!existingData) {
      sendError('This frame does not have an adaptive layout');
      return;
    }

    const layoutData: AdaptiveLayoutData = JSON.parse(existingData);

    if (data.breakpointIndex < 0 || data.breakpointIndex >= layoutData.breakpoints.length) {
      sendError('Invalid breakpoint index');
      return;
    }

    const breakpoint = layoutData.breakpoints[data.breakpointIndex];

    if (!breakpoint.frameId) {
      sendError('This breakpoint does not have a linked frame');
      return;
    }

    sendLoading(true, `Switching to ${breakpoint.name}...`);

    // Resize to match breakpoint dimensions
    const targetFrame = figma.getNodeById(breakpoint.frameId);
    if (targetFrame && targetFrame.type === 'FRAME') {
      await frame.resizeWithoutConstraints(targetFrame.width, targetFrame.height);
      await swapFrameContent(frame, breakpoint.frameId);

      sendSuccess(`Switched to ${breakpoint.name} layout`, {
        width: targetFrame.width,
        height: targetFrame.height,
      });
    } else {
      sendError('Referenced frame not found');
    }

    sendLoading(false);
  } catch (error) {
    sendError('Failed to test breakpoint', String(error));
    sendLoading(false);
  }
}

// Find matching breakpoint for current width
function findMatchingBreakpoint(
  width: number,
  breakpoints: Breakpoint[]
): Breakpoint | null {
  return (
    breakpoints.find(
      (bp) => width >= bp.minWidth && width <= bp.maxWidth
    ) || null
  );
}

// Enhanced frame content swapping with optimization
async function swapFrameContent(
  currentFrame: FrameNode,
  targetFrameId: string
): Promise<void> {
  try {
    const targetFrame = figma.getNodeById(targetFrameId);

    if (!targetFrame || targetFrame.type !== 'FRAME') {
      throw new Error('Target frame not found or is not a frame');
    }

    // Store current properties
    const currentWidth = currentFrame.width;
    const currentHeight = currentFrame.height;

    // Create a snapshot of current state for undo
    figma.currentPage.selection = [currentFrame];

    // Clone children efficiently
    const childrenToClone = targetFrame.children.slice();
    const clonedChildren = childrenToClone.map((child) => child.clone());

    // Remove current children
    currentFrame.children.forEach((child) => child.remove());

    // Add cloned children
    for (const child of clonedChildren) {
      currentFrame.appendChild(child);
    }

    // Resize to match target frame dimensions
    await currentFrame.resizeWithoutConstraints(
      targetFrame.width,
      targetFrame.height
    );

    // Notify UI of successful swap
    figma.ui.postMessage({
      type: 'frame-swapped',
      data: {
        targetFrameId,
        width: targetFrame.width,
        height: targetFrame.height,
      },
    });
  } catch (error) {
    throw new Error(`Frame swap failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Enhanced selection info sending
async function sendCurrentSelection() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length > 0 && selection[0].type === 'FRAME') {
      const frame = selection[0] as FrameNode;
      const existingData = frame.getPluginData('adaptiveLayout');

      const frameData = {
        frameId: frame.id,
        frameName: frame.name,
        width: Math.round(frame.width),
        height: Math.round(frame.height),
        adaptiveLayout: existingData
          ? (JSON.parse(existingData) as AdaptiveLayoutData)
          : null,
        hasAdaptiveLayout: !!existingData,
      };

      figma.ui.postMessage({
        type: 'selection-info',
        data: frameData,
      });
    } else {
      // Send empty selection info
      figma.ui.postMessage({
        type: 'selection-info',
        data: null,
      });
    }
  } catch (error) {
    console.error('Error sending selection info:', error);
  }
}

// Listen to selection changes with debouncing
let selectionChangeTimer: NodeJS.Timeout | null = null;
figma.on('selectionchange', () => {
  if (selectionChangeTimer) {
    clearTimeout(selectionChangeTimer);
  }

  selectionChangeTimer = setTimeout(() => {
    sendCurrentSelection();
  }, 100);
});
