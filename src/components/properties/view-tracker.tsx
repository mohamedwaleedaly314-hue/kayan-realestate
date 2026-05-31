'use client';

import { useEffect } from 'react';
import { trackView } from './recently-viewed';

interface ViewTrackerProps {
  property: {
    id: string;
    title_ar: string;
    slug: string;
    price: number;
    district: string;
    type: string;
    primaryImage?: string;
  };
}

export default function ViewTracker({ property }: ViewTrackerProps) {
  useEffect(() => {
    trackView(property);
  }, [property.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
