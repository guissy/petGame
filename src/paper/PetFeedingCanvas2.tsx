import{ useEffect } from 'react';
import Phaser from 'phaser';
import rabbitSvgUrl from './rabbit.svg?url';
import BgSvgUrl from './bg.svg?url';
import FoodSvgUrl from './food.svg?url';
import bgMp3Url from './bg.mp3?url';

const PetFeedingCanvas2 = () => {
  useEffect(() => {
    // Phaser 游戏配置
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerWidth * 900 / 1658,
      backgroundColor: '#ffffff',
      parent: 'phaser-container',
      scene: {
        preload: preload,
        create: create,
        update: update,
      }
    };

    // 初始化 Phaser 游戏
    const game = new Phaser.Game(config);

    let rabbit: Phaser.GameObjects.Image;
    let food: Phaser.GameObjects.Image;
    let foodInitPosition = { x: 350, y: 400 };

    function preload(this: Phaser.Scene) {
      // 加载资源
      this.load.image('rabbit', rabbitSvgUrl);
      this.load.image('bg', BgSvgUrl);
      this.load.image('food', FoodSvgUrl);
      this.load.audio('bgMusic', bgMp3Url);
    }

    function create(this: Phaser.Scene) {
      // 添加背景
      this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'bg');

      // 添加兔子
      rabbit = this.add.image(400, 300, 'rabbit');
      rabbit.setInteractive();

      // 兔子点击事件
      rabbit.on('pointerup', () => {
        // moveFoodToPet(rabbit.x, rabbit.y);
        moveFoodToPet.call(this, rabbit.x, rabbit.y); // 手动绑定 this
      });

      // 添加食物
      food = this.add.image(foodInitPosition.x, foodInitPosition.y, 'food');

      // 播放背景音乐
      const music = this.sound.add('bgMusic');
      music.play({ loop: true });

      // 双击移动兔子
      this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (pointer.getDuration() < 300) {
          rabbit.setPosition(pointer.x, pointer.y);
        }
      });
    }

    function moveFoodToPet(this: Phaser.Scene, x: number, y: number) {
      this.tweens.add({
        targets: food,
        x: x - 30,
        y: y,
        duration: 800,
        onComplete: () => {
          this.tweens.add({
            targets: food,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              food.setPosition(foodInitPosition.x, foodInitPosition.y);
              food.setAlpha(1);
              // food.setDepth(-1);
            }
          });
        }
      });
    }

    function update(this: Phaser.Scene) {
      // 更新场景逻辑
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-container" className={'w-full h-[911px]'} style={{ width: '100%', height: '100%' }} />;
};

export default PetFeedingCanvas2;
