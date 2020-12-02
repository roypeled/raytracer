import { HitRecord, Hittable } from './Hittable';
import { Ray } from './Ray';

export class HittableList implements Hittable{

	list:Hittable[] = [];

	add(object:Hittable) {
		this.list.push(object);
	}

	clear() {
		this.list = [];
	}

	hit(r: Ray, tMin: number, tMax: number, record: HitRecord): boolean {
		let tempRec = record;
		let hitAnything = false;
		let closestSoFar = tMax;

		for(let object of this.list) {
			if(object.hit(r, tMin, closestSoFar, tempRec)) {
				hitAnything = true;
				closestSoFar = tempRec.t;
				this.merge(record, tempRec);
			}
		}

		return hitAnything;
	}

	private merge(target: HitRecord, object: HitRecord) {
		target.normal = object.normal;
		target.frontFace = object.frontFace;
		target.material = object.material;
		target.p = object.p;
		target.t = object.t;
	}
}
