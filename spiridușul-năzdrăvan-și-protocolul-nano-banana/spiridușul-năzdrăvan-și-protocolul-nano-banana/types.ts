
export interface MagicLetter {
  meaning_of_name: string;
  funny_joke: string;
  heartfelt_wish: string;
  personalized_story: string;
}

export enum AppState {
  START = 'START',
  CAMERA_PULL = 'CAMERA_PULL',
  ELF_CAM = 'ELF_CAM',
  NAME_INPUT = 'NAME_INPUT',
  LOADING = 'LOADING',
  HANDOVER = 'HANDOVER',
  REVEAL = 'REVEAL'
}
