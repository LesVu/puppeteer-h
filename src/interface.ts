import { PathLike } from 'fs';

export interface NHdata {
  id: number;
  name: string;
  link: string;
  img: string;
}

export interface MongooseConfig {
  enabled?: boolean;
  mongooseDB?: string;
}

export interface WsOption {
  enabled?: boolean;
  wsEvent?: string;
}

export interface OptionWriteData {
  mongooseConfig: MongooseConfig;
  JSONFilePath: PathLike;
  wsOption: WsOption;
}
