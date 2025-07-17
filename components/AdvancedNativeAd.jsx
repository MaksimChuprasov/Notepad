import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeAdView, NativeAdEventType, TestIds } from 'react-native-google-mobile-ads';

export default function AdvancedNativeAd() {
  const [ad, setAd] = useState(null);

  return (
    <NativeAdView
      adUnitId={__DEV__ ? TestIds.NATIVE : 'ca-app-pub-3940256099942544/2247696110'}
      onAdLoaded={(nativeAd) => {
        console.log('Ad loaded', nativeAd);
        setAd(nativeAd);
      }}
      onAdFailedToLoad={(error) => {
        console.error('Ad failed to load', error);
      }}
      style={styles.nativeAd}
    >
      {ad ? (
        <View style={styles.container}>
          {ad.icon && <Image source={{ uri: ad.icon.uri }} style={styles.icon} />}
          <View style={styles.textContainer}>
            <Text style={styles.headline}>{ad.headline}</Text>
            <Text style={styles.tagline}>{ad.tagline}</Text>
            <Text style={styles.advertiser}>{ad.advertiser}</Text>
          </View>
          <TouchableOpacity style={styles.callToAction}>
            <Text style={styles.callToActionText}>{ad.callToAction}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Loading ad...</Text>
      )}
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  nativeAd: { width: '100%', height: 100, backgroundColor: '#fff' },
  container: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  icon: { width: 60, height: 60, marginRight: 10 },
  textContainer: { flex: 1 },
  headline: { fontWeight: 'bold', fontSize: 16 },
  tagline: { fontSize: 12, color: 'gray' },
  advertiser: { fontSize: 10, color: 'darkgray' },
  callToAction: { backgroundColor: '#0a84ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  callToActionText: { color: 'white', fontWeight: 'bold' },
});