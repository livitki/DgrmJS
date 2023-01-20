import { listen } from '../infrastructure/util.js';

/**
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 * @param { {(evt: PointerEvent):void} } onDel
 */
export function delPnlCreate(bottomX, bottomY, onDel) {
	const div = document.createElement('div');
	div.style.cssText = 'height: 24px; padding:10px;';
	div.onclick = onDel;
	div.innerHTML = delSvg;
	return pnlCreate(bottomX, bottomY, div);
}

/**
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 * @param { {(evt: CustomEvent<{cmd:string, arg:string}>):void} } onCmd
 */
export function settingsPnlCreate(bottomX, bottomY, onCmd) {
	const shapeSettings = new ShapeSettings();
	shapeSettings.addEventListener('cmd', onCmd);
	return pnlCreate(bottomX, bottomY, shapeSettings);
}

/** @param {number} bottomX, @param {number} bottomY, @param {HTMLElement} elem */
function pnlCreate(bottomX, bottomY, elem) {
	const div = document.createElement('div');
	div.style.cssText = 'position: fixed; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);';
	div.append(elem);
	document.body.append(div);

	function position(btmX, btmY) {
		div.style.left = `${btmX}px`;
		div.style.top = `${window.scrollY + btmY - div.getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
	}
	position(bottomX, bottomY);

	return {
		/**
		 * @param {number} bottomX positon of the bottom left corner of the panel
		 * @param {number} bottomY positon of the bottom left corner of the panel
		 */
		position,
		del: () => div.remove()
	};
}

class ShapeSettings extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
		<style>
			.ln { display: flex; }
			.ln > * {
				height: 24px;
				padding: 10px;
			}
			[data-cmd] { cursor: pointer; }
		</style>
		<ap-shape-edit id="edit">
			${colorPickerHtml}
		</ap-shape-edit>`;

		listen(shadow.getElementById('edit'), 'del',
			() => this.dispatchEvent(new CustomEvent('cmd', { detail: { cmd: 'del' } })), true);

		shadow.querySelectorAll('[data-cmd]').forEach(el => listen(el, 'click', this));
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	handleEvent(evt) {
		this.dispatchEvent(new CustomEvent('cmd', {
			detail: {
				cmd: evt.currentTarget.getAttribute('data-cmd'),
				arg: evt.currentTarget.getAttribute('data-cmd-arg')
			}
		}));
	}
}
customElements.define('ap-shape-settings2', ShapeSettings);

class ShapeEdit extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
		`<style>
			.ln { display: flex; }
			.ln > svg {
				height: 24px;
				padding: 10px;
			}
			svg { cursor: pointer; }
			#prop { padding-bottom: 10px; }
		</style>
		<div id="prop" style="display: none;">
			<slot></slot>
		</div>
		<div class="ln">
			<svg id="toggle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12.9 6.858l4.242 4.243L7.242 21H3v-4.243l9.9-9.9zm1.414-1.414l2.121-2.122a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414l-2.122 2.121-4.242-4.242z" fill="rgba(52,71,103,1)"/></svg>
			${delSvg}
		</div>`;;

		const props = shadow.getElementById('prop');
		const modalDiv = /** @type {ShadowRoot} */ (shadow.host.parentNode).host.parentElement;

		/** @param {1|-1} coef */
		function modalSetTop(coef) {
			modalDiv.style.top = `${modalDiv.getBoundingClientRect().top + window.scrollY + coef * props.getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
		}

		shadow.getElementById('toggle').onclick = () => {
			if (display(props)) {
				modalSetTop(1);
				display(props, false);
			} else {
				display(props, true);
				modalSetTop(-1);
			}
		};

		/** @type {HTMLElement} */(shadow.querySelector('[data-cmd="del"]'))
			.onclick = () => this.dispatchEvent(new CustomEvent('del'));
	}
}
customElements.define('ap-shape-edit', ShapeEdit);

const delSvg = '<svg data-cmd="del" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';
const colorPickerHtml = `
	<style>.crcl { width: 25px; height: 25px; border-radius: 50%; }</style>
	<div class="ln">
		<div data-cmd="style" data-cmd-arg="cl-red">
			<div class="crcl" style="background: #E74C3C"></div>
		</div>
		<div data-cmd="style" data-cmd-arg="cl-orange">
			<div class="crcl" style="background: #ff6600"></div>
		</div>
		<div data-cmd="style" data-cmd-arg="cl-green">
			<div class="crcl" style="background: #19bc9b"></div>
		</div>
	</div>
	<div class="ln">
		<div data-cmd="style" data-cmd-arg="cl-blue">
			<div class="crcl" style="background: #1aaee5"></div>
		</div>
		<div data-cmd="style" data-cmd-arg="cl-dblue">
			<div class="crcl" style="background: #1D809F"></div>
		</div>
		<div data-cmd="style" data-cmd-arg="cl-dgray">
			<div class="crcl" style="background: #495057"></div>
		</div>
	</div>`;

/** @param {ElementCSSInlineStyle} el, @param {boolean?=} isDisp */
function display(el, isDisp) {
	if (isDisp !== undefined) { el.style.display = isDisp ? 'unset' : 'none'; }
	return el.style.display === 'unset';
}

// <div class="ln">
// 			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" fill="rgba(52,71,103,1)"/></svg>
// 		</div>
