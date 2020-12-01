class Stats {

	start = new Date().getTime();
	el:HTMLElement;

	constructor() {
		this.el = document.createElement("pre");
		document.body.appendChild(this.el);
	}

	set(
		totalPixels:number,
		renderedPixels:number
	    ) {
		let percentage = Math.round(renderedPixels/totalPixels * 100);
		let now = new Date().getTime();
		let duration = now - this.start;
		let remaining = (duration / (renderedPixels/totalPixels)) - duration;
		let durationMinutes = Math.floor(remaining / (1000*60));
		let durationSeconds = Math.floor((remaining - (durationMinutes*1000*60)) / 1000);

		let elapsedMinutes = Math.floor(duration / (1000*60));
		let elapsedSeconds = Math.floor((duration - (elapsedMinutes*1000*60)) / 1000);

		this.el.innerText = `${percentage}% || ${durationMinutes}:${durationSeconds} remaining || ${elapsedMinutes}:${elapsedSeconds} elapsed`;
	}
}

export const stats = new Stats();
