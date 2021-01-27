/**
 * `core/user` data store: disconnect
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
import API from 'googlesitekit-api';
import Data from 'googlesitekit-data';
import { STORE_NAME } from './constants';
import { createFetchStore } from '../../data/create-fetch-store';

const { createRegistrySelector } = Data;

const fetchDisconnectStore = createFetchStore( {
	baseName: 'disconnect',
	controlCallback: () => {
		return API.set( 'core', 'user', 'disconnect' );
	},
	reducerCallback: ( state, disconnected ) => {
		return {
			...state,
			disconnected,
		};
	},
} );

const baseInitialState = {
	disconnected: undefined,
};

const baseActions = {
	*disconnect() {
		yield fetchDisconnectStore.actions.fetchDisconnect();
	},
};

const baseSelectors = {
	/**
	 * Returns whether a disconnect is occurring.
	 *
	 * @since 1.9.0
	 *
	 * @param {Object} state Data store's state.
	 * @return {boolean} Is a disconnect occurring or not.
	 */
	isDoingDisconnect: createRegistrySelector( ( select ) => () => {
		return select( STORE_NAME ).isFetchingDisconnect();
	} ),
};

const store = Data.combineStores(
	fetchDisconnectStore,
	{
		initialState: baseInitialState,
		actions: baseActions,
		selectors: baseSelectors,
	}
);

export const initialState = store.initialState;
export const actions = store.actions;
export const controls = store.controls;
export const reducer = store.reducer;
export const resolvers = store.resolvers;
export const selectors = store.selectors;

export default store;
