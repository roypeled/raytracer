import { HitRecord, Hittable } from './Hittable';
import { Ray } from './Ray';
import { Vector } from './Vector';
import { Material } from './Material';
import { deserialize, SerializeOf } from './deserialize';

export class Sphere implements Hittable {
	sortedHittables: Hittable[];

	static deserialize(object: SerializeOf<Sphere>): Sphere {
		return new Sphere(
			deserialize(object.center),
			object.radius,
			deserialize(object.material),
		);
	}

	serialize() {
		return {
			center: this.center.serialize(),
			radius: this.radius,
			material: this.material.serialize(),
			type: 'Sphere',
		};
	}

	constructor(public center:Vector, private radius:number, public material:Material) {
	}

	distanceFrom(center: Vector): number {
        return Math.sqrt(Math.pow(this.center.x - center.x, 2) + Math.pow(this.center.y - center.y, 2) + Math.pow(this.center.z - center.z, 2));
	}

	hit(r: Ray, tMin: number, tMax: number, rec: HitRecord): boolean {
		let oc = r.origin.subtract(this.center);
		let a = r.direction.length_squared();
		let halfB = Vector.dot(oc, r.direction);
		let c = oc.length_squared() - this.radius*this.radius;

		let discriminant = halfB*halfB - a*c;

		if(discriminant < 0) return false;

		let sqrt = Math.sqrt(discriminant);

		let root = (-halfB-sqrt) / a;
		if(root < tMin || tMax < root) {
			root = (-halfB + sqrt) / a;
			if (root < tMin || tMax < root) return false;
		}

		rec.t = root;
		rec.p = r.at(rec.t);

		let outwardNormal = rec.p
			.subtract(this.center)
			.divideNum(this.radius);

		rec.setFaceNormal(r, outwardNormal);
		rec.material = this.material;

		return true;
	}
}
