import { Vector } from './Vector';
import { Camera } from './Camera';
import { RandomScene } from './RandomScene';
import { stats } from './Stats';

const ASPECT_RATIO = 3/2;

const lookFrom = new Vector(13, 2,3);
const lookAt = new Vector(0,0,0);
const vup = new Vector(0,1,0);
const samplesPerPixel = 10;
const distToFocus = 10;
const aperture = .1;
const imageWidth = 600;
const maxDepth = 50;


export class Renderer {
	protected static canvas:HTMLCanvasElement;
	protected static ctx:CanvasRenderingContext2D;
	protected static IMAGE_WIDTH = imageWidth;
	protected static IMAGE_HEIGHT:number;

	protected static world = new RandomScene().world;
	// Camera

	protected static camera = new Camera(
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

		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('style', 'transform: rotate(180deg)');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.setAttribute('width', `${this.IMAGE_WIDTH}px`);
		this.canvas.setAttribute('height', `${this.IMAGE_HEIGHT}px`);

		document.body.appendChild(this.canvas);
	}

	protected static async wait(){
		return new Promise((resolve) => setTimeout(resolve, 0))
	}

	static async render() {
		// Image
		this.IMAGE_HEIGHT = this.IMAGE_WIDTH / ASPECT_RATIO;
		this.createCanvas();

		const imageData = this.ctx.createImageData(this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
		const data = imageData.data;

		let points = [];

		for (let j = this.IMAGE_HEIGHT-1; j >=0; --j) {
			for (let i = 0; i < this.IMAGE_WIDTH; ++i) {
				points.push([i, j]);
			}
		}

		points = points.sort(() => Math.random() - .5);

		const frameLength = 1000/24;
		let start = new Date().getTime();

		stats.set(points.length, 0);

		let count=0;
		for (let [i, j] of points) {
			this.renderRay(imageData, data, i, j);
			count++;
			let now = new Date().getTime();

			if(now - start > frameLength){
				start = now;
				await this.wait();

				stats.set(points.length, count);
			}
		}
	}

	static renderRay(imageData:ImageData, data:Uint8ClampedArray, i:number, j:number) {

		let color = new Vector(0,0,0);

		for(let s = 0; s<samplesPerPixel; ++s) {
			const u = (i + Math.random()) / (this.IMAGE_WIDTH-1);
			const v = (j + Math.random()) / (this.IMAGE_HEIGHT-1);
			let ray = this.camera.getRay(u, v);
			color = color.add(ray.color(this.world, maxDepth))
		}

		const [r,g,b,a] = color.writeColor(samplesPerPixel);

		const startIndex = (j*this.IMAGE_WIDTH*4) + (i*4);

		data[startIndex] = r;
		data[startIndex+1] = g;
		data[startIndex+2] = b;
		data[startIndex+3] = a;

		this.ctx.putImageData(imageData, 0, 0);
	}
}
