
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
  image?: string; // Base64 Data URL
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    sourceConfig?: {
      googleMapsDataSource?: {
        location?: {
          latitude: number;
          longitude: number;
        }
      }
    };
    placeId?: string;
    displayName?: string;
    formattedAddress?: string;
    uri?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    };
  };
}

export enum AppMode {
  CHAT = 'CHAT',
  FIRST_AID = 'FIRST_AID',
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}
