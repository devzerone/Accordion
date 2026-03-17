import type { Meta, StoryObj } from '@storybook/react';
import { App } from '../App';
import React, { useEffect } from 'react';

// Mock wrapper to simulate Figma plugin messages
const MockWrapper: React.FC<{
  selectedFrame?: any;
  children?: React.ReactNode
}> = ({ selectedFrame, children }) => {
  useEffect(() => {
    // Simulate frame selection message
    if (selectedFrame) {
      setTimeout(() => {
        window.dispatchEvent(new MessageEvent('message', {
          data: {
            pluginMessage: {
              type: 'selection-info',
              data: selectedFrame,
            },
          },
        }));
      }, 100);
    }
  }, [selectedFrame]);

  return <>{children}</>;
};

const meta: Meta<typeof App> = {
  title: 'Figma Plugin/App',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const selectedFrame = context.args.selectedFrame;

      if (selectedFrame) {
        return (
          <MockWrapper selectedFrame={selectedFrame}>
            <Story />
          </MockWrapper>
        );
      }

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof App>;

export const Default: Story = {
  args: {
    selectedFrame: undefined,
  },
};

export const WithFrameSelected: Story = {
  args: {
    selectedFrame: {
      frameId: 'frame-123',
      frameName: 'My Responsive Frame',
      width: 1024,
      height: 768,
      hasAdaptiveLayout: false,
      adaptiveLayout: null,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '프레임이 선택된 상태입니다. 중단점 설정을 시작할 수 있습니다.',
      },
    },
  },
};

export const WithAdaptiveLayout: Story = {
  args: {
    selectedFrame: {
      frameId: 'frame-456',
      frameName: 'Responsive Dashboard',
      width: 1440,
      height: 900,
      hasAdaptiveLayout: true,
      adaptiveLayout: {
        breakpoints: [
          { name: 'Mobile', minWidth: 0, maxWidth: 600, frameId: 'mobile-frame' },
          { name: 'Tablet', minWidth: 601, maxWidth: 1024, frameId: 'tablet-frame' },
          { name: 'Desktop', minWidth: 1025, maxWidth: 9999, frameId: 'desktop-frame' },
        ],
        currentFrameId: 'frame-456',
        currentBreakpointIndex: 2,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: '적응형 레이아웃이 이미 설정된 프레임입니다. 중단점 편집 및 테스트가 가능합니다.',
      },
    },
  },
};

export const WithMobileBreakpoint: Story = {
  args: {
    selectedFrame: {
      frameId: 'frame-mobile',
      frameName: 'Mobile Page',
      width: 375,
      height: 667,
      hasAdaptiveLayout: false,
      adaptiveLayout: null,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
};

export const WithTabletBreakpoint: Story = {
  args: {
    selectedFrame: {
      frameId: 'frame-tablet',
      frameName: 'Tablet Page',
      width: 768,
      height: 1024,
      hasAdaptiveLayout: false,
      adaptiveLayout: null,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'ipadair2',
    },
  },
};

export const WithDesktopBreakpoint: Story = {
  args: {
    selectedFrame: {
      frameId: 'frame-desktop',
      frameName: 'Desktop Page',
      width: 1920,
      height: 1080,
      hasAdaptiveLayout: false,
      adaptiveLayout: null,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
