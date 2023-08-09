export const vncBufferEncode: Function = (text: string, encoding: string = 'windows-1251'): string => {
  return new TextDecoder(encoding, {
    ignoreBOM: true
  }).decode(strToUint8(text));
}

export const vncBufferDecode: Function = (text: string, encoding: string = 'windows-1251'): string => {
  let decodedText: string = '';
  for (let i = 0; i < text.length; i++) {
    let c: number = text.charCodeAt(i);
    if (c <= 127) {
      decodedText += text.charAt(i);
      continue;
    }
    if (c == 1025) {
      c = 1016;
    } else if (c == 1105) {
      c = 1032;
    }
    decodedText += String.fromCharCode(c - 848);
  }
  return decodedText;
}

export const imageDataToBlob = (imageData: ImageData): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);        // synchronous

  return new Promise<Blob>((resolve: any) => {
    canvas.toBlob(resolve);
  });
}

const strToUint8  = (str: string): Uint8Array => {
  let chars: number[] = [];
  for (let i = 0; i < str.length; i++) {
    chars.push(str.charCodeAt(i));
  }
  return new Uint8Array(chars);
}
