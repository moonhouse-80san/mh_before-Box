<?php
/**
 * @class  mh_before
 * @author 팔공산 (80san@moonhouse.co.kr)
 * @brief  두 이미지를 겹쳐서 드래그로 비교해서 보여주는 Before/After 비교 슬라이더 에디터 컴포넌트
 */
class mh_before extends EditorHandler
{
	// editor.class.php의 EditorModel::getComponentObject()가 반드시 이 두 값을 넘겨줌
	var $editor_sequence = 0;
	var $component_path = '';

	/**
	 * @brief editor_sequence와 컴포넌트 경로를 전달받음
	 */
	function __construct($editor_sequence, $component_path)
	{
		$this->editor_sequence = $editor_sequence;
		$this->component_path = $component_path;
	}

	/**
	 * @brief 에디터에서 컴포넌트 버튼을 눌렀을 때 뜨는 팝업창 내용
	 */
	function getPopupContent()
	{
		$tpl_path = $this->component_path . 'tpl';
		Context::set('tpl_path', $tpl_path);

		$oTemplate = TemplateHandler::getInstance();
		return $oTemplate->compile($tpl_path, 'popup.html');
	}

	/**
	 * @brief 본문에 저장된 <img editor_component="mh_before" .../> 태그를
	 *        화면에 보여줄 때마다 실제 비교 슬라이더 마크업으로 변환
	 */
	function transHTML($xml_obj)
	{
		$src1 = $xml_obj->attrs->src1 ?? '';
		$src2 = $xml_obj->attrs->src2 ?? '';
		if ($src1 === '' || $src2 === '')
		{
			return '';
		}

		// 슬라이더 영역의 가로폭 (콘텐츠 폭 기준 %)
		$width = (int)($xml_obj->attrs->width ?? 100);
		if ($width < 10 || $width > 100)
		{
			$width = 100;
		}

		// 처음 열었을 때 경계선이 위치할 지점 (%)
		$start_pos = (int)($xml_obj->attrs->start_pos ?? 50);
		if ($start_pos < 0 || $start_pos > 100)
		{
			$start_pos = 50;
		}

		$caption1 = trim($xml_obj->attrs->caption1 ?? '');
		$caption2 = trim($xml_obj->attrs->caption2 ?? '');

		$before_info = new stdClass();
		$before_info->id = 'mhBefore' . substr(md5($src1 . $src2 . microtime()), 0, 8);
		$before_info->src1 = $this->_normalizeSrc($src1);
		$before_info->src2 = $this->_normalizeSrc($src2);
		$before_info->width = $width;
		$before_info->start_pos = $start_pos;
		$before_info->alt1 = htmlspecialchars($caption1 !== '' ? $caption1 : 'Before', ENT_QUOTES);
		$before_info->alt2 = htmlspecialchars($caption2 !== '' ? $caption2 : 'After', ENT_QUOTES);
		$before_info->caption1_html = $caption1 !== ''
			? '<figcaption>' . htmlspecialchars($caption1, ENT_QUOTES) . '</figcaption>'
			: '';
		$before_info->caption2_html = $caption2 !== ''
			? '<figcaption>' . htmlspecialchars($caption2, ENT_QUOTES) . '</figcaption>'
			: '';

		Context::set('before_info', $before_info);

		$tpl_path = $this->component_path . 'tpl';
		Context::set('tpl_path', $tpl_path);

		$oTemplate = TemplateHandler::getInstance();
		return $oTemplate->compile($tpl_path, 'display.html');
	}

	/**
	 * @brief 상대경로 이미지 주소를 절대경로로 변환 (코어 image_link 컴포넌트와 동일한 방식)
	 */
	private function _normalizeSrc($src)
	{
		$src = str_replace(['&', '"'], ['&amp;', '&quot;'], $src);
		$src = str_replace('&amp;amp;', '&amp;', $src);

		if (substr($src, 0, 2) === './')
		{
			$src = \RX_BASEURL . substr($src, 2);
		}
		elseif (substr($src, 0, 1) !== '/' && !preg_match('!^https?:!i', $src))
		{
			$src = \RX_BASEURL . $src;
		}

		return $src;
	}
}
/* End of file mh_before.class.php */
/* Location: ./modules/editor/components/mh_before/mh_before.class.php */
