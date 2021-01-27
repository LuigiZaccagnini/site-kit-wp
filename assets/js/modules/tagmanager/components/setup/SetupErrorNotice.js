/**
 * Tag Manager Setup Error Notice component.
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
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { STORE_NAME } from '../../datastore/constants';
import { MODULES_ANALYTICS } from '../../../analytics/datastore/constants';
import { CORE_MODULES } from '../../../../googlesitekit/modules/datastore/constants';
import StoreErrorNotices from '../../../../components/StoreErrorNotices';
import ErrorText from '../../../../components/ErrorText';
const { useSelect } = Data;

export default function SetupErrorNotice() {
	const analyticsErrors = [
		// Check if activating Analytics failed.
		useSelect( ( select ) => select( CORE_MODULES ).getErrorForAction( 'activateModule', [ 'analytics' ] ) ),
		// Check if saving Analytics settings failed.
		useSelect( ( select ) => {
			const settings = select( MODULES_ANALYTICS ).getSettings();
			return select( MODULES_ANALYTICS ).getErrorForAction( 'saveSettings', [ settings ] );
		} ),
	].filter( Boolean );

	if ( analyticsErrors.length ) {
		return analyticsErrors.map(
			( { message, reconnectURL } ) => <ErrorText key={ message } message={ message } reconnectURL={ reconnectURL } />
		);
	}

	return <StoreErrorNotices moduleSlug="tagmanager" storeName={ STORE_NAME } />;
}
