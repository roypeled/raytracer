class Stats {

	start = new Date().getTime();
	el:HTMLElement;
	message = `Use arrow keys to move camera, 'o' - zoom out, 'i' - zoom in`;

	constructor() {
		this.el = document.createElement("pre");
		this.el.innerText = this.message;
		document.body.appendChild(this.el);
	}

	set(
		totalPixels:number,
		renderedPixels:number,
		pointsPerFrame:number,
	    ) {
		let percentage = Math.round(renderedPixels/totalPixels * 100);
		let now = new Date().getTime();
		let duration = now - this.start;

		let elapsedMinutes = Math.floor(duration / (1000*60));
		let elapsedSeconds = Math.floor((duration - (elapsedMinutes*1000*60)) / 1000);

		this.el.innerText = `${this.message} || ${percentage}% || ${elapsedMinutes}:${elapsedSeconds} elapsed`;
	}
}

export const stats = new Stats();
