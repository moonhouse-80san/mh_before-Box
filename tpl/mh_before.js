jQuery(function ($) {
	document.querySelectorAll(".comparison-slider").forEach((element) => {
		if (element.dataset.mhBeforeInit === "1") return;

		const fig1 = element.getElementsByTagName("figure")[0];
		const fig2 = element.getElementsByTagName("figure")[1];
		if (!fig1 || !fig2) return;

		element.dataset.mhBeforeInit = "1";

		const img1 = fig1.querySelector("img");
		const img2 = fig2.querySelector("img");

		const slider = document.createElement("div");

		const figcaption = {
			first: element.getElementsByTagName("figcaption")[0],
			second: element.getElementsByTagName("figcaption")[1],
		};

		const initSlider = () => {
			// 이미지 자연 크기 가져오기
			const w1 = img1.naturalWidth || img1.offsetWidth;
			const h1 = img1.naturalHeight || img1.offsetHeight;
			const w2 = img2.naturalWidth || img2.offsetWidth;
			const h2 = img2.naturalHeight || img2.offsetHeight;

			// **작은 이미지 결정** (너비 우선)
			let baseW = Math.min(w1, w2);
			let baseH = Math.min(h1, h2);

			// 컨테이너 너비 제한 (부모 요소가 정한 max-width 적용)
			const containerWidth = element.parentElement.offsetWidth;
			const finalWidth = Math.min(baseW, containerWidth);
			const finalHeight = Math.round(finalWidth * (baseH / baseW));

			// 강제 크기 적용
			element.style.width = finalWidth + 'px';
			element.style.height = finalHeight + 'px';
			element.style.maxWidth = '100%';   // 반응형 유지

			// 두 이미지 모두 동일한 크기로 강제 설정
			fig1.style.width = '100%';
			fig1.style.height = '100%';
			fig2.style.width = '100%';
			fig2.style.height = '100%';

			const setPosition = (percentage) => {
				percentage = Math.max(0, Math.min(100, percentage));
				slider.style.left = `${percentage}%`;
				fig2.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
			};

			const slide = (event) => {
				const clientX = event.clientX ?? (event.touches && event.touches[0].clientX);
				if (!clientX) return;
				const rect = element.getBoundingClientRect();
				let x = clientX - rect.left;
				x = Math.max(0, Math.min(x, rect.width));
				const percentage = (x / rect.width) * 100;
				setPosition(percentage);

				if (figcaption.first) figcaption.first.classList.toggle("hide", x < 60);
				if (figcaption.second) figcaption.second.classList.toggle("hide", rect.width - x < 60);
			};

			const dragStart = (e) => { e.preventDefault(); document.addEventListener("mousemove", slide); document.addEventListener("touchmove", slide); element.classList.add("dragging"); };
			const dragDone = () => { document.removeEventListener("mousemove", slide); document.removeEventListener("touchmove", slide); element.classList.remove("dragging"); };

			// 슬라이더 UI
			slider.classList.add("slider");
			const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			arrow.setAttribute("width", "20"); arrow.setAttribute("height", "20");
			arrow.setAttribute("viewBox", "0 0 30 30");
			path.setAttribute("d", "M1,14.9l7.8-7.6v4.2h12.3V7.3l7.9,7.6l-7.9,7.7v-4.2H8.8v4.2L1,14.9z");
			arrow.appendChild(path);
			slider.appendChild(arrow);

			element.appendChild(slider);

			slider.addEventListener("mousedown", dragStart);
			slider.addEventListener("touchstart", dragStart);
			document.addEventListener("mouseup", dragDone);
			document.addEventListener("touchend", dragDone);
			document.addEventListener("touchcancel", dragDone);

			setPosition(parseFloat(element.dataset.start) || 50);
		};

		// 이미지 로드 대기
		if (img1.complete && img2.complete) {
			initSlider();
		} else {
			let loaded = 0;
			const checkLoad = () => { loaded++; if (loaded >= 2) initSlider(); };
			img1.addEventListener('load', checkLoad);
			img2.addEventListener('load', checkLoad);
		}
	});
});