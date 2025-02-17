/**
 * DimensionTabs component
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
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';

/**
 * WordPress dependencies
 */
import { Fragment, useCallback, useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import ViewContextContext from '../../../../../components/Root/ViewContextContext';
import { CORE_UI } from '../../../../../googlesitekit/datastore/ui/constants';
import {
	UI_DIMENSION_COLOR,
	UI_DIMENSION_NAME,
	UI_DIMENSION_VALUE,
	UI_ACTIVE_ROW_INDEX,
} from '../../../datastore/constants';
import PreviewBlock from '../../../../../components/PreviewBlock';
import { Select, Option } from '../../../../../material-components';
import { trackEvent } from '../../../../../util';
const { useDispatch } = Data;

const tabs = [
	{
		tabText: __( 'Channels', 'google-site-kit' ),
		dimensionName: 'ga:channelGrouping',
	},
	{
		tabText: __( 'Locations', 'google-site-kit' ),
		dimensionName: 'ga:country',
	},
	{
		tabText: __( 'Devices', 'google-site-kit' ),
		dimensionName: 'ga:deviceCategory',
	},
];

export default function DimensionTabs( { dimensionName, loaded } ) {
	const viewContext = useContext( ViewContextContext );
	const { setValues } = useDispatch( CORE_UI );

	const activeTab = tabs.findIndex(
		( v ) => v.dimensionName === dimensionName
	);

	const handleTabUpdate = useCallback(
		( index ) => {
			const { dimensionName: name } = tabs[ index ] || {};

			setValues( {
				[ UI_DIMENSION_NAME ]: name,
				[ UI_DIMENSION_VALUE ]: '',
				[ UI_DIMENSION_COLOR ]: '',
				[ UI_ACTIVE_ROW_INDEX ]: null,
			} );

			trackEvent(
				`${ viewContext }_all-traffic-widget`,
				'tab_select',
				name
			);
		},
		[ setValues, viewContext ]
	);

	if ( ! loaded ) {
		return (
			<div className="googlesitekit-widget--analyticsAllTraffic__tabs--loading">
				<PreviewBlock width="100px" height="40px" shape="square" />
				<PreviewBlock width="100px" height="40px" shape="square" />
				<PreviewBlock width="100px" height="40px" shape="square" />
			</div>
		);
	}

	return (
		<Fragment>
			<div className="googlesitekit-widget--analyticsAllTraffic__tabs hidden-on-mobile">
				<TabBar
					activeIndex={ activeTab }
					handleActiveIndexUpdate={ handleTabUpdate }
				>
					{ tabs.map( ( tab ) => (
						<Tab
							key={ tab.dimensionName }
							className="mdc-tab--min-width"
							focusOnActivate={ false }
						>
							<span className="mdc-tab__text-label">
								{ tab.tabText }
							</span>
						</Tab>
					) ) }
				</TabBar>
			</div>

			<div className="googlesitekit-widget--analyticsAllTraffic__tabs--small">
				<Select
					enhanced
					onEnhancedChange={ handleTabUpdate }
					outlined
					value={ `dimension-name-${ activeTab }` }
				>
					{ tabs.map( ( tab, index ) => (
						<Option
							key={ index }
							value={ `dimension-name-${ index }` }
						>
							{ tab.tabText }
						</Option>
					) ) }
				</Select>
			</div>
		</Fragment>
	);
}

DimensionTabs.propTypes = {
	dimensionName: PropTypes.string.isRequired,
	loaded: PropTypes.bool,
};
