import { Ray } from './Ray';
import { Vector } from './Vector';
import { Material } from './Material';
import { HittableList } from './HittableList';

export class HitRecord {
	frontFace: boolean;
	material: Material;

	constructor(public p: Vector = null,
	            public t: number = null,
	            public normal: Vector = null) {
	}

	setFaceNormal(r: Ray, outwardNormal: Vector) {
		this.frontFace = Vector.dot(r.direction, outwardNormal) < 0;
		this.normal = this.frontFace ? outwardNormal : outwardNormal.multiplyNum(-1);
	}
}

export function sortHittables(from:Vector, list:Hittable[]) {
	let distances = new Map<Hittable, number>();
	list.forEach(o => distances.set(o, o.distanceFrom(from)));
	return list.sort((a, b) => distances.get(a) - distances.get(b));
}

export interface Serialized {
	type:string;
}

export interface Serializeable {
	serialize():Serialized;
}

export interface SerializedHittable {
	type:"sphere";
}

export interface Hittable extends Serializeable {
	sortedHittables:Hittable[];
	center:Vector;

	hit(r: Ray, tMin: number, tMax: number, rec: HitRecord): boolean;
	distanceFrom(center:Vector):number;
}
