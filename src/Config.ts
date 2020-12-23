export class Config {
	samplesPerPixel = 20;
	maxDepth = 20;
	imageWidth = 1000;
	imageHeight:number;
	aspectRatio = 16/9;

	constructor() {
		this.imageHeight = Math.round(this.imageWidth / this.aspectRatio);
	}
}
