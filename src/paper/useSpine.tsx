import React, { useEffect, useMemo, useRef } from 'react';

const useSpine = (canvasRef: HTMLCanvasElement | null, drawMgr: { draw: () => void }) => {
  console.log('useSpine', canvasRef);
  const renderRef = useRef<(() => void) | undefined>();
  const render = useMemo(() => {
    if (canvasRef) {
      const canvas = canvasRef;
      const context = canvas.getContext('2d')!;
      const skeletonRenderer = new spine.canvas.SkeletonRenderer(context);
      skeletonRenderer.debugRendering = false;
      skeletonRenderer.triangleRendering = false;

      const assetManager = new spine.canvas.AssetManager();
      const skelName = 'spineboy-ess';
      const animName = 'walk';

      assetManager.loadText(`assets/${skelName}.json`);
      assetManager.loadText(`assets/${skelName.replace('-pro', '').replace('-ess', '')}.atlas`);
      assetManager.loadTexture(`assets/${skelName.replace('-pro', '').replace('-ess', '')}.png`);

      let lastFrameTime = Date.now() / 1000;
      let skeleton: spine.Skeleton, state: spine.AnimationState, bounds: { offset: spine.Vector2; size: spine.Vector2 };

      function loadSkeleton(name: string, initialAnimation: string, skin = 'default'): {
        skeleton: spine.Skeleton;
        state: spine.AnimationState;
        bounds: { offset: spine.Vector2; size: spine.Vector2 };
      } {
        const atlas = new spine.TextureAtlas(
          assetManager.get(`assets/${name.replace('-pro', '').replace('-ess', '')}.atlas`),
          (path) => assetManager.get(`assets/${path}`)
        );
        const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
        const skeletonJson = new spine.SkeletonJson(atlasLoader);
        const skeletonData = skeletonJson.readSkeletonData(assetManager.get(`assets/${name}.json`));
        const skeleton = new spine.Skeleton(skeletonData);
        skeleton.scaleY = -1;
        skeleton.x = canvas.width / 2;
        skeleton.y = canvas.height / 2;
        skeleton.scaleX = -0.5;
        skeleton.scaleY = -0.5;
        const bounds = calculateBounds(skeleton);
        skeleton.setSkinByName(skin);

        const animationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
        animationState.setAnimation(0, initialAnimation, true);
        animationState.addListener({
          event: (trackIndex, event) => {
            // console.log("Event on track " + trackIndex + ": " + JSON.stringify(event));
          },
          complete: (trackIndex, loopCount) => {
            // console.log("Animation on track " + trackIndex + " completed, loop count: " + loopCount);
          },
          start: (trackIndex) => {
            // console.log("Animation on track " + trackIndex + " started");
          },
          end: (trackIndex) => {
            // console.log("Animation on track " + trackIndex + " ended");
          },
        });

        return { skeleton, state: animationState, bounds };
      }

      function calculateBounds(skeleton: spine.Skeleton): {
        offset: spine.Vector2;
        size: spine.Vector2;
      } {
        const data = skeleton.data;
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        const offset = new spine.Vector2();
        const size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        return { offset, size };
      }

      function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

        const centerX = bounds.offset.x + bounds.size.x / 2;
        const centerY = bounds.offset.y + bounds.size.y / 2;
        const scaleX = bounds.size.x / canvas.width;
        const scaleY = bounds.size.y / canvas.height;
        let scale = Math.max(scaleX, scaleY) * 1.2;
        if (scale < 1) scale = 1;
        const width = canvas.width * scale;
        const height = canvas.height * scale;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(1 / scale, 1 / scale);
        context.translate(-centerX, -centerY);
        // context.translate(width / 2, height / 2);
      }

      function render() {
        const now = Date.now() / 1000;
        const delta = now - lastFrameTime;
        lastFrameTime = now;

        // resize();

        // context.save();
        // context.setTransform(1, 0, 0, 1, 0, 0);
        // context.fillStyle = '#cccccc';
        // context.fillRect(0, 0, canvas.width, canvas.height);
        // context.restore();
        drawMgr?.draw?.();

        state.update(delta);
        state.apply(skeleton);
        skeleton.updateWorldTransform();
        skeletonRenderer.draw(skeleton);

        // context.strokeStyle = 'green';
        // context.beginPath();
        // context.moveTo(-1000, 0);
        // context.lineTo(1000, 0);
        // context.moveTo(0, -1000);
        // context.lineTo(0, 1000);
        // context.stroke();

        // requestAnimationFrame(render);
      }

      function load() {
        if (assetManager.isLoadingComplete()) {
          const data = loadSkeleton(skelName, animName);
          skeleton = data.skeleton;
          state = data.state;
          bounds = data.bounds;
          renderRef.current = render;
          console.log('loaded')
          // requestAnimationFrame(render);
        } else {
          requestAnimationFrame(load);
        }
      }

      load();
    }
    return renderRef;
  }, [canvasRef]);
  return render;
};

export default useSpine;