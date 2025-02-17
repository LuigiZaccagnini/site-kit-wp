/**
 * DashboardCoreSiteAlerts component.
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
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
const { useSelect } = Data;
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import Notification from './notification';
import { acceptNotification, dismissNotification } from './site';

const MAX_SECONDS_FOR_SURVEY = 5;

const DashboardCoreSiteAlerts = () => {
	const [ ready, setReady ] = useState( false );
	const [ hasSurveys, setHasSurveys ] = useState( false );
	const startTime = useRef( Date.now() );
	const surveys = useSelect( ( select ) =>
		select( CORE_USER ).getCurrentSurvey()
	);
	const notifications = useSelect( ( select ) =>
		select( CORE_SITE ).getNotifications()
	);

	useEffect( () => {
		const timer = setTimeout( () => {
			if ( ! hasSurveys ) {
				setReady( true );
			}
		}, MAX_SECONDS_FOR_SURVEY * 1000 );

		return () => {
			clearTimeout( timer );
		};
	}, [ hasSurveys ] );

	useEffect( () => {
		const secondsElapsed = Math.floor(
			( Date.now() - startTime.current ) / 1000
		);
		// Surveys that were received in time prevent the render, surveys loaded
		// after a set amount of time do not prevent notifications from rendering.
		if ( secondsElapsed < MAX_SECONDS_FOR_SURVEY && surveys ) {
			setHasSurveys( true );
		}
	}, [ startTime, surveys, setHasSurveys ] );

	if ( ! Array.isArray( notifications ) || ! ready || hasSurveys ) {
		return null;
	}

	return notifications.map( ( notification ) => (
		<Notification
			key={ notification.id }
			id={ notification.id }
			title={ notification.title || '' }
			description={ notification.content || '' }
			learnMoreURL={ notification.learnMoreURL || '' }
			learnMoreLabel={ notification.learnMoreLabel || '' }
			ctaLink={ notification.ctaURL || '' }
			ctaLabel={ notification.ctaLabel || '' }
			ctaTarget={ notification.ctaTarget || '' }
			dismiss={
				notification.dismissLabel ||
				__( 'OK, Got it!', 'google-site-kit' )
			}
			isDismissable={ notification.dismissible }
			onCTAClick={ async () => {
				await acceptNotification( notification.id );
			} }
			onDismiss={ async () => {
				await dismissNotification( notification.id );
			} }
		/>
	) );
};

export default DashboardCoreSiteAlerts;
