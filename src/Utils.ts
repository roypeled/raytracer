import { Vector } from './Vector';

export function degreesToRadians(degrees: number) {
	return degrees * Math.PI / 180;
}

export function randomInRange(min: number, max: number) {
	return min + (max - min) * Math.random();
}

export function clamp(x: number, min: number, max: number) {
	if (x < min) return min;
	if (x > max) return max;
	return x;
}

export function randomInUnitSphere() {
	while (true) {
		let p = Vector.randomInRange(-1, 1);
		if (p.length_squared() >= 1) continue;
		return p;
	}
}

export function randomUnitVector() {
	return Vector.unitVector(randomInUnitSphere());
}

export function randomInHemisphere(normal: Vector) {
	let inUnitSphere = randomInUnitSphere();
	if (Vector.dot(inUnitSphere, normal) > 0) return inUnitSphere;
	else return inUnitSphere.multiplyNum(-1);
}

export function randomInUnitDisk() {
	while (true) {
		let p = new Vector(randomInRange(-1, 1), randomInRange(-1, 1), 0);
		if (p.length_squared() >= 1) continue;
		return p;
	}
}
