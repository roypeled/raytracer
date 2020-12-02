import { Vector } from './Vector';
import { Ray } from './Ray';
import { degreesToRadians, randomInUnitDisk } from './Utils';

export class Camera {
	viewportHeight:number;
	viewportWidth:number;
	lensRadius:number;

	origin:Vector;
	horizontal:Vector;
	vertical:Vector;
	lowerLeftCorner:Vector;
	u:Vector;
	v:Vector;

	constructor(
		private lookFrom:Vector,
		private lookAt:Vector,
		private vUp:Vector,
		private vFov:number,
		private aspectRatio:number,
		private aperture: number,
		private focusDist: number,
	) {
		this.init();
	}

	moveRight() {
		this.lookFrom.z += .5;
		this.init();
	}

	moveLeft() {
		this.lookFrom.z -= .5;
		this.init();
	}

	moveUp() {
		this.lookFrom.y += .5;
		this.init();
	}

	moveDown() {
		this.lookFrom.y -= .5;
		this.init();
	}

	zoomIn() {
		this.vFov -= .5;
		this.init();
	}

	zoomOut() {
		this.vFov += .5;
		this.init();
	}

	private init() {
		let theta = degreesToRadians(this.vFov);
		let h = Math.tan(theta/2);
		this.viewportHeight = 2 * h;
		this.viewportWidth = this.aspectRatio * this.viewportHeight;

		let w = Vector.unitVector(this.lookFrom.subtract(this.lookAt));
		this.u = Vector.unitVector(Vector.cross(this.vUp, w));
		this.v = Vector.cross(w, this.u);

		this.lensRadius = this.aperture/2;

		this.origin = this.lookFrom;
		this.horizontal = this.u.multiplyNum(this.viewportWidth).multiplyNum(this.focusDist);
		this.vertical = this.v.multiplyNum(this.viewportHeight).multiplyNum(this.focusDist);
		this.lowerLeftCorner = this.origin
			.subtract(this.horizontal.divideNum(2))
			.subtract(this.vertical.divideNum(2))
			.subtract(
				w.multiplyNum(this.focusDist)
			);
	}

	getRay(s:number, t:number) {
		let rd = randomInUnitDisk().multiplyNum(this.lensRadius);
		let offset = this.u.multiplyNum(rd.x)
			.add(this.v.multiplyNum(rd.y))

		return new Ray(
			this.origin.add(offset),
			this.lowerLeftCorner
				.add(this.horizontal.multiplyNum(s))
				.add(this.vertical.multiplyNum(t))
				.subtract(this.origin)
				.subtract(offset)
		);

	}
}
