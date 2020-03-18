/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import {
	BlockEditorKeyboardShortcuts,
	__experimentalEditorSkeleton as EditorSkeleton,
} from '@wordpress/block-editor';
import {
	DropZoneProvider,
	FocusReturnProvider,
	Popover,
	SlotFillProvider,
} from '@wordpress/components';

export default function Layout() {
	const isMobile = useViewportMatch( 'medium', '<' );

	return (
		<>
			<BlockEditorKeyboardShortcuts.Register />
			<SlotFillProvider>
				<DropZoneProvider>
					<FocusReturnProvider>
						<EditorSkeleton
							header={ <div>Header</div> }
							sidebar={ ! isMobile && <div>Sidebar</div> }
							content={
								<>
									{ /* <Notices /> */ }
									<Popover.Slot name="block-toolbar" />
									<div
										className="edit-navigation-layout__content"
										tabIndex="-1"
									>
										Content
									</div>
								</>
							}
						/>
					</FocusReturnProvider>
				</DropZoneProvider>
			</SlotFillProvider>
		</>
	);
}
