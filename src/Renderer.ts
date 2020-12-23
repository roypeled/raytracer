import { Vector } from './Vector';
import { Camera } from './Camera';
import { RandomScene } from './RandomScene';
import { stats } from './Stats';
import Worker from './RendererSlave.worker';
import { Config } from './Config';

const lookFrom = new Vector(13, 2, 3);
const lookAt = new Vector(0, 0, 0);
const vup = new Vector(0, 1, 0);
const distToFocus = 10;
const aperture = .1;

const workers = 8;

const config = new Config();

export class Renderer {
	static availableWorkers: Worker[] = [];
	static workingWorkers: Worker[] = [];

	static config = config;
	static worldBuffer: SharedArrayBuffer;
	static cameraBuffer: SharedArrayBuffer;
	static renderedPixels = 0;
	static camera = new Camera(
		lookFrom,
		lookAt,
		vup,
		20,
		config.aspectRatio,
		aperture,
		distToFocus,
	);
	protected static canvas: HTMLCanvasElement;
	protected static imageData: ImageData;
	protected static data: Uint8ClampedArray;
	protected static ctx: CanvasRenderingContext2D;
	// Camera
	protected static firstRun = true;
	protected static renderPoints: [number, number][] = [];
	protected static templatePoints: [number, number][] = [];
	protected static world = new RandomScene().world;

	static createCanvas() {
		if (this.canvas) return;

		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('style', 'transform: rotate(180deg)');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.setAttribute('width', `${this.config.imageWidth}px`);
		this.canvas.setAttribute('height', `${this.config.imageHeight}px`);

		document.body.appendChild(this.canvas);

		this.imageData = this.ctx.createImageData(this.config.imageWidth, this.config.imageHeight);
		this.data = this.imageData.data;

		for (let j = 0; j < this.config.imageHeight; ++j) {
			for (let i = 0; i < this.config.imageWidth; ++i) {
				this.templatePoints.push([i, j]);
			}
		}

		this.cameraBuffer = this.jsonToSharedArrayBuffer(this.camera.serialize());
		this.worldBuffer = this.jsonToSharedArrayBuffer(this.world.serialize());
	}

	static jsonToSharedArrayBuffer(obj: any) {
		let str = JSON.stringify(obj);
		let sharedArrayBuffer = new SharedArrayBuffer(str.length * 2);
		let bufView = new Uint16Array(sharedArrayBuffer);
		for (let i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return sharedArrayBuffer;
	}

	static smartRender() {
		this.cameraBuffer = this.jsonToSharedArrayBuffer(this.camera.serialize());

		let cancel = () => Promise.resolve();
		let canceled = false;

		async function run() {
			let render = Renderer.quickRender();
			cancel = render.cancel;
			await render.action;

			render = Renderer.fullRender();
			cancel = render.cancel;
			await render.action;
		}

		run();

		return async () => {
			console.log('cancel');
			canceled = true;
			return cancel();
		};
	}

	static getWorker() {
		let worker = this.availableWorkers.pop();
		if(!worker) {
			worker = new Worker();
		}

		this.workingWorkers.push(worker);
		return worker;
	}

	static stopWorkers() {
		this.workingWorkers.forEach(w => w.postMessage({terminate:true}));
		this.availableWorkers.push(...this.workingWorkers);
		this.workingWorkers = [];
	}

	static async startWorker(points: [number, number][], samplesPerPixel:number, maxDepth:number) {
		return new Promise<void>((resolve => {

			const worker = this.getWorker();

			worker.postMessage({
				points,
				samplesPerPixel,
				maxDepth,
				world: this.worldBuffer,
				camera: this.cameraBuffer,
			});

			worker.onmessage = ({ data }: MessageEvent) => {
				const { from, result, done } = data;
				const [[i, j]] = from;

				const offset = (j * this.config.imageWidth * 4) + (i * 4);
				this.data.set(result, offset);

				this.renderedPixels += from.length;
				stats.set(this.renderPoints.length, this.renderedPixels, 0);
				this.ctx.putImageData(this.imageData, 0, 0);

				if(done) resolve();
			};
		}));
	}

	protected static async wait(time: number = 0) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	protected static quickRender() {
		return this.render(1, 3, false);
	}

	protected static fullRender() {
		return this.render(10, 20, true);
	}

	protected static render(samplesPerPixel: number, maxDepth: number, showStats = false) {
		let cancelled = false;
		this.firstRun = false;

		stats.reset();
		this.renderedPixels = 0;

		const render = async () => {

			this.renderPoints = this.templatePoints;

			const frameLength = 1000 / 24;

			console.log('render frameLength', frameLength);

			stats.set(this.renderPoints.length, 0, 0);

			const pointsPerWorker = this.renderPoints.length / workers;

			const work: Promise<void>[] = [];

			for (let i = 0; i < workers; i++) {
				work.push(
					this.startWorker(
						this.renderPoints.slice(i * pointsPerWorker, i * pointsPerWorker + pointsPerWorker),
						samplesPerPixel,
						maxDepth,
					)
				);
			}

			return Promise.all(work);
		};

		return {
			action: render(),
			cancel: async () => {
				console.log('canceling');

				this.stopWorkers();

				this.ctx.putImageData(this.imageData, 0, 0);
				await this.wait(1000 / 24);
				cancelled = true;
			},
		};

	}
}
