export interface BannerImage {
  url: string;
  alt: string;
}

export interface BannerLink {
  url?: string;
  text?: string;
  openInNewTab: boolean;
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: BannerImage;
  link?: BannerLink;
  position: 'hero' | 'sidebar' | 'footer' | 'popup' | 'category';
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience: 'all' | 'customers' | 'merchants' | 'new-users';
  clickCount: number;
  impressionCount: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  
  // Virtual properties
  isCurrentlyActive?: boolean;
}
