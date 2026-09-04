import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

export function KeyboardAwareScrollViewCompat(props: ScrollViewProps) {
  return <ScrollView {...props} />;
}
