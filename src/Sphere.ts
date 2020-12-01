import { HitRecord, Hittable } from './Hittable';
import { Ray } from './Ray';
import { Vector } from './Vector';
import { Material } from './Material';

export class Sphere implements Hittable {
	constructor(private center:Vector, private radius:number, public material:Material) {
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
			.divide(this.radius);

		rec.setFaceNormal(r, outwardNormal);
		rec.material = this.material;

		return true;
	}
}
