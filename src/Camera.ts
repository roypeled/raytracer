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
		lookFrom:Vector,
		lookAt:Vector,
		vUp:Vector,
		vFov:number,
		private aspectRation:number,
		aperture: number,
		focusDist: number,
	) {
		let theta = degreesToRadians(vFov);
		let h = Math.tan(theta/2);
		this.viewportHeight = 2 * h;
		this.viewportWidth = aspectRation * this.viewportHeight;

		let w = Vector.unitVector(lookFrom.subtract(lookAt));
		this.u = Vector.unitVector(Vector.cross(vUp, w));
		this.v = Vector.cross(w, this.u);

		this.lensRadius = aperture/2;

		this.origin = lookFrom;
		this.horizontal = this.u.multiply(this.viewportWidth).multiply(focusDist);
		this.vertical = this.v.multiply(this.viewportHeight).multiply(focusDist);
		this.lowerLeftCorner = this.origin
			.subtract(this.horizontal.divide(2))
			.subtract(this.vertical.divide(2))
			.subtract(
				w.multiply(focusDist)
			);
	}

	getRay(s:number, t:number) {
		let rd = randomInUnitDisk().multiply(this.lensRadius);
		let offset = this.u.multiply(rd.x)
			.add(this.v.multiply(rd.y))

		return new Ray(
			this.origin.add(offset),
			this.lowerLeftCorner
				.add(this.horizontal.multiply(s))
				.add(this.vertical.multiply(t))
				.subtract(this.origin)
				.subtract(offset)
		);

	}
}
