'use client';

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

interface MobileImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
}

export default function MobileImageViewer({ isOpen, onClose, images, initialIndex }: MobileImageViewerProps) {
  if (!isOpen) return null;

  const slides = images.map(src => ({ src }));

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      index={initialIndex}
      slides={slides}
      plugins={[Zoom, Counter]}
      carousel={{ finite: false }}
      styles={{ 
        container: { backgroundColor: "rgba(0, 0, 0, 0.95)" } 
      }}
      zoom={{
        maxZoomPixelRatio: 5,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: true,
      }}
    />
  );
}
