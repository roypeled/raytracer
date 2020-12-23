import { HittableList } from './HittableList';
import { Dielectric, Lambertian, Light, Material, Metal } from './Material';
import { Vector } from './Vector';
import { Sphere } from './Sphere';
import { randomInRange } from './Utils';

export class RandomScene {
	world = new HittableList();

	groundMat = new Lambertian(new Vector(.5, .5, .5));

	constructor() {
		this.world.add(new Sphere(new Vector(0, -1000,0), 1000, this.groundMat));

		const balls = 5;
		for (let a = -balls; a < balls; a++) {
			for (let b = -balls; b < balls; b++) {
				let autoChooseMat = Math.random();
				let center = new Vector(a + 0.9*Math.random(), 0.2, b + 0.9*Math.random());

				if ((center.subtract(new Vector(4, 0.2, 0))).length() > 0.9) {
					let r = randomInRange(.01, .4);

					if (autoChooseMat < 0.8) {
						// diffuse
						let albedo = Vector.random().multiply(Vector.random());
						let sphereMaterial = new Lambertian(albedo);
						this.world.add(new Sphere(center, r, sphereMaterial));
					} else if (autoChooseMat < 0.9) {
						// metal
						let albedo = Vector.randomInRange(0.5, 1);
						let fuzz = randomInRange(0, 0.5);
						let sphereMaterial = new Metal(albedo, fuzz);
						this.world.add(new Sphere(center, r, sphereMaterial));
					} else if (autoChooseMat < 0.95) {
						// light
						let sphereMaterial = new Light();
						this.world.add(new Sphere(center, r, sphereMaterial));
					} else {
						// glass
						let sphereMaterial = new Dielectric(1.5);
						this.world.add(new Sphere(center, r, sphereMaterial));
					}
				}
			}
		}

		let material1 = new Dielectric(1.5);
		this.world.add(new Sphere(new Vector(0, 1, 0), randomInRange(.3, 1.5), material1));

		let material2 = new Lambertian(new Vector(0.4, 0.2, 0.1));
		this.world.add(new Sphere(new Vector(-4, 1, 0), randomInRange(.3, 1.5), material2));

		let material3 = new Metal(new Vector(0.7, 0.6, 0.5), 0.0);
		this.world.add(new Sphere(new Vector(4, 1, 0), randomInRange(.3, 1.5), material3));
	}
}
