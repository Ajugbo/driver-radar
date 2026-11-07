import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '__last_crash__';

export function installCrashCapture() {
  // Catch unhandled JS errors
  const prev = (global as any).ErrorUtils?.getGlobalHandler?.();
  (global as any).ErrorUtils?.setGlobalHandler?.((error: any, isFatal?: boolean) => {
    Alert.alert(isFatal ? 'Fatal Crash' : 'JS Error', `${error?.message}\n${error?.stack?.slice(0, 500)}`);
    prev?.(error, isFatal);
  });

  // Catch unhandled promise rejections (Hermes & non-Hermes)
  try {
    require('promise/setimmediate/rejection-tracking').enable({
      allRejections: true,
      onUnhandled: (_id: number, error: unknown) => 
        Alert.alert('Promise Rejection', `${String(error)?.slice(0, 900)}`),
    });
  } catch {}
  
  try {
    (global as any).HermesInternal?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: (_id: number, error: unknown) => 
        Alert.alert('Hermes Rejection', `${String(error)?.slice(0, 900)}`),
    });
  } catch {}
}
