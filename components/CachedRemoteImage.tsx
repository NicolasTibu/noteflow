import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface CachedRemoteImageProps extends Omit<ImageProps, 'source' | 'style'> {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  placeholderStyle?: StyleProp<ViewStyle>;
}

export function CachedRemoteImage({
  uri,
  style,
  placeholderStyle,
  onLoadStart,
  onLoadEnd,
  onError,
  ...props
}: CachedRemoteImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const showImage = !!uri && !hasError;

  return (
    <View style={[styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri, cache: 'force-cache' }}
          style={StyleSheet.absoluteFill}
          onLoadStart={(event) => {
            setIsLoading(true);
            onLoadStart?.(event);
          }}
          onLoadEnd={(event) => {
            setIsLoading(false);
            onLoadEnd?.(event);
          }}
          onError={(event) => {
            setIsLoading(false);
            setHasError(true);
            onError?.(event);
          }}
          {...props}
        />
      ) : (
        <View style={[styles.placeholder, placeholderStyle]} />
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#CFCFCF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
});
