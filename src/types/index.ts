export interface Client {
  id: string;
  name: string;
  password: string;
  prefix: string;
}

export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  type: 'image' | 'video';
  folder: string;
  client: string;
  url: string;
  size: number;
  hidden?: boolean;
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