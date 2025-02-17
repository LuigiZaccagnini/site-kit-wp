/**
 * DashboardSetupAlerts component.
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
import { useMount } from 'react-use';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { getQueryParameter } from '../../util';
import Notification from './notification';
import ModulesList from '../ModulesList';
import SuccessGreenSVG from '../../../svg/success-green.svg';
import UserInputSuccessNotification from '../notifications/UserInputSuccessNotification';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { VIEW_CONTEXT_DASHBOARD } from '../../googlesitekit/constants';
import {
	CORE_USER,
	PERMISSION_MANAGE_OPTIONS,
} from '../../googlesitekit/datastore/user/constants';
import { trackEvent } from '../../util/tracking';
const { useSelect } = Data;

function DashboardSetupAlerts() {
	const modules = useSelect( ( select ) =>
		select( CORE_MODULES ).getModules()
	);
	const canManageOptions = useSelect( ( select ) =>
		select( CORE_USER ).hasCapability( PERMISSION_MANAGE_OPTIONS )
	);
	const hasMultipleAdmins = useSelect( ( select ) =>
		select( CORE_SITE ).hasMultipleAdmins()
	);
	const isUsingProxy = useSelect( ( select ) =>
		select( CORE_SITE ).isUsingProxy()
	);
	const slug = getQueryParameter( 'slug' );

	useMount( () => {
		trackEvent(
			`${ VIEW_CONTEXT_DASHBOARD }_authentication-success_notification`,
			'view_notification'
		);

		// Only trigger these events if this is a site/plugin setup event,
		// and not setup of an individual module (eg. AdSense, Analytics, etc.)
		if ( slug === null ) {
			trackEvent(
				`${ VIEW_CONTEXT_DASHBOARD }_authentication-success_notification`,
				'complete_user_setup',
				isUsingProxy ? 'proxy' : 'custom-oauth'
			);

			// If the site doesn't yet have multiple admins, this is the initial
			// site setup so we can log the "site setup complete" event.
			if ( ! hasMultipleAdmins ) {
				trackEvent(
					`${ VIEW_CONTEXT_DASHBOARD }_authentication-success_notification`,
					'complete_site_setup',
					isUsingProxy ? 'proxy' : 'custom-oauth'
				);
			}
		}
	} );

	if ( modules === undefined ) {
		return null;
	}

	// Only show the connected win when the user completes setup flow.
	const notification = getQueryParameter( 'notification' );
	if ( ! notification || '' === notification ) {
		return null;
	}

	let winData = {
		id: 'connected-successfully',
		setupTitle: __( 'Site Kit', 'google-site-kit' ),
		description: __(
			'Now you’ll be able to see how your site is doing in search. To get even more detailed stats, activate more modules. Here are our recommendations for what to include in your Site Kit:',
			'google-site-kit'
		),
		learnMore: {
			label: '',
			url: '',
			description: '',
		},
	};

	switch ( notification ) {
		case 'authentication_success':
			if ( ! canManageOptions ) {
				return null;
			}

			if ( slug && ! modules[ slug ]?.active ) {
				return null;
			}

			if ( modules[ slug ] ) {
				winData.id = `${ winData.id }-${ slug }`;
				winData.setupTitle = modules[ slug ].name;
				winData.description = __(
					'Here are some other services you can connect to see even more stats:',
					'google-site-kit'
				);

				winData = applyFilters(
					`googlesitekit.SetupWinNotification-${ slug }`,
					winData
				);
			}

			return (
				<Fragment>
					<Notification
						id={ winData.id }
						title={ sprintf(
							/* translators: %s: the name of a module that setup was completed for */
							__(
								'Congrats on completing the setup for %s!',
								'google-site-kit'
							),
							winData.setupTitle
						) }
						description={ winData.description }
						handleDismiss={ () => {} }
						WinImageSVG={ SuccessGreenSVG }
						dismiss={ __( 'OK, Got it!', 'google-site-kit' ) }
						onDismiss={ async () =>
							trackEvent(
								`${ VIEW_CONTEXT_DASHBOARD }_authentication-success_notification`,
								'confirm_notification'
							)
						}
						format="large"
						type="win-success"
						learnMoreLabel={ winData.learnMore.label }
						learnMoreDescription={ winData.learnMore.description }
						learnMoreURL={ winData.learnMore.url }
						anchorLink={
							'pagespeed-insights' === slug
								? '#googlesitekit-pagespeed-header'
								: ''
						}
						anchorLinkLabel={
							'pagespeed-insights' === slug
								? __(
										'Jump to the bottom of the dashboard to see how fast your home page is',
										'google-site-kit'
								  )
								: ''
						}
					>
						<ModulesList
							moduleSlugs={ [
								'search-console',
								'adsense',
								'analytics',
								'pagespeed-insights',
							] }
						/>
					</Notification>
				</Fragment>
			);

		case 'authentication_failure':
			return (
				<Fragment>
					<Notification
						id="connection error"
						title={ __(
							'There was a problem connecting to Google!',
							'google-site-kit'
						) }
						description={ '' }
						handleDismiss={ () => {} }
						format="small"
						type="win-error"
					/>
				</Fragment>
			);

		case 'user_input_success':
			return <UserInputSuccessNotification />;
	}
}

export default DashboardSetupAlerts;
