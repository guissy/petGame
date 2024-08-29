import { decompressFrames, parseGIF } from 'gifuct-js';
import paper from 'paper';

async function loadGifAndRender(url: string) {
  // 加载GIF文件
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // 解析GIF文件
  const gif = parseGIF(arrayBuffer);
  // 解压并获取所有帧
  return decompressFrames(gif, true);
}

export async function renderGifFrames(gifUrl: string, position: paper.Point) {
  const frames = await loadGifAndRender(gifUrl);
  let currentFrame = 0;

  // 创建一个Group用于管理GIF帧
  const gifGroup = new paper.Group();

  function drawFrame() {
    const frame = frames[currentFrame];
    const { width, height } = frame.dims;

    const imageData = new ImageData(new Uint8ClampedArray(frame.patch), width, height);
    const canvasContext = document.createElement('canvas').getContext('2d');
    canvasContext!.canvas.width = width;
    canvasContext!.canvas.height = height;
    canvasContext!.putImageData(imageData, 0, 0);

    // 创建新的Raster并添加到Group中
    const raster = new paper.Raster(canvasContext!.canvas);
    raster.scale(0.5);
    raster.position = position ?? paper.view.center;

    // 先清除Group中的子元素，然后添加当前帧
    gifGroup.removeChildren();
    gifGroup.addChild(raster);

    currentFrame = (currentFrame + 1) % frames.length;
  }

  return drawFrame;
}

