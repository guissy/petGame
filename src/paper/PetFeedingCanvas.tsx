import { useEffect, useRef, useState } from "react";
import paper from "paper";
import rabbitSvgUrl from './rabbit.svg?url';
import BgSvgUrl from './bg.svg?url';
import { drawRuler } from './drawRuler.tsx';
import bgMp3Url from './bg.mp3?url';
// import AirConditioning from './AirConditioning.gif?url';
import DogTurnRound from './DogTurnRound.gif?url';
import MouseRunning from './MouseRunning.gif?url';
import { renderGifFrames } from './renderGifFrames.ts';
import useSpine from "./useSpine.tsx";

const PetFeedingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const renderSpine = useSpine(canvas, paper.view);
  useEffect(() => {
    (async () => {
      if (canvasRef.current) {
        setCanvas(canvasRef.current);
        paper.setup(canvasRef.current);
        let foodInitPosition = new paper.Point(350, 400);
        let rabbit: paper.Item;

        // 加载背景 SVG
        paper.project.importSVG(BgSvgUrl, (bg: paper.Item) => {
          const scene1Children = bg.getItem({
            name: 'scene1'
          }).children;

          scene1Children
            .filter((child) => {
              return ['floor', 'wall'].every(it => !child.name?.toLowerCase().includes(it));
            })
            .forEach((child) => {
              // 允许拖动元素
              child.onMouseDrag = (event: paper.MouseEvent) => {
                child.position = child.position.add(event.delta);
                child.bringToFront();
                const bounds = child.bounds;
                if (!(child as any).rectStroke && !!child.firstChild) {
                  (child as any).rectStroke = child.addChild(
                    new paper.Path.Rectangle({
                      point: bounds.topLeft,
                      size: bounds.size,
                      strokeColor: new paper.Color("red"),
                      strokeWidth: 2,
                      dashArray: [10, 6], // 虚线样式
                    })
                  );
                }
              };
              child.onMouseLeave = () => {
                // 取消红色描边
                child.style = {
                  strokeColor: new paper.Color("transparent"), // 恢复为黑色或其他默认颜色
                } as paper.Style;
              };

              child.onClick = () => {
                child.style = {
                  strokeColor: new paper.Color("red"),
                } as paper.Style;
              };
            });
        });

        // 加载兔子 SVG
        paper.project.importSVG(rabbitSvgUrl, (loadedRabbit: paper.Item) => {
          rabbit = loadedRabbit;
          // 让 SVG 居中显示
          rabbit.position = paper.view.center;

          // 确保 SVG 可点击
          rabbit.onClick = () => {
            food.bringToFront();
            moveFoodToPet(rabbit.position);
          };

          // 添加鼠标点击反馈
          rabbit.onMouseEnter = () => {
            rabbit.style = {
              strokeColor: new paper.Color("red"),
            } as paper.Style;
          };

          rabbit.onMouseLeave = () => {
            rabbit.style = {
              strokeColor: new paper.Color("lightgray")
            } as paper.Style;
          };
        });

        const food = new paper.Path.Circle({
          position: foodInitPosition,
          radius: 20,
          fillColor: "brown",
        });

        food.onMouseEnter = () => {
          const bounds = food.bounds;
          new paper.Path.Rectangle({
            point: bounds.topLeft,
            size: bounds.size,
            strokeColor: new paper.Color("green"),
            dashArray: [4, 4], // 虚线样式
          });
          food.style = {
            strokeWidth: 4,
            strokeColor: new paper.Color("blue")
          } as paper.Style;
        };

        food.onMouseLeave = () => {
          food.style = {
            strokeWidth: 4,
            strokeColor: new paper.Color("lightgray")
          } as paper.Style;
        };

        const moveFoodToPet = (targetPosition: paper.Point) => {
          food.tween(
            {
              position: new paper.Point(targetPosition.x - 30, targetPosition.y),
              fillColor: new paper.Color("green"),
            },
            {
              duration: 800,
            }
          ).then(() => {
            food.tween(
              {
                opacity: 0,
              },
              {
                duration: 1000,
              }
            ).then(() => {
              food.position = foodInitPosition;
              food.opacity = 1;
              food.fillColor = new paper.Color("brown");
              food.sendToBack();
            });
          });
        };

        drawRuler(paper.view.bounds.width, paper.view.bounds.height);

        // 监听画布点击事件
        paper.view.onClick = (event: paper.MouseEvent) => {
          if (rabbit && !isPointInsideWalls(event.point) && findNameByPoint(event.point) !== null) {
            let target = event.point
            const name = findNameByPoint(event.point)
            if (name && ['chair', 'circle', 'girl'].some(it =>
              name?.toLowerCase().includes(it))
            ) {
              const center = paper.project.getItem({ name }).bounds.center;
              const offsetMap = {
                chair1: 70,
                chair2: 60,
                circle: 50,
                girl: 0,
              }
              target = new paper.Point(center.x, center.y - Number(offsetMap[name as keyof typeof offsetMap] ?? 0))
            }
            rabbit.tween(
              { position: target },
              { duration: 500 }
            );
          }
        };

        const p1 = new paper.Point(paper.view.center.x - 150,  paper.view.center.y);
        const renderDog = await renderGifFrames(DogTurnRound, p1);
        const p2 = new paper.Point(paper.view.center.x - 300,  paper.view.center.y);
        const renderMouse = await renderGifFrames(MouseRunning, p2);

        // 为当前动画的Group创建独立的onFrame回调
        paper.view.onFrame = (event: { count: number }) => {
          if (event.count % 5 === 0) { // 控制帧率，可以根据需要调整
            // canvasRef.current?.getContext('2d')!.save();
            renderDog();
            renderMouse();
            renderSpine.current?.();
            console.log(renderSpine, 'renderSpine')
          }
        };

        // 播放背景音乐
        if (audioRef.current) {
          // audioRef.current.play();
        }
      }
    })()

    return () => {
      paper.project?.clear();
      audioRef.current?.pause();
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // 重置音乐
      }
    };
  }, [renderSpine]);

  const handlePlayMusic = () => {
    setIsMusicPlaying(true);
    // audioRef.current?.play();
  };

  const findClosestGroupName = (item: paper.Group | paper.Item) => {
    let currentItem = item;

    // 迭代向上查找，直到找到一个具有 name 的 Group，或者达到顶层
    while (currentItem && !(currentItem instanceof paper.Group)) {
      currentItem = currentItem.parent; // 向上查找
    }

    // 如果找到了 Group，并且它有 name，则返回该 name
    if (currentItem && currentItem instanceof paper.Group) {
      return currentItem.name || null;
    }

    return null; // 没有找到具有 name 的 Group
  };

  function findNameByPoint(point: paper.Point) {
    const hitResult = paper.project.hitTest(point);
    if (hitResult && hitResult.item) {
      const clickedItem = hitResult.item;
      return findClosestGroupName(clickedItem);
    }
    return undefined
  }

  // 检查点击的位置是否在任何墙壁的区域内
  const isPointInsideWalls = (point: paper.Point) => {
    const name = findNameByPoint(point)
    if (name && ['wall', 'flower', 'light', 'draw', 'clock'].some(it =>
      name?.toLowerCase().includes(it))
    ) {
      return true; // 点击了 wall
    }
  };


  return (
    <>
      <div className="w-full h-full border-2 border-red-500 rounded-lg relative">
        <canvas ref={canvasRef} className="w-full h-full border-2 border-red-500 rounded-lg"></canvas>
        <audio ref={audioRef} src={bgMp3Url} loop/>
        {!isMusicPlaying && (
          <button onClick={handlePlayMusic} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Play Background Music
          </button>
        )}
      </div>
    </>
  );
};

export default PetFeedingCanvas;
