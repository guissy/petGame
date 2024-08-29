import paper from "paper";

export function drawRuler(width: number, height: number): void {

  // 绘制水平标尺
  const drawHorizontalRuler = () => {
    const horizontalRuler = new paper.Group();
    for (let i = 0; i <= width; i += 50) {
      const line = new paper.Path.Line({
        from: [i, 0],
        to: [i, 10],
        strokeColor: 'black',
      });
      const text = new paper.PointText({
        point: [i + 2, 20],
        content: i.toString(),
        fillColor: 'black',
        fontSize: 10,
      });
      horizontalRuler.addChild(line);
      horizontalRuler.addChild(text);
    }
  };

  // 绘制垂直标尺
  const drawVerticalRuler = () => {
    const verticalRuler = new paper.Group();
    for (let i = 0; i <= height; i += 50) {
      const line = new paper.Path.Line({
        from: [0, i],
        to: [10, i],
        strokeColor: 'black',
      });
      const text = new paper.PointText({
        point: [15, i + 3],
        content: i.toString(),
        fillColor: 'black',
        fontSize: 10,
      });
      verticalRuler.addChild(line);
      verticalRuler.addChild(text);
    }
  };

  drawHorizontalRuler();
  drawVerticalRuler();
}
