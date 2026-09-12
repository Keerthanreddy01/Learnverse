import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { AlertTriangle, ExternalLink, Play, RefreshCw, Volume2 } from 'lucide-react-native'
import { Colors } from '../constants/theme'

export interface YouTubePlayerHandle {
  play(): void
  pause(): void
  mute(): void
  unmute(): void
}

interface YouTubeShortPlayerProps {
  videoId: string
  isActive: boolean
  isMuted?: boolean
}

const buildPlayerHtml = (videoId: string, muted: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: #000000;
      overflow: hidden;
    }
    .video-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000000;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <div class="video-container">
    <iframe
      id="yt-iframe"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&controls=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&enablejsapi=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </div>
  <script>
    function post(obj) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    }

    // Command listener from React Native
    function handleMsg(event) {
      try {
        var msg = JSON.parse(event.data);
        var iframe = document.getElementById('yt-iframe');
        if (!iframe || !iframe.contentWindow) return;
        if (msg.cmd === 'play') {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } else if (msg.cmd === 'pause') {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else if (msg.cmd === 'mute') {
          iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        } else if (msg.cmd === 'unmute') {
          iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        }
      } catch (e) {}
    }
    window.addEventListener('message', handleMsg);
    document.addEventListener('message', handleMsg);

    // Notify ready
    setTimeout(function() {
      post({ type: 'ready' });
    }, 600);
  </script>
</body>
</html>
`

const USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  default: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
})

const YouTubeShortPlayer = forwardRef<YouTubePlayerHandle, YouTubeShortPlayerProps>(
  function YouTubeShortPlayer({ videoId, isActive, isMuted = false }, ref) {
    const { height: screenHeight, width: screenWidth } = useWindowDimensions()
    const webViewRef = useRef<WebView>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    useImperativeHandle(ref, () => ({
      play() {
        webViewRef.current?.injectJavaScript(
          `(function(){try{var f=document.getElementById('yt-iframe');if(f&&f.contentWindow){f.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}','*');}}catch(e){}})()`
        )
      },
      pause() {
        webViewRef.current?.injectJavaScript(
          `(function(){try{var f=document.getElementById('yt-iframe');if(f&&f.contentWindow){f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');}}catch(e){}})()`
        )
      },
      mute() {
        webViewRef.current?.injectJavaScript(
          `(function(){try{var f=document.getElementById('yt-iframe');if(f&&f.contentWindow){f.contentWindow.postMessage('{"event":"command","func":"mute","args":""}','*');}}catch(e){}})()`
        )
      },
      unmute() {
        webViewRef.current?.injectJavaScript(
          `(function(){try{var f=document.getElementById('yt-iframe');if(f&&f.contentWindow){f.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}','*');}}catch(e){}})()`
        )
      },
    }))

    const sendCmd = useCallback((cmd: string) => {
      webViewRef.current?.injectJavaScript(
        `(function(){try{var f=document.getElementById('yt-iframe');if(f&&f.contentWindow){f.contentWindow.postMessage('{"event":"command","func":"${cmd}","args":""}','*');}}catch(e){}})()`
      )
    }, [])

    const openInYouTube = useCallback(() => {
      Linking.openURL(`https://www.youtube.com/shorts/${videoId}`).catch(() =>
        Linking.openURL(`https://youtube.com/watch?v=${videoId}`)
      )
    }, [videoId])

    const html = buildPlayerHtml(videoId, isMuted)

    if (hasError) {
      return (
        <View style={[styles.errorContainer, { width: screenWidth, height: screenHeight }]}>
          <AlertTriangle size={36} color="#FF4D6D" />
          <Text style={styles.errorTitle}>Video unavailable in embed</Text>
          <Text style={styles.errorSubtitle}>Tap below to open directly in YouTube</Text>
          <TouchableOpacity style={styles.openButton} onPress={openInYouTube} activeOpacity={0.8}>
            <ExternalLink size={14} color="#000000" />
            <Text style={styles.openButtonText}>Open in YouTube</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
        {!isLoaded && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading YouTube short…</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          style={styles.webview}
          source={{ html }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          userAgent={USER_AGENT}
          originWhitelist={['*']}
          onLoadEnd={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          scrollEnabled={false}
          bounces={false}
          renderToHardwareTextureAndroid={true}
        />
      </View>
    )
  }
)

export default YouTubeShortPlayer

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#0E0B0D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    zIndex: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#8A8E9A',
    fontSize: 12,
    textAlign: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1DED83',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  openButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
})
