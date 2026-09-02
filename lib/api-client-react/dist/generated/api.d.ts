import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthCredentials, AuthResponse, DriverPreferences, DriverPreferencesInput, HealthStatus, PlatformConnection, RideDecision, RideRequest } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterDriverUrl: () => string;
/**
 * @summary Register a driver
 */
export declare const registerDriver: (authCredentials: AuthCredentials, options?: Parameters<typeof customFetch>[1]) => Promise<AuthResponse>;
export declare const getRegisterDriverMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerDriver>>, TError, {
        data: BodyType<AuthCredentials>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerDriver>>, TError, {
    data: BodyType<AuthCredentials>;
}, TContext>;
export type RegisterDriverMutationResult = NonNullable<Awaited<ReturnType<typeof registerDriver>>>;
export type RegisterDriverMutationBody = BodyType<AuthCredentials>;
export type RegisterDriverMutationError = ErrorType<void>;
/**
* @summary Register a driver
*/
export declare const useRegisterDriver: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerDriver>>, TError, {
        data: BodyType<AuthCredentials>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof registerDriver>>, TError, {
    data: BodyType<AuthCredentials>;
}, TContext>;
export declare const getLoginDriverUrl: () => string;
/**
 * @summary Log in a driver
 */
export declare const loginDriver: (authCredentials: AuthCredentials, options?: Parameters<typeof customFetch>[1]) => Promise<AuthResponse>;
export declare const getLoginDriverMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginDriver>>, TError, {
        data: BodyType<AuthCredentials>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof loginDriver>>, TError, {
    data: BodyType<AuthCredentials>;
}, TContext>;
export type LoginDriverMutationResult = NonNullable<Awaited<ReturnType<typeof loginDriver>>>;
export type LoginDriverMutationBody = BodyType<AuthCredentials>;
export type LoginDriverMutationError = ErrorType<void>;
/**
* @summary Log in a driver
*/
export declare const useLoginDriver: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginDriver>>, TError, {
        data: BodyType<AuthCredentials>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof loginDriver>>, TError, {
    data: BodyType<AuthCredentials>;
}, TContext>;
export declare const getGetDriverPreferencesUrl: () => string;
/**
 * @summary Get driver preferences
 */
export declare const getDriverPreferences: (options?: Parameters<typeof customFetch>[1]) => Promise<DriverPreferences>;
export declare const getGetDriverPreferencesQueryKey: () => readonly ["/api/preferences"];
export declare const getGetDriverPreferencesQueryOptions: <TData = Awaited<ReturnType<typeof getDriverPreferences>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDriverPreferences>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDriverPreferences>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDriverPreferencesQueryResult = NonNullable<Awaited<ReturnType<typeof getDriverPreferences>>>;
export type GetDriverPreferencesQueryError = ErrorType<unknown>;
/**
 * @summary Get driver preferences
 */
export declare function useGetDriverPreferences<TData = Awaited<ReturnType<typeof getDriverPreferences>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDriverPreferences>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateDriverPreferencesUrl: () => string;
/**
 * @summary Update driver preferences
 */
export declare const updateDriverPreferences: (driverPreferencesInput: DriverPreferencesInput, options?: Parameters<typeof customFetch>[1]) => Promise<DriverPreferences>;
export declare const getUpdateDriverPreferencesMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDriverPreferences>>, TError, {
        data: BodyType<DriverPreferencesInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDriverPreferences>>, TError, {
    data: BodyType<DriverPreferencesInput>;
}, TContext>;
export type UpdateDriverPreferencesMutationResult = NonNullable<Awaited<ReturnType<typeof updateDriverPreferences>>>;
export type UpdateDriverPreferencesMutationBody = BodyType<DriverPreferencesInput>;
export type UpdateDriverPreferencesMutationError = ErrorType<unknown>;
/**
* @summary Update driver preferences
*/
export declare const useUpdateDriverPreferences: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDriverPreferences>>, TError, {
        data: BodyType<DriverPreferencesInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDriverPreferences>>, TError, {
    data: BodyType<DriverPreferencesInput>;
}, TContext>;
export declare const getListRideRequestsUrl: () => string;
/**
 * @summary List unified ride requests
 */
export declare const listRideRequests: (options?: Parameters<typeof customFetch>[1]) => Promise<RideRequest[]>;
export declare const getListRideRequestsQueryKey: () => readonly ["/api/ride-requests"];
export declare const getListRideRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listRideRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRideRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRideRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRideRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listRideRequests>>>;
export type ListRideRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List unified ride requests
 */
export declare function useListRideRequests<TData = Awaited<ReturnType<typeof listRideRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRideRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDecideRideRequestUrl: (id: number) => string;
/**
 * @summary Accept or decline a ride request
 */
export declare const decideRideRequest: (id: number, rideDecision: RideDecision, options?: Parameters<typeof customFetch>[1]) => Promise<RideRequest>;
export declare const getDecideRideRequestMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof decideRideRequest>>, TError, {
        id: number;
        data: BodyType<RideDecision>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof decideRideRequest>>, TError, {
    id: number;
    data: BodyType<RideDecision>;
}, TContext>;
export type DecideRideRequestMutationResult = NonNullable<Awaited<ReturnType<typeof decideRideRequest>>>;
export type DecideRideRequestMutationBody = BodyType<RideDecision>;
export type DecideRideRequestMutationError = ErrorType<void>;
/**
* @summary Accept or decline a ride request
*/
export declare const useDecideRideRequest: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof decideRideRequest>>, TError, {
        id: number;
        data: BodyType<RideDecision>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof decideRideRequest>>, TError, {
    id: number;
    data: BodyType<RideDecision>;
}, TContext>;
export declare const getListPlatformConnectionsUrl: () => string;
/**
 * @summary List connected platform sources
 */
export declare const listPlatformConnections: (options?: Parameters<typeof customFetch>[1]) => Promise<PlatformConnection[]>;
export declare const getListPlatformConnectionsQueryKey: () => readonly ["/api/platform-connections"];
export declare const getListPlatformConnectionsQueryOptions: <TData = Awaited<ReturnType<typeof listPlatformConnections>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPlatformConnections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPlatformConnections>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPlatformConnectionsQueryResult = NonNullable<Awaited<ReturnType<typeof listPlatformConnections>>>;
export type ListPlatformConnectionsQueryError = ErrorType<unknown>;
/**
 * @summary List connected platform sources
 */
export declare function useListPlatformConnections<TData = Awaited<ReturnType<typeof listPlatformConnections>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPlatformConnections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map