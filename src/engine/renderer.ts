import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { gameState, type GameLayer } from '@core/state';
import type { Location } from '@content/schema';

const layerColors: Record<GameLayer, number> = {
  menu: 0x10131a,
  waking: 0x14243a,
  dream: 0x2a1651,
  meta: 0x05040a
};

export class Renderer {
  app: Application;
  private locationLayer = new Container();
  private labelLayer = new Container();

  constructor(view: HTMLElement) {
    this.app = new Application({
      width: 800,
      height: 600,
      backgroundColor: layerColors.menu,
      antialias: true
    });
    view.appendChild(this.app.view as HTMLCanvasElement);
    this.app.stage.addChild(this.locationLayer, this.labelLayer);
  }

  renderLocations(locations: Location[], currentId: string) {
    this.locationLayer.removeChildren();
    this.labelLayer.removeChildren();

    const centerX = this.app.renderer.width / 2;
    const centerY = this.app.renderer.height / 2;
    const radius = 160;
    const angleStep = (Math.PI * 2) / locations.length;

    locations.forEach((location, index) => {
      const angle = index * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const node = new Graphics();
      const isCurrent = location.id === currentId;
      node.beginFill(isCurrent ? 0x7ef9c6 : 0x39445a, 0.85);
      node.lineStyle(2, 0xffffff, 0.3);
      node.drawCircle(0, 0, isCurrent ? 36 : 24);
      node.endFill();
      node.x = x;
      node.y = y;
      this.locationLayer.addChild(node);

      const label = new Text({
        text: location.name,
        style: new TextStyle({
          fill: '#f3f5f7',
          fontFamily: 'Inter, sans-serif',
          fontSize: isCurrent ? 20 : 16
        })
      });
      label.anchor.set(0.5);
      label.x = x;
      label.y = y + (isCurrent ? 48 : 40);
      this.labelLayer.addChild(label);
    });
  }

  setLayer(layer: GameLayer) {
    this.app.renderer.background.color = layerColors[layer];
  }

  destroy() {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}

export function setupRenderer(container: HTMLElement) {
  const renderer = new Renderer(container);
  gameState.subscribe((state) => {
    renderer.setLayer(state.layer);
    if (state.content) {
      renderer.renderLocations(state.content.locations.locations, state.player.location);
    }
  });
  return renderer;
}
