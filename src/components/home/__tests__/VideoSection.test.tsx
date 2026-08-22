import { render } from '@testing-library/react';
import { VideoSection } from '../VideoSection';

function getVideo(container: HTMLElement): HTMLVideoElement {
  const video = container.querySelector('video');
  if (!video) throw new Error('VideoSection must render a <video> element');
  return video;
}

describe('VideoSection deferred loading (#137)', () => {
  it('renders below-fold video without autoplay', () => {
    const { container } = render(<VideoSection />);
    expect(getVideo(container)).not.toHaveAttribute('autoplay');
  });

  it('provides a poster frame so the browser does not fetch the MP4 eagerly', () => {
    const { container } = render(<VideoSection />);
    const video = getVideo(container);
    expect(video.getAttribute('poster')).toMatch(/^\/sleek-ui\/.+\.(svg|png|jpe?g|webp)$/);
  });

  it('never preloads the full video automatically', () => {
    const { container } = render(<VideoSection />);
    const preload = getVideo(container).getAttribute('preload');
    expect(preload).not.toBe('auto');
  });
});
