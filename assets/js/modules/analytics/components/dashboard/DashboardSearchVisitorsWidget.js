/**
 * DashboardSearchVisitorsWidget component.
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
import { __, _x } from '@wordpress/i18n';
import { isURL } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import {
	DATE_RANGE_OFFSET,
	MODULES_ANALYTICS,
} from '../../datastore/constants';
import { CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
import { CORE_USER } from '../../../../googlesitekit/datastore/user/constants';
import whenActive from '../../../../util/when-active';
import PreviewBlock from '../../../../components/PreviewBlock';
import DataBlock from '../../../../components/DataBlock';
import Sparkline from '../../../../components/Sparkline';
import { calculateChange, getURLPath } from '../../../../util';
import parseDimensionStringToDate from '../../util/parseDimensionStringToDate';
import { isZeroReport } from '../../util';
import { generateDateRangeArgs } from '../../util/report-date-range-args';

const { useSelect } = Data;

function DashboardSearchVisitorsWidget( props ) {
	const { WidgetReportZero, WidgetReportError } = props;

	const isGatheringData = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).isGatheringData()
	);

	const {
		loading,
		error,
		sparkData,
		serviceURL,
		visitorsData,
		totalUsersData,
	} = useSelect( ( select ) => {
		const store = select( MODULES_ANALYTICS );

		const { compareStartDate, compareEndDate, startDate, endDate } = select(
			CORE_USER
		).getDateRangeDates( {
			offsetDays: DATE_RANGE_OFFSET,
			compare: true,
		} );

		const commonArgs = {
			startDate,
			endDate,
			metrics: [
				{
					expression: 'ga:users',
					alias: 'Users',
				},
			],
		};

		const url = select( CORE_SITE ).getCurrentEntityURL();
		if ( url ) {
			commonArgs.url = url;
		}

		const sparklineArgs = {
			dimensions: [ 'ga:date', 'ga:channelGrouping' ],
			dimensionFilters: { 'ga:channelGrouping': 'Organic Search' },
			...commonArgs,
		};

		// This request needs to be separate from the sparkline request because it would result in a different total if it included the ga:date dimension.
		const visitorsArgs = {
			compareStartDate,
			compareEndDate,
			dimensions: [ 'ga:channelGrouping' ],
			dimensionFilters: { 'ga:channelGrouping': 'Organic Search' },
			...commonArgs,
		};

		const totalUsersArgs = {
			compareStartDate,
			compareEndDate,
			...commonArgs,
		};

		const drilldowns = [ 'analytics.trafficChannel:Organic Search' ];
		if ( isURL( url ) ) {
			drilldowns.push( `analytics.pagePath:${ getURLPath( url ) }` );
		}

		return {
			loading:
				! store.hasFinishedResolution( 'getReport', [
					sparklineArgs,
				] ) ||
				! store.hasFinishedResolution( 'getReport', [
					visitorsArgs,
				] ) ||
				! store.hasFinishedResolution( 'getReport', [
					totalUsersArgs,
				] ),
			error:
				store.getErrorForSelector( 'getReport', [ sparklineArgs ] ) ||
				store.getErrorForSelector( 'getReport', [ visitorsArgs ] ) ||
				store.getErrorForSelector( 'getReport', [ totalUsersArgs ] ),
			// Due to the nature of these queries, we need to run them separately.
			sparkData: store.getReport( sparklineArgs ),
			serviceURL: store.getServiceReportURL( 'acquisition-channels', {
				'_r.drilldown': drilldowns.join( ',' ),
				...generateDateRangeArgs( {
					startDate,
					endDate,
					compareStartDate,
					compareEndDate,
				} ),
			} ),
			visitorsData: store.getReport( visitorsArgs ),
			totalUsersData: store.getReport( totalUsersArgs ),
		};
	} );

	if ( loading || isGatheringData === undefined ) {
		return <PreviewBlock width="100%" height="202px" />;
	}

	if ( error ) {
		return <WidgetReportError moduleSlug="analytics" error={ error } />;
	}

	if (
		isGatheringData &&
		( isZeroReport( sparkData ) || isZeroReport( visitorsData ) ) &&
		isZeroReport( totalUsersData )
	) {
		return <WidgetReportZero moduleSlug="analytics" />;
	}

	const sparkLineData = [
		[
			{ type: 'date', label: 'Day' },
			{ type: 'number', label: 'Unique Visitors from Search' },
		],
	];

	const dataRows = sparkData?.[ 0 ]?.data?.rows || [];

	// Loop the rows to build the chart data.
	for ( let i = 0; i < dataRows.length; i++ ) {
		const { values } = dataRows[ i ].metrics[ 0 ];
		const dateString = dataRows[ i ].dimensions[ 0 ];
		const date = parseDimensionStringToDate( dateString );
		sparkLineData.push( [ date, values[ 0 ] ] );
	}

	const { totals = [] } = visitorsData?.[ 0 ]?.data || {};
	const totalVisitors = totals[ 0 ]?.values?.[ 0 ] || 0;
	const previousTotalVisitors = totals[ 1 ]?.values?.[ 0 ] || 0;
	const totalVisitorsChange = calculateChange(
		previousTotalVisitors,
		totalVisitors
	);

	return (
		<DataBlock
			className="overview-total-users"
			title={ __( 'Unique Visitors from Search', 'google-site-kit' ) }
			datapoint={ totalVisitors }
			change={ totalVisitorsChange }
			changeDataUnit="%"
			source={ {
				name: _x( 'Analytics', 'Service name', 'google-site-kit' ),
				link: serviceURL,
				external: true,
			} }
			sparkline={
				sparkLineData && (
					<Sparkline
						data={ sparkLineData }
						change={ totalVisitorsChange }
					/>
				)
			}
		/>
	);
}

export default whenActive( {
	moduleName: 'analytics',
	FallbackComponent: ( { WidgetActivateModuleCTA } ) => (
		<WidgetActivateModuleCTA moduleSlug="analytics" />
	),
	IncompleteComponent: ( { WidgetCompleteModuleActivationCTA } ) => (
		<WidgetCompleteModuleActivationCTA moduleSlug="analytics" />
	),
} )( DashboardSearchVisitorsWidget );
