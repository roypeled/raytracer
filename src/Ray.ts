import { Vector } from './Vector';
import { HitRecord, Hittable } from './Hittable';

export class Ray {
	constructor(public origin:Vector, public direction:Vector) {}

	at(t:number) {
		return this.origin.add(this.direction.multiplyNum(t));
	}

	color(world:Hittable, depth:number):Vector {
		if(depth <= 0) return new Vector(0,0,0);

		let rec = new HitRecord();
		if(world.hit(this, 0.00001, Infinity, rec))	{
			let scattered:Ray = new Ray(null, null);
			let attenuation:Vector = new Vector(0,0,0);

			if(rec.material.scatter(this, rec, attenuation, scattered))
				return attenuation.multiply(scattered.color(world, depth-1));
			else if(rec.material.lightSource(attenuation))
				return attenuation;

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
