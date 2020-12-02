import { Renderer } from './Renderer';

function debounce(func:Function, interval:number) {
	let called = 0;
	return (...args:any[]) => {
		let now = new Date().getTime();
		if(now - called > interval) {
			func.apply(func, args);
			console.log('yes', now - called);
			called = now;
		} else {
			console.log('not');
		}
	}
}

async function run() {

	Renderer.createCanvas();

	document.body.addEventListener('keydown', debounce(onKeypress, 100));

	let canceller:()=>Promise<any>;

	async function onKeypress(e:KeyboardEvent) {
		e.preventDefault();
		switch (e.keyCode) {
			case 37:
				await canceller();
				Renderer.camera.moveLeft();
				canceller = Renderer.smartRender();
				break;
			case 39:
				await canceller();
				Renderer.camera.moveRight();
				canceller = Renderer.smartRender();
				break;
			case 38:
				await canceller();
				Renderer.camera.moveUp();
				canceller = Renderer.smartRender();
				break;
			case 40:
				await canceller();
				Renderer.camera.moveDown();
				canceller = Renderer.smartRender();
				break;
			case 73:
				await canceller();
				Renderer.camera.zoomIn();
				canceller = Renderer.smartRender();
				break;
			case 79:
				await canceller();
				Renderer.camera.zoomOut();
				canceller = Renderer.smartRender();
				break;
		}
	}

	canceller = Renderer.smartRender();
}

run();
