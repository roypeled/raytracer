import { Serializeable, Serialized } from './Hittable';
import { HittableList } from './HittableList';
import { Sphere } from './Sphere';
import { Vector } from './Vector';
import { Camera } from './Camera';
import { Dielectric, Lambertian, Light, Metal } from './Material';

export type SerializeOf<T extends Serializeable> = ReturnType<T['serialize']>;

const isHittableList = (o:Serialized): o is SerializeOf<HittableList> => o.type == 'HittableList';
const isSphere = (o:Serialized): o is SerializeOf<Sphere> => o.type == 'Sphere';
const isVector = (o:Serialized): o is SerializeOf<Vector> => o.type == 'Vector';
const isCamera = (o:Serialized): o is SerializeOf<Camera> => o.type == 'Camera';
const isLambertian = (o:Serialized): o is SerializeOf<Lambertian> => o.type == 'Lambertian';
const isLight = (o:Serialized): o is SerializeOf<Light> => o.type == 'Light';
const isDielectric = (o:Serialized): o is SerializeOf<Dielectric> => o.type == 'Dielectric';
const isMetal = (o:Serialized): o is SerializeOf<Metal> => o.type == 'Metal';

type ObjectType<T extends Serialized> =
	T extends { type: 'HittableList' } ? HittableList :
	T extends { type: 'Sphere' } ? Sphere :
	T extends { type: 'Vector' } ? Vector :
	T extends { type: 'Camera' } ? Camera :
	T extends { type: 'Lambertian' } ? Lambertian :
	T extends { type: 'Light' } ? Light :
	T extends { type: 'Dielectric' } ? Dielectric :
	T extends { type: 'Metal' } ? Metal :
		never;

export function deserialize<T extends Serialized>(o:T):ObjectType<T> {
	if (isHittableList(o)) return HittableList.deserialize(o) as ObjectType<T>;
	if (isSphere(o)) return Sphere.deserialize(o) as ObjectType<T>;
	if (isVector(o)) return Vector.deserialize(o) as ObjectType<T>;
	if (isCamera(o)) return Camera.deserialize(o) as ObjectType<T>;
	if (isLambertian(o)) return Lambertian.deserialize(o) as ObjectType<T>;
	if (isLight(o)) return Light.deserialize(o) as ObjectType<T>;
	if (isDielectric(o)) return Dielectric.deserialize(o) as ObjectType<T>;
	if (isMetal(o)) return Metal.deserialize(o) as ObjectType<T>;

	throw new Error("Could not deserialize " + JSON.stringify(o));
}
