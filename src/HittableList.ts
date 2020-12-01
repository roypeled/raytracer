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
				Object.assign(record, tempRec)
			}
		}

		return hitAnything;
	}
}
