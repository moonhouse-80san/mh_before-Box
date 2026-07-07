;(function($) {
	var $form = $;

	// 기존에 삽입된 mh_before 이미지를 더블클릭해서 다시 연 경우, 값을 채워줌
	function getComponent() {
		if (typeof(opener) == "undefined") return;

		var node = opener.editorPrevNode;
		if (!node || node.nodeName != 'IMG' || !node.getAttribute('editor_component')) return;
		if (node.getAttribute('editor_component') != 'mh_before') return;

		var src1 = node.getAttribute('src1') || '';
		var src2 = node.getAttribute('src2') || '';

		$form.find('#src1').val(src1);
		$form.find('#src2').val(src2);
		$form.find('#caption1').val(node.getAttribute('caption1') || '');
		$form.find('#caption2').val(node.getAttribute('caption2') || '');
		$form.find('#bottom_caption').val(node.getAttribute('caption') || '');
		$form.find('#width').val(node.getAttribute('width') || 100);
		$form.find('#start_pos').val(node.getAttribute('start_pos') || 50);

		if (src1) showPreview(1, src1);
		if (src2) showPreview(2, src2);
	}

	function showPreview(slot, url) {
		$form.find('#preview_img' + slot).attr('src', url).show();
	}

	function uploadImage(slot, file) {
		if (!file) return;

		var $status = $form.find('#upload_status' + slot);
		var $btnInsert = $form.find('#btn_insert');

		var formData = new FormData();
		formData.append('Filedata', file);
		formData.append('editor_sequence', $form.find('#editor_sequence').val());
		formData.append('module_srl', $form.find('#module_srl').val());
		formData.append('mid', $form.find('#mid').val());

		$status.text('업로드 중...');
		$btnInsert.prop('disabled', true);

		$.ajax({
			url: './index.php?module=file&act=procFileUpload',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			dataType: 'json',
			success: function(data) {
				$btnInsert.prop('disabled', false);
				if (!data || data.error != 0 || !data.download_url) {
					$status.text('업로드 실패' + (data && data.message ? (': ' + data.message) : ''));
					return;
				}
				$form.find('#src' + slot).val(data.download_url);
				$status.text('업로드 완료');
				showPreview(slot, data.download_url);
			},
			error: function() {
				$btnInsert.prop('disabled', false);
				$status.text('업로드 실패 (서버 오류)');
			}
		});
	}

	function insertComponent() {
		if (typeof(opener) == "undefined") return;

		var src1 = $.trim($form.find('#src1').val());
		var src2 = $.trim($form.find('#src2').val());

		if (!src1 || !src2) {
			alert('두 이미지를 모두 업로드해 주세요.');
			return;
		}

		var attrs = {
			editor_component: 'mh_before',
			// 글 작성 화면(에디터 iframe)에서는 transHTML() 변환이 실행되지 않고 태그가 그대로 보이므로,
			// 실제로 그려질 src가 없으면 아무것도 표시되지 않는다. 코어의 image_gallery, poll_maker 컴포넌트와
			// 동일하게 투명 1x1 이미지 + 점선 테두리 + 안내 배경으로 "여기 컴포넌트 있음"을 표시해 준다.
			src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
			src1: src1,
			src2: src2,
			caption1: $form.find('#caption1').val(),
			caption2: $form.find('#caption2').val(),
			caption: $form.find('#bottom_caption').val(),
			width: parseInt($form.find('#width').val(), 10) || 100,
			start_pos: parseInt($form.find('#start_pos').val(), 10)
		};
		if (isNaN(attrs.start_pos)) attrs.start_pos = 50;

		var $img = $('<img />').attr(attrs);
		$img.css({
			display: 'block',
			width: '100%',
			height: '200px',
			border: '2px dotted #4371B9',
			background: "url('./modules/editor/components/mh_before/tpl/mh_before_placeholder.gif') no-repeat center",
			backgroundSize: 'contain'
		});
		var iframe_obj = opener.editorGetIFrame(opener.editorPrevSrl);

		try {
			var prevNode = opener.editorPrevNode;
			prevNode.parentNode.insertBefore($img.get(0), prevNode);
			prevNode.parentNode.removeChild(prevNode);
		} catch (e) {
			try {
				opener.editorReplaceHTML(iframe_obj, $('<div>').append($img).html());
			} catch (ee) { }
		}

		opener.editorFocus(opener.editorPrevSrl);
		window.close();
	}

	/* DOM READY */
	$(function() {
		$form = $('#fo');
		$form.find('#btn_insert').click(insertComponent);
		$form.find('#upload_file1').on('change', function() {
			var file = this.files && this.files[0];
			uploadImage(1, file);
		});
		$form.find('#upload_file2').on('change', function() {
			var file = this.files && this.files[0];
			uploadImage(2, file);
		});
		if (typeof(opener) != "undefined") getComponent();
	});

})(jQuery);
