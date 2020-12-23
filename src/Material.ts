import { Ray } from './Ray';
import { HitRecord, Serializeable, SerializedHittable } from './Hittable';
import { Vector } from './Vector';
import { randomInUnitSphere, randomUnitVector } from './Utils';
import { deserialize, SerializeOf } from './deserialize';

export interface SerializedMaterial extends SerializedHittable {

}

export interface Material extends Serializeable {
	scatter(rIn:Ray, rec:HitRecord, attenuation:Vector, scattered:Ray):boolean;
	lightSource(attenuation:Vector):boolean;
}


export class Lambertian implements Material {
	static deserialize(object: SerializeOf<Lambertian>): Lambertian {
		return new Lambertian(
			deserialize(object.color)
		);
	}

	serialize() {
		return {
			type: 'Lambertian',
			color: this.color.serialize(),
		};
	}

	lightSource(attenuation: Vector): boolean {
		return false;
	}

	constructor(private color:Vector) {
	}

	scatter(rIn: Ray, rec: HitRecord, attenuation: Vector, scattered: Ray): boolean {
		let scatterDirection = rec.normal.add(randomUnitVector());

		if(scatterDirection.nearZero())
			scatterDirection = rec.normal;

		Object.assign(scattered, new Ray(rec.p, scatterDirection));
		Object.assign(attenuation, this.color);
		return true;
	}

}

export class Light implements Material {
	static deserialize(object: SerializeOf<Light>): Light {
		return new Light();
	}

	serialize() {
		return {
			type: 'Light',
		};
	}

	constructor() {
	}

	lightSource(attenuation: Vector): boolean {
		Object.assign(attenuation, new Vector(1.9, 1.9, 1.9));
		return true;
	}

	scatter(rIn: Ray, rec: HitRecord, attenuation: Vector, scattered: Ray): boolean {
		let scatterDirection = rec.normal.add(randomUnitVector());

		if(scatterDirection.nearZero())
			scatterDirection = rec.normal;

		Object.assign(scattered, new Ray(rec.p, scatterDirection));
		Object.assign(attenuation, new Vector(1.9, 1.9, 1.9));
		return false;
	}
}

export class Metal implements Material {
	static deserialize(object: SerializeOf<Metal>): Metal {
		return new Metal(
			deserialize(object.color),
			object.fuzz
		);
	}

	serialize() {
		return {
			type: 'Metal',
			color: this.color.serialize(),
			fuzz: this.fuzz,
		};
	}

	constructor(private color:Vector, private fuzz:number) {
	}

	lightSource(attenuation: Vector): boolean {
		return false;
	}

	scatter(rIn: Ray, rec: HitRecord, attenuation: Vector, scattered: Ray): boolean {
		let reflect = Vector.reflect(
			Vector.unitVector(rIn.direction),
			rec.normal
		);

		Object.assign(scattered, new Ray(rec.p, reflect.add(randomInUnitSphere().multiplyNum(this.fuzz))));
		Object.assign(attenuation, this.color);

		return Vector.dot(scattered.direction, rec.normal) > 0;
	}
}

export class Dielectric implements Material {
	static deserialize(object: SerializeOf<Dielectric>) {
		return new Dielectric(object.indexOfRefraction);
	}

	serialize() {
		return {
			type: 'Dielectric',
			indexOfRefraction: this.indexOfRefraction
		};
	}

	constructor(private indexOfRefraction:number) {
	}

	lightSource(attenuation: Vector): boolean {
		return false;
	}

	scatter(rIn: Ray, rec: HitRecord, attenuation: Vector, scattered: Ray): boolean {
		let refractionRatio = rec.frontFace ? 1/this.indexOfRefraction : this.indexOfRefraction;

		let unitDirection = Vector.unitVector(rIn.direction);
		let cosTheta = Math.min(Vector.dot(unitDirection.multiplyNum(-1), rec.normal), 1);
		let sinTheta = Math.sqrt(1 - cosTheta*cosTheta);

		let cannotRefract = refractionRatio * sinTheta > 1;
		let direction:Vector;

		if(cannotRefract || this.reflectance(cosTheta, refractionRatio) > Math.random())
			direction = Vector.reflect(unitDirection, rec.normal);
		else
			direction = Vector.refract(unitDirection, rec.normal, refractionRatio);

		Object.assign(scattered, new Ray(rec.p, direction));
		Object.assign(attenuation, new Vector(1,1,1));

		return true;
	}

	reflectance(cosine:number, refIdx:number) {
		let r0 = (1-refIdx) / (1+refIdx);
		r0 = r0*r0;
		return r0 + (1-r0) * Math.pow((1-cosine), 5);
	}
}
