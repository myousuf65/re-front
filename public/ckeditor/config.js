/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html

	// The toolbar groups arrangement, optimized for two toolbar rows.
	config.toolbar = [
		{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ] },
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat' ] },
		{ name: 'links', items: [ 'Link', 'Unlink' ] },
		{ name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'SpecialChar', 'EmojiPanel' ] },
		'/',
		{ name: 'styles', items: [ 'Font', 'FontSize', 'Format' ] },
		{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
		{ name: 'paragraph', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent' ] }
	];

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Subscript,Superscript,Styles,Anchor';

	// Set the most common block elements.
	config.format_tags = 'div;p;h1;h2;h3';
	config.fontSize_sizes = '12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;32/32px;';
	config.font_names = 'Arial;Times New Roman;微軟正黑體/微軟正黑體,Microsoft JhengHei,sans-serif;標楷體/標楷體,DFKai-sb,sans-serif;細明體/細明體,MingLiU,sans-serif;新細明體/新細明體,PMingLiU,sans-serif;';
	config.removePlugins = "Subscript,Superscript";

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
};
