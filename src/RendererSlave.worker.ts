import { Vector } from './Vector';
import { Camera } from './Camera';
import { HittableList } from './HittableList';
import { Config } from './Config';
import { Serialized, sortHittables } from './Hittable';
import { deserialize } from './deserialize';


export class RendererSlaveWorker {
	world: HittableList;
	camera: Camera;
	config = new Config();
	running = false;
	terminating = false;

	constructor() {
		self.onmessage = ({ data }: { data: { points: [number, number][], world:SharedArrayBuffer, camera:SharedArrayBuffer, samplesPerPixel:number, maxDepth:number, terminate:boolean } }) => {
			if(data.terminate && this.running) {
				this.terminating = true;
			}

			this.world = this.bufferToObject(data.world);
			this.camera = this.bufferToObject(data.camera);

			this.world.list.forEach(o => o.sortedHittables = sortHittables(o.center, this.world.list));
			this.camera.sortedHittables = sortHittables(this.camera.lookFrom, this.world.list);
			this.render(data.points, data.samplesPerPixel, data.maxDepth);
		};
	}

	bufferToObject(buffer:SharedArrayBuffer) {
		let str = String.fromCharCode.apply(null, new Uint16Array(buffer));
		let json = JSON.parse(str) as Serialized;
		return deserialize(json);
	}

	async wait(time:number = 0) {
		return new Promise(resolve => setTimeout(resolve, time));
	}

	async render(points: [number, number][], samplesPerPixel:number, maxDepth:number) {
		let time = 0;
		let result = [];
		let from = [];

		this.running = true;

		for (let count = 0; count < points.length; count++, time++) {
			if(this.terminating) break;

			let curPoints = points[count];

			from.push(curPoints);

			result.push(...this.renderRay(curPoints[0], curPoints[1], samplesPerPixel, maxDepth));

			if(time > 1000) {
				self.postMessage({
					result,
					from
				});

				time = 0;
				result = [];
				from = [];

				await this.wait();
			}
		}

		self.postMessage({
			result,
			from,
			done: true,
		});

		this.running = false;
		this.terminating = false;
	}

	renderRay(i: number, j: number, samplesPerPixel: number, maxDepth: number) {

		let color = new Vector(0, 0, 0);

		for (let s = 0; s < samplesPerPixel; ++s) {
			const u = (i + Math.random()) / (this.config.imageWidth - 1);
			const v = (j + Math.random()) / (this.config.imageHeight - 1);
			let ray = this.camera.getRay(u, v);
			color = color.add(ray.color(this.world, maxDepth));
		}

		const [r, g, b, a] = color.writeColor(samplesPerPixel);

		return [r, g, b, a];
	}
}

new RendererSlaveWorker();

export default null as any;
