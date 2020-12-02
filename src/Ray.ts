import { Vector } from './Vector';
import { HitRecord, Hittable } from './Hittable';

export class Ray {
	constructor(public origin:Vector, public direction:Vector) {}

	at(t:number) {
		return this.origin.add(this.direction.multiplyNum(t));
	}

	hitSphere(center:Vector, radius:number, r:Ray) {
		let oc = r.origin.subtract(center);
		let a = r.direction.length_squared();
		let halfB = Vector.dot(oc, r.direction);
		let c = oc.length_squared() - radius*radius;
		const discriminant = halfB*halfB - a*c;

		if(discriminant < 0) {
			return -1;
		}

		return (-halfB-Math.sqrt(discriminant)) / a
	}

	color(world:Hittable, depth:number):Vector {
		if(depth <= 0) return new Vector(0,0,0);

		let rec = new HitRecord();
		if(world.hit(this, 0.00001, Infinity, rec))	{
			let scattered:Ray = new Ray(null, null);
			let attenuation:Vector = new Vector(0,0,0);

			if(rec.material.scatter(this, rec, attenuation, scattered))
				return attenuation.multiply(scattered.color(world, depth-1))

			return new Vector(0,0,0);
		}

		let unitDirection = Vector.unitVector(this.direction);
		let t = .5 * (unitDirection.y + 1);
		const white = new Vector(1,1,1);
		const blue = new Vector(.5,.7,1);

		return white
				.multiplyNum(1-t)
				.add(
					blue.multiplyNum(t)
				);
	}

}
