/**
 * Recommendation component.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useCallback, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import ViewContextContext from '../../../../components/Root/ViewContextContext';
import {
	MODULES_PAGESPEED_INSIGHTS,
	STRATEGY_MOBILE,
	STRATEGY_DESKTOP,
} from '../../datastore/constants';
import Accordion from '../../../../components/Accordion';
import { sanitizeHTML, markdownToHTML, trackEvent } from '../../../../util';
const { useSelect } = Data;

export default function Recommendation( props ) {
	const { auditID, title, referenceURL, strategy } = props;
	const viewContext = useContext( ViewContextContext );

	const onOpen = useCallback( () => {
		trackEvent(
			`${ viewContext }_pagespeed-widget`,
			'stack_pack_expand',
			auditID
		);
	}, [ auditID, viewContext ] );

	const stackPack = useSelect( ( select ) =>
		select( MODULES_PAGESPEED_INSIGHTS ).getStackPackDescription(
			referenceURL,
			strategy,
			auditID,
			'wordpress'
		)
	);
	if ( ! stackPack ) {
		return null;
	}

	const content = markdownToHTML( stackPack.description );
	const sanitizeArgs = {
		ALLOWED_TAGS: [ 'a', 'p' ],
		ALLOWED_ATTR: [ 'href', 'rel', 'target' ],
	};

	return (
		<Accordion id={ auditID } title={ title } onOpen={ onOpen }>
			<div
				dangerouslySetInnerHTML={ sanitizeHTML(
					content,
					sanitizeArgs
				) }
			/>
		</Accordion>
	);
}

Recommendation.propTypes = {
	auditID: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	referenceURL: PropTypes.string.isRequired,
	strategy: PropTypes.oneOf( [ STRATEGY_MOBILE, STRATEGY_DESKTOP ] )
		.isRequired,
};
