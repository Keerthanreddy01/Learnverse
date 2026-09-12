import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing } from '../constants/theme'
import { useStudy } from '../context/StudyContext'
import { useAuth } from '../context/AuthContext'
import { MemojiAvatar } from '../components/Illustrations'
import {
  Bell,
  Zap,
  ChevronDown,
  BarChart2,
  Star,
  Flame,
  Sparkles,
  LogOut,
} from 'lucide-react-native'

export default function ProfileScreen() {
  const { streakDays, materials } = useStudy()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [period, setPeriod] = useState<'weekly' | 'month'>('weekly')

  const BAR_DATA = [
    { day: 'Mon', count: 39, heightPercent: 65 },
    { day: 'Tue', count: 14, heightPercent: 32 },
    { day: 'Wed', count: 48, heightPercent: 92, isPeak: true },
    { day: 'Thr', count: 24, heightPercent: 48 },
    { day: 'Fri', count: 22, heightPercent: 42 },
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Top Header: 3D Memoji + Greeting + Notification Bell */}
        <View style={styles.topHeader}>
          <View style={styles.userGreetingRow}>
            <MemojiAvatar size={48} />
            <View style={styles.greetingTextBox}>
              <Text style={styles.greetingTitle}>Hello, {user?.name?.split(' ')[0] || 'Jacob'}</Text>
              <View style={styles.progressSubtitleRow}>
                <Zap size={13} color="#706CFF" fill="#706CFF" />
                <Text style={styles.progressSubtitleText}>Progress: 76%</Text>
              </View>
            </View>
          </View>

          <View style={styles.notificationBtn}>
            <Bell size={18} color="#181A20" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        {/* 2. Progress Title + Subject Filter Dropdown */}
        <View style={styles.progressTitleRow}>
          <Text style={styles.progressMainHeading}>Progress</Text>

          <TouchableOpacity style={styles.filterDropdownPill} activeOpacity={0.8}>
            <BarChart2 size={13} color="#706CFF" />
            <Text style={styles.filterDropdownText}>All subjects</Text>
            <ChevronDown size={14} color="#848792" />
          </TouchableOpacity>
        </View>

        {/* 3. Main Progress Analytics Card (Warm Cream Card) */}
        <View style={styles.analyticsCard}>
          {/* Card Top Row: Bar Chart Icon + Toggle */}
          <View style={styles.analyticsTopRow}>
            <View style={styles.darkChartIconBox}>
              <BarChart2 size={16} color="#FFFFFF" />
            </View>

            {/* Weekly / Month Toggle */}
            <View style={styles.togglePillContainer}>
              <TouchableOpacity
                style={[styles.togglePill, period === 'weekly' && styles.togglePillActive]}
                onPress={() => setPeriod('weekly')}
              >
                <Text style={[styles.toggleText, period === 'weekly' && styles.toggleTextActive]}>
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.togglePill, period === 'month' && styles.togglePillActive]}
                onPress={() => setPeriod('month')}
              >
                <Text style={[styles.toggleText, period === 'month' && styles.toggleTextActive]}>
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Metric Numbers */}
          <View style={styles.analyticsNumbersRow}>
            <View style={styles.statMetricItem}>
              <Text style={styles.bigMetricNumber}>48</Text>
              <Text style={styles.metricUnitLabel}>lessons</Text>
            </View>

            <View style={styles.statMetricItem}>
              <Text style={styles.bigMetricNumber}>12</Text>
              <Text style={styles.metricUnitLabel}>hours</Text>
            </View>
          </View>

          {/* Vertical Bar Chart Visual */}
          <View style={styles.barChartContainer}>
            {BAR_DATA.map((item) => (
              <View key={item.day} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${item.heightPercent}%` },
                      item.isPeak ? styles.barFillPeak : styles.barFillStandard,
                    ]}
                  >
                    <Text style={styles.barCountLabel}>{item.count}</Text>
                  </View>
                </View>
                <Text style={styles.barDayText}>{item.day}</Text>
              </View>
            ))}
          </View>

          {/* Carousel Pagination Indicator */}
          <View style={styles.carouselDotsRow}>
            <View style={[styles.carouselDot, styles.carouselDotActive]} />
            <View style={styles.carouselDot} />
            <View style={styles.carouselDot} />
          </View>
        </View>

        {/* 4. Rating of Students Card */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <View style={styles.starBadgeCircle}>
              <Star size={18} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View style={styles.ratingTextBox}>
              <Text style={styles.ratingTitle}>Rating of students</Text>
              <Text style={styles.ratingSubtitle}>10 best students</Text>
            </View>
          </View>

          {/* Student Avatars Stack */}
          <View style={styles.ratingAvatarStack}>
            <View style={[styles.ratingAvatar, { backgroundColor: '#FFA770' }]}>
              <Text style={styles.ratingAvatarEmoji}>👱🏻</Text>
            </View>
            <View style={[styles.ratingAvatar, { backgroundColor: '#706CFF', marginLeft: -10 }]}>
              <Text style={styles.ratingAvatarEmoji}>👦🏼</Text>
            </View>
            <View style={[styles.ratingAvatar, { backgroundColor: '#10B981', marginLeft: -10 }]}>
              <Text style={styles.ratingAvatarEmoji}>👩🏻</Text>
            </View>
          </View>
        </View>

        {/* 5. Habit Streak & Adaptive Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.settingItemRow}>
            <View style={styles.settingItemLeft}>
              <Flame size={18} color="#FF8A48" />
              <Text style={styles.settingItemTitle}>Daily Habit Streak</Text>
            </View>
            <Text style={styles.settingItemValue}>{streakDays} Days</Text>
          </View>

          <View style={styles.settingItemRow}>
            <View style={styles.settingItemLeft}>
              <Sparkles size={18} color="#706CFF" />
              <Text style={styles.settingItemTitle}>Spaced Repetition Engine</Text>
            </View>
            <Text style={styles.settingItemValue}>SM-2 Active</Text>
          </View>
        </View>

        {/* 6. Logout Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout()
            router.replace('/login')
          }}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#C84A55" />
          <Text style={styles.logoutBtnText}>Log out of LearnVerse</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 130,
    gap: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingTextBox: {
    gap: 2,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.4,
  },
  progressSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressSubtitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#767984',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DC',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF4D6D',
  },
  progressTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressMainHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.6,
  },
  filterDropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  filterDropdownText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#181A20',
  },
  analyticsCard: {
    backgroundColor: '#FFF7F0',
    borderRadius: 32,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1E4D8',
    gap: 18,
    shadowColor: '#FFA770',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  analyticsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkChartIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFE3D8',
    borderRadius: 18,
    padding: 3,
  },
  togglePill: {
    paddingHorizontal: 13,
    paddingVertical: 5.5,
    borderRadius: 15,
  },
  togglePillActive: {
    backgroundColor: '#181A20',
  },
  toggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#848792',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  analyticsNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 24,
  },
  statMetricItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bigMetricNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.5,
  },
  metricUnitLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#848792',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 145,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  barTrack: {
    width: 38,
    height: 112,
    backgroundColor: 'rgba(255, 167, 112, 0.16)',
    borderRadius: 19,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  barFillStandard: {
    backgroundColor: '#FFA770',
  },
  barFillPeak: {
    backgroundColor: '#FF8A48',
  },
  barCountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  barDayText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#848792',
  },
  carouselDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  carouselDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#DBCFC5',
  },
  carouselDotActive: {
    width: 15,
    backgroundColor: '#181A20',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFA770',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingTextBox: {
    gap: 2,
  },
  ratingTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#181A20',
  },
  ratingSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#848792',
  },
  ratingAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ratingAvatarEmoji: {
    fontSize: 16,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181A20',
  },
  settingItemValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#706CFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF0F1',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FFD9DC',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C84A55',
  },
})
