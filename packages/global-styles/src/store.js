/**
 * External dependencies
 */
import { camelCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { useContext, createContext } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useRenderedGlobalStyles } from './renderer';
import { fromPx, toPx } from './utils';

/**
 * TODO: Replace everything below with wp.data store mechanism
 */

const GlobalStylesContext = createContext( {} );
export const useGlobalStylesContext = () => useContext( GlobalStylesContext );

export function GlobalStylesProvider( { children, baseStyles, userEntityId } ) {
	// Trigger entity retrieval.
	useSelect( ( select ) =>
		select( 'core' ).getEntityRecord(
			'postType',
			'wp_global_styles',
			userEntityId
		)
	);
	const globalStyles = useGlobalStyles( baseStyles, userEntityId );

	return (
		<GlobalStylesContext.Provider value={ globalStyles }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}

function toCamelCase( tree ) {
	if ( ! ( tree instanceof Object ) ) {
		return tree;
	}

	const newTree = {};
	for ( const key in tree ) {
		if ( ! tree.hasOwnProperty( key ) ) continue;

		if ( tree[ key ] instanceof Object ) {
			newTree[ camelCase( key ) ] = toCamelCase( tree[ key ] );
		} else {
			newTree[ camelCase( key ) ] = tree[ key ];
		}
	}
	return newTree;
}

// Make object reference immutable
// so it stays the same in the function setters.
let styles = {};
function useGlobalStyles( baseStyles, userEntityId ) {
	// Start with base styles.
	styles = {
		...toCamelCase( baseStyles ),
	};

	// Merge user styles, if any.
	const userStyles = useSelect( ( select ) =>
		select( 'core' ).getEditedEntityRecord(
			'postType',
			'wp_global_styles',
			userEntityId
		)
	);
	if ( Object.keys( userStyles ).length > 0 ) {
		styles = {
			...styles,
			...toCamelCase( JSON.parse( userStyles.content ) ),
		};
	}

	// Merge generated styles.
	styles = {
		...styles,
		typography: {
			...styles.typography,
			...generateFontSizesHeading( styles.typography ),
			...generateLineHeightHeading( styles.typography ),
		},
	};

	// Convert styles to CSS props.
	useRenderedGlobalStyles( styles );

	// Create and bind function settters to context,
	// so controls can modify the styles.
	const { editEntityRecord } = useDispatch( 'core' );

	const setColor = ( newStyles ) => {
		editEntityRecord( 'postType', 'wp_global_styles', userEntityId, {
			content: JSON.stringify( {
				...styles,
				color: {
					...styles.color,
					...newStyles,
				},
			} ),
		} );
	};

	const setTypography = ( newStyles ) => {
		const baseTypography = {
			...styles.typography,
			...newStyles,
		};
		editEntityRecord( 'postType', 'wp_global_styles', userEntityId, {
			content: JSON.stringify( {
				...styles,
				typography: {
					...baseTypography,
					...generateFontSizesHeading( baseTypography ),
					...generateLineHeightHeading( baseTypography ),
				},
			} ),
		} );
	};

	// Return context value.
	return {
		...styles,
		setColor,
		setTypography,
	};
}

/**
 * NOTE: Generators for extra computed values.
 */

function generateLineHeightHeading( { lineHeight } ) {
	return {
		lineHeightHeading: ( lineHeight * 0.8 ).toFixed( 2 ),
	};
}

function generateFontSizesHeading( { fontSize, fontScale } ) {
	const fontBase = fromPx( fontSize );
	const toScale = ( size ) =>
		( Math.pow( fontScale, size ) * fontBase ).toFixed( 2 );

	return {
		fontSizeHeading1: toPx( toScale( 5 ) ),
		fontSizeHeading2: toPx( toScale( 4 ) ),
		fontSizeHeading3: toPx( toScale( 3 ) ),
		fontSizeHeading4: toPx( toScale( 2 ) ),
		fontSizeHeading5: toPx( toScale( 1 ) ),
		fontSizeHeading6: toPx( toScale( 0.5 ) ),
	};
}
