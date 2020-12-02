import { Vector } from './Vector';
import { Camera } from './Camera';
import { RandomScene } from './RandomScene';
import { stats } from './Stats';

const ASPECT_RATIO = 3/2;

const lookFrom = new Vector(13, 2,3);
const lookAt = new Vector(0,0,0);
const vup = new Vector(0,1,0);
const distToFocus = 10;
const aperture = .1;
const imageWidth = 600;

export class Renderer {
	protected static canvas:HTMLCanvasElement;
	protected static imageData:ImageData;
	protected static data:Uint8ClampedArray;
	protected static ctx:CanvasRenderingContext2D;
	protected static IMAGE_WIDTH = imageWidth;
	protected static firstRun = true;
	protected static IMAGE_HEIGHT:number;
	protected static renderPoints:[number, number][] = [];

	protected static world = new RandomScene().world;
	// Camera

	static camera = new Camera(
		lookFrom,
		lookAt,
		vup,
		20,
		ASPECT_RATIO,
		aperture,
		distToFocus,
	);

	protected static createCanvas() {
		if (this.canvas) return;

		this.IMAGE_HEIGHT = this.IMAGE_WIDTH / ASPECT_RATIO;

		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('style', 'transform: rotate(180deg)');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.setAttribute('width', `${this.IMAGE_WIDTH}px`);
		this.canvas.setAttribute('height', `${this.IMAGE_HEIGHT}px`);

		document.body.appendChild(this.canvas);

		this.imageData = this.ctx.createImageData(this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
		this.data = this.imageData.data;
	}

	protected static async wait(time:number = 0){
		return new Promise((resolve) => setTimeout(resolve, time))
	}

	static smartRender() {
		let cancel = () => Promise.resolve();
		let canceled = false;

		async function run() {
			let render = Renderer.quickRender();
			cancel = render.cancel;
			await render.action;


			if (canceled) return;
			render = Renderer.fullRender();

			cancel = render.cancel;
			await render.action;
		}

		run();

		return async () => {
			console.log('cancel');
			canceled = true;
			return cancel();
		}
	}

	protected static quickRender() {
		return this.render(1, 3,  false)
	}

	protected static fullRender() {
		return this.render(10, 20, true)
	}

	protected static render(samplesPerPixel:number, maxDepth:number, showStats = false) {
		let cancelled = false;
		this.firstRun = false;


		const render = async () => {
			// Image
			this.createCanvas();

			this.renderPoints = [];

			for (let j = this.IMAGE_HEIGHT-1; j >=0; --j) {
				for (let i = 0; i < this.IMAGE_WIDTH; ++i) {
					this.renderPoints.push([i, j]);
				}
			}

			this.renderPoints = this.renderPoints.sort(() => Math.random() - .5);

			const frameLength = 1000/24 * .8;

			console.log('render frameLength', frameLength);

			let start = new Date().getTime();

			showStats && stats.set(this.renderPoints.length, 0, 0);

			let count=0;
			let frameCount = 0;

			for (let [i, j] of this.renderPoints) {
				this.renderRay(i, j, samplesPerPixel, maxDepth);

				count++;
				frameCount++;

				let now = new Date().getTime();

				if(now - start > frameLength){
					this.ctx.putImageData(this.imageData, 0, 0);

					now = new Date().getTime();

					await this.wait(1000/24 - (now - start));

					if(cancelled) {
						console.log('before cancel', count);
						return;
					}

					showStats && stats.set(this.renderPoints.length, count, frameCount);

					start = now;
					frameCount = 0;
				}
			}

			this.ctx.putImageData(this.imageData, 0, 0);
		}

		return {
			action: render(),
			cancel: async () => {
				console.log('canceling');
				this.ctx.putImageData(this.imageData, 0, 0);
				await this.wait(1000/24);
				cancelled = true;
			}
		}

	}

	static renderRay(i:number, j:number, samplesPerPixel:number, maxDepth:number) {

		let color = new Vector(0,0,0);

		for(let s = 0; s<samplesPerPixel; ++s) {
			const u = (i + Math.random()) / (this.IMAGE_WIDTH-1);
			const v = (j + Math.random()) / (this.IMAGE_HEIGHT-1);
			let ray = this.camera.getRay(u, v);
			color = color.add(ray.color(this.world, maxDepth))
		}

		const [r,g,b,a] = color.writeColor(samplesPerPixel);

		const startIndex = (j*this.IMAGE_WIDTH*4) + (i*4);

		this.data[startIndex] = r;
		this.data[startIndex+1] = g;
		this.data[startIndex+2] = b;
		this.data[startIndex+3] = a;
	}
}
