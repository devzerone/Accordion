// Figma plugin code - runs in the main context
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

// Show UI when plugin is started
figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-adaptive-layout') {
    createAdaptiveLayout(msg.data);
  } else if (msg.type === 'update-breakpoint') {
    updateBreakpoint(msg.data);
  } else if (msg.type === 'resize-detected') {
    handleResize(msg.width, msg.height);
  } else if (msg.type === 'get-current-selection') {
    sendCurrentSelection();
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// Create new adaptive layout frame
function createAdaptiveLayout(data: { breakpoints: Breakpoint[] }) {
  const selection = figma.currentPage.selection;

  if (selection.length === 0 || selection[0].type !== 'FRAME') {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select a frame to convert to adaptive layout',
    });
    return;
  }

  const masterFrame = selection[0] as FrameNode;

  // Store adaptive layout data
  const layoutData: AdaptiveLayoutData = {
    breakpoints: data.breakpoints,
    currentFrameId: masterFrame.id,
  };

  masterFrame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));

  figma.ui.postMessage({
    type: 'layout-created',
    frameId: masterFrame.id,
  });
}

// Update breakpoint configuration
function updateBreakpoint(data: Breakpoint) {
  const selection = figma.currentPage.selection;

  if (selection.length > 0 && selection[0].type === 'FRAME') {
    const frame = selection[0] as FrameNode;
    const existingData = frame.getPluginData('adaptiveLayout');

    if (existingData) {
      const layoutData: AdaptiveLayoutData = JSON.parse(existingData);

      // Update or add breakpoint
      const existingIndex = layoutData.breakpoints.findIndex(
        (bp) => bp.frameId === data.frameId
      );

      if (existingIndex >= 0) {
        layoutData.breakpoints[existingIndex] = data;
      } else {
        layoutData.breakpoints.push(data);
      }

      frame.setPluginData('adaptiveLayout', JSON.stringify(layoutData));

      figma.ui.postMessage({
        type: 'breakpoint-updated',
        data: layoutData,
      });
    }
  }
}

// Handle frame resize
function handleResize(width: number, height: number) {
  const selection = figma.currentPage.selection;

  if (selection.length > 0 && selection[0].type === 'FRAME') {
    const frame = selection[0] as FrameNode;
    const existingData = frame.getPluginData('adaptiveLayout');

    if (existingData) {
      const layoutData: AdaptiveLayoutData = JSON.parse(existingData);
      const matchingBreakpoint = findMatchingBreakpoint(
        width,
        layoutData.breakpoints
      );

      if (matchingBreakpoint) {
        swapFrameContent(frame, matchingBreakpoint.frameId);
      }
    }
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

// Swap frame content with matched breakpoint frame
function swapFrameContent(currentFrame: FrameNode, targetFrameId: string) {
  const targetFrame = figma.getNodeById(targetFrameId);

  if (targetFrame && targetFrame.type === 'FRAME') {
    // Clone content from target frame
    const clonedChildren = targetFrame.children.map((child) => child.clone());

    // Clear current frame
    currentFrame.children.forEach((child) => child.remove());

    // Add cloned content
    clonedChildren.forEach((child) => {
      currentFrame.appendChild(child);
    });

    // Update dimensions to match
    currentFrame.resizeWithoutConstraints(
      targetFrame.width,
      targetFrame.height
    );
  }
}

// Send current selection info to UI
function sendCurrentSelection() {
  const selection = figma.currentPage.selection;

  if (selection.length > 0 && selection[0].type === 'FRAME') {
    const frame = selection[0] as FrameNode;
    const existingData = frame.getPluginData('adaptiveLayout');

    figma.ui.postMessage({
      type: 'selection-info',
      data: {
        frameId: frame.id,
        frameName: frame.name,
        width: frame.width,
        height: frame.height,
        adaptiveLayout: existingData
          ? JSON.parse(existingData)
          : null,
      },
    });
  }
}

// Listen to selection changes
figma.on('selectionchange', () => {
  sendCurrentSelection();
});
