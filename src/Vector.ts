import { clamp, randomInRange } from './Utils';

export class Vector {
	constructor(public x:number, public y:number, public z:number) {
	}

	subtract(v:Vector|number) {
		if(v instanceof Vector)
			return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
		else
			return new Vector(this.x - v, this.y - v, this.z - v);
	}

	subtractFrom(v:Vector) {
		return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
	}

	add(v:Vector|number) {
		if(v instanceof Vector)
			return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
		else
			return new Vector(this.x + v, this.y + v, this.z + v);
	}

	multiply(v:Vector | number) {
		if(v instanceof Vector)
			return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
		else
			return new Vector(this.x * v, this.y * v, this.z * v);
	}

	divide(v:Vector | number) {
		if(v instanceof Vector)
			return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
		else
			return new Vector(this.x / v, this.y / v, this.z / v);
	}

	length_squared() {
		const sqrd = this.multiply(this);
		return sqrd.x + sqrd.y + sqrd.z;
	}

	length() {
		return Math.sqrt(this.length_squared());
	}

	writeColor(samplesPerPixel:number) {
		return Vector.writeColor(this, samplesPerPixel);
	}

	nearZero() {
		const s = 1e-8;
		return (Math.abs(this.x) < s)
			&& (Math.abs(this.y) < s)
			&& (Math.abs(this.z) < s);
	}

	static reflect(v1:Vector, v2:Vector){
		return v1.subtract(
			v2.multiply(
			2 * Vector.dot(v1, v2)
			)
		)
	}

	static refract(v1:Vector, v2:Vector, etaiOverEtat:number) {
		let cosTheta = Math.min(Vector.dot(v1.multiply(-1), v2), 1);
		let rOutPerp = v1.add(v2.multiply(cosTheta))
			.multiply(etaiOverEtat);
		let rOutParallel = v2.multiply(
			-Math.sqrt(
				Math.abs(1 - rOutPerp.length_squared())
			)
		);
		return rOutPerp.add(rOutParallel);
	}
	
	static add(v1:Vector, v2:Vector) {
		return v1.add(v2);
	}
	
	static subtract(v1:Vector, v2:Vector) {
		return v1.subtract(v2);
	}

	static multiply(v1:Vector, v2:Vector | number) {
		return v1.multiply(v2);
	}

	static divide(t:number, v:Vector) {
		return v.divide(t);
	}
	
	static dot(v1:Vector, v2:Vector) {
		return v1.x*v2.x
			+ v1.y*v2.y
			+ v1.z*v2.z;
	}
	
	static cross(v1:Vector, v2:Vector) {
		return new Vector(v1.y * v2.z - v1.z * v2.y,
			v1.z * v2.x - v1.x * v2.z,
			v1.x * v2.y - v1.y * v2.x);
	}

	static unitVector(v:Vector) {
		return v.divide(v.length());
	}

	static writeColor(v:Vector, samplesPerPixel:number) {
		let r = v.x;
		let g = v.y;
		let b = v.z;

		let scale = 1 / samplesPerPixel;

		r = Math.sqrt(scale * r);
		g = Math.sqrt(scale * g);
		b = Math.sqrt(scale * b);

		return [
			256 * clamp(r, 0, .999),
			256 * clamp(g, 0, .999),
			256 * clamp(b, 0, .999),
			255,
		]
	}

	static random() {
		return new Vector(Math.random(), Math.random(), Math.random());
	}

	static randomInRange(min:number, max:number) {
		return new Vector(randomInRange(min, max), randomInRange(min, max), randomInRange(min, max));
	}
}


