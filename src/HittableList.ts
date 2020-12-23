import { HitRecord, Hittable } from './Hittable';
import { Ray } from './Ray';
import { deserialize, SerializeOf } from './deserialize';
import { Vector } from './Vector';

export class HittableList implements Hittable {
    sortedHittables: Hittable[];
	list:Hittable[] = [];
	center: Vector;

    distanceFrom(center: Vector): number {
        throw new Error('Method not implemented.');
    }

	static deserialize(object: SerializeOf<HittableList>): HittableList {
		let hittableList = new HittableList();
		hittableList.list = object.list.map(deserialize)
		return hittableList;
	}

	serialize() {
		return {
			list: this.list.map(o => o.serialize()),
			type: 'HittableList',
		};
	}


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
