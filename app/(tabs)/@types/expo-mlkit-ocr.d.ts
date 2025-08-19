declare module "expo-mlkit-ocr" {
    export type Block = {
      text: string;
      bounding: number[];
    };
  
    export type OCRResult = {
      blocks: Block[];
    };
  
    export function scanFromUriAsync(uri: string): Promise<OCRResult>;
  }
  