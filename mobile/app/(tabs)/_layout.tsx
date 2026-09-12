import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { Tabs } from 'expo-router'

const TAB_CONFIG: Record<string, { label: string; badge?: string }> = {
  index: { label: 'Home', badge: '4' },
  explore: { label: 'Courses' },
  workshops: { label: 'Workshops' },
  reels: { label: 'Reels' },
  profile: { label: 'Progress' },
}

function CustomPillTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.pillContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index
          const config = TAB_CONFIG[route.name] || { label: options?.title || route.name }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>

              {/* Show badge pill when active and badge exists */}
              {isFocused && config.badge ? (
                <View style={styles.badgeCircle}>
                  <Text style={styles.badgeText}>{config.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomPillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Courses' }} />
      <Tabs.Screen name="workshops" options={{ title: 'Workshops' }} />
      <Tabs.Screen name="reels" options={{ title: 'Reels' }} />
      <Tabs.Screen name="profile" options={{ title: 'Progress' }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pillContainer: {
    width: '100%',
    maxWidth: 410,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#B4F373', // Light lime green pill
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: '#1C1F26',
    fontWeight: '700',
  },
  badgeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
})
