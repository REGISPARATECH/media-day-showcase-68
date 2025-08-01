export interface Client {
  id: string;
  name: string;
  password: string;
  prefix: string;
}

export interface MediaFile {
  id: string;
  original_name: string;
  file_name: string;
  file_type: string;
  file_size: number;
  folder: string;
  url: string;
  hidden: boolean;
  animation_type?: string;
  animation_duration?: number;
  created_at: string;
  updated_at: string;
  // Propriedades computadas para compatibilidade
  name?: string;
  originalName?: string;
  type?: 'image' | 'video';
  client?: string;
  size?: number;
  uploadProgress?: number;
  animation?: 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'rotate' | 'none';
}

export interface SystemSettings {
  showFooter: boolean;
  showMarquee: boolean;
  marqueeText: string;
  showLottery: boolean;
  showWeather: boolean;
  showNews: boolean;
  primaryColor: string;
  accentColor: string;
  playerOrientation?: 'landscape' | 'portrait';
  lotteryApi?: string;
  weatherApi?: string;
  newsApi?: string;
}

export interface MediaFolder {
  name: string;
  media: MediaFile[];
}