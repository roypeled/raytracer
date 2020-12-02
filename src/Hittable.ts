import { Ray } from './Ray';
import { Vector } from './Vector';
import { Material } from './Material';

export class HitRecord {
	frontFace: boolean;
	material:Material;

	constructor(public p: Vector = null,
	            public t: number = null,
	            public normal: Vector = null) {
	}

	setFaceNormal(r: Ray, outwardNormal: Vector) {
		this.frontFace = Vector.dot(r.direction, outwardNormal) < 0;
		this.normal = this.frontFace ? outwardNormal : outwardNormal.multiplyNum(-1);
	}
}

export interface Hittable {
	hit(r: Ray, tMin: number, tMax: number, red: HitRecord): boolean;
}
